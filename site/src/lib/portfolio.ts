import statsSnapshot from '../../public/data/stats.json';
import projectsSnapshot from '../../public/data/projects.json';
import discussionsSnapshot from '../../public/data/discussions.json';
import repositoriesSnapshot from '../../public/data/repositories.json';
import workItemsSnapshot from '../../public/data/work-items.json';
import docsIndexSnapshot from '../../public/data/docs-index.json';
import { unwrapSnapshot, formatSnapshotDate, type StatsData, type ProjectsData, type DiscussionsData } from './command-center';
export { formatSnapshotDate };

export const siteUrl = 'https://cywf.github.io';
export const repoUrl = 'https://github.com/cywf/cywf.github.io';
export const cywfOrgUrl = 'https://github.com/cywf';

export const snapshots = {
  stats: unwrapSnapshot<StatsData>(statsSnapshot),
  projects: unwrapSnapshot<ProjectsData>(projectsSnapshot),
  discussions: unwrapSnapshot<DiscussionsData>(discussionsSnapshot),
  repositories: unwrapSnapshot<any>(repositoriesSnapshot),
  workItems: unwrapSnapshot<any>(workItemsSnapshot),
  docsIndex: unwrapSnapshot<any>(docsIndexSnapshot),
};

export const seededRepos = [
  { name: 'cywf.github.io', description: 'Astro portfolio, command-center UX, legacy dashboard bridge, and public snapshot contracts.', language: 'Astro / TypeScript', url: repoUrl, focus: 'Portfolio platform' },
  { name: 'spec-bootstrap', description: 'Reference operating model for PR-CYBR repositories, branching, CI/CD, and public-safe configuration.', language: 'Repository governance', url: 'https://github.com/PR-CYBR/spec-bootstrap', focus: 'Delivery standards' },
  { name: 'public snapshots', description: 'CI-generated stats, discussions, and project data powering the static-first operational views.', language: 'JSON contracts', url: `${repoUrl}/tree/main/site/public/data`, focus: 'Data pipeline' },
];

export function safeList<T>(value: T[] | undefined | null): T[] { return Array.isArray(value) ? value : []; }
export function percent(value: number, total: number) { return total > 0 ? Math.round((value / total) * 100) : 0; }
export function formatNumber(value?: number) { return (value ?? 0).toLocaleString(); }
export function formatAge(date?: string) {
  if (!date) return 'age unavailable';
  const delta = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(delta)) return 'age unavailable';
  const days = Math.max(0, Math.round(delta / 86_400_000));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
export function topLanguages(limit = 6) { return Object.entries(snapshots.stats.data.languages || {}).sort(([,a],[,b]) => b-a).slice(0, limit); }
export function topRepos(limit = 6) {
  const repos: any[] = safeList<any>(snapshots.repositories.data.originals || snapshots.stats.data.repositories);
  return repos.sort((a,b) => (b.stars ?? 0)-(a.stars ?? 0) || Date.parse(b.pushedAt || b.updatedAt || '0') - Date.parse(a.pushedAt || a.updatedAt || '0')).slice(0, limit);
}
export function repoFallbacks(limit = 3) { return topRepos(limit).length ? topRepos(limit) : seededRepos.slice(0, limit); }
export function isSnapshotEmpty() {
  return snapshots.stats.data.repoCount === 0 && snapshots.projects.data.itemCount === 0 && snapshots.discussions.data.discussions.length === 0;
}
