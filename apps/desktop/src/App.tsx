import { useEffect, useRef, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { CommandCenter } from './pages/CommandCenter';
import { TasksPage } from './pages/Tasks';
import { SimplePage } from './pages/SimplePage';
import { api } from './services/api';
import type { ActivationStatus, Task } from './types/api';

const initialActivation: ActivationStatus = { state: 'idle', current_state: 'idle', wake_listening: false, clap_listening: false, wake_enabled: false, clap_enabled: false, last_event: 'none' };

export function App() {
  const [page, setPage] = useState('Home');
  const [connected, setConnected] = useState(false);
  const [activation, setActivation] = useState<ActivationStatus>(initialActivation);
  const [tasks, setTasks] = useState<Task[]>([]);
  const lastEvent = useRef<string | undefined>('none');

  const refreshTasks = async () => { try { setTasks(await api.tasks()); } catch { /* backend offline */ } };
  const applyActivation = (next: ActivationStatus) => {
    const event = next.last_event ?? 'none';
    if (event !== lastEvent.current && event.includes('wake_detected:wake_phrase')) {
      setActivation({ ...next, state: 'wake_detected', current_state: 'wake_detected' });
      window.setTimeout(() => setActivation((current) => ({ ...current, state: 'listening', current_state: 'listening' })), 1100);
    } else if (event !== lastEvent.current && event.includes('wake_detected:double_clap')) {
      setActivation({ ...next, state: 'clap_detected', current_state: 'clap_detected' });
      window.setTimeout(() => setActivation((current) => ({ ...current, state: 'listening', current_state: 'listening' })), 1200);
    } else {
      setActivation(next);
    }
    lastEvent.current = event;
  };
  const refresh = async () => { try { await api.health(); setConnected(true); applyActivation(await api.activationStatus()); } catch { setConnected(false); } };

  useEffect(() => { refresh(); refreshTasks(); const timer = window.setInterval(refresh, 2500); return () => window.clearInterval(timer); }, []);
  const content = page === 'Home' ? <Dashboard connected={connected} activation={activation} setActivation={setActivation} tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} setPage={setPage} /> : page === 'Settings' ? <SettingsPage setActivation={setActivation} /> : page === 'Command Center' ? <CommandCenter /> : page === 'Tasks' ? <TasksPage tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} /> : <SimplePage title={page} />;
  return <AppShell page={page} setPage={setPage} connected={connected} activation={activation}>{content}</AppShell>;
}
