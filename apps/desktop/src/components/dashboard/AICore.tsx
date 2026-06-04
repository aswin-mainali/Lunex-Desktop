export function AICore({ state }: { state: string }) {
  return <section className="core-stage"><div className="core-orb"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orb-grid"/><div className="orb-center"/></div><div className="waveform">{Array.from({length: 58}).map((_,i)=><span key={i} style={{height: `${12 + Math.abs(Math.sin(i * 1.7)) * 45}px`}} />)}</div><div className="status-line">• • {state.toUpperCase()} • •</div></section>;
}
