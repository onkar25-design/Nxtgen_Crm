import React, { useState } from 'react';
import Select from 'react-select'; // Import Select for multi-select fields
import { supabase } from '../../../supabaseClient'; // Use named import
import './EditLeadForm.css'; // Import the CSS file

const EditLeadForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (selectedOptions) => {
    setFormData((prev) => ({ ...prev, tags: selectedOptions.map(option => option.value) }));
  };

  const handleProductsChange = (selectedOptions) => {
    setFormData((prev) => ({ ...prev, interested_products: selectedOptions.map(option => option.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('leads').update(formData).eq('id', formData.id);
      if (error) throw error;
      onSubmit(formData); // Pass updated data back to LeadCard
    } catch (error) {
      console.error('Error updating the lead:', error);
    }
  };

  // Options for tags and products
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
    <div className="new-lead-form-overlay">
      <div className="new-lead-form">
        <h2>Edit Lead</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" required />
            </div>
            <div>
              <label>Budget</label>
              <input name="budget" value={formData.budget} onChange={handleInputChange} placeholder="Budget" required />
            </div>
            <div>
              <label>Company</label>
              <input name="company" value={formData.company} onChange={handleInputChange} placeholder="Company" required />
            </div>
            <div>
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required />
            </div>
            <div>
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
            </div>
            <div>
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" required />
            </div>
            <div>
              <label>Lead Source</label>
              <input name="lead_source" value={formData.lead_source} onChange={handleInputChange} placeholder="Lead Source" required />
            </div>
            <div>
              <label>Assigned To</label>
              <input name="assigned_to" value={formData.assigned_to} onChange={handleInputChange} placeholder="Assigned To" required />
            </div>
            <div>
              <label>Status</label>
              <input name="status" value={formData.status} onChange={handleInputChange} placeholder="Status" required />
            </div>
            <div>
              <label>Lead Score</label>
              <select name="lead_score" value={formData.lead_score} onChange={handleInputChange} required>
                {[1, 2, 3, 4, 5].map(score => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Tags</label>
              <Select
                isMulti
                options={tagOptions}
                onChange={handleTagsChange}
                className="react-select-container"
                classNamePrefix="react-select"
                defaultValue={tagOptions.filter(option => formData.tags.includes(option.value))}
              />
            </div>
            <div>
              <label>Interested Products</label>
              <Select
                isMulti
                options={productOptions}
                onChange={handleProductsChange}
                className="react-select-container"
                classNamePrefix="react-select"
                defaultValue={productOptions.filter(option => formData.interested_products.includes(option.value))}
              />
            </div>
          </div>
          <div>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">Save</button>
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadForm;
