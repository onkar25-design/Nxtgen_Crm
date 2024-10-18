import React, { useState, useEffect } from 'react';
import './Calls.css'; // Ensure you have appropriate styles

function Calls() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [calls, setCalls] = useState([]);
  const [callInfo, setCallInfo] = useState({
    date: '',
    time: '',
    description: '', // Default description will be set when adding
    with: '',
    subject: '',
    clientName: '', // Field for client name
  });

  const initialCalls = [
    {
      date: '2024-07-18',
      time: '10:00',
      description: `Dear Client,\n\nThis is a reminder for your upcoming call scheduled on 2024-07-18 at 10:00 with Manager.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nBest regards,\n\nNxtGen Innovation`,
      with: 'Manager',
      subject: 'Call with Manager',
      clientName: 'Client',
    },
  ];

  useEffect(() => {
    setCalls(initialCalls);
  }, []);

  const handleAddCall = () => {
    setCallInfo({
      date: '',
      time: '',
      description: `Dear {CLIENT_NAME},\n\nThis is a reminder for your upcoming call scheduled on {CALL_DATE} at {CALL_TIME} with {MANAGER_NAME}.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nBest regards,\n\nNxtGen Innovation`, // Default description
      with: '',
      subject: '',
      clientName: '', // Reset client name
    });
    setIsAddModalOpen(true);
  };

  const handleSelectCall = (selectedCall) => {
    setCallInfo(selectedCall);
    setIsViewModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace placeholders in the description with actual values
    const filledDescription = callInfo.description
      .replace('{CLIENT_NAME}', callInfo.clientName) // Use client name
      .replace('{CALL_DATE}', callInfo.date)
      .replace('{CALL_TIME}', callInfo.time)
      .replace('{MANAGER_NAME}', callInfo.with) // Assuming the manager is the same as the call with

    const newCall = {
      ...callInfo,
      description: filledDescription,
    };

    setCalls([...calls, newCall]);
    setIsAddModalOpen(false);
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
                Client Name:
                <input
                  type="text"
                  value={callInfo.clientName} // Input for client name
                  onChange={(e) => setCallInfo({ ...callInfo, clientName: e.target.value })}
                  required
                />
              </label>
              <label>
                Call With:
                <select
                  value={callInfo.with}
                  onChange={(e) => setCallInfo({ ...callInfo, with: e.target.value })}
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
              <p><strong>Call With:</strong> {callInfo.with}</p>
              <p>{formatDateTime(callInfo.date, callInfo.time)}</p> {/* Display formatted date and time */}
              <p><strong>Subject:</strong> {callInfo.subject}</p>
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
