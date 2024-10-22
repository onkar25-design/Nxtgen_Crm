import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../supabaseClient';
import './AssignedCalls.css'; // Import the CSS file for styling

const AssignedCalls = () => {
  const [assignedCalls, setAssignedCalls] = useState([]);

  useEffect(() => {
    const fetchAssignedCallsToday = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching assigned calls for today:', error);
      } else {
        setAssignedCalls(data);
      }
    };

    fetchAssignedCallsToday();
  }, []);

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
                <td>{call.date}</td> {/* Assuming 'date' is a field in your calls table */}
                <td>{call.clients.company_name}</td> {/* Accessing company_name from the joined clients table */}
                <td>{call.subject}</td> {/* Assuming 'subject' is a field in your calls table */}
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
