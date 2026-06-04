export type ActivationStatus = { state: string; wake_listening: boolean; clap_listening: boolean; last_event?: string; warning?: string };
export type CommandResponse = { command: string; intent: string; safety_level: string; status: string; response: string; requires_confirmation: boolean; activation_state: string };
export type CommandHistory = CommandResponse & { id: number; created_at: string; command_text: string };
export type SettingsMap = Record<string, string>;
