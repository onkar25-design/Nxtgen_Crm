import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient'; // Import Supabase client
import sendEmail from '../../utils/sendEmail'; // Adjust the import path as necessary
import Swal from 'sweetalert2'; // Import SweetAlert
import './Reminders.css'; // Import the CSS file

function Reminders({ clientId }) {
  const [reminders, setReminders] = useState([]);
  const [reminderInfo, setReminderInfo] = useState({
    subject: '',
    description: `Dear Client,\n\nWe hope this message finds you well. It’s been a while since we last connected, and we just wanted to reach out to see how you’re doing and if there’s anything we can assist you with.\n\nWhether you have questions, need guidance, or simply want to catch up, please feel free to contact us at 1234567890. We’d love to hear from you and look forward to supporting you in any way we can.`,
    frequency: '1 month', // Default frequency
    client_email: '', // New field for client email
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for modal visibility
  const [userId, setUserId] = useState(null); // State for user ID
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for view modal visibility
  const [selectedReminder, setSelectedReminder] = useState(null); // State to hold the selected reminder

  // Fetch reminders and user ID when the component mounts or clientId changes
  useEffect(() => {
    const fetchRemindersAndUserId = async () => {
      // Fetch user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        return; // Exit if there's an error
      }

      setUserId(user.id); // Set user ID

      // Fetch reminders for the specific client
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('client_id', clientId);

      if (error) {
        console.error('Error fetching reminders:', error);
      } else {
        setReminders(data); // Update state with fetched reminders
      }

      // Fetch client email
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('email') // Fetch client email
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error fetching client email:', clientError);
      } else {
        setReminderInfo((prev) => ({
          ...prev,
          client_email: clientData?.email || '', // Set client email
        }));
      }
    };

    if (clientId) {
      fetchRemindersAndUserId();
    }
  }, [clientId]);

  const handleAddReminder = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const newReminder = {
      ...reminderInfo,
      client_id: clientId,
      user_id: userId, // Include user ID
    };

    const { error } = await supabase
      .from('reminders')
      .insert([newReminder]); // Insert new reminder into the database

    if (error) {
      console.error('Error adding reminder:', error);
    } else {
      setReminders([...reminders, newReminder]); // Update state with new reminder
      await sendEmailReminder(newReminder); // Send email reminder
      setReminderInfo({ subject: '', description: reminderInfo.description, frequency: '1 month', client_email: '' }); // Reset form
      setIsAddModalOpen(false); // Close modal

      // Show success alert for reminder added
      Swal.fire({
        icon: 'success',
        title: 'Reminder Added Successfully',
        text: 'The reminder has been added successfully.',
      });
    }
  };

  const sendEmailReminder = async (reminder) => {
    const emailSubject = reminder.subject;
    const emailBody = reminder.description;

    // Use the new template ID for reminders
    const reminderTemplateId = 'template_xhihmol'; // Replace with your actual reminder template ID

    await sendEmail(reminder.client_email, emailSubject, emailBody, reminderTemplateId); // Use the email from the reminder
  };

  // Function to handle selecting a reminder
  const handleSelectReminder = (reminder) => {
    setSelectedReminder(reminder); // Set the selected reminder
    setIsViewModalOpen(true); // Open the view modal
  };

  return (
    <div className="reminders">
      <div className="reminders-header">
        <h2>Reminders</h2>
        <button className="reminders-add-btn" onClick={() => setIsAddModalOpen(true)}>
          +
        </button>
      </div>
      <hr className="reminders-divider" />

      {/* Display reminders */}
      {reminders.length > 0 ? (
        reminders.map((reminder, index) => (
          <div key={index} className="reminder-card" onClick={() => handleSelectReminder(reminder)}>
            <h3>{reminder.subject}</h3>
            <p>Frequency: {reminder.frequency}</p>
          </div>
        ))
      ) : (
        <p>No reminders available. Please add a reminder.</p>
      )}

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="reminders-modal">
          <div className="reminders-modal-content">
            <h3>Add Reminder</h3>
            <hr />
            <form onSubmit={handleAddReminder}>
              <label>
                To Email:
                <input
                  type="email"
                  placeholder="Client Email"
                  value={reminderInfo.client_email}
                  onChange={(e) => setReminderInfo({ ...reminderInfo, client_email: e.target.value })}
                  required
                />
              </label>
              <label>
                Subject:
                <input
                  type="text"
                  placeholder="Subject"
                  value={reminderInfo.subject}
                  onChange={(e) => setReminderInfo({ ...reminderInfo, subject: e.target.value })}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  placeholder="Description"
                  value={reminderInfo.description}
                  onChange={(e) => setReminderInfo({ ...reminderInfo, description: e.target.value })}
                  required
                />
              </label>
              <label>
                Frequency:
                <select
                  value={reminderInfo.frequency}
                  onChange={(e) => setReminderInfo({ ...reminderInfo, frequency: e.target.value })}
                >
                  <option value="1 month">Every Month</option>
                  <option value="3 months">Every 3 Months</option>
                  <option value="6 months">Every 6 Months</option>
                </select>
              </label>
              <div className="reminders-modal-buttons">
                <button type="submit" className="reminders-submit-btn">Submit</button>
                <button type="button" className="reminders-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Reminder Modal */}
      {isViewModalOpen && selectedReminder && (
        <div className="reminders-modal">
          <div className="reminders-modal-content">
            <h3>View Reminder</h3>
            <hr />
            <div>
              <p><strong>To Email:</strong> {selectedReminder.client_email}</p>
              <p><strong>Subject:</strong> {selectedReminder.subject}</p>
              <p><strong>Description:</strong> {selectedReminder.description.split('\n').map((line, index) => (
                <span key={index}>{line}<br /></span>
              ))}</p>
              <p><strong>Frequency:</strong> {selectedReminder.frequency}</p>
            </div>
            <div className="reminders-modal-buttons">
              <button type="button" className="reminders-submit-btn" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders; 