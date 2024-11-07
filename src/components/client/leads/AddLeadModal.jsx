import React from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

const AddLeadModal = ({ isAddModalOpen, setIsAddModalOpen, addLead, leadInfo, setLeadInfo, leadSourceOptions, productOptions, tagOptions }) => {
  if (!isAddModalOpen) return null;

  return (
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
                  <label>Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={leadInfo.name}
                    onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={leadInfo.email}
                    onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={leadInfo.phone}
                    onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Lead Source</label>
                  <select
                    name="lead_source"
                    value={leadInfo.lead_source}
                    onChange={(e) => setLeadInfo({ ...leadInfo, lead_source: e.target.value })}
                    required
                  >
                    {leadSourceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Lead Score</label>
                  <select name="lead_score" value={leadInfo.lead_score} onChange={(e) => setLeadInfo({ ...leadInfo, lead_score: e.target.value })} required className="form-field-width">
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
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, interested_products: selectedOptions.map(option => option.value) }))} // Update state
                    classNamePrefix="react-select"
                  />
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
                    onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))} // Update state
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={leadInfo.notes}
                    onChange={(e) => setLeadInfo({ ...leadInfo, notes: e.target.value })}
                    required
                  />
                </div>
              </div>
          <div className="client-leads-form-actions">
            <button type="submit" className="client-leads-submit-btn">Add Lead</button>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="client-leads-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
