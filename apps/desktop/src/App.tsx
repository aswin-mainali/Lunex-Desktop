import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { CommandCenter } from './pages/CommandCenter';
import { SimplePage } from './pages/SimplePage';
import { api } from './services/api';
import type { ActivationStatus } from './types/api';

export function App() {
  const [page, setPage] = useState('Home');
  const [connected, setConnected] = useState(false);
  const [activation, setActivation] = useState<ActivationStatus>({ state: 'idle', wake_listening: false, clap_listening: false });
  const refresh = async () => { try { await api.health(); setConnected(true); setActivation(await api.activationStatus()); } catch { setConnected(false); } };
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 7000); return () => window.clearInterval(timer); }, []);
  const content = page === 'Home' ? <Dashboard connected={connected} activation={activation} setActivation={setActivation} /> : page === 'Settings' ? <SettingsPage setActivation={setActivation} /> : page === 'Command Center' ? <CommandCenter /> : <SimplePage title={page} />;
  return <AppShell page={page} setPage={setPage} connected={connected} activation={activation}>{content}</AppShell>;
}
