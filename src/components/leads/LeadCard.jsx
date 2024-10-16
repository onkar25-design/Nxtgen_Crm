import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './LeadCard.css';
import { FaEdit, FaTrash, FaEllipsisV, FaStar } from 'react-icons/fa'; // Import star icon
import EditLeadForm from './EditLeadForm'; // Import the EditLeadForm component
import { supabase } from '../../../supabaseClient'; // Use named import

function LeadCard({ card, columnId, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State to manage editing
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown

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

  const getBackgroundColor = (score) => {
    if (score < 3) return 'rgba(255, 99, 71, 0.1)'; // Light red
    if (score < 4) return 'rgba(255, 165, 0, 0.1)'; // Light orange
    return 'rgba(76, 175, 80, 0.1)'; // Light green
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
    setDropdownOpen(false); // Close dropdown on edit
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
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
      style={{
        borderLeftColor: getBorderColor(card.lead_score),
        borderLeftWidth: '5px',
        borderLeftStyle: 'solid',
        backgroundColor: getBackgroundColor(card.lead_score), // Set background color based on score
      }} // Thicker left border
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="header">
        <h3>{card.title}</h3>
        <div className="dropdown">
          <button onClick={handleDropdownToggle} className="dropdown-button">
            {/* Downward triangle icon using CSS */}
            <span className="triangle-icon"></span>
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="dropdown-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaEdit className="edit-icon" style={{ marginRight: '8px' }} /> Edit
                </div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="dropdown-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaTrash className="delete-icon" style={{ marginRight: '8px' }} /> Delete
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="tags">
        {card.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      {/* Display amount, company name, and stars when card is closed */}
      {!isExpanded && (
        <div className="card-summary">
          <p style={{ fontSize: '0.9em', margin: 0 }}> {/* Adjust font size and margin */}
            <span>$ {card.budget.toLocaleString()}, </span> {/* Add dollar sign and format amount */}
            {card.company}
          </p>
          <div className="lead-score">
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} className={index < card.lead_score ? 'star filled' : 'star'} />
            ))}
          </div>
        </div>
      )}
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
