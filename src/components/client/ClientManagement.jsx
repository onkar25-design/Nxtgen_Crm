import React, { useState } from 'react'
import { Calendar, Mail, Phone, PieChart, Plus, Search, Users } from 'lucide-react'
import Leads from './Leads'
import Calls from './Calls'
import Appointments from './Appointments'
import Notes from './Notes'
import ContactInfo from './ContactInfo'
import './ClientManagement.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the edit icon

export default function ClientManagement() {
  const [activeTab, setActiveTab] = useState('contact-info') // Default to contact-info
  const [searchInput, setSearchInput] = useState('')
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false) // New state for edit modal
  const [clientInfo, setClientInfo] = useState({
    companyName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: '',
    phone: ''
  })

  // Static data for client details
  const staticClientDetails = {
    companyName: 'TechCorp',
    email: 'contact@techcorp.com',
    phone: '+123-456-7890',
    street: '123 Tech Lane',
    city: 'Tech City',
    state: 'Tech State',
    zipCode: '12345',
    country: 'Tech Country'
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        return <Leads />
      case 'calls':
        return <Calls />
      case 'appointments':
        return <Appointments />
      case 'contact-info':
        return <ContactInfo />
      case 'notes':
      default:
        return <Notes />
    }
  }

  const handleAddClient = () => {
    // Logic to add client (you can customize this)
    console.log(clientInfo);
    setIsAddClientModalOpen(false);
  };

  const handleEditClient = () => {
    // Logic to edit client (you can customize this)
    console.log(clientInfo);
    setIsEditClientModalOpen(false);
  };

  return (
    <div className="client-management">
      <div className="client-management-pipeline-header">
        <h1>
          <span className="client-management-logo"> <Users style={{ color: '#4CAF50', marginRight: '8px' }} /> </span>
          Client Management
        </h1>
        <div className="client-management-header-actions">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="client-management-search-input"
          />
          <button className="client-management-icon-btn add-client-btn" onClick={() => setIsAddClientModalOpen(true)}>
            <Plus />
          </button>
        </div>
      </div>

      <div className="client-management-dashboard">
        <div className="client-management-dashboard-item">
          <Users className="client-management-dashboard-icon users" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Total Clients</p>
            <p className="client-management-dashboard-value">256</p>
          </div>
        </div>
        <div className="client-management-dashboard-item">
          <PieChart className="client-management-dashboard-icon pie-chart" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Active Deals</p>
            <p className="client-management-dashboard-value">64</p>
          </div>
        </div>
        <div className="client-management-dashboard-item">
          <Calendar className="client-management-dashboard-icon calendar" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Appointments Today</p>
            <p className="client-management-dashboard-value">12</p>
          </div>
        </div>
        <div className="client-management-dashboard-item">
          <Phone className="client-management-dashboard-icon phone" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Assigned Calls</p>
            <p className="client-management-dashboard-value">28</p>
          </div>
        </div>
      </div>

      <div className="client-management-client-details">
        <div className="client-management-client-header">
          <h2>Client Details</h2>
          <button className="client-management-edit-btn" onClick={() => {
            setClientInfo(staticClientDetails); // Set static data to clientInfo for editing
            setIsEditClientModalOpen(true);
          }}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
        <hr className="client-management-divider" />
        <div className="client-management-client-info">
          <div className="client-management-info-item">
            <p className="client-management-info-label">Company</p>
            <p className="client-management-info-value">{staticClientDetails.companyName}</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Email</p>
            <p className="client-management-info-value">{staticClientDetails.email}</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Phone</p>
            <p className="client-management-info-value">{staticClientDetails.phone}</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Address</p>
            <p className="client-management-info-value">
              {`${staticClientDetails.street}, ${staticClientDetails.city}, ${staticClientDetails.state}, ${staticClientDetails.zipCode}, ${staticClientDetails.country}`}
            </p>
          </div>
        </div>
      </div>

      <div className="client-management-tabs">
        <button
          className={`client-management-tab ${activeTab === 'contact-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact-info')}
        >
          Contact Info
        </button>
        <button
          className={`client-management-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          Leads
        </button>
        <button
          className={`client-management-tab ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          Calls
        </button>
        <button
          className={`client-management-tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        
        <button
          className={`client-management-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      <div className="client-management-tab-content">
        {renderContent()}
      </div>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="contact-info-modal">
          <div className="contact-info-modal-content">
            <h3 className="contact-info-modal-title">Add Client Information</h3>
            <hr className="contact-info-modal-divider" />
            <form onSubmit={(e) => { e.preventDefault(); handleAddClient(); }}>
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
                <button type="button" className="contact-info-cancel-btn" onClick={() => setIsAddClientModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditClientModalOpen && (
        <div className="contact-info-modal">
          <div className="contact-info-modal-content">
            <h3 className="contact-info-modal-title">Edit Client Information</h3>
            <hr className="contact-info-modal-divider" />
            <form onSubmit={(e) => { e.preventDefault(); handleEditClient(); }}>
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
                <button type="submit" className="contact-info-submit-btn">Update</button>
                <button type="button" className="contact-info-cancel-btn" onClick={() => setIsEditClientModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
