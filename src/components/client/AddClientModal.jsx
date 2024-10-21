import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient'; // Import the Supabase client

const AddClientModal = ({ isOpen, onClose }) => {
  const [clientInfo, setClientInfo] = useState({
    companyName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: '',
    phone: ''
  });

  const handleAddClient = async (e) => {
    e.preventDefault();
    // Logic to add client to Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        company_name: clientInfo.companyName,
        email: clientInfo.email,
        phone: clientInfo.phone,
        street: clientInfo.street,
        city: clientInfo.city,
        state: clientInfo.state,
        zip_code: clientInfo.zipCode,
        country: clientInfo.country,
      }]);

    if (error) {
      console.error('Error adding client:', error);
    } else {
      console.log('Client added:', data);
    }
    onClose(); // Close the modal after adding
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="contact-info-modal">
      <div className="contact-info-modal-content">
        <h3 className="contact-info-modal-title">Add Client Information</h3>
        <hr className="contact-info-modal-divider" />
        <form onSubmit={handleAddClient}>
          <input
            type="text"
            placeholder="Company Name"
            value={clientInfo.companyName}
            onChange={(e) => setClientInfo({ ...clientInfo, companyName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Email"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Street"
            value={clientInfo.street}
            onChange={(e) => setClientInfo({ ...clientInfo, street: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={clientInfo.city}
            onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="State"
            value={clientInfo.state}
            onChange={(e) => setClientInfo({ ...clientInfo, state: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={clientInfo.zipCode}
            onChange={(e) => setClientInfo({ ...clientInfo, zipCode: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={clientInfo.country}
            onChange={(e) => setClientInfo({ ...clientInfo, country: e.target.value })}
            required
          />
          <div className="contact-info-modal-buttons">
            <button type="submit" className="contact-info-submit-btn">Submit</button>
            <button type="button" className="contact-info-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;
