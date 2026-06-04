import { useState } from 'react';
import { AICore } from '../components/dashboard/AICore';
import { CommandBar } from '../components/dashboard/CommandBar';
import { RightPanels } from '../components/dashboard/RightPanels';
import type { ActivationStatus, CommandResponse } from '../types/api';
export function Dashboard({ connected, activation, setActivation }: { connected: boolean; activation: ActivationStatus; setActivation: (a: ActivationStatus)=>void }) {
  const [result, setResult] = useState<CommandResponse | string>('Voice response placeholder: text responses are shown here in v1.');
  const text = typeof result === 'string' ? result : result.response;
  return <div className="dashboard"><section className="center-panel"><div className="top-label">LUNEX AI CORE</div><h2>GOOD MORNING</h2><h1><span>LUNEX</span> ONLINE</h1><p className="subtitle">How can I <em>assist</em> you today?</p><AICore state={activation.state || 'idle'} /><div className="chips"><button>Summarize my day</button><button>Find project files</button><button>Analyze data</button><button>Optimize system</button></div><div className="response-strip"><strong>{connected ? 'Backend connected' : 'Backend offline'}</strong><span>{text}</span><small>Wake {activation.wake_listening ? 'ON' : 'OFF'} · Double-clap {activation.clap_listening ? 'ON' : 'OFF'}</small></div><CommandBar onResult={setResult} setActivation={setActivation}/></section><RightPanels /></div>;
}
