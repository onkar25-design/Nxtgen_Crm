import React, { useState, useEffect } from 'react';
import './Leads.css'; // Create a CSS file for styling
import { supabase } from '../../../supabaseClient'; // Import Supabase client

function Leads({ clientId }) { // Accept clientId as a prop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leads, setLeads] = useState([]); // State for leads
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', phone: '' }); // State for lead info

  // Fetch leads from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('client_leads')
        .select('*')
        .eq('client_id', clientId); // Filter leads by client_id

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

  const handleAddLead = () => {
    setLeadInfo({ name: '', email: '', phone: '' });
    setIsAddModalOpen(true);
  };

  const addLead = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const { error } = await supabase
      .from('client_leads')
      .insert([{ ...leadInfo, client_id: clientId }]); // Insert new lead with client_id

    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setLeads([...leads, { ...leadInfo, client_id: clientId }]); // Add new lead to the state
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="leads">
      <div className="leads-header">
        <h2>Leads</h2>
        <button className="lead-info-add-btn" onClick={handleAddLead}>
          +
        </button>
      </div>
      <hr className="leads-divider" />

      {leads.length > 0 ? (
        leads.map((lead, index) => (
          <div key={index} className="lead-card">
            <h3>{lead.name || 'Lead Name'}</h3>
            <p>Email: {lead.email || 'example@example.com'}</p>
            <p>Phone: {lead.phone || '123-456-7890'}</p>
            {/* Add edit and delete buttons here if needed */}
          </div>
        ))
      ) : (
        <p>No leads available. Please add a lead.</p>
      )}

      {/* Modal for Adding Leads */}
      {isAddModalOpen && (
        <div className="lead-modal">
          <div className="lead-modal-content">
            <h3>Add New Lead</h3>
            <form onSubmit={addLead}>
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
              <div className="lead-modal-buttons">
                <button type="submit">Add Lead</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
