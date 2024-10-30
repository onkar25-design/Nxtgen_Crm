import React, { useState, useEffect } from 'react';
import './Leads.css'; // Create a CSS file for styling
import Select from 'react-select'; // Import Select for multi-select fields
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'; // Import icons

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
    assigned_to: '',
    status: 'New',
    notes: '',
  }); // State for lead info
  const [currentLeadId, setCurrentLeadId] = useState(null); // State to track the lead being edited
  const [expandedLeadId, setExpandedLeadId] = useState(null); // State to track expanded lead

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
      assigned_to: '',
      status: 'New',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const addLead = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

    const { error } = await supabase
      .from('client_leads')
      .insert([{ ...leadInfo, client_id: clientId, user_id: user.id }]); // Insert new lead with client_id and user_id

    if (error) {
      console.error('Error adding lead:', error);
    } else {
      setLeads([...leads, { ...leadInfo, client_id: clientId }]); // Add new lead to the state
      await logActivity({
        activity: `Added Lead: ${leadInfo.title} (Company: ${leadInfo.company})`, // Include title and company name
        action: 'Add',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEditLead = (lead) => {
    setLeadInfo(lead); // Set the lead info to be edited
    setCurrentLeadId(lead.id); // Set the current lead ID
    setIsEditModalOpen(true); // Open the edit modal
  };

  const updateLead = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const { error } = await supabase
      .from('client_leads')
      .update(leadInfo)
      .eq('id', currentLeadId); // Update the lead in the database

    if (error) {
      console.error('Error updating lead:', error);
    } else {
      setLeads(leads.map(lead => (lead.id === currentLeadId ? leadInfo : lead))); // Update the lead in the state
      await logActivity({
        activity: `Edited Lead: ${leadInfo.title} (Company: ${leadInfo.company})`, // Include title and company name
        action: 'Edit',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
      setIsEditModalOpen(false); // Close the edit modal
    }
  };

  const deleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) { // Confirmation alert
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
        await logActivity({
          activity: `Deleted Lead: ${leadToDelete.title} (Company: ${leadToDelete.company})`, // Include title and company name
          action: 'Delete',
          activity_by: 'User',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
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
                <p><strong>Assigned To:</strong> {lead.assigned_to}</p>
                <p><strong>Status:</strong> {lead.status}</p>
                <p><strong>Notes:</strong> {lead.notes}</p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No leads available. Please add a lead.</p>
      )}

      {/* Modal for Adding Leads */}
      {isAddModalOpen && (
        <div className="client-leads-modal">
          <div className="client-leads-modal-content">
            <h3 className="client-leads-modal-title">Add Lead Information</h3>
            <hr className="client-leads-modal-divider" />
            <form onSubmit={addLead}>
              <div className="client-leads-form-grid">
                <div>
                  <label>Title</label>
                  <input type="text" name="title" value={leadInfo.title} onChange={(e) => setLeadInfo({ ...leadInfo, title: e.target.value })} required />
                </div>
                <div>
                  <label>Budget</label>
                  <input type="number" name="budget" value={leadInfo.budget} onChange={(e) => setLeadInfo({ ...leadInfo, budget: e.target.value })} required />
                </div>
                <div>
                  <label>Company</label>
                  <input type="text" name="company" value={leadInfo.company} onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })} required />
                </div>
                <div>
                  <label>Name</label>
                  <input type="text" name="name" value={leadInfo.name} onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })} required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" name="email" value={leadInfo.email} onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })} required />
                </div>
                <div>
                  <label>Phone</label>
                  <input type="tel" name="phone" value={leadInfo.phone} onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })} required />
                </div>
                <div>
                  <label>Lead Source</label>
                  <input type="text" name="lead_source" value={leadInfo.lead_source} onChange={(e) => setLeadInfo({ ...leadInfo, lead_source: e.target.value })} required />
                </div>
                <div>
                  <label>Lead Score</label>
                  <select name="lead_score" value={leadInfo.lead_score} onChange={(e) => setLeadInfo({ ...leadInfo, lead_score: e.target.value })} required>
                    {[1, 2, 3, 4, 5].map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Interested Products</label>
                  <Select
                    isMulti
                    options={productOptions}
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, interested_products: selectedOptions.map(option => option.value) }))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label>Assigned To</label>
                  <input type="text" name="assigned_to" value={leadInfo.assigned_to} onChange={(e) => setLeadInfo({ ...leadInfo, assigned_to: e.target.value })} required />
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" value={leadInfo.status} onChange={(e) => setLeadInfo({ ...leadInfo, status: e.target.value })} required>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label>Tags</label>
                  <Select
                    isMulti
                    options={tagOptions}
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
              <div>
                <label>Notes</label>
                <textarea name="notes" value={leadInfo.notes} onChange={(e) => setLeadInfo({ ...leadInfo, notes: e.target.value })} rows={3}></textarea>
              </div>
              <div className="client-leads-form-actions">
                <button type="submit" className="client-leads-submit-btn">Add Lead</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="client-leads-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Leads */}
      {isEditModalOpen && (
        <div className="client-leads-modal">
          <div className="client-leads-modal-content">
            <h3>Edit Lead</h3>
            <form onSubmit={updateLead}>
              <div className="client-leads-form-grid">
                <div>
                  <label>Title</label>
                  <input type="text" name="title" value={leadInfo.title} onChange={(e) => setLeadInfo({ ...leadInfo, title: e.target.value })} required />
                </div>
                <div>
                  <label>Budget</label>
                  <input type="number" name="budget" value={leadInfo.budget} onChange={(e) => setLeadInfo({ ...leadInfo, budget: e.target.value })} required />
                </div>
                <div>
                  <label>Company</label>
                  <input type="text" name="company" value={leadInfo.company} onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })} required />
                </div>
                <div>
                  <label>Name</label>
                  <input type="text" name="name" value={leadInfo.name} onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })} required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" name="email" value={leadInfo.email} onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })} required />
                </div>
                <div>
                  <label>Phone</label>
                  <input type="tel" name="phone" value={leadInfo.phone} onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })} required />
                </div>
                <div>
                  <label>Lead Source</label>
                  <input type="text" name="lead_source" value={leadInfo.lead_source} onChange={(e) => setLeadInfo({ ...leadInfo, lead_source: e.target.value })} required />
                </div>
                <div>
                  <label>Lead Score</label>
                  <select name="lead_score" value={leadInfo.lead_score} onChange={(e) => setLeadInfo({ ...leadInfo, lead_score: e.target.value })} required>
                    {[1, 2, 3, 4, 5].map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Interested Products</label>
                  <Select
                    isMulti
                    options={productOptions}
                    value={productOptions.filter(option => leadInfo.interested_products.includes(option.value))} // Set selected options
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, interested_products: selectedOptions.map(option => option.value) }))}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label>Assigned To</label>
                  <input type="text" name="assigned_to" value={leadInfo.assigned_to} onChange={(e) => setLeadInfo({ ...leadInfo, assigned_to: e.target.value })} required />
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" value={leadInfo.status} onChange={(e) => setLeadInfo({ ...leadInfo, status: e.target.value })} required>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up Needed">Follow-up Needed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label>Tags</label>
                  <Select
                    isMulti
                    options={tagOptions}
                    value={tagOptions.filter(option => leadInfo.tags.includes(option.value))} // Set selected options
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))} // Update tags in leadInfo
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
              <div>
                <label>Notes</label>
                <textarea name="notes" value={leadInfo.notes} onChange={(e) => setLeadInfo({ ...leadInfo, notes: e.target.value })} rows={3}></textarea>
              </div>
              <div className="client-leads-form-actions">
                <button type="submit" className="client-leads-submit-btn">Update Lead</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="client-leads-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
