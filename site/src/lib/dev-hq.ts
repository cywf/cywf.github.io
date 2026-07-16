export interface DevHqCapability {
  title: string;
  summary: string;
  evidence: string;
  status: 'live' | 'ready' | 'planned';
}

export interface DevHqRoadmapItem {
  phase: string;
  title: string;
  outcome: string;
}

export interface DevHqSpec {
  version: string;
  updatedAt: string;
  productName: string;
  tagline: string;
  principles: string[];
  architectureLayers: string[];
  capabilities: DevHqCapability[];
  roadmap: DevHqRoadmapItem[];
}

const statusRank: Record<DevHqCapability['status'], number> = { live: 0, ready: 1, planned: 2 };

export function getCapabilityCounts(capabilities: DevHqCapability[]) {
  return capabilities.reduce<Record<DevHqCapability['status'], number>>(
    (counts, capability) => {
      counts[capability.status] += 1;
      return counts;
    },
    { live: 0, ready: 0, planned: 0 }
  );
}

export function getPrioritizedCapabilities(capabilities: DevHqCapability[]) {
  return [...capabilities].sort((a, b) => statusRank[a.status] - statusRank[b.status] || a.title.localeCompare(b.title));
}
