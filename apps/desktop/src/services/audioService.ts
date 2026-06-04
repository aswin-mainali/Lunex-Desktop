import { api } from './api';

type AmplitudeHandler = (amplitude: number) => void;
type DetectionHandler = () => void;
type TranscriptHandler = (transcript: string) => Promise<void> | void;

type SpeechRecognitionConstructor = new () => SpeechRecognition;
type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

class AudioService {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private amplitudeFrame = 0;
  private clapFrame = 0;
  private lastPeakAt = 0;
  private lastDetectionAt = 0;
  private wakeRecognition: SpeechRecognition | null = null;
  private wakeRecorder: MediaRecorder | null = null;
  private wakeTimer = 0;

  async requestMicrophone(): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone is not available on this system.');
    }
    if (!this.stream || !this.stream.active) {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    return this.stream;
  }

  async startRecording(onAmplitude?: AmplitudeHandler): Promise<void> {
    const stream = await this.requestMicrophone();
    this.chunks = [];
    this.recorder = new MediaRecorder(stream);
    this.recorder.ondataavailable = (event) => { if (event.data.size > 0) this.chunks.push(event.data); };
    this.recorder.start();
    if (onAmplitude) await this.startAmplitudeMeter(onAmplitude);
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recorder || this.recorder.state === 'inactive') return new Blob(this.chunks, { type: 'audio/webm' });
    await new Promise<void>((resolve) => {
      this.recorder!.onstop = () => resolve();
      this.recorder!.stop();
    });
    this.stopAmplitudeMeter();
    return new Blob(this.chunks, { type: 'audio/webm' });
  }

  async transcribe(blob: Blob) {
    return api.transcribe(blob);
  }

  async startDoubleClapDetection(onDetected: DetectionHandler, onAmplitude?: AmplitudeHandler): Promise<void> {
    await this.startAmplitudeMeter((amplitude) => {
      onAmplitude?.(amplitude);
      const now = Date.now();
      const isPeak = amplitude > 0.62;
      if (!isPeak || now - this.lastDetectionAt < 2000) return;
      if (this.lastPeakAt && now - this.lastPeakAt >= 250 && now - this.lastPeakAt <= 900) {
        this.lastDetectionAt = now;
        this.lastPeakAt = 0;
        onDetected();
        return;
      }
      this.lastPeakAt = now;
    });
  }

  stopDoubleClapDetection(): void {
    this.stopAmplitudeMeter();
    this.lastPeakAt = 0;
  }

  async startWakePhraseListening(onWake: DetectionHandler, onTranscript?: TranscriptHandler): Promise<void> {
    await this.requestMicrophone();
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = async (event) => {
        const latest = event.results[event.results.length - 1]?.[0]?.transcript ?? '';
        if (!latest) return;
        await onTranscript?.(latest);
        const check = await api.checkWake({ transcript: latest });
        if (check.wake_detected) onWake();
      };
      recognition.onerror = () => undefined;
      recognition.onend = () => { if (this.wakeRecognition === recognition) recognition.start(); };
      recognition.start();
      this.wakeRecognition = recognition;
      return;
    }
    throw new Error('Wake phrase detection is not supported by this WebView yet. Use push-to-talk or clap activation.');
  }

  stopWakePhraseListening(): void {
    this.wakeRecognition?.stop();
    this.wakeRecognition = null;
    if (this.wakeTimer) window.clearInterval(this.wakeTimer);
    this.wakeTimer = 0;
    if (this.wakeRecorder?.state === 'recording') this.wakeRecorder.stop();
    this.wakeRecorder = null;
  }

  stopAll(): void {
    this.stopWakePhraseListening();
    this.stopDoubleClapDetection();
    this.stopAmplitudeMeter();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private async captureWakeChunk(onWake: DetectionHandler): Promise<void> {
    const stream = await this.requestMicrophone();
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    this.wakeRecorder = recorder;
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
    recorder.onstop = async () => {
      const check = await api.checkWake({ audio: new Blob(chunks, { type: 'audio/webm' }) });
      if (check.wake_detected) onWake();
    };
    recorder.start();
    window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 1800);
  }

  private async startAmplitudeMeter(onAmplitude: AmplitudeHandler): Promise<void> {
    const stream = await this.requestMicrophone();
    if (!this.audioContext) this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024;
    this.audioContext.createMediaStreamSource(stream).connect(this.analyser);
    const data = new Uint8Array(this.analyser.fftSize);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      }
      onAmplitude(Math.min(1, Math.sqrt(sum / data.length) * 3.5));
      this.amplitudeFrame = window.requestAnimationFrame(tick);
    };
    tick();
  }

  private stopAmplitudeMeter(): void {
    if (this.amplitudeFrame) window.cancelAnimationFrame(this.amplitudeFrame);
    if (this.clapFrame) window.cancelAnimationFrame(this.clapFrame);
    this.amplitudeFrame = 0;
    this.clapFrame = 0;
    this.analyser?.disconnect();
    this.analyser = null;
  }
}

export const audioService = new AudioService();
