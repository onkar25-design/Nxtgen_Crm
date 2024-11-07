import React, { useState, useEffect } from 'react';
import './Appointments.css'; // Ensure you have appropriate styles
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import sendEmail from '../../utils/sendEmail'; // Adjust the import path as necessary
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
    client_email: '', // New field for client email
  });
  const [companyName, setCompanyName] = useState(''); // Add state for company name
  const [userRole, setUserRole] = useState(''); // State for user role

  // Fetch appointments and company name from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchAppointmentsAndCompanyName = async () => {
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
        setAppointmentInfo((prev) => ({
          ...prev,
          client_email: clientData[0]?.email || '', // Set client email
        }));
      }

      // Fetch appointments based on user role
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId); // Fetch appointments for the specific client

      if (userRole === 'admin') {
        // Admin can see all appointments
        query = query; // No additional filter needed
      } else if (userRole === 'staff') {
        // Staff can only see their own appointments
        query = query.eq('user_id', user.id); // Filter by user ID
      } else {
        // Handle other roles if necessary
        query = query.or('user_id.is.null'); // Public appointments
      }

      const { data, error } = await query; // Execute the query

      if (error) {
        console.error('Error fetching appointments:', error);
      } else {
        setAppointments(data); // Update state with fetched appointments
      }
    };

    if (clientId) {
      fetchAppointmentsAndCompanyName();
    }
  }, [clientId, userRole]); // Add userRole to the dependency array

  const handleAddAppointment = () => {
    // Reset appointment info and set client email
    setAppointmentInfo((prev) => ({
      ...prev,
      date: '',
      time: '',
      description: `Dear Client,\n\nThis is a courteous reminder of your upcoming appointment scheduled on {APPOINTMENT_DATE} at {APPOINTMENT_TIME} with {MANAGER_NAME}.\n\nPlease let us know if you have any questions or need to reschedule. You can contact us at 1234567890 for any assistance.\n\nWe look forward to meeting you.`,
      appointment_with: '',
      subject: '',
      client_email: appointmentInfo.client_email, // Set client email from state
    }));
    setIsAddModalOpen(true);
  };

  const handleSelectAppointment = (selectedAppointment) => {
    setAppointmentInfo(selectedAppointment); // Ensure selectedAppointment includes client_email
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

    // Fetch user details from the users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single(); // Fetch the user details

    if (userError) {
        console.error('Error fetching user details:', userError);
        return; // Exit if there's an error
    }

    const userName = `${userData.first_name} ${userData.last_name}`; // Combine first and last name

    // Replace placeholders in the description with actual values
    const filledDescription = appointmentInfo.description
      .replace('{APPOINTMENT_DATE}', appointmentInfo.date)
      .replace('{APPOINTMENT_TIME}', appointmentInfo.time)
      .replace('{MANAGER_NAME}', appointmentInfo.appointment_with) // Updated to appointment_with
      .replace('{COMPANY_NAME}', 'NxtGen Innovation'); // Set company name

    // Prepare the email content
    const emailSubject = `Appointment Confirmation with ${appointmentInfo.appointment_with}`;
    const emailBody = `\n${filledDescription}\n`;

    try {
      // Call the sendEmail function
      console.log('Sending email to:', appointmentInfo.client_email);
      await sendEmail(appointmentInfo.client_email, emailSubject, emailBody, 'template_4ymgh0h'); // Use the new template ID
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    const newAppointment = {
      ...appointmentInfo,
      description: filledDescription,
      client_id: clientId, // Include client_id when inserting
      user_id: user.id, // Set the user_id to the logged-in user's ID
    };

    const { error } = await supabase
      .from('appointments')
      .insert([newAppointment]); // Insert new appointment into the database

    if (error) {
      console.error('Error adding appointment:', error);
    } else {
      // Log the activity for the new appointment
      await logActivity({ 
        activity: `Added Appointment with ${appointmentInfo.appointment_with} (Client: ${companyName})`, // Include company name
        action: 'Add', 
        user_id: user.id, // Pass user ID to user_id
        activity_by: userName, // Use full name for activity_by
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString() 
      });

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

      // Show success alert for appointment added
      Swal.fire({
        icon: 'success',
        title: 'Appointment Added Successfully',
        text: 'The appointment has been added successfully.',
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
                    min={new Date().toISOString().split('T')[0]} // Set minimum date to today
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
                To Email: {/* Bind this to the client_email state */}
                <input
                  type="email"
                  value={appointmentInfo.client_email} // Bind to client_email
                  onChange={(e) => setAppointmentInfo({ ...appointmentInfo, client_email: e.target.value })} // Update state on change
                  required // Ensure this field is required
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
              <p><strong>Client Email:</strong> {appointmentInfo.client_email}</p> {/* Display client email */}
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
