import React, { useState, useEffect } from 'react';
import './Leads.css'; // Create a CSS file for styling
import Select from 'react-select'; // Import Select for multi-select fields
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faTrash, faEdit, faUser } from '@fortawesome/free-solid-svg-icons'; // Import icons
import Swal from 'sweetalert2'; // Import SweetAlert
import AddLeadModal from './AddLeadModal'; // Import the new AddLeadModal component
import EditLeadModalForm from './EditLeadModalForm'; // Import the EditLeadModalForm component

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

// Function to capitalize the first letter of each word
const capitalizeEachWord = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Add lead source options
const leadSourceOptions = [
  { value: 'Email', label: 'Email' },
  { value: 'Website', label: 'Website' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Surveys', label: 'Surveys' },
];

function Leads({ clientId, companyName }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [leads, setLeads] = useState([]); // State for leads
  const [leadInfo, setLeadInfo] = useState({
    title: '',
    budget: 0,
    company: companyName, // Set initial company name from props
    tags: [],
    name: '',
    email: '',
    phone: '',
    lead_source: '',
    lead_score: 1,
    interested_products: [],
    status: 'New',
    notes: '',
  }); // State for lead info
  const [currentLeadId, setCurrentLeadId] = useState(null); // State to track the lead being edited
  const [expandedLeadId, setExpandedLeadId] = useState(null); // State to track expanded lead
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // State for assign modal
  const [selectedLeadUserId, setSelectedLeadUserId] = useState(null); // State to track selected lead's user ID
  const [assignedUser, setAssignedUser] = useState({ first_name: '', last_name: '' }); // State to store assigned user's details
  const [allUsers, setAllUsers] = useState([]); // State to store all users
  const [newUserId, setNewUserId] = useState(null); // State to store the new user ID for assignment

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#333', // Set background color to dark (black)
      borderColor: '#555', // Set border color to a lighter shade of black
      boxShadow: 'none', // Remove box shadow
      '&:hover': {
        borderColor: '#777', // Change border color on hover
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#28a745' : state.isFocused ? '#28a745' : '#333', // Green for selected and focused, dark for unselected
      color: state.isSelected ? 'white' : 'white', // White text for all options
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure the dropdown appears above other elements
      backgroundColor: '#333', // Match the menu background with the control
    }),
  };

  // Fetch leads from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchLeads = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

      // Check if the user is an admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        return;
      }

      let query = supabase
        .from('client_leads')
        .select('*')
        .eq('client_id', clientId); // Filter leads by client_id

      // If the user is an admin, fetch all leads; otherwise, filter by user_id
      if (userData.role === 'admin') {
        // Admins can see all leads
        query = query;
      } else {
        // Regular users can only see their own leads
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
      } else {
        setLeads(data);
      }
    };

    if (clientId) {
      fetchLeads();
    }
  }, [clientId]);

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchAllUsers = async () => {
      const { data, error } = await supabase.from('users').select('id, first_name, last_name');
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setAllUsers(data); // Set the fetched users
      }
    };

    fetchAllUsers();
  }, []);

  const handleAddLead = () => {
    setLeadInfo({
      title: '',
      budget: 0,
      company: companyName, // Set initial company name from props
      tags: [],
      name: '',
      email: '',
      phone: '',
      lead_source: '',
      lead_score: 1,
      interested_products: [],
      stage: 'new', // Set default stage to 'New'
      status: 'New', // Allow status to be selected from dropdown
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const addLead = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(leadInfo.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be a 10-digit number.',
      });
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(leadInfo.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    // Capitalize first letter of each word in name
    const formattedLeadInfo = {
      ...leadInfo,
      name: capitalizeEachWord(leadInfo.name),
    };

    const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

    // Fetch user details to get first and last name
    const { data: userData, error: userDetailsError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single(); // Fetch the user details

    if (userDetailsError) {
      console.error('Error fetching user details:', userDetailsError);
      return; // Exit if there's an error
    }

    const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name

    const { error } = await supabase
      .from('client_leads')
      .insert([{ ...formattedLeadInfo, client_id: clientId, user_id: user.id }]); // Insert new lead with client_id and user_id

    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setLeads([...leads, { ...formattedLeadInfo, client_id: clientId }]); // Add new lead to the state
      await logActivity({
        activity: `Added Lead: ${formattedLeadInfo.title} (Company: ${formattedLeadInfo.company})`, // Include title and company name
        action: 'Add',
        user_id: user.id, // Pass user ID to user_id
        activity_by: userName, // Use full name for activity_by
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
      setIsAddModalOpen(false);

      // Show success alert for lead added
      Swal.fire({
        icon: 'success',
        title: 'Lead Added Successfully',
        text: 'The lead has been added successfully.',
      });
    }
  };

  const handleEditLead = (lead) => {
    setLeadInfo(lead); // Set the lead info to be edited
    setCurrentLeadId(lead.id); // Set the current lead ID
    setIsEditModalOpen(true); // Open the edit modal
  };

  const updateLead = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(leadInfo.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be a 10-digit number.',
      });
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(leadInfo.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    // Capitalize first letter of each word in name
    const formattedLeadInfo = {
      ...leadInfo,
      name: capitalizeEachWord(leadInfo.name),
    };

    const { error } = await supabase
      .from('client_leads')
      .update(formattedLeadInfo)
      .eq('id', currentLeadId); // Update the lead in the database

    if (error) {
      console.error('Error updating lead:', error);
    } else {
      setLeads(leads.map(lead => (lead.id === currentLeadId ? formattedLeadInfo : lead))); // Update the lead in the state
      const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

      // Fetch user details to get first and last name
      const { data: userData, error: userDetailsError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single(); // Fetch the user details

      if (userDetailsError) {
        console.error('Error fetching user details:', userDetailsError);
        return; // Exit if there's an error
      }

      const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name

      await logActivity({
        activity: `Edited Lead: ${formattedLeadInfo.title} (Company: ${formattedLeadInfo.company})`, // Include title and company name
        action: 'Edit',
        user_id: user.id, // Pass user ID to user_id
        activity_by: userName, // Use full name for activity_by
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
      setIsEditModalOpen(false); // Close the edit modal

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        text: 'The lead has been updated successfully.',
      });
    }
  };

  const deleteLead = async (leadId) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        // Fetch the lead details before deletion
        const leadToDelete = leads.find(lead => lead.id === leadId); // Find the lead to delete

        const { error } = await supabase
            .from('client_leads')
            .delete()
            .eq('id', leadId); // Delete the lead from the database

        if (error) {
            console.error('Error deleting lead:', error);
        } else {
            setLeads(leads.filter(lead => lead.id !== leadId)); // Remove the lead from the state
            const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

            // Fetch user details to get first and last name
            const { data: userData, error: userDetailsError } = await supabase
                .from('users')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single(); // Fetch the user details

            if (userDetailsError) {
                console.error('Error fetching user details:', userDetailsError);
                return; // Exit if there's an error
            }

            const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name

            await logActivity({
                activity: `Deleted Lead: ${leadToDelete.title} (Company: ${leadToDelete.company})`, // Include title and company name
                action: 'Delete',
                user_id: user.id, // Pass user ID to user_id
                activity_by: userName, // Use full name for activity_by
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString(),
            });

            // Show success alert for deletion
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The lead has been deleted successfully.',
            });
        }
    }
  };

  const toggleExpandLead = (id) => {
    setExpandedLeadId(expandedLeadId === id ? null : id); // Toggle expanded state
  };

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

  // Function to handle opening the assign modal
  const handleAssignLead = async (lead) => {
    const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

    // Check if the user is an admin
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return;
    }

    // Check if the user is authorized to assign leads
    if (userData.role !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You are not authorized to access this option.',
      });
      return; // Exit the function if not authorized
    }

    setCurrentLeadId(lead.id); // Set the current lead ID
    setSelectedLeadUserId(lead.user_id); // Set the user ID of the lead

    // Fetch user details from the users table
    const { data: userDataDetails, error: userDetailsError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', lead.user_id)
      .single();

    if (userDetailsError) {
      console.error('Error fetching user details:', userDetailsError);
    } else {
      setAssignedUser(userDataDetails); // Set the fetched user details
    }

    setIsAssignModalOpen(true); // Open the assign modal
  };

  // Function to handle user selection
  const handleUserChange = (selectedOption) => {
    setNewUserId(selectedOption.value); // Store the new user ID from the selected option
  };

  // Function to assign the lead to the new user
  const assignLeadToUser = async () => {
    if (newUserId && currentLeadId) { // Ensure currentLeadId is not null
        const { error } = await supabase
            .from('client_leads')
            .update({ user_id: newUserId }) // Update the user ID in the client_leads table
            .eq('id', currentLeadId); // Ensure you have currentLeadId set when editing

        if (error) {
            console.error('Error assigning lead to user:', error);
        } else {
            setSelectedLeadUserId(newUserId); // Update the state with the new user ID
            setIsAssignModalOpen(false); // Close the modal

            // Show success alert for assignment
            Swal.fire({
                icon: 'success',
                title: 'Assigned!',
                text: 'The lead has been assigned successfully.',
            });
        }
    } else {
        console.error('Current lead ID is null or new user ID is not selected.');
    }
  };

  return (
    <div className="client-leads">
      <div className="client-leads-header">
        <h2>Leads</h2>
        <button className="client-leads-add-btn" onClick={handleAddLead}>
          +
        </button>
      </div>
      <hr className="client-leads-divider" />

      {leads.length > 0 ? (
        leads.map((lead) => (
          <div key={lead.id} className={`client-leads-card lead-score-${lead.lead_score}`} onClick={() => toggleExpandLead(lead.id)}>
            <div className="client-leads-card-actions">
              <button onClick={(e) => { e.stopPropagation(); handleEditLead(lead); }} className="client-leads-card-edit-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }} className="client-leads-card-delete-btn">
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleAssignLead(lead); }} className="client-leads-card-assign-btn">
                <FontAwesomeIcon icon={faUser} /> {/* Assign button with user icon */}
              </button>
            </div>

            {/* Display title, tags, and stars when the card is closed */}
            {expandedLeadId !== lead.id ? (
              <>
                <h3>{lead.title || 'Lead Title'}</h3>
                <div className="lead-tags">
                  {lead.tags.map(tag => (
                    <span key={tag} className="lead-tag">{tag}</span>
                  ))}
                </div>
                <div className="lead-score-stars">
                  {Array.from({ length: lead.lead_score }, (_, index) => (
                    <span key={index} className="star">★</span>
                  ))}
                  {Array.from({ length: 5 - lead.lead_score }, (_, index) => (
                    <span key={index} className="star empty">☆</span>
                  ))}
                </div>
              </>
            ) : (
              // When the card is expanded, hide the title, tags, and lead score
              <div className="client-leads-card-details">
                {/* Do not display title, company, or lead score here */}
                <p><strong>Budget:</strong> ${lead.budget}</p>
                <p><strong>Lead Source:</strong> {lead.lead_source}</p>
                <p><strong>Interested Products:</strong> {lead.interested_products.join(', ')}</p>
                <p><strong>Status:</strong> {lead.status}</p>
                <p><strong>Notes:</strong> {lead.notes}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No leads available. Please add a lead.</p>
      )}

      {/* Replace the existing modal code with the AddLeadModal component */}
      <AddLeadModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        addLead={addLead}
        leadInfo={leadInfo}
        setLeadInfo={setLeadInfo}
        leadSourceOptions={leadSourceOptions}
        productOptions={productOptions}
        tagOptions={tagOptions}
      />

      {/* Replace the existing edit modal code with the EditLeadModalForm component */}
      <EditLeadModalForm
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        updateLead={updateLead}
        leadInfo={leadInfo}
        setLeadInfo={setLeadInfo}
        leadSourceOptions={leadSourceOptions}
        productOptions={productOptions}
        tagOptions={tagOptions}
      />

      {/* Modal for Assigning Leads */}
      {isAssignModalOpen && (
        <div className="client-leads-modal">
          <div className="client-leads-modal-content">
            <h3>Assign Lead</h3>
            <hr className="client-leads-modal-divider" />
            <p>Currently assigned to: {assignedUser.first_name} {assignedUser.last_name}</p>
            <Select
              options={allUsers.map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name}`
              }))}
              onChange={handleUserChange}
              classNamePrefix="react-select"
              styles={customSelectStyles}
            />
            <div className="client-leads-form-actions">
              <button type="button" onClick={assignLeadToUser} className="client-leads-submit-btn">Assign</button>
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="client-leads-cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
