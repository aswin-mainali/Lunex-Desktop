import { Copy, Volume2, X } from 'lucide-react';
import { useMemo } from 'react';
import { speakResponse } from '../../services/ttsService';
import type { CommandResponse } from '../../types/api';

export function AssistantResponseCard({ result, ttsEnabled, onClear, onTtsStatus }: { result: CommandResponse; ttsEnabled: boolean; onClear: () => void; onTtsStatus: (status: string) => void }) {
  const timestamp = useMemo(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [result.command, result.response]);
  const source = result.mocked ? 'Fallback' : result.source === 'openai' ? 'OpenAI' : result.source === 'local' ? 'Local' : result.source ?? 'Local';
  const speakAgain = async () => {
    const warning = await speakResponse(result.response, ttsEnabled, {
      onStart: () => onTtsStatus('speaking'),
      onEnd: () => onTtsStatus('ready'),
      onError: () => onTtsStatus('unavailable'),
    });
    if (warning === 'TTS disabled') onTtsStatus('disabled');
    else if (warning) onTtsStatus('unavailable');
  };
  const copy = async () => navigator.clipboard?.writeText(result.response);
  return <article className="assistant-response-card"><header><div><span className="response-kicker">Lunex reply</span><strong>{result.command}</strong></div><time>{timestamp}</time></header><div className="response-body"><p>{result.response}</p></div><footer><span>Intent: {result.intent}</span><span>Source: {source}</span><span>Safety: {result.safety_level}</span><span>Status: {result.status}</span><div className="response-actions"><button onClick={speakAgain}><Volume2 size={13}/>Speak again</button><button onClick={copy}><Copy size={13}/>Copy</button><button onClick={onClear}><X size={13}/>Clear</button></div></footer></article>;
}
