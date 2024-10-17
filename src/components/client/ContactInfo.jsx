import React, { useState } from 'react';
import './ContactInfo.css'; // Create a CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit} from '@fortawesome/free-solid-svg-icons'; // Import icons

function ContactInfo() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contacts, setContacts] = useState([
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+123-456-7890',
      companyName: 'TechCorp',
      companyAddress: '123 Tech Lane',
      designation: 'Software Engineer',
    },
  ]);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    designation: '',
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleAddContact = () => {
    setContactInfo({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      companyAddress: '',
      designation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditContact = (index) => {
    setEditIndex(index);
    setContactInfo(contacts[index]);
    setIsEditModalOpen(true);
  };

  const handleDeleteContact = (index) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
      alert('Contact deleted successfully.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setContacts([...contacts, contactInfo]);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedContacts = contacts.map((contact, index) =>
      index === editIndex ? contactInfo : contact
    );
    setContacts(updatedContacts);
    setIsEditModalOpen(false);
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
          <div key={index} className="contact-info-card">
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
            <p className="contact-info-text">Company: {contact.companyName || 'Company Name'}</p>
            <p className="contact-info-text">Address: {contact.companyAddress || 'Company Address'}</p>
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
                placeholder="Company Name"
                value={contactInfo.companyName}
                onChange={(e) => setContactInfo({ ...contactInfo, companyName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Company Address"
                value={contactInfo.companyAddress}
                onChange={(e) => setContactInfo({ ...contactInfo, companyAddress: e.target.value })}
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
                placeholder="Company Name"
                value={contactInfo.companyName}
                onChange={(e) => setContactInfo({ ...contactInfo, companyName: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Company Address"
                value={contactInfo.companyAddress}
                onChange={(e) => setContactInfo({ ...contactInfo, companyAddress: e.target.value })}
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
