import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import './AssignedCalls.css'; // Import the CSS file for styling

const AssignedCalls = () => {
  const [assignedCalls, setAssignedCalls] = useState([]);
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

    const fetchAssignedCallsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      let query = supabase
        .from('calls')
        .select(`
          id,
          date,
          time,
          subject,
          client_id,
          clients (company_name)  // Join with clients table to get company_name
        `)
        .eq('date', today); // Fetch assigned calls for today

      if (userRole === 'staff') {
        const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user
        query = query.eq('user_id', user.id); // Filter by user ID for staff
      }

      const { data, error } = await query; // Execute the query

      if (error) {
        console.error('Error fetching assigned calls for today:', error);
      } else {
        setAssignedCalls(data);
      }
    };

    fetchUserRole().then(fetchAssignedCallsToday); // Fetch user role and then assigned calls

  }, [userRole]); // Add userRole to the dependency array

  return (
    <div className="assigned-calls-container">
      <h2>Assigned Calls Today</h2>
      {assignedCalls.length > 0 ? (
        <table className="assigned-calls-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client Name</th>
              <th>Assigned Call Subject</th>
              <th>Call Time</th>
            </tr>
          </thead>
          <tbody>
            {assignedCalls.map(call => (
              <tr key={call.id}>
                <td>{call.date}</td>
                <td>{call.clients.company_name}</td>
                <td>{call.subject}</td>
                <td>{call.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assigned calls for today.</p>
      )}
    </div>
  );
};

export default AssignedCalls;
