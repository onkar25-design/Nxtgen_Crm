import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'; // Import the Font Awesome trash icon
import { supabase } from '../../../supabaseClient'; // Import the Supabase client
import './Notes.css'; // Create a CSS file for styling

function Notes({ clientId }) { // Accept clientId as a prop
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, date: '', text: '' });

  // Fetch notes from Supabase when the component mounts or clientId changes
  useEffect(() => {
    const fetchNotes = async () => {
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
      fetchNotes();
    }
  }, [clientId]);

  const handleAddNote = () => {
    setCurrentNote({ id: null, date: '', text: '' });
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsModalOpen(true);
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
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentNote.id) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update({
          date: currentNote.date,
          text: currentNote.text,
        })
        .eq('id', currentNote.id);

      if (error) {
        console.error('Error updating note:', error);
      } else {
        setNotes(notes.map(note => (note.id === currentNote.id ? currentNote : note)));
      }
    } else {
      // Insert new note
      const { error } = await supabase
        .from('notes')
        .insert([{ client_id: clientId, date: currentNote.date, text: currentNote.text }]); // Corrected insert

      if (error) {
        console.error('Error adding note:', error);
      } else {
        setNotes([{ ...currentNote, id: Date.now() }, ...notes]); // Add new note to the top
      }
    }
    setIsModalOpen(false);
  };

  console.log('Client ID:', clientId);

  return (
    <div className="notes">
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="notes-add-note-btn" onClick={handleAddNote}>+</button>
      </div>
      <hr className="notes-divider" />
      <ul className="notes-list">
        {notes.map(note => (
          <li key={note.id}>
            <span className="notes-note-date">{note.date}</span>
            <span className="notes-note-text" onClick={() => handleEditNote(note)}>{note.text}</span>
            <FontAwesomeIcon icon={faTrash} className="notes-delete-icon" onClick={() => handleDeleteNote(note.id)} />
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="notes-modal">
          <div className="notes-modal-content">
            <h3>{currentNote.id ? 'Edit Note' : 'Add Note'}</h3>
            <hr className="notes-modal-divider" />
            <form onSubmit={handleSubmit}>
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
    </div>
  );
}

export default Notes;
