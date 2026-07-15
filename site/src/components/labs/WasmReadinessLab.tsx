import { useMemo, useState } from 'react';
function jsScore(text: string) { let score = 0; for (let i=0;i<text.length;i++) score = (score + text.charCodeAt(i) * (i+1)) % 1000003; return score; }
export function WasmReadinessLab() {
  const [input, setInput] = useState('README docs license workflow release homepage wiki issues prs');
  const result = useMemo(() => { const big = input.repeat(5000); const s1 = performance.now(); const js = jsScore(big); const jsMs = performance.now()-s1; return { js, jsMs: jsMs.toFixed(2), wasmMs: 'unavailable', active: 'JS fallback active' }; }, [input]);
  return <div className="space-y-4"><div className="badge badge-warning">{result.active}</div><p className="text-sm text-slate-300">This isolated module is structured for a future Wasm import but keeps a browser-local JavaScript fallback for GitHub Pages and environments without Wasm.</p><textarea className="textarea textarea-bordered w-full" value={input} onChange={(e)=>setInput(e.target.value)} aria-label="Readiness lab input"/><div className="grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-slate-900 p-3">JS score: {result.js}</div><div className="rounded-xl bg-slate-900 p-3">JS ms: {result.jsMs}</div><div className="rounded-xl bg-slate-900 p-3">Wasm ms: {result.wasmMs}</div></div></div>;
}
