import React, { useState, useEffect } from 'react'
import { Calendar, Mail, Phone, PieChart, Plus, Search, Users } from 'lucide-react'
import Leads from './leads/Leads'
import Calls from './calls/Calls'
import Appointments from './appointments/Appointments'
import Notes from './notes/Notes'
import ContactInfo from './contactinfo/ContactInfo'
import './ClientManagement.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the edit icon
import { supabase } from '../../../supabaseClient'; // Import the Supabase client
import Select from 'react-select'; // Import react-select
import AddClientModal from './clients-management/AddClientModal'; // Import the new AddClientModal component
import EditClientModal from './clients-management/EditClientModal'; // Import the new EditClientModal component
import AssignedCalls from './calls/AssignedCalls'; // Import the new AssignedCalls component
import Modal from './Modal'; // Import the Modal component
import AppointmentsToday from './appointments/AppointmentsToday'; // Import the new AppointmentsToday component

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
  const [isAssignedCallsModalOpen, setIsAssignedCallsModalOpen] = useState(false); // State for the assigned calls modal
  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false); // State for the appointments modal
  const [leadsCount, setLeadsCount] = useState(0); // State for leads count

 
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

    const fetchLeadsCount = async () => {
      const { data, error } = await supabase
        .from('client_leads')
        .select('*', { count: 'exact' }); // Fetch all leads and get the count

      if (error) {
        console.error('Error fetching leads count:', error);
      } else {
        setLeadsCount(data.length); // Set leads count
      }
    };

    fetchClients();
    fetchAppointmentsToday();
    fetchAssignedCallsToday();
    fetchLeadsCount(); // Fetch leads count
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
        return <Leads clientId={clientInfo.id} companyName={clientInfo.companyName} />; // Pass the client ID and company name to Leads
      case 'calls':
        return <Calls clientId={clientInfo.id} />; // Pass the client ID to Calls
      case 'appointments':
        return <Appointments clientId={clientInfo.id} />; // Pass the client ID to Appointments
      case 'contact-info':
        return <ContactInfo clientId={clientInfo.id} />;
      case 'notes':
      case 'assigned-calls':
        return <Notes clientId={clientInfo.id} />; // Pass the client ID to the Notes component
      default:
        return <AssignedCalls />; // Render the AssignedCalls component
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

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#2B2B2B', // Dark background
      borderColor: '#4CAF50', // Green border
      color: '#FFFFFF', // White text
      minHeight: '40px', // Fixed height
      width: '300px', // Fixed width
      boxShadow: state.isFocused ? '0 0 0 1px #4CAF50' : null, // Green shadow on focus
      '&:hover': {
        borderColor: '#4CAF50', // Green border on hover
      },
    }),
    input: (provided) => ({
      ...provided,
      color: '#FFFFFF', // White text
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#FFFFFF', // White text for selected value
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#B0BEC5', // Light gray for placeholder
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#2B2B2B', // Dark background for dropdown
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#4CAF50' : '#2B2B2B', // Green on hover
      color: '#FFFFFF', // White text
    }),
  };

  return (
    <div className="client-management">
      <div className="client-management-pipeline-header">
        <h1>
          <span className="client-management-logo">
            <Users style={{ color: '#4CAF50', marginRight: '8px' }} />
          </span>
          Client Management
        </h1>
        <div className="client-management-header-actions">
          <Select
            className="client-management-select"
            options={options}
            onChange={handleSelectChange}
            styles={customSelectStyles} // Apply custom styles
            placeholder="Search clients..."
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
            <p className="client-management-dashboard-label">Total Leads</p> {/* Changed label to Leads */}
            <p className="client-management-dashboard-value">{leadsCount}</p> {/* Display leads count */}
          </div>
        </div>
        <div className="client-management-dashboard-item" onClick={() => setIsAppointmentsModalOpen(true)}>
          <Calendar className="client-management-dashboard-icon calendar" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Appointments Today</p>
            <p className="client-management-dashboard-value">{appointmentsToday}</p>
          </div>
        </div>
        <div className="client-management-dashboard-item" onClick={() => setIsAssignedCallsModalOpen(true)}>
          <Phone className="client-management-dashboard-icon phone" />
          <div className="client-management-dashboard-info">
            <p className="client-management-dashboard-label">Assigned Calls Today</p>
            <p className="client-management-dashboard-value">{assignedCallsToday}</p>
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

      {/* Modal for Assigned Calls */}
      <Modal isOpen={isAssignedCallsModalOpen} onClose={() => setIsAssignedCallsModalOpen(false)}>
        <AssignedCalls /> {/* Render AssignedCalls component inside the modal */}
      </Modal>

      {/* Modal for Appointments */}
      <Modal isOpen={isAppointmentsModalOpen} onClose={() => setIsAppointmentsModalOpen(false)}>
        <AppointmentsToday /> {/* Render AppointmentsToday component inside the modal */}
      </Modal>
    </div>
  )
}
