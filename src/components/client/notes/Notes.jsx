import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'; // Import the Font Awesome edit icon
import { supabase } from '../../../../supabaseClient'; // Import the Supabase client
import './Notes.css'; // Create a CSS file for styling

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

function Notes({ clientId }) { // Accept clientId as a prop
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isReadOnlyModalOpen, setIsReadOnlyModalOpen] = useState(false); // State for read-only modal
  const [currentNote, setCurrentNote] = useState({ id: null, date: '', title: '', text: '' });
  const [companyName, setCompanyName] = useState(''); // State for company name

  // Fetch notes and company name from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchNotesAndCompanyName = async () => {
      // Fetch company name
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('company_name')
        .eq('id', clientId);

      if (clientError) {
        console.error('Error fetching client:', clientError);
      } else {
        setCompanyName(clientData[0]?.company_name); // Set company name
      }

      // Fetch notes
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('client_id', clientId) // Filter notes by client_id
        .order('date', { ascending: false }); // Order by date in descending order

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data);
      }
    };

    if (clientId) {
      fetchNotesAndCompanyName();
    }
  }, [clientId]);

  const handleAddNote = async () => {
    setCurrentNote({ id: null, date: '', title: '', text: '' });
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleReadNote = (note) => {
    setCurrentNote(note);
    setIsReadOnlyModalOpen(true); // Open the read-only modal
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting note:', error);
      } else {
        setNotes(notes.filter(note => note.id !== id));
        await logActivity({ 
          activity: `Deleted Note: ${currentNote.title} (Client: ${companyName})`, // Log title and company name
          action: 'Delete', 
          activity_by: 'User', 
          date: new Date().toISOString().split('T')[0], 
          time: new Date().toLocaleTimeString() 
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser(); // Get the logged-in user

    if (currentNote.id) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update({
          date: currentNote.date,
          title: currentNote.title,
          text: currentNote.text,
        })
        .eq('id', currentNote.id);

      if (error) {
        console.error('Error updating note:', error);
      } else {
        setNotes(notes.map(note => (note.id === currentNote.id ? currentNote : note)));
        await logActivity({ 
          activity: `Edited Note: ${currentNote.title} (Client: ${companyName})`,
          action: 'Edit', 
          activity_by: 'User', 
          date: new Date().toISOString().split('T')[0], 
          time: new Date().toLocaleTimeString() 
        });
      }
    } else {
      // Insert new note
      const { error } = await supabase
        .from('notes')
        .insert([{ 
          client_id: clientId, 
          user_id: user.id, // Set the user_id to the logged-in user's ID
          date: currentNote.date, 
          title: currentNote.title, 
          text: currentNote.text 
        }]);

      if (error) {
        console.error('Error adding note:', error);
      } else {
        setNotes([{ ...currentNote, id: Date.now() }, ...notes]);
        await logActivity({ 
          activity: `Added Note: ${currentNote.title} (Client: ${companyName})`,
          action: 'Add', 
          activity_by: 'User', 
          date: new Date().toISOString().split('T')[0], 
          time: new Date().toLocaleTimeString() 
        });
      }
    }
    setIsModalOpen(false);
    setIsEditModalOpen(false); // Close edit modal if it was open
  };

  return (
    <div className="notes">
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="notes-add-note-btn" onClick={handleAddNote}>+</button>
      </div>
      <hr className="notes-divider" />
      <ul className="notes-list">
        {notes.map(note => (
          <li key={note.id} className="notes-list-item">
            <span className="notes-note-date">{note.date}</span>
            <span className="notes-note-title" onClick={() => handleReadNote(note)}>{note.title}</span> {/* Display title */}
            <div className="notes-actions">
              <FontAwesomeIcon icon={faEdit} className="notes-edit-icon" onClick={() => handleEditNote(note)} />
              <FontAwesomeIcon icon={faTrash} className="notes-delete-icon" onClick={() => handleDeleteNote(note.id)} />
            </div>
          </li>
        ))}
      </ul>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="notes-modal">
          <div className="notes-modal-content">
            <h3>{currentNote.id ? 'Edit Note' : 'Add Note'}</h3>
            <hr className="notes-modal-divider" />
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={currentNote.title} // Title input
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                placeholder="Note Title"
                required
              />
              <input
                type="text"
                value={currentNote.text}
                onChange={(e) => setCurrentNote({ ...currentNote, text: e.target.value })}
                placeholder="Note content"
                required
              />
              <input
                type="date"
                value={currentNote.date}
                onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                required
              />
              <div className="notes-modal-buttons">
                <button type="submit" className="notes-submit-btn">Submit</button>
                <button type="button" className="notes-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditModalOpen && (
        <div className="notes-modal">
          <div className="notes-modal-content">
            <h3>Edit Note</h3>
            <hr className="notes-modal-divider" />
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={currentNote.title} // Title input
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                placeholder="Note Title"
                required
              />
              <input
                type="text"
                value={currentNote.text}
                onChange={(e) => setCurrentNote({ ...currentNote, text: e.target.value })}
                placeholder="Note content"
                required
              />
              <input
                type="date"
                value={currentNote.date}
                onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                required
              />
              <div className="notes-modal-buttons">
                <button type="submit" className="notes-submit-btn">Update</button>
                <button type="button" className="notes-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read-Only Note Modal */}
      {isReadOnlyModalOpen && (
        <div className="notes-modal">
          <div className="notes-modal-content">
            <h3>View Note</h3>
            <hr className="notes-modal-divider" />
            <div>
              <strong>Date:</strong> {currentNote.date}
            </div>
            <div>
              <strong>Title:</strong> {currentNote.title}
            </div>
            <div>
              <strong>Content:</strong> {currentNote.text}
            </div>
            <div className="notes-modal-buttons">
              <button type="button" className="notes-cancel-btn" onClick={() => setIsReadOnlyModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
