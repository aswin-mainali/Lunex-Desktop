import { useEffect, useRef, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/Settings';
import { CommandCenter } from './pages/CommandCenter';
import { TasksPage } from './pages/Tasks';
import { SimplePage } from './pages/SimplePage';
import { api } from './services/api';
import { audioService } from './services/audioService';
import type { ActivationStatus, SettingsMap, Task } from './types/api';

const initialActivation: ActivationStatus = { state: 'idle', current_state: 'idle', wake_listening: false, clap_listening: false, wake_enabled: false, clap_enabled: false, last_event: 'none' };

export function App() {
  const [page, setPage] = useState('Home');
  const [connected, setConnected] = useState(false);
  const [activation, setActivation] = useState<ActivationStatus>(initialActivation);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceDebug, setVoiceDebug] = useState({ micPermission: 'not requested', clapListener: 'inactive', lastClapEvent: 'none' });
  const lastEvent = useRef<string | undefined>('none');

  const refreshTasks = async () => { try { setTasks(await api.tasks()); } catch { /* backend offline */ } };
  const refreshSettings = async () => { try { setSettings(await api.settings()); } catch { /* backend offline */ } };
  const showTransientState = (state: 'wake_detected' | 'clap_detected', next: ActivationStatus) => {
    setActivation({ ...next, state, current_state: state });
    window.setTimeout(() => setActivation((current) => ({ ...current, state: 'listening', current_state: 'listening' })), state === 'wake_detected' ? 1100 : 1200);
  };
  const applyActivation = (next: ActivationStatus) => {
    const event = next.last_event ?? 'none';
    if (event !== lastEvent.current && event.includes('wake_detected:wake_phrase')) showTransientState('wake_detected', next);
    else if (event !== lastEvent.current && event.includes('wake_detected:double_clap')) showTransientState('clap_detected', next);
    else setActivation(next);
    lastEvent.current = event;
  };
  const refresh = async () => { try { await api.health(); setConnected(true); applyActivation(await api.activationStatus()); } catch { setConnected(false); } };

  useEffect(() => { refresh(); refreshTasks(); refreshSettings(); const timer = window.setInterval(refresh, 2500); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!activation.wake_listening) { audioService.stopWakePhraseListening(); return; }
    setVoiceDebug((debug) => ({ ...debug, micPermission: 'granted' }));
    audioService.startWakePhraseListening(async () => {
      const next = await api.simulateWake();
      showTransientState('wake_detected', next);
    }).catch((error: Error) => {
      setVoiceDebug((debug) => ({ ...debug, micPermission: error.message.includes('unsupported') ? debug.micPermission : 'denied' }));
      setVoiceNotice(error.message || 'Microphone permission denied. Enable microphone access to use voice activation.');
    });
    return () => audioService.stopWakePhraseListening();
  }, [activation.wake_listening]);
  useEffect(() => {
    if (!activation.clap_listening) { audioService.stopDoubleClapDetection(); setVoiceDebug((debug) => ({ ...debug, clapListener: 'inactive' })); return; }
    setVoiceDebug((debug) => ({ ...debug, micPermission: 'granted', clapListener: 'active' }));
    audioService.startDoubleClapDetection(async () => {
      setVoiceDebug((debug) => ({ ...debug, lastClapEvent: new Date().toLocaleTimeString() }));
      const next = await api.simulateClap();
      showTransientState('clap_detected', next);
    }).catch(() => {
      setVoiceDebug((debug) => ({ ...debug, micPermission: 'denied', clapListener: 'inactive' }));
      setVoiceNotice('Microphone permission denied. Enable microphone access to use voice activation.');
    });
    return () => { audioService.stopDoubleClapDetection(); setVoiceDebug((debug) => ({ ...debug, clapListener: 'inactive' })); };
  }, [activation.clap_listening]);

  const content = page === 'Home' ? <Dashboard connected={connected} activation={activation} setActivation={setActivation} settings={settings} voiceNotice={voiceNotice} setVoiceNotice={setVoiceNotice} voiceDebug={voiceDebug} setVoiceDebug={setVoiceDebug} tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} setPage={setPage} /> : page === 'Settings' ? <SettingsPage setActivation={setActivation} onSettingsChanged={setSettings} /> : page === 'Command Center' ? <CommandCenter /> : page === 'Tasks' ? <TasksPage tasks={tasks} setTasks={setTasks} refreshTasks={refreshTasks} /> : <SimplePage title={page} />;
  return <AppShell page={page} setPage={setPage} connected={connected} activation={activation}>{content}</AppShell>;
}
