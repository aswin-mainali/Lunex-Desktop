import { speakResponse } from '../services/ttsService';
import type { SettingsMap } from '../types/api';

const fields = [
  ['privacy_mode', 'Privacy mode'],
  ['wake_phrase_enabled', 'Wake phrase detection'],
  ['double_clap_enabled', 'Double-clap activation'],
  ['push_to_talk_enabled', 'Push-to-talk'],
  ['tts_enabled', 'Voice response / TTS'],
  ['local_memory_enabled', 'Local memory'],
  ['local_tasks_enabled', 'Local task/reminder storage'],
] as const;

type VoiceDebug = { micPermission: string; clapListener: string; wakeListener: string; tts: string; lastClapEvent: string; lastWakeEvent: string; currentAmplitude: string; clapThreshold: string };

export function SettingsPage({ settings, updateSetting, voiceDebug, voiceNotice }: { settings: SettingsMap; updateSetting: (key: string, value: string) => Promise<SettingsMap>; voiceDebug: VoiceDebug; voiceNotice: string }) {
  const toggle = async (key: string) => updateSetting(key, settings[key] === 'true' ? 'false' : 'true');
  const testVoice = async () => { await speakResponse('Lunex voice response is active.', true); };
  return <div className="page glass-page"><h1>Settings</h1><p>Windows-first local controls. Settings persist in SQLite.</p>{voiceNotice && <p className="modal-error">{voiceNotice}</p>}<div className="settings-debug">Mic permission: {voiceDebug.micPermission} · Wake listener: {voiceDebug.wakeListener} · Clap listener: {voiceDebug.clapListener} · TTS: {voiceDebug.tts} · Amp: {voiceDebug.currentAmplitude}/{voiceDebug.clapThreshold}</div><button className="page-action" onClick={testVoice}>Test Voice</button><div className="settings-grid">{fields.map(([key,label])=><label className="setting-row" key={key}><span>{label}</span><button onClick={()=>toggle(key)} className={settings[key]==='true'?'on':''}>{settings[key]==='true'?'ON':'OFF'}</button></label>)}<label className="setting-row"><span>Microphone device placeholder</span><input value={settings.microphone_device ?? ''} onChange={e=>updateSetting('microphone_device',e.target.value)} /></label><label className="setting-row"><span>OpenAI API key field placeholder</span><input value={settings.openai_api_key_placeholder ?? ''} onChange={e=>updateSetting('openai_api_key_placeholder',e.target.value)} /></label><label className="setting-row"><span>Folder connection placeholder</span><input value={settings.folders ?? ''} onChange={e=>updateSetting('folders',e.target.value)} /></label><label className="setting-row"><span>Appearance theme</span><input value={settings.appearance_theme ?? ''} onChange={e=>updateSetting('appearance_theme',e.target.value)} /></label></div></div>;
}
