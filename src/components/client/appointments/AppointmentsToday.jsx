import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import './AppointmentsToday.css'; // Import the CSS file for styling

const AppointmentsToday = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointmentsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching appointments for today:', error);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointmentsToday();
  }, []);

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
