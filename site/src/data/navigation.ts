export interface NavItem { href: string; label: string; section: 'portfolio' | 'developer-hq' | 'utility'; description?: string }
export const primaryNavigation: NavItem[] = [
  { href: '/', label: 'Home', section: 'portfolio' },
  { href: '/about', label: 'About', section: 'portfolio' },
  { href: '/expertise', label: 'Expertise', section: 'portfolio' },
  { href: '/projects', label: 'Projects', section: 'portfolio' },
  { href: '/experience', label: 'Experience', section: 'portfolio' },
  { href: '/research', label: 'Research', section: 'portfolio' },
  { href: '/contact', label: 'Contact', section: 'portfolio' },
  { href: '/developer-hq', label: 'Developer HQ', section: 'developer-hq' },
];
export const developerHqNavigation: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', section: 'developer-hq', description: 'Native and legacy operational dashboard views.' },
  { href: '/statistics', label: 'Statistics', section: 'developer-hq', description: 'Repository health and language snapshots.' },
  { href: '/development-board', label: 'Development Board', section: 'developer-hq', description: 'Public project/task snapshot board.' },
  { href: '/discussions', label: 'Discussions', section: 'developer-hq', description: 'Recent public GitHub discussion snapshot.' },
  { href: '/docs', label: 'Docs', section: 'developer-hq', description: 'README and wiki coverage evidence.' },
  { href: '/visualizer', label: 'Visualizer', section: 'developer-hq', description: 'Static architecture and repository diagrams.' },
  { href: '/labs', label: 'Labs', section: 'developer-hq', description: 'Progressive enhancement research prototypes.' },
  { href: '/create-issue', label: 'Create Issue', section: 'developer-hq', description: 'Public contribution intake path.' },
  { href: '/dev-hq', label: 'Spec Map', section: 'developer-hq', description: 'Traceability page for KP-DEV-HQ v2.0.' },
];
export const allRoutes = [...primaryNavigation, ...developerHqNavigation, { href: '/404', label: '404', section: 'utility' as const }];
