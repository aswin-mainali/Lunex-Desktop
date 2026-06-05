import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import type { ActivationStatus, SettingsMap } from '../types/api';

type VoiceDebug = {
  micPermission: string;
  clapListener: string;
  wakeListener: string;
  tts: string;
  lastClapEvent: string;
  lastWakeEvent: string;
  currentAmplitude: string;
  clapThreshold: string;
};

const initialActivation: ActivationStatus = { state: 'idle', current_state: 'idle', wake_listening: false, clap_listening: false, wake_enabled: false, clap_enabled: false, last_event: 'none' };
const initialDebug: VoiceDebug = { micPermission: 'not requested', clapListener: 'inactive', wakeListener: 'inactive', tts: 'off', lastClapEvent: 'none', lastWakeEvent: 'none', currentAmplitude: '0.000', clapThreshold: '0.620' };

export function useAudioActivation() {
  const [activation, setActivation] = useState<ActivationStatus>(initialActivation);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceDebug, setVoiceDebug] = useState<VoiceDebug>(initialDebug);
  const lastEvent = useRef<string | undefined>('none');

  const showTransientState = useCallback((state: 'wake_detected' | 'clap_detected', next: ActivationStatus) => {
    setActivation({ ...next, state, current_state: state });
    window.setTimeout(() => setActivation((current) => ({ ...current, state: 'listening', current_state: 'listening' })), state === 'wake_detected' ? 1100 : 1200);
  }, []);

  const applyActivation = useCallback((next: ActivationStatus) => {
    const event = next.last_event ?? 'none';
    if (event !== lastEvent.current && event.includes('wake_detected:wake_phrase')) showTransientState('wake_detected', next);
    else if (event !== lastEvent.current && event.includes('wake_detected:double_clap')) showTransientState('clap_detected', next);
    else setActivation(next);
    lastEvent.current = event;
  }, [showTransientState]);

  const refreshActivation = useCallback(async () => {
    applyActivation(await api.activationStatus());
  }, [applyActivation]);

  const loadSettings = useCallback(async () => {
    const next = await api.settings();
    setSettings(next);
    setVoiceDebug((debug) => ({ ...debug, tts: next.tts_enabled === 'true' ? 'on' : 'off' }));
    if (next.wake_phrase_enabled === 'true' || next.wake_enabled === 'true') applyActivation(await api.toggleWake(true));
    if (next.double_clap_enabled === 'true' || next.clap_enabled === 'true') applyActivation(await api.toggleClap(true));
    return next;
  }, [applyActivation]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    const next = { ...settings, [key]: value };
    const saved = await api.saveSettings(next);
    setSettings(saved);
    setVoiceDebug((debug) => ({ ...debug, tts: saved.tts_enabled === 'true' ? 'on' : 'off' }));
    if (key === 'wake_phrase_enabled' || key === 'wake_enabled') applyActivation(await api.toggleWake(value === 'true'));
    if (key === 'double_clap_enabled' || key === 'clap_enabled') applyActivation(await api.toggleClap(value === 'true'));
    return saved;
  }, [applyActivation, settings]);

  useEffect(() => {
    if (!activation.wake_listening) {
      audioService.stopWakePhraseListening();
      setVoiceDebug((debug) => ({ ...debug, wakeListener: 'inactive' }));
      return;
    }
    setVoiceDebug((debug) => ({ ...debug, wakeListener: 'starting' }));
    audioService.startWakePhraseListening(async () => {
      setVoiceDebug((debug) => ({ ...debug, lastWakeEvent: new Date().toLocaleTimeString(), wakeListener: 'active' }));
      const next = await api.simulateWake();
      showTransientState('wake_detected', next);
    }).then(() => {
      setVoiceDebug((debug) => ({ ...debug, micPermission: 'granted', wakeListener: 'active' }));
      setVoiceNotice('');
    }).catch((error: Error) => {
      const unsupported = error.message.includes('not supported');
      setVoiceDebug((debug) => ({ ...debug, micPermission: unsupported ? debug.micPermission : 'denied', wakeListener: unsupported ? 'unsupported' : 'inactive' }));
      setVoiceNotice(error.message || 'Microphone permission denied. Enable microphone access to use voice activation.');
    });
    return () => audioService.stopWakePhraseListening();
  }, [activation.wake_listening, showTransientState]);

  useEffect(() => {
    if (!activation.clap_listening) {
      audioService.stopDoubleClapDetection();
      setVoiceDebug((debug) => ({ ...debug, clapListener: 'inactive' }));
      return;
    }
    setVoiceDebug((debug) => ({ ...debug, clapListener: 'starting' }));
    audioService.startDoubleClapDetection(
      async () => {
        const next = await api.simulateClap();
        showTransientState('clap_detected', next);
      },
      (amplitude) => setVoiceDebug((debug) => ({ ...debug, currentAmplitude: amplitude.toFixed(3) })),
      () => setVoiceDebug((debug) => ({ ...debug, lastClapEvent: new Date().toLocaleTimeString() })),
    ).then(() => {
      setVoiceDebug((debug) => ({ ...debug, micPermission: 'granted', clapListener: 'active' }));
      setVoiceNotice('');
    }).catch(() => {
      setVoiceDebug((debug) => ({ ...debug, micPermission: 'denied', clapListener: 'inactive' }));
      setVoiceNotice('Microphone permission denied. Enable microphone access to use voice activation.');
    });
    return () => { audioService.stopDoubleClapDetection(); setVoiceDebug((debug) => ({ ...debug, clapListener: 'inactive' })); };
  }, [activation.clap_listening, showTransientState]);

  return { activation, setActivation, settings, setSettings, voiceNotice, setVoiceNotice, voiceDebug, setVoiceDebug, loadSettings, updateSetting, refreshActivation };
}
