import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import LeadCard from './LeadCard';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faThList } from '@fortawesome/free-solid-svg-icons'; // Import new icon
import './LeadsPipeline.css';
import NewLeadForm from './NewLeadForm'; // Import the NewLeadForm component
import { supabase } from '../../../supabaseClient'; // Import Supabase client

const initialColumns = [
  {
    id: 'new',
    title: 'New',
    cards: [], // All columns have the same structure
  },
  {
    id: 'qualified',
    title: 'Qualified',
    cards: [], // All columns have the same structure
  },
  {
    id: 'proposition',
    title: 'Proposition',
    cards: [], // All columns have the same structure
  },
  {
    id: 'won',
    title: 'Won',
    cards: [], // All columns have the same structure
  },
];

const onEdit = (card) => {
  // Logic to handle editing the lead
  console.log("Editing lead:", card);
  // You can implement a modal or form to edit the lead details here
};

function LeadsPipeline() {
  const [columns, setColumns] = useState(initialColumns);
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

  const searchOptions = [
    { value: 'title', label: 'Title' },
    { value: 'company', label: 'Company' },
    { value: 'amount', label: 'Amount' },
    { value: 'tags', label: 'Tags' },
  ];

  useEffect(() => {
    const fetchLeadsAndColumns = async () => {
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase.from('columns').select('*');
      if (columnsError) {
        console.error('Error fetching columns:', columnsError);
        return; // Exit if there's an error
      }

      // Initialize column map
      const columnMap = {};
      columnsData.forEach(col => {
        columnMap[col.id] = { ...col, cards: [] }; // Ensure cards is initialized as an empty array
      });

      // Fetch leads with required fields
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, title, budget, company, tags, name, email, phone, lead_source, lead_score, interested_products, assigned_to, status, notes, stage');
      
      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return; // Exit if there's an error
      }

      // Populate the columns with the fetched leads based on their stage
      leadsData.forEach(lead => {
        const stage = lead.stage || 'new'; // Default to 'new' if stage is not set
        if (columnMap[stage]) {
          columnMap[stage].cards.push(lead); // Add the lead to the corresponding column
        }
      });

      // Set the columns state with the updated columns
      setColumns(Object.values(columnMap));
    };

    fetchLeadsAndColumns(); // Call the fetch function on component mount
  }, []);

  const moveCard = async (cardId, fromColumn, toColumn) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => {
        if (col.id === fromColumn) {
          return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
        }
        if (col.id === toColumn) {
          const [movedCard] = prevColumns.find(c => c.id === fromColumn).cards.filter(card => card.id === cardId);
          // Update the stage of the moved card
          const updatedCard = { ...movedCard, stage: toColumn }; // Update stage field

          // Update the card in Supabase
          supabase.from('leads').update({ stage: toColumn }).eq('id', cardId)
            .then(({ data, error }) => {
              if (error) {
                console.error('Error updating lead stage:', error);
              }
            });

          return { 
            ...col, 
            cards: [...col.cards, updatedCard] // Add updated card to the new column
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
    };

    // Insert the new column into Supabase
    const { data, error } = await supabase.from('columns').insert([newColumn]);
    if (error) {
      console.error('Error adding column:', error);
    } else {
      // Update the local state to include the new column
      setColumns(prevColumns => [...prevColumns, newColumn]);
    }

    setNewColumnTitle('');
    setSelectedColumnToInsertAfter('');
    setShowAddColumnModal(false);
  };

  const deleteColumn = async (columnId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this column?");
    if (confirmDelete) {
      // Delete the column from Supabase
      const { data, error } = await supabase.from('columns').delete().eq('id', columnId);
      if (error) {
        console.error('Error deleting column:', error);
        return; // Exit if there's an error
      }

      // Update the local state to remove the deleted column
      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
    }
  };

  const addLead = async (leadData) => {
    const newLeadData = {
      id: Date.now(), // Unique ID for the lead
      title: leadData.title,
      budget: leadData.budget,
      company: leadData.company,
      tags: leadData.tags,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      leadSource: leadData.leadSource,
      leadScore: leadData.leadScore,
      interestedProducts: leadData.interestedProducts,
      assignedTo: leadData.assignedTo,
      status: leadData.status,
      notes: leadData.notes,
      stage: 'new', // Set initial stage to 'new'
    };

    // Insert the new lead into Supabase
    const { data, error } = await supabase.from('leads').insert([newLeadData]);
    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setColumns(prevColumns => {
        const updatedColumns = [...prevColumns];
        updatedColumns[0].cards.push(newLeadData); // Add to the "New" column
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
          cards: column.cards.filter(card => card.id !== cardId) // Remove the card with the matching ID
        };
      });
    });
  };

  return (
    <div className="leads-pipeline">
      <div className="pipeline-header">
        <h1>
          <FontAwesomeIcon icon={faThList} style={{ color: '#4CAF50', marginRight: '8px' }} />
          Leads Pipeline
        </h1>
        <Select
          options={searchOptions}
          isMulti
          placeholder="Search leads..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <div className="header-actions">
          <button className="icon-btn add-column-btn" onClick={() => setShowAddColumnModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <div className="delete-column-dropdown">
            <button className="icon-btn delete-column-btn" onClick={() => setShowDeleteColumnDropdown(!showDeleteColumnDropdown)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
            {showDeleteColumnDropdown && (
              <div className="dropdown-menu">
                {columns.map(column => (
                  <button key={column.id} onClick={() => deleteColumn(column.id)}>
                    {column.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="columns-container">
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            moveCard={moveCard}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddLead={() => setShowAddLeadModal(true)} // Pass the function to show the add lead modal
          />
        ))}
      </div>
      {showAddColumnModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Column</h2>
            <input
              type="text"
              placeholder="Column Title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="modal-input" // Added class for styling
            />
            <select
              value={selectedColumnToInsertAfter}
              onChange={(e) => setSelectedColumnToInsertAfter(e.target.value)}
              className="modal-select" // Added class for styling
            >
              <option value="">Add to end</option>
              {columns.map(col => (
                <option key={col.id} value={col.id}>After {col.title}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="modal-btn" onClick={addColumn}>Add</button>
              <button className="modal-btn" onClick={() => setShowAddColumnModal(false)}>Cancel</button>
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

function Column({ column, moveCard, onEdit, onDelete, onAddLead }) {
  const [, drop] = useDrop({
    accept: 'card',
    drop: (item) => moveCard(item.id, item.columnId, column.id),
  });

  return (
    <div ref={drop} className="column">
      <div className="column-header">
        <h2>{column.title}</h2>
        {column.id === 'new' && (
          <button className="icon-btn add-lead-btn" onClick={onAddLead}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
      {column.cards && column.cards.length > 0 ? (
        column.cards.map(card => (
          <LeadCard key={card.id} card={card} columnId={column.id} onEdit={onEdit} onDelete={onDelete} />
        ))
      ) : (
        <p>No leads in this column.</p> // Handle empty state
      )}
    </div>
  );
}

export default LeadsPipeline;