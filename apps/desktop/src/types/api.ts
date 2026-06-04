export type ActivationState = 'idle' | 'wake_detected' | 'listening' | 'transcribing' | 'thinking' | 'responding' | 'clap_detected' | 'confirmation_required' | 'blocked' | 'error' | 'complete';
export type ActivationStatus = { state: ActivationState | string; current_state?: ActivationState | string; wake_listening: boolean; clap_listening: boolean; wake_enabled?: boolean; clap_enabled?: boolean; last_event?: string; warning?: string };
export type Task = { id: number; title: string; notes: string; due_date?: string | null; due_time?: string | null; status: 'pending' | 'completed' | 'cancelled'; source: 'manual' | 'text_command' | 'voice_command'; created_at: string; updated_at: string };
export type TaskInput = { title: string; notes?: string; due_date?: string | null; due_time?: string | null; source?: 'manual' | 'text_command' | 'voice_command' };
export type CommandResponse = { command: string; intent: string; safety_level: string; status: string; response: string; requires_confirmation: boolean; activation_state: string; task?: Task | null };
export type CommandHistory = CommandResponse & { id: number; created_at: string; command_text: string };
export type SettingsMap = Record<string, string>;
