import React from 'react';
import Select from 'react-select';

const EditLeadModalForm = ({ isEditModalOpen, setIsEditModalOpen, updateLead, leadInfo, setLeadInfo, leadSourceOptions, productOptions, tagOptions }) => {
  if (!isEditModalOpen) return null;

  return (
    <div className="client-leads-modal">
      <div className="client-leads-modal-content">
        <h3>Edit Lead</h3>
        <hr className="client-leads-modal-divider" />
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
              <Select
                options={[1, 2, 3, 4, 5].map(score => ({ value: score, label: score }))}
                value={{ value: leadInfo.lead_score, label: leadInfo.lead_score }} // Set selected value
                onChange={(selectedOption) => setLeadInfo({ ...leadInfo, lead_score: selectedOption.value })}
                className="custom-select" // Apply custom styles
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label>Interested Products</label>
              <Select
                isMulti
                options={productOptions}
                value={productOptions.filter(option => leadInfo.interested_products.includes(option.value))} // Set selected options
                onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, interested_products: selectedOptions.map(option => option.value) }))}
                className="custom-select" // Apply custom styles
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label>Status</label>
              <select
                name="status"
                value={leadInfo.status}
                onChange={(e) => setLeadInfo({ ...leadInfo, status: e.target.value })}
                required
              >
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
                onChange={(selectedOptions) => setLeadInfo(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))}
                className="custom-select" // Apply custom styles
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
            <button type="submit" className="client-leads-submit-btn">Update Lead</button>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="client-leads-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModalForm;
