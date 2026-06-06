import type React from 'react';
export function SimplePage({ title, children }: { title: string; children?: React.ReactNode }) { return <div className="page glass-page"><h1>{title}</h1>{children ?? <p>Lunex foundation page ready for the next implementation pass.</p>}</div>; }
