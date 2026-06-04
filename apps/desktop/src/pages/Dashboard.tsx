import { useMemo, useState } from 'react';
import type React from 'react';
import { AICore } from '../components/dashboard/AICore';
import { CommandBar } from '../components/dashboard/CommandBar';
import { RightPanels } from '../components/dashboard/RightPanels';
import { api } from '../services/api';
import type { ActivationStatus, CommandResponse, SettingsMap, Task } from '../types/api';

type VoiceDebug = { micPermission: string; clapListener: string; wakeListener: string; tts: string; lastClapEvent: string; lastWakeEvent: string };

function welcomeText() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning. Lunex is online.';
  if (hour < 18) return 'Good afternoon. Lunex is ready.';
  return 'Good evening. Lunex is standing by.';
}

export function Dashboard({ connected, activation, setActivation, settings, voiceNotice, setVoiceNotice, voiceDebug, setVoiceDebug, tasks, setTasks, refreshTasks, setPage }: { connected: boolean; activation: ActivationStatus; setActivation: React.Dispatch<React.SetStateAction<ActivationStatus>>; settings: SettingsMap; voiceNotice: string; setVoiceNotice: (message: string) => void; voiceDebug: VoiceDebug; setVoiceDebug: React.Dispatch<React.SetStateAction<VoiceDebug>>; tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; refreshTasks: () => Promise<void>; setPage: (page: string) => void }) {
  const [result, setResult] = useState<CommandResponse | string>('Voice response placeholder: text responses are shown here in v1.');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const text = typeof result === 'string' ? result : result.response;
  const state = (activation.current_state || activation.state || 'idle') as string;
  const welcome = useMemo(welcomeText, []);
  const completeTask = async (task: Task) => { const updated = await api.updateTask(task.id, { status: 'completed' }); setTasks(tasks.map((item) => item.id === updated.id ? updated : item)); };
  const deleteTask = async (id: number) => { await api.deleteTask(id); setTasks(tasks.filter((task) => task.id !== id)); };
  const resultDetails = typeof result === 'string' ? null : result;
  return <div className="dashboard"><section className="center-panel"><div className="top-label">LUNEX AI CORE</div><h2>{welcome}</h2><h1><span>LUNEX</span> ONLINE</h1><p className="subtitle">How can I <em>assist</em> you today?</p><AICore state={state} /><div className="chips"><button>Summarize my day</button><button>Find project files</button><button>Analyze data</button><button>Optimize system</button></div><div className="response-strip"><strong>{connected ? 'Backend connected' : 'Backend offline'}</strong><span>{voiceNotice || text}</span>{resultDetails && <div className="command-result"><b>{resultDetails.command}</b><em>{resultDetails.status} · {resultDetails.safety_level}</em><p>{resultDetails.response}</p></div>}<small>Wake {activation.wake_listening ? 'ON' : 'OFF'} · Double-clap {activation.clap_listening ? 'ON' : 'OFF'} · TTS {settings.tts_enabled === 'true' ? 'ON' : 'OFF'}</small><div className="voice-debug">Mic permission: {voiceDebug.micPermission} · Wake listener: {voiceDebug.wakeListener} · Clap listener: {voiceDebug.clapListener} · TTS: {voiceDebug.tts} · Last clap: {voiceDebug.lastClapEvent} · Last wake: {voiceDebug.lastWakeEvent}</div></div><CommandBar onResult={setResult} setActivation={setActivation} onTaskCreated={refreshTasks} ttsEnabled={settings.tts_enabled === 'true'} pushToTalkEnabled={settings.push_to_talk_enabled !== 'false'} setVoiceNotice={setVoiceNotice} onMicPermission={(micPermission) => setVoiceDebug((debug) => ({ ...debug, micPermission }))}/></section><RightPanels tasks={tasks} setPage={setPage} onTaskSaved={(task) => setTasks([task, ...tasks])} onTaskCompleted={completeTask} onTaskDeleted={deleteTask} showTaskModal={showTaskModal} setShowTaskModal={setShowTaskModal} /></div>;
}
