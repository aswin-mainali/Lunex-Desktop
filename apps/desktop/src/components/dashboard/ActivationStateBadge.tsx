import type { ActivationState } from '../../types/api';

const LABELS: Record<string, string> = {
  idle: 'IDLE',
  wake_detected: 'HEY LUNEX DETECTED',
  listening: 'LISTENING',
  transcribing: 'TRANSCRIBING',
  thinking: 'THINKING',
  responding: 'RESPONDING',
  clap_detected: 'DOUBLE CLAP DETECTED',
  confirmation_required: 'CONFIRMATION REQUIRED',
  blocked: 'BLOCKED',
  error: 'ERROR',
  complete: 'COMPLETE',
};

export function ActivationStateBadge({ state }: { state: ActivationState | string }) {
  return <div className={`status-line state-${state}`}>• • {LABELS[state] ?? state.toUpperCase()} • •</div>;
}
