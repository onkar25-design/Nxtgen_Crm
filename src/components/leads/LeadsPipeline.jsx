import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import LeadCard from './lead-card/LeadCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faThList } from '@fortawesome/free-solid-svg-icons'; // Import new icon
import './LeadsPipeline.css';
import NewLeadForm from './add-edit-lead-form/NewLeadForm'; // Import the NewLeadForm component
import { supabase } from '../../../supabaseClient'; // Import Supabase client
import Swal from 'sweetalert2'; // Import SweetAlert2

const initialColumns = [
  {
    id: 'new',
    title: 'New',
    cards: [],
  },
  {
    id: 'qualified',
    title: 'Qualified',
    cards: [],
  },
  {
    id: 'proposition',
    title: 'Proposition',
    cards: [],
  },
  {
    id: 'won',
    title: 'Won',
    cards: [],
  },
];

const onEdit = (card) => {
  // Logic to handle editing the lead
  console.log("Editing lead:", card);
  // You can implement a modal or form to edit the lead details here
};

function LeadsPipeline() {
  const [columns, setColumns] = useState(initialColumns);
  const [activeColumnId, setActiveColumnId] = useState(columns[0].id);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showDeleteColumnDropdown, setShowDeleteColumnDropdown] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [selectedColumnToInsertAfter, setSelectedColumnToInsertAfter] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    leadSource: '',
    leadScore: 0,
    interestedProducts: '',
    budget: '',
    timeline: '',
    assignedSalesperson: '',
    status: 'New',
    notes: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const searchOptions = [
    { value: 'title', label: 'Title' },
    { value: 'company', label: 'Company' },
    { value: 'amount', label: 'Amount' },
    { value: 'tags', label: 'Tags' },
  ];

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  useEffect(() => {
    const fetchLeadsAndColumns = async () => {
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .order('order', { ascending: true });
      if (columnsError) {
        console.error('Error fetching columns:', columnsError);
        return;
      }

      const columnMap = {};
      columnsData.forEach(col => {
        columnMap[col.id] = { ...col, cards: [] };
      });

      const { data: leadsData, error: leadsError } = await supabase
        .from('client_leads')
        .select('id, title, budget, company, tags, name, email, phone, lead_source, lead_score, interested_products, status, notes, stage');

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return;
      }

      leadsData.forEach(lead => {
        const stage = lead.stage || 'new';
        if (columnMap[stage]) {
          columnMap[stage].cards.push(lead);
        }
      });

      setColumns(Object.values(columnMap));
    };

    fetchLeadsAndColumns();
  }, []);

  const moveCard = async (cardId, fromColumn, toColumn) => {
    if (fromColumn === toColumn) {
      // If the card is moved within the same column, do nothing
      return;
    }

    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => {
        const cards = col.cards || [];

        if (col.id === fromColumn) {
          return { ...col, cards: cards.filter(card => card.id !== cardId) };
        }
        if (col.id === toColumn) {
          const [movedCard] = prevColumns.find(c => c.id === fromColumn).cards.filter(card => card.id === cardId);
          const updatedCard = { ...movedCard, stage: toColumn };

          // Update the stage in the database
          supabase.from('client_leads').update({ stage: toColumn }).eq('id', cardId)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating lead stage:', error);
              }
            });

          return { 
            ...col, 
            cards: [...cards, updatedCard]
          };
        }
        return col;
      });
      return updatedColumns;
    });
  };

  const addColumn = async () => {
    if (newColumnTitle.trim() === '') return;

    const newColumn = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      order: selectedColumnToInsertAfter ? 
        columns.findIndex(col => col.id === selectedColumnToInsertAfter) + 1 : 
        columns.length + 1,
    };

    const { data, error } = await supabase.from('columns').insert([newColumn]);
    if (error) {
      console.error('Error adding column:', error);
    } else {
      const insertIndex = selectedColumnToInsertAfter ? 
        columns.findIndex(col => col.id === selectedColumnToInsertAfter) + 1 : 
        columns.length;

      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        updatedColumns.splice(insertIndex, 0, newColumn);
        return updatedColumns;
      });
    }

    setNewColumnTitle('');
    setSelectedColumnToInsertAfter('');
    setShowAddColumnModal(false);
  };

  const deleteColumn = async (columnId) => {
    // Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    // Check the user's role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
      return;
    }

    // If the user is staff, show unauthorized message
    if (userData.role === 'staff') {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You are not authorized to delete this column.',
      });
      return; // Prevent deletion
    }

    // Check for leads in the column before allowing deletion
    const { data: leadsData, error: leadsError } = await supabase
      .from('client_leads')
      .select('id')
      .eq('stage', columnId); // Check for leads in the specific stage

    if (leadsError) {
      console.error('Error checking leads:', leadsError);
      return;
    }

    if (leadsData.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete',
        text: 'Cannot delete this column because it contains leads.',
      });
      return; // Prevent deletion
    }

    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmDelete.isConfirmed) {
      const { data, error } = await supabase.from('columns').delete().eq('id', columnId);
      if (error) {
        console.error('Error deleting column:', error);
        return;
      }

      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
      Swal.fire('Deleted!', 'Your column has been deleted.', 'success');
    }
  };

  const addLead = async (leadData) => {
    const newLeadData = {
      id: Date.now(),
      title: leadData.title,
      budget: leadData.budget,
      company: leadData.company,
      tags: leadData.tags,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      lead_source: leadData.leadSource,
      lead_score: leadData.leadScore,
      interested_products: leadData.interestedProducts,
      status: leadData.status,
      notes: leadData.notes,
      stage: 'new',
    };

    const { data, error } = await supabase.from('client_leads').insert([newLeadData]);
    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        const newColumnIndex = updatedColumns.findIndex(col => col.id === 'new');
        if (newColumnIndex !== -1) {
          updatedColumns[newColumnIndex].cards.push(newLeadData);
        }
        return updatedColumns;
      });
    }
    setShowAddLeadModal(false);
  };

  const onDelete = (cardId) => {
    setColumns(prevColumns => {
      return prevColumns.map(column => {
        return {
          ...column,
          cards: column.cards.filter(card => card.id !== cardId)
        };
      });
    });
  };

  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards ? column.cards.filter(card => 
      (card.title && card.title.toLowerCase().includes(searchInput.toLowerCase())) || 
      (card.company && card.company.toLowerCase().includes(searchInput.toLowerCase()))
    ) : []
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDeleteColumnDropdown(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="leads-pipeline">
      <div className="leads-pipeline-header">
        <h1>
          <FontAwesomeIcon icon={faThList} style={{ color: '#4CAF50', marginRight: '8px' }} />
          Leads Pipeline
        </h1>
        <div className="leads-pipeline-header-actions">
          <input
            type="text"
            placeholder="Search by title or company"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="leads-pipeline-search-input"
          />
          <button className="leads-pipeline-icon-btn leads-pipeline-add-column-btn" onClick={() => setShowAddColumnModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <div className="leads-pipeline-delete-column-dropdown" ref={dropdownRef}>
            <button className="leads-pipeline-icon-btn leads-pipeline-delete-column-btn" onClick={() => setShowDeleteColumnDropdown(!showDeleteColumnDropdown)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
            {showDeleteColumnDropdown && (
              <div className="leads-pipeline-dropdown-menu">
                {columns.map(column => (
                  <button key={column.id} onClick={() => { deleteColumn(column.id); setShowDeleteColumnDropdown(false); }}>
                    {column.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="leads-pipeline-tabs">
        {columns.map(column => (
          <div
            key={column.id}
            className={`leads-pipeline-tab ${activeColumnId === column.id ? 'active' : ''}`}
            onClick={() => setActiveColumnId(column.id)}
          >
            {column.title}
          </div>
        ))}
      </div>
      <div className="leads-pipeline-columns-container">
        {filteredColumns.map(column => (
          <Column
            key={column.id}
            column={column}
            moveCard={moveCard}
            onEdit={onEdit}
            onDelete={onDelete}
            className={activeColumnId === column.id ? 'active' : ''}
          />
        ))}
      </div>
      {showAddColumnModal && (
        <div className="leads-pipeline-modal">
          <div className="leads-pipeline-modal-content">
            <h2>Add New Column</h2>
            <hr className="leads-pipeline-divider" />
            <div className="leads-pipeline-modal-inputs">
              <input
                type="text"
                placeholder="Column Title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="leads-pipeline-modal-input"
              />
              <select
                value={selectedColumnToInsertAfter}
                onChange={(e) => setSelectedColumnToInsertAfter(e.target.value)}
                className="leads-pipeline-modal-select"
              >
                <option value="">Add to end</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>After {col.title}</option>
                ))}
              </select>
            </div>
            <div className="leads-pipeline-modal-actions">
              <button className="leads-pipeline-modal-btn" onClick={addColumn}>Add</button>
              <button className="leads-pipeline-modal-btn" onClick={() => setShowAddColumnModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showAddLeadModal && (
        <NewLeadForm onSubmit={addLead} onCancel={() => setShowAddLeadModal(false)} />
      )}
    </div>
  );
}

function Column({ column, moveCard, onEdit, onDelete, className }) {
  const [, drop] = useDrop({
    accept: 'card',
    drop: (item) => moveCard(item.id, item.columnId, column.id),
  });

  return (
    <div ref={drop} className={`leads-pipeline-column ${className}`}>
      <div className="leads-pipeline-column-header">
        <h2>{column.title}</h2>
      </div>
      <div className="leads-pipeline-column-content">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map(card => (
            <LeadCard key={card.id} card={card} columnId={column.id} onEdit={onEdit} onDelete={onDelete} />
          ))
        ) : (
          <p>No leads in this column.</p>
        )}
      </div>
    </div>
  );
}

export default LeadsPipeline;
