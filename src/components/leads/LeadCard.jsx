import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './LeadCard.css';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importing edit and delete icons
import NewLeadForm from './NewLeadForm'; // Import the NewLeadForm component

function LeadCard({ card, columnId, onEdit, onDelete }) { // Ensure onDelete is passed
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to manage editing
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { id: card.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const getBorderColor = (score) => {
    if (score < 3) return 'red';
    if (score < 4) return 'orange';
    return 'green';
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      onDelete(card.id); // Call the onDelete function with the card ID
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Open the edit form
  };

  const handleFormSubmit = (updatedData) => {
    onEdit(updatedData); // Call the onEdit function with updated data
    setIsEditing(false); // Close the edit form
  };

  return (
    <div
      ref={drag}
      className={`lead-card ${isDragging ? 'dragging' : ''}`}
      style={{ borderLeftColor: getBorderColor(card.leadScore), borderLeftWidth: '5px', borderLeftStyle: 'solid' }} // Thicker left border
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="header">
        <h3>{card.title}</h3>
        <div>
          <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="edit-button">
            <FaEdit /> {/* Edit icon */}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="delete-button">
            <FaTrash /> {/* Delete icon */}
          </button>
        </div>
      </div>
      <div className="tags">
        {card.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      <div className="lead-score">
        {[...Array(5)].map((_, index) => (
          <span key={index} className={`star ${index < card.leadScore ? 'filled' : ''}`}>★</span>
        ))}
      </div>
      {isExpanded && (
        <div className="card-details">
          <p><strong>Budget:</strong> ${card.budget}</p> {/* Display budget */}
          <p><strong>Company:</strong> {card.company}</p>
          <p><strong>Name:</strong> {card.name}</p>
          <p><strong>Email:</strong> {card.email}</p>
          <p><strong>Phone:</strong> {card.phone}</p> {/* Display phone */}
          <p><strong>Lead Source:</strong> {card.leadSource}</p> {/* Display lead source */}
          <p><strong>Lead Score:</strong> {card.leadScore}</p> {/* Display lead score */}
          <p><strong>Interested Products:</strong> {(card.interestedProducts || []).join(', ')}</p> {/* Display interested products */}
          <p><strong>Assigned To:</strong> {card.assignedTo}</p> {/* Display assigned to */}
          <p><strong>Status:</strong> {card.status}</p> {/* Display status */}
          <p><strong>Notes:</strong> {card.notes}</p> {/* Display notes */}
        </div>
      )}
      {isEditing && (
        <NewLeadForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditing(false)}
          initialData={card} // Pass the current card data to the form
        />
      )}
    </div>
  );
}

export default LeadCard;