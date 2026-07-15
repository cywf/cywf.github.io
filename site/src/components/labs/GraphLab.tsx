import { useEffect, useState } from 'react';
import { loadOptionalWasmModule } from '../../lib/wasm';
import { SimpleNetworkGraph } from './SimpleNetworkGraph';
import type { LabGraphData } from './types';

export function GraphLab() { const [data, setData] = useState<LabGraphData | null>(null); const [wasmReady, setWasmReady] = useState(false); useEffect(() => { fetch('/data/labs/g8s-sample-graph.json').then((r) => r.json()).then((json: LabGraphData) => setData(json)); void loadOptionalWasmModule(async () => { throw new Error('Future graph-layout Wasm module not bundled yet.'); }).then((mod) => setWasmReady(Boolean(mod))); }, []); return <div className="space-y-3"><p className="text-sm text-slate-300">Layout uses a JavaScript fallback today. Optional WebAssembly layout can be added later without changing the static route contract.</p><span className="badge badge-outline badge-info">Wasm status: {wasmReady ? 'loaded' : 'JS fallback active'}</span>{data && <SimpleNetworkGraph data={data} />}</div>; }
