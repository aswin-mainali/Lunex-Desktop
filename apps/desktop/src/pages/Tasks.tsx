import type React from 'react';
import { useEffect, useState } from 'react';
import { TaskModal } from '../components/dashboard/TaskModal';
import { api } from '../services/api';
import type { Task } from '../types/api';

export function TasksPage({ tasks, setTasks, refreshTasks }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; refreshTasks: () => Promise<void> }) {
  const [showModal, setShowModal] = useState(false);
  useEffect(() => { refreshTasks(); }, []);
  const complete = async (task: Task) => { const updated = await api.updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' }); setTasks((items) => items.map((item) => item.id === updated.id ? updated : item)); };
  const remove = async (id: number) => { await api.deleteTask(id); setTasks((items) => items.filter((task) => task.id !== id)); };
  return <div className="page glass-page"><div className="page-header"><div><h1>Tasks</h1><p>Local tasks and reminders stored in SQLite.</p></div><button className="page-action" onClick={() => setShowModal(true)}>Add Task</button></div>{tasks.length === 0 ? <div className="empty-state large"><strong>No tasks or reminders yet</strong><p>Ask Lunex to add a reminder, or create one manually.</p><button onClick={() => setShowModal(true)}>Add Task</button></div> : <div className="task-list-page">{tasks.map((task) => <article key={task.id} className={task.status === 'completed' ? 'completed' : ''}><div><strong>{task.title}</strong><span>{[task.due_date, task.due_time].filter(Boolean).join(' · ') || 'No due time'} · {task.source}</span>{task.notes && <p>{task.notes}</p>}</div><button onClick={() => complete(task)}>{task.status === 'completed' ? 'Reopen' : 'Complete'}</button><button onClick={() => remove(task.id)}>Delete</button></article>)}</div>}{showModal && <TaskModal onClose={() => setShowModal(false)} onSaved={(task) => setTasks((items) => [task, ...items])} />}</div>;
}
