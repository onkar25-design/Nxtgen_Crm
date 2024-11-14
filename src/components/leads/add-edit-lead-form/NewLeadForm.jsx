import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './NewLeadForm.css';
import { supabase } from '../../../../supabaseClient'; // Supabase client import

const NewLeadForm = ({ onSubmit, onCancel, initialData }) => { // Removed userId from props
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
    status: 'New', // Default status is 'New'
    stage: 'new', // Default stage is 'New'
    notes: '',
    clientId: null, // Add clientId to formData
  });

  const [companyOptions, setCompanyOptions] = useState([]); // State for company options

  // Define lead source options locally
  const leadSourceOptions = [
    { value: 'Email', label: 'Email' },
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Surveys', label: 'Surveys' },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('clients') // Fetch from clients table
        .select('id, company_name'); // Select id and company_name

      if (error) {
        console.error('Error fetching companies:', error);
      } else {
        setCompanyOptions(data.map(company => ({
          value: company.id,
          label: company.company_name,
        }))); // Map to the format required by react-select
      }
    };

    fetchCompanies(); // Call the function to fetch companies

    if (initialData) {
      setFormData(initialData); // Populate form with initial data
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, clientId: selectedOption.value, company: selectedOption.label })); // Set clientId and company name
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure budget is a float and leadScore is an integer
    const formattedData = {
        ...formData,
        budget: parseFloat(formData.budget), // Convert budget to float
        leadScore: parseInt(formData.leadScore, 10), // Ensure leadScore is an integer
    };

    // Log the values to check their types and values
    console.log('Budget:', formattedData.budget, 'Type:', typeof formattedData.budget);
    console.log('Lead Score:', formattedData.leadScore, 'Type:', typeof formattedData.leadScore);
    console.log('Formatted Form Data Before Submission:', formattedData); // Log the formatted form data

    const result = await submitLeadToSupabase(formattedData);
    if (result) {
      onSubmit(formattedData); // Trigger the parent component's submission
    }
  };

  const submitLeadToSupabase = async (leadData) => {
    const { data, error } = await supabase
      .from('client_leads')  // Change the table name to 'client_leads'
      .insert([{
          client_id: leadData.clientId, // Store client ID
          title: leadData.title,
          budget: leadData.budget, // Use the formatted budget
          company: leadData.company, // Insert the company name
          tags: leadData.tags,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          lead_source: leadData.leadSource,
          lead_score: leadData.leadScore, // Use the formatted leadScore
          interested_products: leadData.interestedProducts,
          status: leadData.status,
          stage: leadData.stage, // Insert stage
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
              <Select
                options={companyOptions}
                onChange={handleCompanyChange} // Handle company selection
                className="newleadform-react-select-container"
                classNamePrefix="newleadform-react-select"
                isClearable
              />
            </div>
            <div>
              <label>Contact Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label>Contact Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label>Lead Source</label>
              <Select
                options={leadSourceOptions} // Use the defined leadSourceOptions from local declaration
                onChange={(selectedOption) => setFormData(prev => ({ ...prev, leadSource: selectedOption.value }))} // Update leadSource in formData
                className="newleadform-react-select-container"
                classNamePrefix="newleadform-react-select"
                isClearable
              />
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
                className="newleadform-react-select-container"
                classNamePrefix="newleadform-react-select"
              />
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
            <div>
              <label>Tags</label>
              <Select
                isMulti
                options={tagOptions}
                onChange={(selectedOptions) => setFormData(prev => ({ ...prev, tags: selectedOptions.map(option => option.value) }))}
                className="newleadform-react-select-container"
                classNamePrefix="newleadform-react-select"
              />
            </div>
            <div>
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}></textarea>
            </div>
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
