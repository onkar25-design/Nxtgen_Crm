import React, { useState, useEffect } from 'react'
import { Calendar, Mail, Phone, PieChart, Plus, Search, Users } from 'lucide-react'
import Leads from './Leads'
import Calls from './Calls'
import Appointments from './Appointments'
import Notes from './Notes'
import ContactInfo from './ContactInfo'
import './ClientManagement.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the edit icon
import { supabase } from '../../../supabaseClient'; // Import the Supabase client
import Select from 'react-select'; // Import react-select
import AddClientModal from './AddClientModal'; // Import the new AddClientModal component
import EditClientModal from './EditClientModal'; // Import the new EditClientModal component

export default function ClientManagement() {
  const [activeTab, setActiveTab] = useState('contact-info') // Default to contact-info
  const [searchInput, setSearchInput] = useState('')
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false) // New state for edit modal
  const [clientInfo, setClientInfo] = useState({
    id: '', // Ensure this is set correctly
    companyName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: '',
    phone: ''
  })
  const [clients, setClients] = useState([]); // New state to hold client data
  const [options, setOptions] = useState([]); // State to hold options for the dropdown
  const [totalClients, setTotalClients] = useState(0); // New state to hold total clients count
  const [appointmentsToday, setAppointmentsToday] = useState(0); // State for today's appointments count
  const [assignedCallsToday, setAssignedCallsToday] = useState(0); // State for today's assigned calls count

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

  // Fetch clients from Supabase when the component mounts
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data);
        setTotalClients(data.length); // Set total clients count
        // Prepare options for react-select
        const clientOptions = data.map(client => ({
          value: client.id,
          label: client.company_name,
        }));
        setOptions(clientOptions);

        // Set default client info to the first client in the list
        if (data.length > 0) {
          updateClientDetails(data[0]); // Set the first client as default
        }
      }
    };

    const fetchAppointmentsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('date', today); // Fetch appointments for today

      if (error) {
        console.error('Error fetching appointments for today:', error);
      } else {
        setAppointmentsToday(data.length); // Set today's appointments count
      }
    };

    const fetchAssignedCallsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('date', today); // Fetch assigned calls for today

      if (error) {
        console.error('Error fetching assigned calls for today:', error);
      } else {
        setAssignedCallsToday(data.length); // Set today's assigned calls count
      }
    };

    fetchClients();
    fetchAppointmentsToday();
    fetchAssignedCallsToday();
  }, []);

  // Filter clients based on search input
  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Update the client details based on the selected client
  const updateClientDetails = (client) => {
    setClientInfo({
      id: client.id, // Ensure this is set correctly
      companyName: client.company_name,
      street: client.street,
      city: client.city,
      state: client.state,
      zipCode: client.zip_code,
      country: client.country,
      email: client.email,
      phone: client.phone,
    });
  };

  // Handle selection from the dropdown
  const handleSelectChange = (selectedOption) => {
    const selectedClient = clients.find(client => client.id === selectedOption.value);
    if (selectedClient) {
      updateClientDetails(selectedClient); // Update client details for editing
      console.log("Selected Client ID:", selectedClient.id); // Debugging line
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'leads':
        console.log("Client ID being passed to Leads:", clientInfo.id); // Debugging line
        return <Leads clientId={clientInfo.id} />; // Pass the client ID to Leads
      case 'calls':
        return <Calls clientId={clientInfo.id} />; // Pass the client ID to Calls
      case 'appointments':
        return <Appointments clientId={clientInfo.id} />; // Pass the client ID to Appointments
      case 'contact-info':
        return <ContactInfo clientId={clientInfo.id} />;
      case 'notes':
      default:
        return <Notes clientId={clientInfo.id} />; // Pass the client ID to the Notes component
    }
  }

  const handleAddClient = async () => {
    // Logic to add client to Supabase
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          company_name: clientInfo.companyName,
          email: clientInfo.email,
          phone: clientInfo.phone,
          street: clientInfo.street,
          city: clientInfo.city,
          state: clientInfo.state,
          zip_code: clientInfo.zipCode,
          country: clientInfo.country,
        },
      ]);

    if (error) {
      console.error('Error adding client:', error);
    } else {
      console.log('Client added:', data);
      // Update the clients state to include the new client
      setClients([...clients, ...data]); // Update clients state
      setTotalClients(clients.length + 1); // Update total clients count
    }
    setIsAddClientModalOpen(false);
  };

  return (
    <div className="client-management">
      <div className="client-management-pipeline-header">
        <h1>
          <span className="client-management-logo"> <Users style={{ color: '#4CAF50', marginRight: '8px' }} /> </span>
          Client Management
        </h1>
        <div className="client-management-header-actions">
          <Select
            options={options}
            onChange={handleSelectChange}
            placeholder="Search clients by company name..."
            className="client-management-select"
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
            <p className="client-management-dashboard-value">{totalClients}</p> {/* Display total clients count */}
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
            <p className="client-management-dashboard-value">{appointmentsToday}</p> {/* Display today's appointments count */}
          </div>
        </div>
        <div className="client-management-dashboard-item">
          <Phone className="client-management-dashboard-icon phone" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Assigned Calls Today</p> {/* Updated label */}
            <p className="client-management-dashboard-value">{assignedCallsToday}</p> {/* Display today's assigned calls count */}
          </div>
        </div>
      </div>

      <div className="client-management-client-details">
        <div className="client-management-client-header">
          <h2>Client Details</h2>
          <button className="client-management-edit-btn" onClick={() => {
            setIsEditClientModalOpen(true); // Open the edit modal
          }}>
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
        <hr className="client-management-divider" />
        <div className="client-management-client-info">
          {filteredClients.length > 0 ? (
            <>
              <div className="client-management-info-item">
                <p className="client-management-info-label">Company</p>
                <p className="client-management-info-value">{clientInfo.companyName}</p>
              </div>
              <div className="client-management-info-item">
                <p className="client-management-info-label">Email</p>
                <p className="client-management-info-value">{clientInfo.email}</p>
              </div>
              <div className="client-management-info-item">
                <p className="client-management-info-label">Phone</p>
                <p className="client-management-info-value">{clientInfo.phone}</p>
              </div>
              <div className="client-management-info-item">
                <p className="client-management-info-label">Address</p>
                <p className="client-management-info-value">
                  {`${clientInfo.street}, ${clientInfo.city}, ${clientInfo.state}, ${clientInfo.zipCode}, ${clientInfo.country}`}
                </p>
              </div>
            </>
          ) : (
            <p>No client found.</p> // Display message if no client matches the search
          )}
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
      <AddClientModal 
        isOpen={isAddClientModalOpen} 
        onClose={() => setIsAddClientModalOpen(false)} 
      />

      {/* Edit Client Modal */}
      <EditClientModal 
        isOpen={isEditClientModalOpen} 
        onClose={() => setIsEditClientModalOpen(false)} 
        clientInfo={clientInfo} 
        setClientInfo={setClientInfo} 
      />
    </div>
  )
}
