export const expertiseDomains = [
  { title: 'Cybersecurity operations', summary: 'Public-safe incident, tooling, threat-modeling, and readiness workflows with clear data boundaries.' },
  { title: 'Developer operations', summary: 'GitHub Pages, Actions, snapshots, repository governance, and CI/CD practices aligned to spec-bootstrap conventions.' },
  { title: 'Automation and data shaping', summary: 'Static JSON contracts, graceful API fallback behavior, and reviewable TypeScript utility layers.' },
  { title: 'Documentation systems', summary: 'README, wiki, diagrams, ADRs, and route-level explanations that make project state understandable.' },
];
export type EvidenceLevel = 'verified-public' | 'documented-design' | 'active-development' | 'concept-research';
export const flagshipProjects = [
  { slug: 'kp-dev-hq-portfolio', title: 'KP-DEV-HQ Portfolio Foundation', evidence: 'active-development' as EvidenceLevel, href: '/projects#kp-dev-hq-portfolio', summary: 'Portfolio-first Astro site with Developer HQ as public operational evidence subsystem.' },
  { slug: 'public-snapshot-pipeline', title: 'Public Snapshot Pipeline', evidence: 'verified-public' as EvidenceLevel, href: '/developer-hq', summary: 'Committed JSON envelopes for repositories, projects, discussions, docs, and labs data.' },
  { slug: 'spec-bootstrap-alignment', title: 'Spec-Bootstrap Delivery Alignment', evidence: 'documented-design' as EvidenceLevel, href: 'https://github.com/PR-CYBR/spec-bootstrap', summary: 'Repository management model used as a delivery reference for PR-CYBR public projects.' },
];
export const caseStudyDrafts = flagshipProjects.map((project) => ({ ...project, statusNote: 'Draft case study placeholder pending verified public evidence and owner-approved outcomes.' }));
