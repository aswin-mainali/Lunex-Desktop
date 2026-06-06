import type React from 'react';
import { BarChart3, Bot, FileText, Globe2, Network, Workflow } from 'lucide-react';
import type { Task } from '../../types/api';
import { TaskModal } from './TaskModal';

const modules = [[BarChart3, 'Data Analyzer', 'Analyze & visualize data'], [Globe2, 'Web Navigator', 'Smart browsing & search'], [Bot, 'Code Assistant', 'Write & debug code'], [FileText, 'Report Builder', 'Create reports fast'], [Network, 'Mind Map', 'Organize ideas'], [Workflow, 'Automations', 'Smart workflows']] as const;

export function RightPanels({ tasks, setPage, onTaskSaved, onTaskCompleted, onTaskDeleted, showTaskModal, setShowTaskModal }: { tasks: Task[]; setPage: (page: string) => void; onTaskSaved: (task: Task) => void; onTaskCompleted: (task: Task) => void; onTaskDeleted: (id: number) => void; showTaskModal: boolean; setShowTaskModal: (show: boolean) => void }) {
  const pending = tasks.filter((task) => task.status === 'pending').slice(0, 4);
  return (
    <aside className="right-column">
      <Panel title="MODULES" action="View All"><div className="module-grid">{modules.map(([Icon, name, sub]) => <div className="module" key={name}><Icon size={20} /><strong>{name}</strong><span>{sub}</span><i /></div>)}</div></Panel>
      <Panel title="RECENT FILES" action="View All"><EmptyState title="No recent files yet" subtitle="Connect folders in Settings to let Lunex show recent files here." action="Choose folders" onAction={() => setPage('Settings')} /></Panel>
      <Panel title="TASKS & REMINDERS" action="View All">
        {pending.length === 0 ? <EmptyState title="No tasks or reminders yet" subtitle="Ask Lunex to add a reminder, or create one manually." action="Add Task" onAction={() => setShowTaskModal(true)} /> : <div>{pending.map((task) => <TaskRow key={task.id} task={task} onComplete={onTaskCompleted} onDelete={onTaskDeleted} />)}<button className="add-task" onClick={() => setShowTaskModal(true)}>+ Add Task</button></div>}
      </Panel>
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} onSaved={onTaskSaved} />}
    </aside>
  );
}

function Panel({ title, action, children }: { title: string; action: string; children: React.ReactNode }) { return <section className="glass-panel"><header><h3>{title}</h3><button>{action}</button></header>{children}</section>; }
function EmptyState({ title, subtitle, action, onAction }: { title: string; subtitle: string; action: string; onAction: () => void }) { return <div className="empty-state"><strong>{title}</strong><p>{subtitle}</p><button onClick={onAction}>{action}</button></div>; }
function TaskRow({ task, onComplete, onDelete }: { task: Task; onComplete: (task: Task) => void; onDelete: (id: number) => void }) { const due = [task.due_date, task.due_time].filter(Boolean).join(' · ') || 'No due time'; return <div className="task-row"><i className="cyan" /><div><strong>{task.title}</strong><small>{due}</small></div><span className="task-actions"><button onClick={() => onComplete(task)}>✓</button><button onClick={() => onDelete(task.id)}>×</button></span></div>; }
