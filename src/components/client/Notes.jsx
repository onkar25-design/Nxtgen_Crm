import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'; // Import the Font Awesome trash icon
import './Notes.css'; // Create a CSS file for styling

function Notes() {
  const [notes, setNotes] = useState([
    { id: 1, date: '2024-07-18', text: 'Client interested in new product line' },
    { id: 2, date: '2024-09-12', text: 'Follow up on pricing inquiry' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, date: '', text: '' });

  const handleAddNote = () => {
    setCurrentNote({ id: null, date: '', text: '' });
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setCurrentNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentNote.id) {
      setNotes(notes.map(note => (note.id === currentNote.id ? currentNote : note)));
    } else {
      setNotes([{ ...currentNote, id: Date.now() }, ...notes]); // Add new note to the top
    }
    setIsModalOpen(false);
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
            <hr className="notes-modal-divider" /> {/* Divider added here */}
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
