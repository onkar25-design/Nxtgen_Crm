import React, { useState } from 'react';
import Select from 'react-select'; // Import React Select
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSort, faEdit, faTrash, faUsers, faEye } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './StaffManagement.css'; // Import the CSS file

const options = [
  { value: 'admin@example.com', label: 'Admin' },
  { value: 'user@example.com', label: 'User' },
  // Add more options as needed
];

const StaffManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for modal visibility
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

  const [sortOption, setSortOption] = useState(''); // State for sorting option

  const [staffData, setStaffData] = useState([ // Initialize staffData as state
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '1234567890', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '2345678901', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '3456789012', role: 'User', status: 'Active' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '4567890123', role: 'Admin', status: 'Active' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', phone: '5678901234', role: 'User', status: 'Inactive' },
    { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '6789012345', role: 'User', status: 'Active' },
    { id: 7, name: 'George Clooney', email: 'george@example.com', phone: '7890123456', role: 'Admin', status: 'Active' },
    { id: 8, name: 'Hannah Montana', email: 'hannah@example.com', phone: '8901234567', role: 'User', status: 'Active' },
    { id: 9, name: 'Ian Malcolm', email: 'ian@example.com', phone: '9012345678', role: 'Admin', status: 'Inactive' },
    { id: 10, name: 'Jack Sparrow', email: 'jack@example.com', phone: '0123456789', role: 'User', status: 'Active' },
    { id: 11, name: 'Kate Winslet', email: 'kate@example.com', phone: '1234567891', role: 'User', status: 'Active' },
    { id: 12, name: 'Leonardo DiCaprio', email: 'leo@example.com', phone: '2345678902', role: 'Admin', status: 'Active' },
    { id: 13, name: 'Meryl Streep', email: 'meryl@example.com', phone: '3456789013', role: 'User', status: 'Inactive' },
  ]);

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

  const handleSubmitNewStaff = (e) => { // Function to handle form submission
    e.preventDefault();
    // Logic to add new staff (e.g., API call)
    console.log(newStaffInfo);
    setIsAddModalOpen(false); // Close the modal after submission
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

  const handleDeleteStaff = (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      const updatedStaffData = staffData.filter(staff => staff.id !== id);
      setStaffData(updatedStaffData); // Update the state with the new staff data
      console.log(`Deleted staff with id: ${id}`);
    }
  };

  return (
    <div className="manageStaff-management">
      <div className="manageStaff-header">
        <h1>
          <FontAwesomeIcon icon={faUsers} className="header-icon" />
          Manage Staff
        </h1>
        <div className="manageStaff-header-actions">
          <Select
            options={options}
            placeholder="Search staff..."
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
            options={[
              { value: '', label: 'Sort by Name' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Admin', label: 'Admin' }, // Added Admin option
              { value: 'User', label: 'User' },   // Added User option
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
              <input
                type="text"
                placeholder="Role"
                value={newStaffInfo.role}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, role: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Designation"
                value={newStaffInfo.designation}
                onChange={(e) => setNewStaffInfo({ ...newStaffInfo, designation: e.target.value })}
                required
              />
              <div className="manageStaff-modal-buttons">
                <button type="submit">Add Staff</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              </div>
            </form>
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
          {sortedStaffData.map(staff => (
            <tr key={staff.id}>
              <td>{staff.name}</td>
              <td>{staff.email}</td>
              <td>{staff.phone}</td>
              <td>
                <span className={`badge badge-${staff.role.toLowerCase()}`}>{staff.role}</span> {/* Badge for role */}
              </td>
              <td>
                <span className={`badge badge-${staff.status.toLowerCase()}`}>{staff.status}</span> {/* Badge for status */}
              </td>
              <td>
                <button className="manageStaff-action-button" onClick={() => { /* Do nothing for now */ }}>
                  <FontAwesomeIcon icon={faEye} style={{ color: '#2196f3' }} /> {/* Blue color for view icon */}
                </button>
                <button className="manageStaff-action-button manageStaff-edit-button" onClick={() => { /* Handle edit action */ }}>
                  <FontAwesomeIcon icon={faEdit} style={{ color: '#28a745' }} /> {/* Green color for edit icon */}
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
