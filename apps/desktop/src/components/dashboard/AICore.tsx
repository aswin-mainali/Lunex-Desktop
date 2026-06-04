import type { ActivationState } from '../../types/api';
import { ActivationStateBadge } from './ActivationStateBadge';
import { ReactiveWaveform } from './ReactiveWaveform';

export function AICore({ state }: { state: ActivationState | string }) {
  return (
    <section className={`core-stage core-state-${state}`}>
      <div className="core-orb" aria-label={`Lunex core ${state}`}>
        <div className="orbit orbit-a" />
        <div className="orbit orbit-b" />
        <div className="scan-ring" />
        <div className="shockwave shockwave-a" />
        <div className="shockwave shockwave-b" />
        <div className="particle-field">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
        <div className="orb-grid" />
        <div className="orb-center" />
      </div>
      <ReactiveWaveform state={state} />
      <ActivationStateBadge state={state} />
    </section>
  );
}
