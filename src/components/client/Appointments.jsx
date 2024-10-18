import React, { useState, useEffect } from 'react';
import './Appointments.css'; // Ensure you have appropriate styles

function Appointments() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentInfo, setAppointmentInfo] = useState({
    date: '',
    time: '',
    description: '', // Default description will be set when adding
    with: '',
    subject: '',
    clientName: '', // Field for client name
  });

  const initialAppointments = [
    {
      date: '2024-07-18',
      time: '10:00',
      description: `Dear Client,\n\nThis is a courteous reminder of your upcoming appointment scheduled on 2024-07-18 at 10:00 with Manager.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nWe look forward to meeting you.\n\nBest regards,\n\nNxtGen Innovation`,
      with: 'Manager',
      subject: 'Meeting with Manager',
      clientName: 'Client',
    },
  ];

  useEffect(() => {
    setAppointments(initialAppointments);
  }, []);

  const handleAddAppointment = () => {
    setAppointmentInfo({
      date: '',
      time: '',
      description: `Dear {CLIENT_NAME},\n\nThis is a courteous reminder of your upcoming appointment scheduled on {APPOINTMENT_DATE} at {APPOINTMENT_TIME} with {MANAGER_NAME}.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nWe look forward to meeting you.\n\nBest regards,\n\nNxtGen Innovation`, // Default description
      with: '',
      subject: '',
      clientName: '', // Reset client name
    });
    setIsAddModalOpen(true);
  };

  const handleSelectAppointment = (selectedAppointment) => {
    setAppointmentInfo(selectedAppointment);
    setIsViewModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace placeholders in the description with actual values
    const filledDescription = appointmentInfo.description
      .replace('{CLIENT_NAME}', appointmentInfo.clientName) // Use client name
      .replace('{APPOINTMENT_DATE}', appointmentInfo.date)
      .replace('{APPOINTMENT_TIME}', appointmentInfo.time)
      .replace('{MANAGER_NAME}', appointmentInfo.with) // Assuming the manager is the same as the appointment with
      .replace('{COMPANY_NAME}', 'NxtGen Innovation'); // Set company name

    const newAppointment = {
      ...appointmentInfo,
      description: filledDescription,
    };

    setAppointments([...appointments, newAppointment]);
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
    <div className="appointments">
      <div className="appointments-header">
        <h2>Appointments</h2>
        <button className="appointments-add-btn" onClick={handleAddAppointment}>
          +
        </button>
      </div>
      <hr className="appointments-divider" />

      {appointments.length > 0 ? (
        appointments.map((appointment, index) => (
          <div key={index} className="appointment-card" onClick={() => handleSelectAppointment(appointment)}>
            <h3>{appointment.subject}</h3> {/* Display only the subject */}
            <p>{appointment.date} | {appointment.time}</p> {/* Display date and time */}
          </div>
        ))
      ) : (
        <p>No appointments available. Please add an appointment.</p>
      )}

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="appointments-modal">
          <div className="appointments-modal-content">
            <h3>Add Appointment</h3>
            <hr />
            <form onSubmit={handleSubmit}>
              <label>
                Client Name:
                <input
                  type="text"
                  value={appointmentInfo.clientName} // Input for client name
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, clientName: e.target.value })}
                  required
                />
              </label>
              <label>
                Appointment With:
                <select
                  value={appointmentInfo.with}
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, with: e.target.value })}
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
                    value={appointmentInfo.date}
                    onChange={(e) => setAppointmentInfo({ ...appointmentInfo, date: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    value={appointmentInfo.time}
                    onChange={(e) => setAppointmentInfo({ ...appointmentInfo, time: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label>
                Subject:
                <input
                  type="text"
                  value={appointmentInfo.subject} // Allow user to input their own subject
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, subject: e.target.value })}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={appointmentInfo.description}
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, description: e.target.value })}
                  required
                />
              </label>
              <div className="appointments-modal-buttons">
                <button type="submit" className="appointments-submit-btn">Submit</button>
                <button type="button" className="appointments-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {isViewModalOpen && (
        <div className="appointments-modal">
          <div className="appointments-modal-content">
            <h3>View Appointment</h3>
            <hr />
            <div>
              <p><strong>Appointment With:</strong> {appointmentInfo.with}</p>
              <p>{formatDateTime(appointmentInfo.date, appointmentInfo.time)}</p> {/* Display formatted date and time */}
              <p><strong>Subject:</strong> {appointmentInfo.subject}</p>
              <p>{appointmentInfo.description.split('\n').map((line, index) => (
                <span key={index}>{line}<br /></span> // Replace \n with <br />
              ))}</p>
            </div>
            <div className="appointments-modal-buttons">
              <button type="button" className="appointments-submit-btn" onClick={handleCloseViewModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
