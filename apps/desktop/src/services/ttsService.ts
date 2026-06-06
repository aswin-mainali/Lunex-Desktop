type TTSCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export async function speakResponse(text: string, enabled: boolean, callbacks: TTSCallbacks = {}): Promise<string | null> {
  if (!enabled || !text.trim()) return 'TTS disabled';
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    callbacks.onError?.();
    return 'Voice response is not supported on this system.';
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => /natural|online|aria|guy|jenny|zira/i.test(voice.name)) ?? voices.find((voice) => voice.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.96;
  utterance.pitch = 1.02;
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => callbacks.onEnd?.();
  utterance.onerror = () => callbacks.onError?.();
  window.speechSynthesis.speak(utterance);
  return null;
}
