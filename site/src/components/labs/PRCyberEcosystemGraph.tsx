import { useEffect, useState } from 'react';
import { SimpleNetworkGraph } from './SimpleNetworkGraph';
import type { LabGraphData } from './types';

export function PRCyberEcosystemGraph() { const [data, setData] = useState<LabGraphData | null>(null); useEffect(() => { fetch('/data/labs/pr-cybr-ecosystem.json').then((r) => r.json()).then((json: LabGraphData) => setData(json)); }, []); return <div className="space-y-4"><p className="text-sm text-slate-300">Static ecosystem model connecting education, AI/ML, community resilience, open-source tooling, agent systems, and labs.</p>{data && <SimpleNetworkGraph data={data} height={360} />}</div>; }
