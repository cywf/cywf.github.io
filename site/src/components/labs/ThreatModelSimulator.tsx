import { useEffect, useMemo, useState } from 'react';

type Stride = 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege';
type Threat = { id: string; asset: string; threat: string; stride: Stride; likelihood: number; impact: number };
const strideValues: Stride[] = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];
const mitigations: Record<Stride, string> = { Spoofing: 'Use strong identity, MFA, signed callbacks, and explicit trust boundaries.', Tampering: 'Validate input, sign artifacts, enforce integrity checks, and keep audit trails.', Repudiation: 'Add immutable logs, timestamps, request IDs, and actor attribution.', 'Information Disclosure': 'Minimize data, encrypt at rest/in transit, and redact sensitive output.', 'Denial of Service': 'Rate-limit, queue, cache, degrade gracefully, and cap expensive work.', 'Elevation of Privilege': 'Use least privilege, scoped tokens, review RBAC, and isolate risky actions.' };
const seed: Threat[] = [{ id: '1', asset: 'GitHub Pages labs', threat: 'Malformed local input causes confusing output', stride: 'Tampering', likelihood: 2, impact: 2 }];
function band(score: number) { return score >= 13 ? 'High' : score >= 6 ? 'Medium' : 'Low'; }

export function ThreatModelSimulator() {
  const [items, setItems] = useState<Threat[]>(seed);
  const [draft, setDraft] = useState<Threat>({ id: '', asset: '', threat: '', stride: 'Information Disclosure', likelihood: 3, impact: 3 });
  useEffect(() => { const saved = localStorage.getItem('cywf-threat-model'); if (saved) setItems(JSON.parse(saved) as Threat[]); }, []);
  useEffect(() => { localStorage.setItem('cywf-threat-model', JSON.stringify(items)); }, [items]);
  const summary = useMemo(() => items.reduce((acc, item) => { acc[band(item.likelihood * item.impact)] += 1; return acc; }, { Low: 0, Medium: 0, High: 0 }), [items]);
  function addThreat() { if (!draft.asset.trim() || !draft.threat.trim()) return; setItems([...items, { ...draft, id: crypto.randomUUID() }]); setDraft({ ...draft, id: '', asset: '', threat: '' }); }
  return <div className="space-y-5">
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6"><input className="input input-bordered bg-slate-900 lg:col-span-2" placeholder="Asset" value={draft.asset} onChange={(e) => setDraft({ ...draft, asset: e.target.value })}/><input className="input input-bordered bg-slate-900 lg:col-span-2" placeholder="Threat" value={draft.threat} onChange={(e) => setDraft({ ...draft, threat: e.target.value })}/><select className="select select-bordered bg-slate-900" value={draft.stride} onChange={(e) => setDraft({ ...draft, stride: e.target.value as Stride })}>{strideValues.map((s) => <option key={s}>{s}</option>)}</select><button className="btn btn-info" onClick={addThreat}>Add threat</button></div>
    <div className="grid gap-3 md:grid-cols-2"><label className="text-sm text-slate-300">Likelihood {draft.likelihood}<input type="range" min="1" max="5" value={draft.likelihood} onChange={(e) => setDraft({ ...draft, likelihood: Number(e.target.value) })} className="range range-info" /></label><label className="text-sm text-slate-300">Impact {draft.impact}<input type="range" min="1" max="5" value={draft.impact} onChange={(e) => setDraft({ ...draft, impact: Number(e.target.value) })} className="range range-secondary" /></label></div>
    <div className="stats stats-vertical bg-slate-900 shadow md:stats-horizontal"><div className="stat"><div className="stat-title">Low</div><div className="stat-value text-success">{summary.Low}</div></div><div className="stat"><div className="stat-title">Medium</div><div className="stat-value text-warning">{summary.Medium}</div></div><div className="stat"><div className="stat-title">High</div><div className="stat-value text-error">{summary.High}</div></div></div>
    <div className="overflow-x-auto"><table className="table table-zebra"><thead><tr><th>Asset</th><th>Threat</th><th>STRIDE</th><th>Score</th><th>Band</th><th>Mitigation</th><th></th></tr></thead><tbody>{items.map((item) => { const score = item.likelihood * item.impact; return <tr key={item.id}><td>{item.asset}</td><td>{item.threat}</td><td>{item.stride}</td><td>{score}</td><td>{band(score)}</td><td className="max-w-sm text-xs">{mitigations[item.stride]}</td><td><button className="btn btn-xs btn-ghost" onClick={() => setItems(items.filter((i) => i.id !== item.id))}>Remove</button></td></tr>; })}</tbody></table></div>
  </div>;
}
