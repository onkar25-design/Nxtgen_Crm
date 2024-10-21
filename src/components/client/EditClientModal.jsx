import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient'; // Import the Supabase client

const EditClientModal = ({ isOpen, onClose, clientInfo, setClientInfo }) => {
  const [localClientInfo, setLocalClientInfo] = useState(clientInfo);

  useEffect(() => {
    setLocalClientInfo(clientInfo); // Update local state when clientInfo changes
  }, [clientInfo]);

  const handleEditClient = async (e) => {
    e.preventDefault();
    // Logic to edit client in Supabase
    const { data, error } = await supabase
      .from('clients')
      .update({
        company_name: localClientInfo.companyName,
        email: localClientInfo.email,
        phone: localClientInfo.phone,
        street: localClientInfo.street,
        city: localClientInfo.city,
        state: localClientInfo.state,
        zip_code: localClientInfo.zipCode,
        country: localClientInfo.country,
      })
      .eq('id', localClientInfo.id); // Assuming you have the client ID to update

    if (error) {
      console.error('Error updating client:', error);
    } else {
      console.log('Client updated:', data);
    }
    onClose(); // Close the modal after editing
  };

  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="contact-info-modal">
      <div className="contact-info-modal-content">
        <h3 className="contact-info-modal-title">Edit Client Information</h3>
        <hr className="contact-info-modal-divider" />
        <form onSubmit={handleEditClient}>
          <input
            type="text"
            placeholder="Company Name"
            value={localClientInfo.companyName}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, companyName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Email"
            value={localClientInfo.email}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={localClientInfo.phone}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, phone: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Street"
            value={localClientInfo.street}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, street: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={localClientInfo.city}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="State"
            value={localClientInfo.state}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, state: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={localClientInfo.zipCode}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, zipCode: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={localClientInfo.country}
            onChange={(e) => setLocalClientInfo({ ...localClientInfo, country: e.target.value })}
            required
          />
          <div className="contact-info-modal-buttons">
            <button type="submit" className="contact-info-submit-btn">Update</button>
            <button type="button" className="contact-info-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
