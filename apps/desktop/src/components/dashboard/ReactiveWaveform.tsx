import type React from 'react';
import type { ActivationState } from '../../types/api';

const BAR_COUNT = 64;

function heightFor(index: number, state: string) {
  if (state === 'clap_detected') return index === 18 || index === 45 ? 70 : 8 + Math.abs(Math.sin(index)) * 16;
  if (state === 'listening') return 16 + Math.abs(Math.sin(index * 1.9)) * 52;
  if (state === 'transcribing') return 14 + Math.abs(Math.sin(index * 0.7)) * 38;
  if (state === 'thinking') return 18 + (index % 4 === 0 ? 32 : 10);
  if (state === 'responding') return 12 + Math.abs(Math.sin(index * 0.42)) * 42;
  if (state === 'blocked' || state === 'error') return index % 6 === 0 ? 62 : 12;
  return 8 + Math.abs(Math.sin(index * 0.55)) * 18;
}

export function ReactiveWaveform({ state }: { state: ActivationState | string }) {
  return (
    <div className={`waveform waveform-${state}`} aria-label={`Waveform ${state}`}>
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <span key={index} style={{ '--bar-height': `${heightFor(index, state)}px`, '--bar-delay': `${index * 24}ms` } as React.CSSProperties} />
      ))}
    </div>
  );
}
