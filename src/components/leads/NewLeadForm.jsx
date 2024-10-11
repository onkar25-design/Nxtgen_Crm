import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './NewLeadForm.css';
import { supabase } from '../../../supabaseClient'; // Supabase client import

const NewLeadForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    budget: 0, 
    company: '',
    tags: [],
    name: '',
    email: '',
    phone: '',
    leadSource: '',
    leadScore: 1,
    interestedProducts: [],
    assignedTo: '',
    status: 'New',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Populate form with initial data
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitLeadToSupabase(formData);
    if (result) {
      onSubmit(formData); // Trigger the parent component's submission
    }
  };

  const submitLeadToSupabase = async (leadData) => {
    const { data, error } = await supabase
      .from('leads')  // Ensure the 'leads' table exists
      .insert([
        {
          title: leadData.title,
          budget: leadData.budget,
          company: leadData.company,
          tags: leadData.tags,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          lead_source: leadData.leadSource,
          lead_score: leadData.leadScore,
          interested_products: leadData.interestedProducts,
          assigned_to: leadData.assignedTo,
          status: leadData.status,
          notes: leadData.notes,
        }
      ]);

    if (error) {
      console.error('Error inserting data:', error);
      return false; // Return false to indicate failure
    } else {
      console.log('Lead added successfully:', data);
      return true; // Return true to indicate success
    }
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
    <div className="new-lead-form-overlay">
      <div className="new-lead-form">
        <h2>{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
              <label>Budget</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} required />
            </div>
            <div>
              <label>Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} required />
            </div>
            <div>
              <label>Tags</label>
              <Select
                isMulti
                options={tagOptions}
                onChange={(selectedOptions) => setFormData(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label>Lead Source</label>
              <input type="text" name="leadSource" value={formData.leadSource} onChange={handleChange} required />
            </div>
            <div>
              <label>Lead Score</label>
              <select name="leadScore" value={formData.leadScore} onChange={handleChange} required>
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
                onChange={(selectedOptions) => setFormData(prev => ({ ...prev, interestedProducts: selectedOptions.map(option => option.value) }))}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label>Assigned To</label>
              <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleChange} required />
            </div>
            <div>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up Needed">Follow-up Needed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">{initialData ? 'Update Lead' : 'Add Lead'}</button>
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadForm;
