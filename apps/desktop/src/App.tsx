import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { CommandCenter } from './pages/CommandCenter';
import { TasksPage } from './pages/Tasks';
import { SimplePage } from './pages/SimplePage';
import { api } from './services/api';
import { useAudioActivation } from './hooks/useAudioActivation';
import type { Task } from './types/api';

export function App() {
  const [page, setPage] = useState('Home');
  const [connected, setConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const audio = useAudioActivation();

  const refreshTasks = async () => { try { setTasks(await api.tasks()); } catch { /* backend offline */ } };
  const refresh = async () => { try { await api.health(); setConnected(true); await audio.refreshActivation(); } catch { setConnected(false); } };

  useEffect(() => {
    refresh();
    refreshTasks();
    audio.loadSettings().catch(() => undefined);
    const timer = window.setInterval(refresh, 2500);
    return () => window.clearInterval(timer);
  }, []);

  const content = page === 'Home'
    ? <Dashboard connected={connected} activation={audio.activation} setActivation={audio.setActivation} settings={audio.settings} voiceNotice={audio.voiceNotice} setVoiceNotice={audio.setVoiceNotice} voiceDebug={audio.voiceDebug} setVoiceDebug={audio.setVoiceDebug} tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} setPage={setPage} />
    : page === 'Settings'
      ? <SettingsPage settings={audio.settings} updateSetting={audio.updateSetting} voiceDebug={audio.voiceDebug} voiceNotice={audio.voiceNotice} />
      : page === 'Command Center'
        ? <CommandCenter />
        : page === 'Tasks'
          ? <TasksPage tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} />
          : <SimplePage title={page} />;
  return <AppShell page={page} setPage={setPage} connected={connected} activation={audio.activation}>{content}</AppShell>;
}
