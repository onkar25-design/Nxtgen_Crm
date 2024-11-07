import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import './LeadCard.css';
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa'; // Import star icon
import EditLeadModalForm from '../../client/leads/EditLeadModalForm'; // Import the EditLeadModalForm component
import { supabase } from '../../../../supabaseClient'; // Use named import
import Swal from 'sweetalert2'; // Import SweetAlert2

// Function to log activity
const logActivity = async (activity) => {
  console.log('Logging activity:', activity); // Log the activity being logged
  const { error } = await supabase
    .from('activity_log') // Assuming you have an 'activity_log' table
    .insert([activity]);

  if (error) {
    console.error('Error logging activity:', error);
  } else {
    console.log('Activity logged successfully'); // Log success message
  }
};

function LeadCard({ card, columnId, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [leadInfo, setLeadInfo] = useState(card); // Initialize with card data
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown

  // Define options for lead source, lead score, tags, and products
  const leadSourceOptions = [
    { value: 'Email', label: 'Email' },
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Referral', label: 'Referral' },
  ];

  const leadScoreOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
  ];

  // Updated tag options to match Leads.jsx
  const tagOptions = [
    { value: 'Design', label: 'Design' },
    { value: 'Product', label: 'Product' },
    { value: 'Information', label: 'Information' },
    { value: 'Training', label: 'Training' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Other', label: 'Other' },
  ];

  const productOptions = [
    { value: 'Office Design', label: 'Office Design' },
    { value: 'Carpets', label: 'Carpets' },
    { value: 'Computer Desks', label: 'Computer Desks' },
    { value: 'Training', label: 'Training' },
    { value: 'Architecture Consulting', label: 'Architecture Consulting' },
    { value: 'Distribution Rights', label: 'Distribution Rights' },
  ];

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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await supabase.from('client_leads').delete().eq('id', card.id); // Change to delete from client_leads
        onDelete(card.id); // Call the onDelete function with the card ID
        
        // Log delete activity
        const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user
        const { data: userData, error: userDetailsError } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single(); // Fetch the user details

        if (!userDetailsError) {
          const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name
          await logActivity({
            activity: `Deleted Lead: ${card.title} (Company: ${card.company})`, // Include title and company name
            action: 'Delete',
            user_id: user.id, // Pass user ID to user_id
            activity_by: userName, // Use full name for activity_by
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
          });
        }

        // Show success alert for deletion
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The lead has been deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting the card:', error); // Handle any errors
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'There was an error deleting the lead. Please try again.',
        });
      }
    }
  };

  const handleEdit = () => {
    setLeadInfo(card); // Set the current card data to leadInfo
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const updatedData = {
        ...leadInfo, // Assuming leadInfo holds all updated lead data from the form
      };

      const { error } = await supabase.from('client_leads').update(updatedData).eq('id', card.id);
      if (error) throw error;

      // Update local state to reflect changes
      setLeadInfo(updatedData); // Update the leadInfo state with the new data
      onEdit(updatedData); // Optionally call onEdit if you need to propagate changes up to a parent component

      // Log edit activity
      const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user
      const { data: userData, error: userDetailsError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single(); // Fetch the user details

      if (!userDetailsError) {
        const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name
        await logActivity({
          activity: `Edited Lead: ${updatedData.title} (Company: ${updatedData.company})`, // Include title and company name
          action: 'Edit',
          user_id: user.id, // Pass user ID to user_id
          activity_by: userName, // Use full name for activity_by
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
        });
      }

      setIsEditModalOpen(false); // Close the modal after successful update
      Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        text: 'The lead has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating the card:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update the lead. Please try again.',
      });
    }
  };

  return (
    <div
      ref={drag} // Attach the drag ref to the card
      className={`leadcard-lead-card ${isDragging ? 'dragging' : ''}`}
      style={{
        borderLeftColor: getBorderColor(card.lead_score),
        borderLeftWidth: '5px',
        borderLeftStyle: 'solid',
        backgroundColor: getBackgroundColor(card.lead_score), // Set background color based on score
      }} // Thicker left border
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="leadcard-header">
        <h3>{card.title}</h3>
        <div className="leadcard-dropdown">
          <button onClick={handleDropdownToggle} className="leadcard-dropdown-button">
            <span className="leadcard-triangle-icon"></span>
          </button>
          {dropdownOpen && (
            <div className="leadcard-dropdown-menu">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="leadcard-dropdown-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaEdit className="leadcard-edit-icon" style={{ marginRight: '8px' }} /> Edit
                </div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="leadcard-dropdown-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaTrash className="leadcard-delete-icon" style={{ marginRight: '8px' }} /> Delete
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="leadcard-tags">
        {card.tags.map((tag, index) => (
          <span key={index} className="leadcard-tag">{tag}</span>
        ))}
      </div>
      {/* Display amount, company name, and stars when card is closed */}
      {!isExpanded && (
        <div className="leadcard-card-summary">
          <p style={{ fontSize: '0.9em', margin: 0 }}>
            <span>$ {card.budget.toLocaleString()}, </span>
            {card.company}
          </p>
          <div className="leadcard-lead-score">
            {Array.from({ length: 5 }, (_, index) => (
              <FaStar key={index} className={index < card.lead_score ? 'leadcard-star filled' : 'leadcard-star'} />
            ))}
          </div>
        </div>
      )}
      {isExpanded && (
        <div className="leadcard-card-details">
          <p><strong>Budget:</strong> ${card.budget}</p>
          <p><strong>Company:</strong> {card.company}</p>
          <p><strong>Name:</strong> {card.name}</p>
          <p><strong>Email:</strong> {card.email}</p>
          <p><strong>Phone:</strong> {card.phone}</p>
          <p><strong>Lead Source:</strong> {card.lead_source}</p>
          <p><strong>Lead Score:</strong> {card.lead_score}</p>
          <p><strong>Interested Products:</strong> {(card.interested_products || []).join(', ')}</p>
          <p><strong>Status:</strong> {card.status}</p>
          <p><strong>Notes:</strong> {card.notes}</p>
        </div>
      )}
      {isEditModalOpen && (
        <EditLeadModalForm
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          updateLead={handleFormSubmit} // Reuse handleFormSubmit for updating lead
          leadInfo={leadInfo}
          setLeadInfo={setLeadInfo}
          leadSourceOptions={leadSourceOptions}
          productOptions={productOptions} // Assume productOptions is defined elsewhere or passed as props
          tagOptions={tagOptions}
          leadScoreOptions={leadScoreOptions}
        />
      )}
    </div>
  );
}

export default LeadCard;
