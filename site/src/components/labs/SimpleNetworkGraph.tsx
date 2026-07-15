import { useMemo, useState } from 'react';
import type { LabGraphData } from './types';

type Props = { data: LabGraphData; height?: number };

const colors: Record<string, string> = {
  system: '#22d3ee', repo: '#a78bfa', platform: '#60a5fa', agent: '#f472b6', education: '#34d399', community: '#facc15', tooling: '#fb7185', default: '#94a3b8',
};

export function SimpleNetworkGraph({ data, height = 420 }: Props) {
  const [selectedId, setSelectedId] = useState(data.nodes[0]?.id ?? '');
  const selected = data.nodes.find((node) => node.id === selectedId) ?? data.nodes[0];
  const layout = useMemo(() => {
    const centerX = 420; const centerY = height / 2; const radius = Math.min(250, height / 2 - 55);
    return data.nodes.map((node, index) => {
      const angle = (index / Math.max(data.nodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      return { ...node, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    });
  }, [data.nodes, height]);
  const byId = new Map(layout.map((node) => [node.id, node]));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/80">
        <svg viewBox={`0 0 840 ${height}`} role="img" aria-label="Interactive relationship graph" className="h-full min-h-[320px] w-full">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          {data.edges.map((edge) => {
            const source = byId.get(edge.source); const target = byId.get(edge.target);
            if (!source || !target) return null;
            return <g key={`${edge.source}-${edge.target}-${edge.label}`}><line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="2"/><text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2} fill="#cbd5e1" fontSize="12" textAnchor="middle">{edge.label}</text></g>;
          })}
          {layout.map((node) => <g key={node.id} tabIndex={0} role="button" aria-label={`Inspect ${node.label}`} onClick={() => setSelectedId(node.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(node.id); }} className="cursor-pointer outline-none">
            <circle cx={node.x} cy={node.y} r={selectedId === node.id ? 34 : 28} fill={colors[node.type] ?? colors.default} fillOpacity="0.22" stroke={colors[node.type] ?? colors.default} strokeWidth={selectedId === node.id ? 4 : 2} filter="url(#glow)" />
            <text x={node.x} y={node.y + 4} fill="#f8fafc" fontSize="12" textAnchor="middle" className="select-none">{node.label}</text>
          </g>)}
        </svg>
      </div>
      <aside className="rounded-2xl border border-purple-400/20 bg-purple-950/20 p-4" aria-live="polite">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-200">Selected node</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{selected?.label}</h3>
        <p className="mt-2 text-sm text-slate-300">{selected?.description}</p>
        <p className="mt-4 text-xs text-cyan-200">Type: {selected?.type}</p>
      </aside>
    </div>
  );
}
