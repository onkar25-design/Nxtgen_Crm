import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Import React Select
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSort, faEdit, faTrash, faUsers, faEye, faCheck } from '@fortawesome/free-solid-svg-icons'; // Import Font Awesome icons
import './StaffManagement.css'; // Import the CSS file
import { supabase } from '../../../supabaseClient'; // Import Supabase client
import Swal from 'sweetalert2'; // Import SweetAlert2

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Function to log activity
const logActivity = async (activity) => {s
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
    first_name: '',
    last_name: '',
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
    first_name: '',
    last_name: '',
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
    first_name: '',
    last_name: '',
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
  const [userRole, setUserRole] = useState(''); // State for user role

  // Fetch staff data from Supabase
  const fetchStaffData = async () => {
    try {
        // Get the logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            throw new Error(`Error fetching user: ${userError.message}`);
        }

        if (!user) {
            console.error("User is not logged in");
            return; // Exit if no user is found
        }

        // Fetch the role of the logged-in user
        const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id) // Fetch the role of the logged-in user
            .single();

        if (roleError) {
            throw new Error(`Error fetching user role: ${roleError.message}`);
        }

        console.log("User Role:", userData.role); // Log the user role
        setUserRole(userData.role); // Set the user role

        // Fetch all user data
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('*'); // Fetch all user data

        if (fetchError) {
            throw new Error(`Error fetching staff data: ${fetchError.message}`);
        }

        console.log("Fetched Data:", data); // Log the fetched data

        // Set staff data based on user role
        if (userData.role === 'admin') {
            setStaffData(data); // Admin can see all users (both admins and staff)
        } else {
            setStaffData(data.filter(staff => staff.id === user.id)); // Staff can see only their own data
        }
    } catch (error) {
        console.error(error.message);
    }
  };

  useEffect(() => {
    fetchStaffData(); // Call the fetch function
  }, []); // Empty dependency array to run only on mount

  const handleAddStaff = () => {
    if (userRole !== 'admin') { // Check if the user is not an admin
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You are not authorized to add staff members.',
      });
      return; // Prevent opening the add staff modal
    }
    setNewStaffInfo({ // Reset the form fields
      first_name: '',
      last_name: '',
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

  const handleEditStaff = async (staff) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
    }

    if (!user) {
        console.error("User is not logged in");
        return;
    }

    // Allow edit if admin or if the staff member is editing their own data
    if (userRole === 'admin' || staff.id === user.id) {
        setEditStaffInfo(staff); // Set the staff data to be edited
        setIsEditModalOpen(true); // Open the edit modal
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You are not authorized to edit this staff member.',
        });
    }
  };

  const handleViewStaff = (staff) => { // Function to open the view staff modal
    setViewStaffInfo(staff); // Set the staff data to be viewed
    setIsViewModalOpen(true);
  };

  const handleSubmitNewStaff = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') return; // Prevent non-admins from adding staff

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          first_name: newStaffInfo.first_name,
          last_name: newStaffInfo.last_name,
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
        activity: `Added Staff: ${newStaffInfo.first_name} ${newStaffInfo.last_name} (Role: ${newStaffInfo.role})`,
        action: 'Add',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      });
    }

    setIsAddModalOpen(false); // Close the modal after submission
  };

  const handleSubmitEditStaff = async (e) => {
    e.preventDefault();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
    }

    if (!user) {
        console.error("User is not logged in");
        return;
    }

    // Allow admins to update any data, and staff can only update their own data
    if (userRole !== 'admin' && editStaffInfo.id !== user.id) {
        console.error("You do not have permission to update this data.");
        Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'You are not authorized to update this data.',
        });
        return; // Prevent the update
    }

    // Prepare the update data
    const updateData = {
        first_name: editStaffInfo.first_name,
        last_name: editStaffInfo.last_name,
        email: editStaffInfo.email,
        phone: editStaffInfo.phone,
        designation: editStaffInfo.designation,
        address: editStaffInfo.address,
        // Only include status if the user is an admin
        ...(userRole === 'admin' && { status: editStaffInfo.status }), // Include status only for admin
    };

    // Only include the role if the user is an admin
    if (userRole === 'admin') {
        updateData.role = editStaffInfo.role; // Admin can change role
    }

    // Proceed with the update logic
    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editStaffInfo.id); // Update the user by id

    if (error) {
        console.error('Error updating staff:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error updating the staff member.',
        });
    } else {
        console.log('Staff updated:', data);
        // Update staffData with the edited staff
        const updatedStaffData = staffData.map(staff => 
            staff.id === editStaffInfo.id ? { ...staff, ...editStaffInfo } : staff
        );
        setStaffData(updatedStaffData); // Update staffData with the edited staff
        Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Staff member details have been updated successfully.',
        });
    }

    setIsEditModalOpen(false); // Close the edit modal after submission
  };

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
  };

  const sortedStaffData = [...staffData].sort((a, b) => {
    // Sort by status
    if (sortOption === 'Active') {
      return a.status === 'Active' ? -1 : b.status === 'Active' ? 1 : 0; // Active first
    } else if (sortOption === 'Inactive') {
      return a.status === 'Inactive' ? -1 : b.status === 'Inactive' ? 1 : 0; // Inactive first
    } else if (sortOption === 'Admin') {
      return a.role === 'Admin' ? -1 : b.role === 'Admin' ? 1 : 0; // Admin first
    } else if (sortOption === 'Staff') {
      return a.role === 'Staff' ? -1 : b.role === 'Staff' ? 1 : 0; // Staff first
    } else {
      // Default sort by name
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase(); // Combine first and last name
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase(); // Combine first and last name
      return nameA.localeCompare(nameB); // Sort alphabetically
    }
  });

  const handleApproveStaff = async (id) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'active' }) // Update the status to 'active' (lowercase)
            .eq('id', id); // Specify the user by id

        if (error) throw error;

        // Show a success message
        Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: 'User access has been approved and status is now active.',
        });

        // Refresh the staff data to reflect the changes
        fetchStaffData(); // Call the fetch function to refresh data
    } catch (error) {
        console.error('Error approving staff:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an error approving the user.',
        });
    }
  };

  // Filter staff data based on selected staff names
  const filteredStaffData = sortedStaffData.filter(staff => {
    const firstNameMatch = staff.first_name.toLowerCase().includes(searchQuery.toLowerCase()); // Check first name
    return firstNameMatch; // Filter based on first name only
  });

  return (
    <div className="manageStaff-management">
      <div className="manageStaff-header">
        <h1>
          <FontAwesomeIcon icon={faUsers} className="header-icon" />
          Manage Staff
        </h1>
        <div className="manageStaff-header-actions">
          {/* Input for searching staff by first name */}
          <input
            type="text"
            placeholder="Search staff by First Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          />
        </div>
      </div>
      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>Edit Staff</h3>
            <form onSubmit={handleSubmitEditStaff}>
              <input
                type="text"
                placeholder="First Name"
                value={editStaffInfo.first_name}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, first_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editStaffInfo.last_name}
                onChange={(e) => setEditStaffInfo({ ...editStaffInfo, last_name: e.target.value })}
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
                placeholder="Designation"
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
                isDisabled={userRole === 'staff'} // Disable role selection for staff
                styles={{
                  control: (base) => ({
                    ...base,
                    border: '1px solid #4CAF50', // Green border
                    backgroundColor: '#2B2B2B', // Dark background
                    color: '#FFFFFF', // White text
                    width: 'calc(100% - 20px)', // Match width of other inputs
                    marginBottom: '20px', // Add gap below the role select
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
                    width: 'calc(100% - 20px)', // Match width of other inputs
                    marginBottom: '20px', // Add gap below the status select
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
            <p><strong>First Name:</strong> {viewStaffInfo.first_name}</p>
            <p><strong>Last Name:</strong> {viewStaffInfo.last_name}</p>
            <p><strong>Email:</strong> {viewStaffInfo.email}</p>
            <p><strong>Phone:</strong> {viewStaffInfo.phone}</p>
            <p><strong>Role:</strong> {viewStaffInfo.role}</p>
            <p><strong>Designation:</strong> {viewStaffInfo.designation}</p>
            <p><strong>Status:</strong> {viewStaffInfo.status}</p>
            <p><strong>Address:</strong> {viewStaffInfo.address.street}, {viewStaffInfo.address.city}, {viewStaffInfo.address.state}, {viewStaffInfo.address.country}, {viewStaffInfo.address.zipcode}</p>
            <div className="manageStaff-modal-buttons">
              <button type="button" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Table Wrapper for Horizontal Scrolling */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaffData.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.first_name}</td>
                <td>{staff.last_name}</td>
                <td>{staff.email}</td>
                <td>
                  <span className={`badge badge-${staff.role ? staff.role.toLowerCase() : 'unknown'}`}>{staff.role || 'Unknown'}</span>
                </td>
                <td>
                  <span className={`badge badge-${staff.status ? staff.status.toLowerCase() : 'unknown'}`}>{staff.status || 'Unknown'}</span>
                </td>
                <td>
                  <button className="manageStaff-action-button" onClick={() => handleViewStaff(staff)}>
                    <FontAwesomeIcon icon={faEye} style={{ color: '#2196f3' }} />
                  </button>
                  <button className="manageStaff-action-button manageStaff-edit-button" onClick={() => handleEditStaff(staff)}>
                    <FontAwesomeIcon icon={faEdit} style={{ color: '#28a745' }} />
                  </button>
                  {userRole === 'admin' && staff.status === 'Pending' && (
                    <button className="manageStaff-action-button manageStaff-approve-button" onClick={() => handleApproveStaff(staff.id)}>
                      <FontAwesomeIcon icon={faCheck} style={{ color: '#28a745' }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
