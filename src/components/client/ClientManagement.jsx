import React, { useState } from 'react'
import { Calendar, Mail, Phone, PieChart, Plus, Search, Users } from 'lucide-react'
import Leads from './Leads'
import Calls from './Calls'
import Appointments from './Appointments'
import Notes from './Notes'
import ContactInfo from './ContactInfo'
import './ClientManagement.css'

export default function ClientManagement() {
  const [activeTab, setActiveTab] = useState('notes')
  const [searchInput, setSearchInput] = useState('')

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
          <button className="client-management-icon-btn add-client-btn">
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
        </div>
        <hr className="client-management-divider" />
        <div className="client-management-client-info">
          <div className="client-management-info-item">
            <p className="client-management-info-label">Company</p>
            <p className="client-management-info-value">TechCorp</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Contact Person's Name</p>
            <p className="client-management-info-value">John Doe</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Email address</p>
            <p className="client-management-info-value">john.doe@techcorp.com</p>
          </div>
          <div className="client-management-info-item">
            <p className="client-management-info-label">Phone number</p>
            <p className="client-management-info-value">+123-4567-89</p>
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
    </div>
  )
}
