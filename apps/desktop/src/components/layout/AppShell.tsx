import type React from 'react';
import { Bot, CircleHelp, Cpu, Database, FolderOpen, Home, ListChecks, Settings, Shield, TerminalSquare } from 'lucide-react';
import type { ActivationStatus } from '../../types/api';
const nav = [ ['Home', Home], ['Command Center', TerminalSquare], ['Files & Data', FolderOpen], ['Tasks', ListChecks], ['Modules', Database], ['System', Cpu], ['Settings', Settings], ['Help', CircleHelp] ] as const;
export function AppShell({ children, page, setPage, connected, activation }: { children: React.ReactNode; page: string; setPage: (p: string) => void; connected: boolean; activation: ActivationStatus }) {
  return <div className="app-frame"><aside className="sidebar"><div className="logo"><span>LUNEX</span></div><nav>{nav.map(([label, Icon]) => <button key={label} className={page === label ? 'active' : ''} onClick={() => setPage(label)}><Icon size={17}/><span>{label}</span></button>)}</nav><div className="system-widget"><div className="shield"><Shield size={18}/></div><div><strong>SYSTEM STATUS</strong><span>{connected ? 'OPTIMAL' : 'BACKEND OFFLINE'}</span></div><div className="mini-wave"/><p>{activation.wake_listening ? 'Wake ON' : 'Wake OFF'} · {activation.clap_listening ? 'Clap ON' : 'Clap OFF'}</p></div></aside><main>{children}</main></div>;
}
