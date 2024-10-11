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
    cards: [],
  },
  {
    id: 'qualified',
    title: 'Qualified',
    cards: [
      {
        id: 3,
        title: 'Interest in your products',
        budget: 2000,
        company: 'The Jackson Group',
        tags: ['Product', 'Information'],
        leadSource: 'Referral',
        leadScore: 5,
        interestedProducts: ['Office Supplies'],
        assignedTo: 'Charlie',
        status: 'Qualified',
        notes: 'Schedule a meeting.',
        name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        phone: '555-123-4567',
      },
      {
        id: 4,
        title: 'DeltaPC: 10 Computer Desks',
        budget: 35000,
        company: 'Ready Mat',
        tags: ['Information', 'Training'],
        leadSource: 'Trade Show',
        leadScore: 2,
        interestedProducts: ['Computer Desks'],
        assignedTo: 'Diana',
        status: 'Qualified',
        notes: 'Send proposal.',
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        phone: '555-765-4321',
      },
    ],
  },
  {
    id: 'proposition',
    title: 'Proposition',
    cards: [
      {
        id: 5,
        title: 'Open Space Design',
        budget: 11000,
        company: 'Deco Addict',
        tags: ['Design'],
        leadSource: 'Website',
        leadScore: 4,
        interestedProducts: ['Interior Design'],
        assignedTo: 'Eve',
        status: 'Proposition',
        notes: 'Awaiting client feedback.',
        name: 'Eve Adams',
        email: 'eve.adams@example.com',
        phone: '555-111-2222',
      },
      {
        id: 6,
        title: 'Office Design and Architecture',
        budget: 9000,
        company: 'Ready Mat',
        tags: ['Design', 'Consulting'],
        leadSource: 'Email',
        leadScore: 3, // Lead score below 3
        interestedProducts: ['Consulting Services'],
        assignedTo: 'Frank',
        status: 'Proposition',
        notes: 'Prepare final designs.',
        name: 'Frank Castle',
        email: 'frank.castle@example.com',
        phone: '555-333-4444',
      },
    ],
  },
  {
    id: 'won',
    title: 'Won',
    cards: [
      {
        id: 7,
        title: 'Distributor Contract',
        budget: 19800,
        company: 'Gemini Furniture',
        tags: ['Information', 'Other'],
        leadSource: 'Direct Contact',
        leadScore: 3,
        interestedProducts: ['Furniture'],
        assignedTo: 'Grace',
        status: 'Won',
        notes: 'Contract signed.',
        name: 'Grace Hopper',
        email: 'grace.hopper@example.com',
        phone: '555-555-5555',
      },
    ],
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
    const fetchLeads = async () => { // New function to fetch leads
      const { data, error } = await supabase.from('leads').select('*');
      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        const newColumn = {
          id: 'new',
          title: 'New',
          cards: data.map(lead => ({
            id: lead.id, // Ensure unique ID
            title: lead.title,
            budget: lead.budget,
            company: lead.company,
            tags: lead.tags,
            leadSource: lead.lead_source, // Ensure correct mapping
            leadScore: lead.lead_score, // Ensure correct mapping
            interestedProducts: lead.interested_products, // Ensure correct mapping
            assignedTo: lead.assigned_to, // Ensure correct mapping
            status: lead.status,
            notes: lead.notes,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
          })),
        };
        setColumns(prevColumns => {
          const updatedColumns = prevColumns.map(col => col.id === 'new' ? newColumn : col);
          return updatedColumns;
        });
      }
    };

    fetchLeads(); // Call the fetch function on component mount
  }, []);

  const moveCard = (cardId, fromColumn, toColumn) => {
    setColumns(prevColumns => {
      const updatedColumns = prevColumns.map(col => {
        if (col.id === fromColumn) {
          return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
        }
        if (col.id === toColumn) {
          const [movedCard] = prevColumns.find(c => c.id === fromColumn).cards.filter(card => card.id === cardId);
          return { ...col, cards: [...col.cards, movedCard] };
        }
        return col;
      });
      return updatedColumns;
    });
  };

  const addColumn = () => {
    if (newColumnTitle.trim() === '') return;
    const newColumn = {
      id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'),
      title: newColumnTitle,
      cards: [],
    };
    setColumns(prevColumns => {
      if (selectedColumnToInsertAfter === '') {
        return [...prevColumns, newColumn];
      } else {
        const index = prevColumns.findIndex(col => col.id === selectedColumnToInsertAfter);
        return [...prevColumns.slice(0, index + 1), newColumn, ...prevColumns.slice(index + 1)];
      }
    });
    setNewColumnTitle('');
    setSelectedColumnToInsertAfter('');
    setShowAddColumnModal(false);
  };

  const deleteColumn = (columnId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this column?");
    if (confirmDelete) {
      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
      setShowDeleteColumnDropdown(false);
    }
  };

  const addLead = (leadData) => {
    setColumns(prevColumns => {
      const updatedColumns = [...prevColumns];
      const newLeadData = {
        id: Date.now(), // Unique ID for the lead
        title: leadData.title,
        budget: leadData.budget,
        company: leadData.company,
        tags: leadData.tags,
        name: leadData.name, // Ensure name is included
        email: leadData.email, // Ensure email is included
        phone: leadData.phone, // Ensure phone is included
        leadSource: leadData.leadSource,
        leadScore: leadData.leadScore,
        interestedProducts: leadData.interestedProducts,
        assignedTo: leadData.assignedTo,
        status: leadData.status,
        notes: leadData.notes,
      };
      updatedColumns[0].cards.push(newLeadData); // Add to the "New" column
      return updatedColumns;
    });
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

function Column({ column, moveCard, onEdit, onDelete, onAddLead }) { // Accept onAddLead as a prop
  const [, drop] = useDrop({
    accept: 'card',
    drop: (item) => moveCard(item.id, item.columnId, column.id),
  });

  return (
    <div ref={drop} className="column">
      <div className="column-header">
        <h2>{column.title}</h2>
        {/* Only show the Add New Lead button for the "New" column */}
        {column.id === 'new' && (
          <button className="icon-btn add-lead-btn" onClick={onAddLead}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
      {column.cards.map(card => (
        <LeadCard key={card.id} card={card} columnId={column.id} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default LeadsPipeline;