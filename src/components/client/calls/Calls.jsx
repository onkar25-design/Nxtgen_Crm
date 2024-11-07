import React, { useState, useEffect } from 'react';
import './Calls.css'; // Ensure you have appropriate styles
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import sendEmail from '../../utils/sendEmail'; // Import sendEmail function
import Swal from 'sweetalert2'; // Import SweetAlert

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

function Calls({ clientId }) { // Accept clientId as a prop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [calls, setCalls] = useState([]);
  const [callInfo, setCallInfo] = useState({
    date: '',
    time: '',
    description: '',
    call_with: '', // Updated to call_with
    subject: '',
    client_email: '', // New field for client email
  });
  const [companyName, setCompanyName] = useState(''); // Add state for company name
  const [userRole, setUserRole] = useState(''); // State for user role

  // Fetch calls and company name from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchCallsAndCompanyName = async () => {
      // Fetch user role
      const { data: { user }, error: userError } = await supabase.auth.getUser(); // Correctly get the logged-in user

      if (userError) {
        console.error('Error fetching user:', userError);
        return; // Exit if there's an error
      }

      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id) // Use user.id to get the current user's ID
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
      } else {
        setUserRole(userData.role); // Set user role
      }

      // Fetch company name and client email
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name, email') // Fetch company name and email
        .eq('id', clientId);

      if (clientError) {
        console.error('Error fetching client:', clientError);
      } else {
        setCompanyName(clientData[0]?.company_name); // Set company name
        setCallInfo((prev) => ({
          ...prev,
          client_email: clientData[0]?.email || '', // Set client email
        }));
      }

      // Fetch calls based on user role
      let query = supabase
        .from('calls')
        .select('*')
        .eq('client_id', clientId); // Fetch calls for the specific client

      if (userRole === 'admin') {
        // Admin can see all calls
        query = query; // No additional filter needed
      } else if (userRole === 'staff') {
        // Staff can only see their own calls
        query = query.eq('user_id', user.id); // Filter by user ID
      }

      const { data, error } = await query; // Execute the query

      if (error) {
        console.error('Error fetching calls:', error);
      } else {
        setCalls(data); // Update state with fetched calls
      }
    };

    if (clientId) {
      fetchCallsAndCompanyName();
    }
  }, [clientId, userRole]); // Add userRole to the dependency array

  const handleAddCall = () => {
    setCallInfo({
      date: '',
      time: '',
      description: `Dear Client,\n\nThis is a reminder for your upcoming call scheduled on {CALL_DATE} at {CALL_TIME} with {MANAGER_NAME}.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\n`,
      call_with: '', // Updated to call_with
      subject: '',
      client_email: callInfo.client_email, // Set client email from state
    });
    setIsAddModalOpen(true);
  };

  const handleSelectCall = (selectedCall) => {
    setCallInfo(selectedCall);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Fetch the logged-in user again to get the user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error fetching user:', userError);
      return; // Exit if there's an error
    }

    // Fetch user details to get first and last name
    const { data: userData, error: userDetailsError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single(); // Fetch the user details

    if (userDetailsError) {
        console.error('Error fetching user details:', userDetailsError);
        return; // Exit if there's an error
    }

    const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name

    // Replace placeholders in the description with actual values
    const filledDescription = callInfo.description
      .replace('{CALL_DATE}', callInfo.date)
      .replace('{CALL_TIME}', callInfo.time)
      .replace('{MANAGER_NAME}', callInfo.call_with); // Updated to call_with

    // Prepare the email content
    const emailSubject = `Call Reminder with ${callInfo.call_with}`;
    const emailBody = `\n${filledDescription}\n`;

    try {
      // Call the sendEmail function
      console.log('Sending email to:', callInfo.client_email); // Ensure client_email is set in callInfo
      await sendEmail(callInfo.client_email, emailSubject, emailBody, 'template_4ymgh0h'); // Use the new template ID
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    const newCall = {
      ...callInfo,
      description: filledDescription,
      client_id: clientId, // Include client_id when inserting
      user_id: user.id, // Set the user_id to the logged-in user's ID
    };

    const { error: insertError } = await supabase
      .from('calls')
      .insert([newCall]); // Insert new call into the database

    if (insertError) {
      console.error('Error adding call:', insertError);
    } else {
      setCalls([...calls, newCall]); // Add new call to the state
      await logActivity({
        activity: `Added Call with ${callInfo.call_with} (Client: ${companyName})`, // Include company name instead of email
        action: 'Add',
        user_id: user.id, // Pass user ID to user_id
        activity_by: userName, // Use full name for activity_by
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString()
      });
      setIsAddModalOpen(false); // Close the modal after adding

      // Show success alert for call added
      Swal.fire({
        icon: 'success',
        title: 'Call Added Successfully',
        text: 'The call has been added successfully.',
      });
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  // Function to format date and time
  const formatDateTime = (date, time) => {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
    return `${day}/${month}/${year.slice(-2)}, ${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <div className="calls">
      <div className="calls-header">
        <h2>Calls</h2>
        <button className="calls-add-btn" onClick={handleAddCall}>
          +
        </button>
      </div>
      <hr className="calls-divider" />

      {calls.length > 0 ? (
        calls.map((call, index) => (
          <div key={index} className="call-card" onClick={() => handleSelectCall(call)}>
            <h3>{call.subject}</h3> {/* Display only the subject */}
            <p>{call.date} | {call.time}</p> {/* Display date and time */}
          </div>
        ))
      ) : (
        <p>No calls available. Please add a call.</p>
      )}

      {/* Add Call Modal */}
      {isAddModalOpen && (
        <div className="calls-modal">
          <div className="calls-modal-content">
            <h3>Add Call</h3>
            <hr />
            <form onSubmit={handleSubmit}>
              <label>
                Call With:
                <select
                  value={callInfo.call_with} // Updated to call_with
                  onChange={(e) => setCallInfo({ ...callInfo, call_with: e.target.value })}
                  required
                >
                  <option value="">Select...</option>
                  {['Manager', 'Client', 'Staff'].map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
              </label>
              <div className="date-time-container">
                <label>
                  Date:
                  <input
                    type="date"
                    value={callInfo.date}
                    onChange={(e) => setCallInfo({ ...callInfo, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    value={callInfo.time}
                    onChange={(e) => setCallInfo({ ...callInfo, time: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label>
                Subject:
                <input
                  type="text"
                  value={callInfo.subject} // Allow user to input their own subject
                  onChange={(e) => setCallInfo({ ...callInfo, subject: e.target.value })}
                  required
                />
              </label>
              <label>
                To Email: {/* Bind this to the client_email state */}
                <input
                  type="email"
                  value={callInfo.client_email} // Bind to client_email
                  onChange={(e) => setCallInfo({ ...callInfo, client_email: e.target.value })} // Update state on change
                  required // Ensure this field is required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={callInfo.description}
                  onChange={(e) => setCallInfo({ ...callInfo, description: e.target.value })}
                  required
                />
              </label>
              <div className="calls-modal-buttons">
                <button type="submit" className="calls-submit-btn">Submit</button>
                <button type="button" className="calls-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Call Modal */}
      {isViewModalOpen && (
        <div className="calls-modal">
          <div className="calls-modal-content">
            <h3>View Call</h3>
            <hr />
            <div>
              <p><strong>Call With:</strong> {callInfo.call_with}</p> {/* Updated to call_with */}
              <p>{formatDateTime(callInfo.date, callInfo.time)}</p> {/* Display formatted date and time */}
              <p><strong>Subject:</strong> {callInfo.subject}</p>
              <p><strong>Client Email:</strong> {callInfo.client_email}</p> {/* Display client email */}
              <p>{callInfo.description.split('\n').map((line, index) => (
                <span key={index}>{line}<br /></span> // Replace \n with <br />
              ))}</p>
            </div>
            <div className="calls-modal-buttons">
              <button type="button" className="calls-submit-btn" onClick={handleCloseViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calls;
