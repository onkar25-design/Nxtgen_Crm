import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import './AppointmentsToday.css'; // Import the CSS file for styling

const AppointmentsToday = () => {
  const [appointments, setAppointments] = useState([]);
  const [userRole, setUserRole] = useState(''); // State for user role

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser(); // Get the logged-in user

      if (userError) {
        console.error('Error fetching user:', userError);
        return;
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
    };

    const fetchAppointmentsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          subject,
          client_id,
          clients (company_name)  // Join with clients table to get company_name
        `)
        .eq('date', today); // Fetch appointments for today

      if (userRole === 'staff') {
        const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user
        query = query.eq('user_id', user.id); // Filter by user ID for staff
      }

      const { data, error } = await query; // Execute the query

      if (error) {
        console.error('Error fetching appointments for today:', error);
      } else {
        setAppointments(data);
      }
    };

    fetchUserRole().then(fetchAppointmentsToday); // Fetch user role and then appointments

  }, [userRole]); // Add userRole to the dependency array

  return (
    <div className="appointments-container">
      <h2>Appointments Today</h2>
      {appointments.length > 0 ? (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client Name</th>
              <th>Appointment Subject</th>
              <th>Appointment Time</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.date}</td>
                <td>{appointment.clients.company_name}</td>
                <td>{appointment.subject}</td>
                <td>{appointment.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No appointments for today.</p>
      )}
    </div>
  );
};

export default AppointmentsToday;
