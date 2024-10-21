import React, { useState, useEffect } from 'react';
import './Appointments.css'; // Ensure you have appropriate styles
import { supabase } from '../../../supabaseClient'; // Import Supabase client

function Appointments({ clientId }) { // Accept clientId as a prop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentInfo, setAppointmentInfo] = useState({
    date: '',
    time: '',
    description: '',
    appointment_with: '', // Updated to appointment_with
    subject: '',
  });

  // Fetch appointments from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId); // Fetch appointments for the specific client

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data); // Update state with fetched appointments
      }
    };

    if (clientId) {
      fetchAppointments();
    }
  }, [clientId]);

  const handleAddAppointment = () => {
    setAppointmentInfo({
      date: '',
      time: '',
      description: `Dear Client,\n\nThis is a courteous reminder of your upcoming appointment scheduled on {APPOINTMENT_DATE} at {APPOINTMENT_TIME} with {MANAGER_NAME}.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nWe look forward to meeting you.\n\nBest regards,\n\nNxtGen Innovation`, // Default description
      appointment_with: '', // Updated to appointment_with
      subject: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSelectAppointment = (selectedAppointment) => {
    setAppointmentInfo(selectedAppointment);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Replace placeholders in the description with actual values
    const filledDescription = appointmentInfo.description
      .replace('{CLIENT_NAME}', '') // Removed client name
      .replace('{APPOINTMENT_DATE}', appointmentInfo.date)
      .replace('{APPOINTMENT_TIME}', appointmentInfo.time)
      .replace('{MANAGER_NAME}', appointmentInfo.appointment_with) // Updated to appointment_with
      .replace('{COMPANY_NAME}', 'NxtGen Innovation'); // Set company name

    const newAppointment = {
      ...appointmentInfo,
      description: filledDescription,
      client_id: clientId, // Include client_id when inserting
    };

    const { error } = await supabase
      .from('appointments')
      .insert([newAppointment]); // Insert new appointment into the database

    if (error) {
      console.error('Error adding appointment:', error);
    } else {
      // Fetch updated appointments after adding a new one
      const { data: updatedData, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId); // Fetch appointments for the specific client

      if (fetchError) {
        console.error('Error fetching updated appointments:', fetchError);
      } else {
        setAppointments(updatedData); // Update state with fetched appointments
      }
      setIsAddModalOpen(false);
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
                Appointment With:
                <select
                  value={appointmentInfo.appointment_with} // Updated to appointment_with
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, appointment_with: e.target.value })}
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
              <p><strong>Appointment With:</strong> {appointmentInfo.appointment_with}</p>
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
