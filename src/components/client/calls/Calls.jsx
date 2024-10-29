import React, { useState, useEffect } from 'react';
import './Calls.css'; // Ensure you have appropriate styles
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import sendEmail from '../../utils/sendEmail'; // Import sendEmail function

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

  // Fetch calls and company name from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchCallsAndCompanyName = async () => {
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

      // Fetch calls
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('client_id', clientId);

      if (error) {
        console.error('Error fetching calls:', error);
      } else {
        setCalls(data);
      }
    };

    if (clientId) {
      fetchCallsAndCompanyName();
    }
  }, [clientId]);

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
      await sendEmail(callInfo.client_email, emailSubject, emailBody); // Use the client email from the form
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    const newCall = {
      ...callInfo,
      description: filledDescription,
      client_id: clientId, // Include client_id when inserting
    };

    const { error } = await supabase
      .from('calls')
      .insert([newCall]); // Insert new call into the database

    if (error) {
      console.error('Error adding call:', error);
    } else {
      setCalls([...calls, newCall]); // Add new call to the state
      await logActivity({
        activity: `Added Call with ${callInfo.call_with} (Client: ${companyName})`, // Include company name
        action: 'Add',
        activity_by: 'User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString()
      });
      setIsAddModalOpen(false); // Close the modal after adding
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

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
                    min={today} // Set minimum date to today
                    required
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
