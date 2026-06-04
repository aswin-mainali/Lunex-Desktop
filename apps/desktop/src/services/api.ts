import type { ActivationStatus, CommandHistory, CommandResponse, SettingsMap } from '../types/api';
const API_BASE = import.meta.env.VITE_LUNEX_API_BASE ?? 'http://127.0.0.1:8787';
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init });
  if (!res.ok) throw new Error(`Lunex API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
export const api = {
  async health() { return request<{ status: string }>('/health'); },
  async routeCommand(command: string, confirmed = false) { return request<CommandResponse>('/commands/route', { method: 'POST', body: JSON.stringify({ command, confirmed }) }); },
  async commandHistory() { return request<CommandHistory[]>('/commands/history'); },
  async transcribe(blob?: Blob) {
    const form = new FormData(); if (blob) form.append('file', blob, 'push-to-talk.webm');
    const res = await fetch(`${API_BASE}/audio/transcribe`, { method: 'POST', body: form }); if (!res.ok) throw new Error(await res.text()); return res.json() as Promise<{ transcript: string; mocked: boolean; activation_state: string }>;
  },
  async activationStatus() { return request<ActivationStatus>('/activation/status'); },
  async toggleWake(on: boolean) { return request<ActivationStatus>(`/activation/wake/${on ? 'start' : 'stop'}`, { method: 'POST' }); },
  async toggleClap(on: boolean) { return request<ActivationStatus>(`/activation/clap/${on ? 'start' : 'stop'}`, { method: 'POST' }); },
  async settings() { return request<SettingsMap>('/settings'); },
  async saveSettings(settings: SettingsMap) { return request<SettingsMap>('/settings', { method: 'POST', body: JSON.stringify({ settings }) }); },
  async memory() { return request('/memory'); },
};
