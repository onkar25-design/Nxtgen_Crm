import React, { useState, useEffect } from 'react';
import './ContactInfo.css'; // Create a CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'; // Import icons
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import Swal from 'sweetalert2';

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

function ContactInfo({ clientId }) { // Accept clientId as a prop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [companyName, setCompanyName] = useState(''); // Add state for company name
  const [userId, setUserId] = useState(null); // State for user ID
  const [userName, setUserName] = useState(''); // State for user full name

  // Fetch user ID and user name when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
      } else {
        setUserId(user.id);
        const { data: userData, error: userDetailsError } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        if (userDetailsError) {
          console.error('Error fetching user details:', userDetailsError);
        } else {
          setUserName(`${userData.first_name} ${userData.last_name}`);
        }
      }
    };

    fetchUser();
  }, []);

  // Fetch contacts and company name from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchContacts = async () => {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId); // Fetch company name by client ID

      if (clientError) {
        console.error('Error fetching client:', clientError);
      } else {
        setCompanyName(clientData[0]?.company_name); // Set company name
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('client_id', clientId); // Filter contacts by client_id

      if (error) {
        console.error('Error fetching contacts:', error);
      } else {
        setContacts(data);
      }
    };

    if (clientId) {
      fetchContacts();
    }
  }, [clientId]);

  const handleAddContact = () => {
    setContactInfo({
      name: '',
      email: '',
      phone: '',
      designation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditContact = (index) => {
    setEditIndex(index);
    setContactInfo(contacts[index]);
    setIsEditModalOpen(true);
  };

  const handleDeleteContact = async (index) => {
    // Use SweetAlert for confirmation before deletion
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contacts[index].id); // Delete contact by ID

      if (error) {
        console.error('Error deleting contact:', error);
      } else {
        const deletedContact = contacts[index]; // Store deleted contact info
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        await logActivity({ 
          activity: `Deleted Contact: ${deletedContact.name} (Client: ${companyName})`, // Update activity log
          action: 'Delete', 
          activity_by: userName, // Use full name for activity_by
          user_id: userId, // Include user ID
          date: new Date().toISOString().split('T')[0], 
          time: new Date().toLocaleTimeString() 
        });
        Swal.fire({
          icon: 'success',
          title: 'Contact Deleted',
          text: 'Contact deleted successfully.',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(contactInfo.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be a 10-digit number.',
      });
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contactInfo.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    // Capitalize first letter of each word in name and designation
    const formattedContactInfo = {
      ...contactInfo,
      name: capitalizeEachWord(contactInfo.name),
      designation: capitalizeEachWord(contactInfo.designation),
    };

    const { error } = await supabase
      .from('contacts')
      .insert([{ 
          ...formattedContactInfo, 
          client_id: clientId 
      }]); // Insert new contact with client_id

    if (error) {
      console.error('Error adding contact:', error);
    } else {
      setContacts([...contacts, { ...formattedContactInfo, client_id: clientId }]); // Add new contact to the state
      await logActivity({ 
        activity: `Added Contact: ${formattedContactInfo.name} (Client: ${companyName})`, // Update activity log
        action: 'Add', 
        activity_by: userName, // Use full name for activity_by
        user_id: userId, // Include user ID
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString() 
      });
      setIsAddModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Contact Added',
        text: 'Contact added successfully.',
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(contactInfo.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be a 10-digit number.',
      });
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contactInfo.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    // Capitalize first letter of each word in name and designation
    const formattedContactInfo = {
      ...contactInfo,
      name: capitalizeEachWord(contactInfo.name),
      designation: capitalizeEachWord(contactInfo.designation),
    };

    const { error } = await supabase
      .from('contacts')
      .update(formattedContactInfo)
      .eq('id', contacts[editIndex].id); // Update contact by ID

    if (error) {
      console.error('Error updating contact:', error);
    } else {
      const updatedContacts = contacts.map((contact, index) =>
        index === editIndex ? formattedContactInfo : contact
      );
      setContacts(updatedContacts);
      await logActivity({ 
        activity: `Edited Contact: ${formattedContactInfo.name} (Client: ${companyName})`, // Update activity log
        action: 'Edit', 
        activity_by: userName, // Use full name for activity_by
        user_id: userId, // Include user ID
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString() 
      });
      setIsEditModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Contact Updated',
        text: 'Contact updated successfully.',
      });
    }
  };

  return (
    <div className="contact-info-container">
      <div className="contact-info-header">
        <h2 className="contact-info-title">Contact Information</h2>
        <button className="contact-info-add-btn" onClick={handleAddContact}>
          +
        </button>
      </div>
      <hr className="contact-info-divider" />

      {contacts.length > 0 ? (
        contacts.map((contact, index) => (
          <div key={contact.id} className="contact-info-card">
            <div className="contact-info-header">
              <h3>{contact.name || 'Contact Name'}</h3>
              <div>
                <button className="contact-info-edit-btn" onClick={() => handleEditContact(index)}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="contact-info-delete-btn" onClick={() => handleDeleteContact(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
            <p className="contact-info-text">Email: {contact.email || 'example@example.com'}</p>
            <p className="contact-info-text">Phone: {contact.phone || '123-456-7890'}</p>
            <p className="contact-info-text">Designation: {contact.designation || 'Designation'}</p>
          </div>
        ))
      ) : (
        <p>No contacts available. Please add a contact.</p>
      )}

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="contact-info-modal">
          <div className="contact-info-modal-content">
            <h3 className="contact-info-modal-title">Add Contact Information</h3>
            <hr className="contact-info-modal-divider" />
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Designation"
                value={contactInfo.designation}
                onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })}
                required
              />
              <div className="contact-info-modal-buttons">
                <button type="submit" className="contact-info-submit-btn">Submit</button>
                <button type="button" className="contact-info-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {isEditModalOpen && (
        <div className="contact-info-modal">
          <div className="contact-info-modal-content">
            <h3 className="contact-info-modal-title">Edit Contact Information</h3>
            <hr className="contact-info-modal-divider" />
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Designation"
                value={contactInfo.designation}
                onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })}
                required
              />
              <div className="contact-info-modal-buttons">
                <button type="submit" className="contact-info-submit-btn">Update</button>
                <button type="button" className="contact-info-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactInfo;
