import { Mic, Radio, Send, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import type React from 'react';
import { api } from '../../services/api';
import { audioService } from '../../services/audioService';
import { speakResponse } from '../../services/ttsService';
import type { ActivationStatus, CommandResponse } from '../../types/api';

export function CommandBar({ onResult, setActivation, onTaskCreated, ttsEnabled, pushToTalkEnabled, setVoiceNotice, onMicPermission }: { onResult: (r: CommandResponse | string) => void; setActivation: React.Dispatch<React.SetStateAction<ActivationStatus>>; onTaskCreated: () => Promise<void>; ttsEnabled: boolean; pushToTalkEnabled: boolean; setVoiceNotice: (message: string) => void; onMicPermission?: (status: string) => void }) {
  const [command, setCommand] = useState('');
  const [recording, setRecording] = useState(false);
  const stoppingRef = useRef(false);

  const finishState = (state: string) => {
    window.setTimeout(() => setActivation((current) => ({ ...current, state: 'idle', current_state: 'idle' })), state === 'blocked' ? 1800 : 2600);
  };

  const speakFinal = async (text: string) => {
    const ttsWarning = await speakResponse(text, ttsEnabled);
    if (ttsWarning) setVoiceNotice(ttsWarning);
  };

  const route = async (text: string, source: 'text_command' | 'voice_command' = 'text_command') => {
    if (!text.trim()) return;
    setVoiceNotice('');
    setActivation((current) => ({ ...current, state: 'thinking', current_state: 'thinking' }));
    const res = await api.routeCommand(text, false, source);
    onResult(res);
    if (res.task) await onTaskCreated();
    const nextState = res.activation_state === 'blocked' ? 'blocked' : res.requires_confirmation ? 'confirmation_required' : 'responding';
    setActivation((current) => ({ ...current, state: nextState, current_state: nextState }));
    await speakFinal(res.response);
    finishState(nextState);
    setCommand('');
  };

  const send = async () => route(command);

  const stopAndRouteRecording = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    setRecording(false);
    setActivation((current) => ({ ...current, state: 'transcribing', current_state: 'transcribing' }));
    const blob = await audioService.stopRecording();
    const transcription = await audioService.transcribe(blob);
    const transcript = transcription.transcript.trim();
    if (!transcript) {
      const message = transcription.message || 'I did not catch that. Try again.';
      setVoiceNotice(message);
      onResult(message);
      await speakFinal(transcription.mock ? 'Real transcription is not configured yet.' : message);
      finishState('responding');
      stoppingRef.current = false;
      return;
    }
    if (transcription.message) setVoiceNotice(transcription.message);
    onResult(`${transcript}${transcription.mocked ? ' (mock transcription)' : ''}`);
    setCommand(transcript);
    await route(transcript, 'voice_command');
    stoppingRef.current = false;
  };

  const pushToTalk = async () => {
    if (!pushToTalkEnabled) { setVoiceNotice('Push-to-talk is disabled in Settings.'); return; }
    try {
      if (!recording) {
        stoppingRef.current = false;
        setVoiceNotice('');
        setActivation((current) => ({ ...current, state: 'listening', current_state: 'listening' }));
        await audioService.startSpeechRecording(stopAndRouteRecording);
        onMicPermission?.('granted');
        setRecording(true);
      } else {
        await stopAndRouteRecording();
      }
    } catch {
      stoppingRef.current = false;
      setRecording(false);
      onMicPermission?.('denied');
      setActivation((current) => ({ ...current, state: 'error', current_state: 'error' }));
      setVoiceNotice('Microphone permission denied. Enable microphone access to use voice activation.');
      finishState('error');
    }
  };

  const toggleWake = async () => {
    try {
      await audioService.requestMicrophone();
      onMicPermission?.('granted');
      setActivation(await api.toggleWake(true));
    } catch {
      onMicPermission?.('denied');
      setVoiceNotice('Microphone permission denied. Enable microphone access to use voice activation.');
    }
  };

  return <div className="command-wrap"><div className="command-bar"><Sparkles className="spark" size={21}/><input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder="Type a command or ask anything..."/><button className={recording?'recording':''} onClick={pushToTalk} title="Push to talk"><Mic size={20}/></button><button onClick={toggleWake} title="Wake listening"><Radio size={20}/></button><button className="send" onClick={send}><Send size={20}/></button></div><p>Press <b>/</b> to see commands · Press <b>Ctrl + K</b> to quick search</p></div>;
}
