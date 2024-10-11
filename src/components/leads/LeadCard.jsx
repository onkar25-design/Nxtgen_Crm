import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './LeadCard.css';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importing edit and delete icons
import EditLeadForm from './EditLeadForm'; // Import the EditLeadForm component
import { supabase } from '../../../supabaseClient'; // Use named import

function LeadCard({ card, columnId, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to manage editing

  // Drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card', // Type of the draggable item
    item: { id: card.id, columnId }, // Data to be passed to the drop target
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // Collect dragging state
    }),
  }));

  const getBorderColor = (score) => {
    if (score < 3) return 'red';
    if (score < 4) return 'orange';
    return 'green';
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await supabase.from('leads').delete().eq('id', card.id); // Delete from Supabase
        onDelete(card.id); // Call the onDelete function with the card ID
      } catch (error) {
        console.error('Error deleting the card:', error); // Handle any errors
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Open the edit form
  };

  const handleFormSubmit = async (updatedData) => {
    try {
      const { error } = await supabase.from('leads').update(updatedData).eq('id', card.id);
      if (error) throw error; // Handle any errors from Supabase

      onEdit({ ...card, ...updatedData }); // Update the existing card with new data
      setIsEditing(false); // Close the edit form
    } catch (error) {
      console.error('Error updating the card:', error); // Handle any errors
    }
  };

  return (
    <div
      ref={drag} // Attach the drag ref to the card
      className={`lead-card ${isDragging ? 'dragging' : ''}`}
      style={{ borderLeftColor: getBorderColor(card.lead_score), borderLeftWidth: '5px', borderLeftStyle: 'solid' }} // Thicker left border
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
          <span key={index} className={`star ${index < card.lead_score ? 'filled' : ''}`}>★</span>
        ))}
      </div>
      {isExpanded && (
        <div className="card-details">
          <p><strong>Budget:</strong> ${card.budget}</p>
          <p><strong>Company:</strong> {card.company}</p>
          <p><strong>Name:</strong> {card.name}</p>
          <p><strong>Email:</strong> {card.email}</p>
          <p><strong>Phone:</strong> {card.phone}</p>
          <p><strong>Lead Source:</strong> {card.lead_source}</p>
          <p><strong>Lead Score:</strong> {card.lead_score}</p>
          <p><strong>Interested Products:</strong> {(card.interested_products || []).join(', ')}</p>
          <p><strong>Assigned To:</strong> {card.assigned_to}</p>
          <p><strong>Status:</strong> {card.status}</p>
          <p><strong>Notes:</strong> {card.notes}</p>
        </div>
      )}
      {isEditing && (
        <EditLeadForm
          initialData={card} // Pass the current card data to the edit form
          onSubmit={handleFormSubmit}
          onCancel={() => setIsEditing(false)} // Close the edit form
        />
      )}
    </div>
  );
}

export default LeadCard;