import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import LeadCard from './LeadCard';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faThList } from '@fortawesome/free-solid-svg-icons'; // Import new icon
import './LeadsPipeline.css';

const initialColumns = [
  {
    id: 'new',
    title: 'New',
    cards: [
      { id: 1, title: 'Office Design Project', amount: 24000, company: 'Deco Addict', tags: ['Design'] },
      { id: 2, title: 'Quote for 150 carpets', amount: 40000, company: 'Ready Mat', tags: ['Product'] },
    ],
  },
  {
    id: 'qualified',
    title: 'Qualified',
    cards: [
      { id: 3, title: 'Interest in your products', amount: 2000, company: 'The Jackson Group', tags: ['Product', 'Information'] },
      { id: 4, title: 'DeltaPC: 10 Computer Desks', amount: 35000, company: 'Ready Mat', tags: ['Information', 'Training'] },
    ],
  },
  {
    id: 'proposition',
    title: 'Proposition',
    cards: [
      { id: 5, title: 'Open Space Design', amount: 11000, company: 'Deco Addict', tags: ['Design'] },
      { id: 6, title: 'Office Design and Architecture', amount: 9000, company: 'Ready Mat', tags: ['Design', 'Consulting'] },
    ],
  },
  {
    id: 'won',
    title: 'Won',
    cards: [
      { id: 7, title: 'Distributor Contract', amount: 19800, company: 'Gemini Furniture', tags: ['Information', 'Other'] },
    ],
  },
];

function LeadsPipeline() {
  const [columns, setColumns] = useState(initialColumns);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showDeleteColumnDropdown, setShowDeleteColumnDropdown] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [selectedColumnToInsertAfter, setSelectedColumnToInsertAfter] = useState('');

  const searchOptions = [
    { value: 'title', label: 'Title' },
    { value: 'company', label: 'Company' },
    { value: 'amount', label: 'Amount' },
    { value: 'tags', label: 'Tags' },
  ];

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
    </div>
  );
}

function Column({ column, moveCard }) {
  const [, drop] = useDrop({
    accept: 'card',
    drop: (item) => moveCard(item.id, item.columnId, column.id),
  });

  return (
    <div ref={drop} className="column">
      <div className="column-header">
        <h2>{column.title}</h2>
      </div>
      {column.cards.map(card => (
        <LeadCard key={card.id} card={card} columnId={column.id} />
      ))}
    </div>
  );
}

export default LeadsPipeline;