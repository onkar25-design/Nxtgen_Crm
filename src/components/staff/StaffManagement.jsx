import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Import React Select
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSort, faEdit, faTrash, faUsers, faEye } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './StaffManagement.css'; // Import the CSS file
import { supabase } from '../../../supabaseClient'; // Import Supabase client

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'User', label: 'User' },
];

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

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

const StaffManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for add modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for view modal visibility
  const [newStaffInfo, setNewStaffInfo] = useState({ // State for new staff information
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
  });
  const [editStaffInfo, setEditStaffInfo] = useState({ // State for editing staff information
    id: null,
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
    status: 'Active', // Default status for editing
  });
  const [viewStaffInfo, setViewStaffInfo] = useState({ // State for viewing staff information
    id: null,
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
  });

  const [sortOption, setSortOption] = useState(''); // State for sorting option
  const [staffData, setStaffData] = useState([]); // Initialize staffData as an empty array
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedStaff, setSelectedStaff] = useState([]); // State for selected staff in multi-select

  // Fetch staff data from Supabase
  useEffect(() => {
    const fetchStaffData = async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*'); // Fetch all staff data

      if (error) {
        console.error('Error fetching staff data:', error);
      } else {
        setStaffData(data); // Set the fetched data to state
      }
    };

    fetchStaffData(); // Call the fetch function
  }, []); // Empty dependency array to run only on mount

  const handleAddStaff = () => { // Function to open the add staff modal
    setNewStaffInfo({ // Reset the form fields
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
      },
      role: '',
      designation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditStaff = (staff) => { // Function to open the edit staff modal
    setEditStaffInfo(staff); // Set the staff data to be edited
    setIsEditModalOpen(true);
  };

  const handleViewStaff = (staff) => { // Function to open the view staff modal
    setViewStaffInfo(staff); // Set the staff data to be viewed
    setIsViewModalOpen(true);
  };

  const handleSubmitNewStaff = async (e) => { // Function to handle form submission for adding staff
    e.preventDefault();
    const { data, error } = await supabase
      .from('staff') // Specify the table name
      .insert([
        {
          name: newStaffInfo.name,
          email: newStaffInfo.email,
          phone: newStaffInfo.phone,
          role: newStaffInfo.role,
          designation: newStaffInfo.designation, // Ensure designation is included
          status: 'Active', // Default status
          address: newStaffInfo.address, // Store address as JSON
        },
      ])
      .select(); // Ensure to select the inserted data

    if (error) {
      console.error('Error adding staff:', error);
    } else {
      console.log('Staff added:', data);
      setStaffData([...staffData, ...data]); // Update staffData with the new staff

      // Log activity for addition
      await logActivity({
        activity: `Added Staff: ${newStaffInfo.name} (Role: ${newStaffInfo.role})`,
        action: 'Add',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
    }

    setIsAddModalOpen(false); // Close the modal after submission
  };

  const handleSubmitEditStaff = async (e) => { // Function to handle form submission for editing staff
    e.preventDefault();
    const { data, error } = await supabase
      .from('staff') // Specify the table name
      .update({
        name: editStaffInfo.name,
        email: editStaffInfo.email,
        phone: editStaffInfo.phone,
        role: editStaffInfo.role,
        designation: editStaffInfo.designation,
        status: editStaffInfo.status, // Update status
        address: editStaffInfo.address, // Update address as JSON
      })
      .eq('id', editStaffInfo.id); // Update the staff member by id

    if (error) {
      console.error('Error updating staff:', error);
    } else {
      console.log('Staff updated:', data);
      const updatedStaffData = staffData.map(staff => 
        staff.id === editStaffInfo.id ? { ...staff, ...editStaffInfo } : staff
      );
      setStaffData(updatedStaffData); // Update staffData with the edited staff

      // Log activity for editing
      await logActivity({
        activity: `Edited Staff: ${editStaffInfo.name} (Role: ${editStaffInfo.role})`,
        action: 'Edit',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
    }

    setIsEditModalOpen(false); // Close the edit modal after submission
  };

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
  };

  const sortedStaffData = [...staffData].sort((a, b) => {
    if (sortOption === 'Active') {
      return a.status === 'Active' ? -1 : 1; // Sort Active first
    } else if (sortOption === 'Inactive') {
      return a.status === 'Inactive' ? -1 : 1; // Sort Inactive first
    } else if (sortOption === 'Admin') {
      return a.role === 'Admin' ? -1 : 1; // Sort Admin first
    } else if (sortOption === 'User') {
      return a.role === 'User' ? -1 : 1; // Sort User first
    } else {
      return a.name.localeCompare(b.name); // Default sort by name
    }
  });

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id); // Delete staff member by id

      if (error) {
        console.error('Error deleting staff:', error);
      } else {
        const updatedStaffData = staffData.filter(staff => staff.id !== id);
        setStaffData(updatedStaffData); // Update the state with the new staff data
        console.log(`Deleted staff with id: ${id}`);

        // Log activity for deletion
        const deletedStaff = staffData.find(staff => staff.id === id);
        await logActivity({
          activity: `Deleted Staff: ${deletedStaff.name} (Role: ${deletedStaff.role})`,
          action: 'Delete',
          activity_by: 'User',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
        });
      }
    }
  };

  const filteredStaffData = sortedStaffData.filter(staff => 
    selectedStaff.length === 0 || selectedStaff.includes(staff.name) // Filter based on selected staff names
  );

  return (
    <div className="manageStaff-management">
      <div className="manageStaff-header">
        <h1>
          <FontAwesomeIcon icon={faUsers} className="header-icon" />
          Manage Staff
        </h1>
        <div className="manageStaff-header-actions">
          {/* Recently Added Search Bar using React Select (Multi-Select) */}
          <Select
            options={staffData.map(staff => ({ value: staff.name, label: staff.name }))} // Create options from staff names
            placeholder="Search staff by Name..."
            isMulti // Enable multi-select
            onChange={(selectedOptions) => setSelectedStaff(selectedOptions ? selectedOptions.map(option => option.value) : [])} // Update selected staff
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid #4CAF50', // Green border
                backgroundColor: '#2B2B2B', // Dark background
                color: '#FFFFFF', // White text
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#4CAF50', // Green background for selected values
              }),
              singleValue: (base) => ({
                ...base,
                color: '#FFFFFF', // White text for selected value
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#2B2B2B', // Dark background for dropdown
                color: '#FFFFFF', // White text
              }),
            }}
          />
          {/* Sort Staff Select */}
          <Select
            options={[
              { value: '', label: 'Sort by Name' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Admin', label: 'Admin' },
              { value: 'User', label: 'User' },
            ]}
            placeholder="Sort staff..."
            onChange={handleSortChange}
            styles={{
              control: (base) => ({
                ...base,
                border: '1px solid #4CAF50', // Green border
                backgroundColor: '#2B2B2B', // Dark background
                color: '#FFFFFF', // White text
              }),
              singleValue: (base) => ({
                ...base,
                color: '#FFFFFF', // White text for selected value
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#2B2B2B', // Dark background for dropdown
                color: '#FFFFFF', // White text
              }),
            }}
          />
          <button className="manageStaff-icon-btn manageStaff-add-button" onClick={handleAddStaff}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>
      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>Add New Staff</h3>
            <form onSubmit={handleSubmitNewStaff}>
              <input
                type="text"
                placeholder="Name"
                value={newStaffInfo.name}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newStaffInfo.email}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={newStaffInfo.phone}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Designation" // Add designation input
                value={newStaffInfo.designation}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, designation: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Street"
                value={newStaffInfo.address.street}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, address: { ...newStaffInfo.address, street: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={newStaffInfo.address.city}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, address: { ...newStaffInfo.address, city: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={newStaffInfo.address.state}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, address: { ...newStaffInfo.address, state: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={newStaffInfo.address.country}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, address: { ...newStaffInfo.address, country: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="Zipcode"
                value={newStaffInfo.address.zipcode}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, address: { ...newStaffInfo.address, zipcode: e.target.value } })}
                required
              />
              <Select
                options={roleOptions}
                placeholder="Select Role"
                onChange={(selectedOption) => setNewStaffInfo({ ...newStaffInfo, role: selectedOption.value })}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #4CAF50', // Green border
                    backgroundColor: '#2B2B2B', // Dark background
                    color: '#FFFFFF', // White text
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#FFFFFF', // White text for selected value
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#2B2B2B', // Dark background for dropdown
                    color: '#FFFFFF', // White text
                  }),
                }}
              />
              <div className="manageStaff-modal-buttons">
                <button type="submit">Add Staff</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>Edit Staff</h3>
            <form onSubmit={handleSubmitEditStaff}>
              <input
                type="text"
                placeholder="Name"
                value={editStaffInfo.name}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editStaffInfo.email}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={editStaffInfo.phone}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Designation" // Add designation input
                value={editStaffInfo.designation}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, designation: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Street"
                value={editStaffInfo.address.street}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, address: { ...editStaffInfo.address, street: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={editStaffInfo.address.city}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, address: { ...editStaffInfo.address, city: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={editStaffInfo.address.state}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, address: { ...editStaffInfo.address, state: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={editStaffInfo.address.country}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, address: { ...editStaffInfo.address, country: e.target.value } })}
                required
              />
              <input
                type="text"
                placeholder="Zipcode"
                value={editStaffInfo.address.zipcode}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, address: { ...editStaffInfo.address, zipcode: e.target.value } })}
                required
              />
              <Select
                options={roleOptions}
                placeholder="Select Role"
                value={roleOptions.find(option => option.value === editStaffInfo.role)}
                onChange={(selectedOption) => setEditStaffInfo({ ...editStaffInfo, role: selectedOption.value })}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #4CAF50', // Green border
                    backgroundColor: '#2B2B2B', // Dark background
                    color: '#FFFFFF', // White text
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#FFFFFF', // White text for selected value
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#2B2B2B', // Dark background for dropdown
                    color: '#FFFFFF', // White text
                  }),
                }}
              />
              <Select
                options={statusOptions}
                placeholder="Select Status"
                value={statusOptions.find(option => option.value === editStaffInfo.status)}
                onChange={(selectedOption) => setEditStaffInfo({ ...editStaffInfo, status: selectedOption.value })}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #4CAF50', // Green border
                    backgroundColor: '#2B2B2B', // Dark background
                    color: '#FFFFFF', // White text
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#FFFFFF', // White text for selected value
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#2B2B2B', // Dark background for dropdown
                    color: '#FFFFFF', // White text
                  }),
                }}
              />
              <div className="manageStaff-modal-buttons">
                <button type="submit">Update Staff</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Staff Modal */}
      {isViewModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>View Staff Details</h3>
            <div>
              <p><strong>Name:</strong> {viewStaffInfo.name}</p>
              <p><strong>Email:</strong> {viewStaffInfo.email}</p>
              <p><strong>Phone:</strong> {viewStaffInfo.phone}</p>
              <p><strong>Address:</strong></p>
              <p>{viewStaffInfo.address.street}, {viewStaffInfo.address.city}, {viewStaffInfo.address.state}, {viewStaffInfo.address.country}, {viewStaffInfo.address.zipcode}</p>
              <p><strong>Role:</strong> {viewStaffInfo.role}</p>
              <p><strong>Designation:</strong> {viewStaffInfo.designation}</p>
            </div>
            <div className="manageStaff-modal-buttons">
              <button type="button" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaffData.map(staff => ( // Use filtered staff data
            <tr key={staff.id}>
              <td>{staff.name}</td>
              <td>{staff.email}</td>
              <td>{staff.phone}</td>
              <td>
                <span className={`badge badge-${staff.role.toLowerCase()}`}>{staff.role}</span>
              </td>
              <td>
                <span className={`badge badge-${staff.status.toLowerCase()}`}>{staff.status}</span>
              </td>
              <td>
                <button className="manageStaff-action-button" onClick={() => handleViewStaff(staff)}>
                  <FontAwesomeIcon icon={faEye} style={{ color: '#2196f3' }} />
                </button>
                <button className="manageStaff-action-button manageStaff-edit-button" onClick={() => handleEditStaff(staff)}>
                  <FontAwesomeIcon icon={faEdit} style={{ color: '#28a745' }} />
                </button>
                <button className="manageStaff-action-button manageStaff-delete-button" onClick={() => handleDeleteStaff(staff.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffManagement;
