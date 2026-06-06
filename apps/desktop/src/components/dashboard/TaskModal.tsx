import { useState } from 'react';
import { api } from '../../services/api';
import type { Task } from '../../types/api';

export function TaskModal({ onClose, onSaved }: { onClose: () => void; onSaved: (task: Task) => void }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const save = async () => {
    if (!title.trim()) { setError('Task title is required.'); return; }
    const task = await api.addTask({ title, notes, due_date: dueDate || null, due_time: dueTime || null, source: 'manual' });
    onSaved(task);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="task-modal" role="dialog" aria-modal="true" aria-label="Add task">
        <header><h3>Add Task</h3><button onClick={onClose}>×</button></header>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What should Lunex remember?" /></label>
        <div className="modal-two"><label>Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label><label>Due time<input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} /></label></div>
        <label>Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" /></label>
        {error && <p className="modal-error">{error}</p>}
        <footer><button onClick={onClose}>Cancel</button><button className="primary" onClick={save}>Save task</button></footer>
      </section>
    </div>
  );
}
