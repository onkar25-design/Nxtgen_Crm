import React, { useState } from 'react';
import './Leads.css'; // Create a CSS file for styling
import NewLeadForm from '../leads/NewLeadForm'; // Import the NewLeadForm component

function Leads() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leads, setLeads] = useState([]); // State for leads
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', phone: '' }); // State for lead info
  const [editIndex, setEditIndex] = useState(null);

  const handleAddLead = () => {
    setLeadInfo({ name: '', email: '', phone: '' });
    setIsAddModalOpen(true);
  };

  const handleEditLead = (index) => {
    setEditIndex(index);
    setLeadInfo(leads[index]);
    setIsEditModalOpen(true);
  };

  const handleDeleteLead = (index) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const updatedLeads = leads.filter((_, i) => i !== index);
      setLeads(updatedLeads);
      alert('Lead deleted successfully.');
    }
  };

  const addLead = (leadData) => {
    setLeads([...leads, leadData]);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedLeads = leads.map((lead, index) =>
      index === editIndex ? leadInfo : lead
    );
    setLeads(updatedLeads);
    setIsEditModalOpen(false);
  };

  return (
    <div className="leads">
      <div className="leads-header">
        <h2>Leads</h2>
        <button className="lead-info-add-btn" onClick={handleAddLead}>
          +
        </button>
      </div>
      <hr className="leads-divider" /> {/* Divider after heading */}

      {leads.length > 0 ? (
        leads.map((lead, index) => (
          <div key={index} className="lead-card">
            <h3>{lead.name || 'Lead Name'}</h3>
            <p>Email: {lead.email || 'example@example.com'}</p>
            <p>Phone: {lead.phone || '123-456-7890'}</p>
            <button onClick={() => handleEditLead(index)}>Edit</button>
            <button onClick={() => handleDeleteLead(index)}>Delete</button>
          </div>
        ))
      ) : (
        <p>No leads available. Please add a lead.</p>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <NewLeadForm onSubmit={addLead} onCancel={() => setIsAddModalOpen(false)} />
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <div className="lead-modal">
          <div className="lead-modal-content">
            <h3>Edit Lead</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={leadInfo.name}
                onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={leadInfo.email}
                onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={leadInfo.phone}
                onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                required
              />
              <button type="submit">Update</button>
              <button type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
