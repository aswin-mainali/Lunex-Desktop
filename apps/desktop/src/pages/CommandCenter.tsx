import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CommandHistory } from '../types/api';
export function CommandCenter(){const [items,setItems]=useState<CommandHistory[]>([]); useEffect(()=>{api.commandHistory().then(setItems).catch(()=>setItems([]))},[]); return <div className="page glass-page"><h1>Command Center</h1><p>Local command history is stored in SQLite and intentionally kept off the dashboard.</p><div className="history-list">{items.map(item=><article key={item.id}><strong>{item.command_text}</strong><span>{item.intent} · {item.safety_level} · {item.status}</span><p>{item.response}</p></article>)}</div></div>}
