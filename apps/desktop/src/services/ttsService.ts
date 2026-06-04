export async function speakResponse(text: string, enabled: boolean): Promise<string | null> {
  if (!enabled || !text.trim()) return null;
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return 'Voice response is not supported on this system.';
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => /natural|online|aria|guy|jenny|zira/i.test(voice.name)) ?? voices.find((voice) => voice.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.96;
  utterance.pitch = 1.02;
  window.speechSynthesis.speak(utterance);
  return null;
}
