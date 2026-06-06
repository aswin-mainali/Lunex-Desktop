import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { AICore } from '../components/dashboard/AICore';
import { AssistantResponseCard } from '../components/dashboard/AssistantResponseCard';
import { CommandBar } from '../components/dashboard/CommandBar';
import { RightPanels } from '../components/dashboard/RightPanels';
import { api } from '../services/api';
import type { ActivationStatus, CommandResponse, SettingsMap, Task } from '../types/api';

type VoiceDebug = { micPermission: string; clapListener: string; wakeListener: string; tts: string; lastClapEvent: string; lastWakeEvent: string; currentAmplitude: string; clapThreshold: string };

function welcomeText() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning. Lunex is online.';
  if (hour < 18) return 'Good afternoon. Lunex is ready.';
  return 'Good evening. Lunex is standing by.';
}

export function Dashboard({ connected, activation, setActivation, settings, voiceNotice, setVoiceNotice, voiceDebug, setVoiceDebug, tasks, setTasks, refreshTasks, setPage }: { connected: boolean; activation: ActivationStatus; setActivation: React.Dispatch<React.SetStateAction<ActivationStatus>>; settings: SettingsMap; voiceNotice: string; setVoiceNotice: (message: string) => void; voiceDebug: VoiceDebug; setVoiceDebug: React.Dispatch<React.SetStateAction<VoiceDebug>>; tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; refreshTasks: () => Promise<void>; setPage: (page: string) => void }) {
  const [result, setResult] = useState<CommandResponse | string>('Ready for your command.');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [ttsStatus, setTtsStatus] = useState(settings.tts_enabled === 'true' ? 'ready' : 'disabled');
  const state = (activation.current_state || activation.state || 'idle') as string;
  const welcome = useMemo(welcomeText, []);
  const completeTask = async (task: Task) => { const updated = await api.updateTask(task.id, { status: 'completed' }); setTasks(tasks.map((item) => item.id === updated.id ? updated : item)); };
  const deleteTask = async (id: number) => { await api.deleteTask(id); setTasks(tasks.filter((task) => task.id !== id)); };
  useEffect(() => { setTtsStatus(settings.tts_enabled === 'true' ? 'ready' : 'disabled'); }, [settings.tts_enabled]);
  const resultDetails = typeof result === 'string' ? null : result;
  const simpleStatus = `Wake ${activation.wake_listening ? 'ON' : 'OFF'} · Clap ${activation.clap_listening ? 'ON' : 'OFF'} · TTS ${settings.tts_enabled === 'true' ? 'ON' : 'OFF'} · Mic ${voiceDebug.micPermission}`;
  return <div className="dashboard"><section className="center-panel"><div className="top-label">LUNEX AI CORE</div><h2>{welcome}</h2><h1><span>LUNEX</span> ONLINE</h1><p className="subtitle">How can I <em>assist</em> you today?</p><AICore state={state} /><div className="chips"><button>Summarize my day</button><button>Find project files</button><button>Analyze data</button><button>Optimize system</button></div><div className="assistant-response-zone">{resultDetails ? <AssistantResponseCard result={resultDetails} ttsEnabled={settings.tts_enabled === 'true'} onClear={() => setResult('Ready for your command.')} onTtsStatus={setTtsStatus} /> : <div className="assistant-idle-note"><strong>{connected ? 'Backend connected' : 'Backend offline'}</strong><span>{voiceNotice || String(result)}</span></div>}</div><div className="dashboard-status-row"><span>{simpleStatus}</span><span>TTS {ttsStatus}</span>{voiceNotice && <em>{voiceNotice}</em>}</div><CommandBar onResult={setResult} setActivation={setActivation} onTaskCreated={refreshTasks} ttsEnabled={settings.tts_enabled === 'true'} pushToTalkEnabled={settings.push_to_talk_enabled !== 'false'} setVoiceNotice={setVoiceNotice} onMicPermission={(micPermission) => setVoiceDebug((debug) => ({ ...debug, micPermission }))} onTtsStatus={setTtsStatus}/></section><RightPanels tasks={tasks} setPage={setPage} onTaskSaved={(task) => setTasks([task, ...tasks])} onTaskCompleted={completeTask} onTaskDeleted={deleteTask} showTaskModal={showTaskModal} setShowTaskModal={setShowTaskModal} /></div>;
}
