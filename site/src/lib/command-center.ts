export interface ProjectItem {
  title: string;
  status: string;
  rawStatus: string;
  labels: string[];
  assignees: string[];
  url: string;
  repository: string;
  boardName: string;
  boardUrl: string;
  scope: 'repository' | 'user';
  itemType: 'issue' | 'pull_request' | 'draft';
}

export interface ProjectBoard {
  title: string;
  url: string;
  scope: 'repository' | 'user';
  source: string;
  itemCount: number;
}

export interface ProjectsData {
  repoCount: number;
  boardCount: number;
  itemCount: number;
  boards: ProjectBoard[];
  items: ProjectItem[];
}

export interface StatsData {
  repoCount: number;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  commitActivity: Array<{ date: string; count: number }>;
  dataWarnings?: string[]; openIssuesOnly?: number; openPRs?: number; docsWikiCoverage?: number; stableOrReadyCount?: number; readinessDistribution?: Record<string, number>; repositories: Array<{ name: string; fullName?: string; htmlUrl?: string; description?: string; language?: string; stars?: number; forks?: number; openIssues?: number; openIssuesOnly?: number; openPRs?: number; pushedAt?: string; updatedAt?: string; productionReadinessBand?: string; productionReadinessScore?: number }>;
}

export interface DiscussionsData {
  repoCount: number;
  discussions: Array<{ title: string; url: string; repository: string; createdAt?: string; updatedAt?: string; author?: string; category?: string }>;
}

export interface SnapshotEnvelope<T> {
  fetchedAt?: string;
  data: T;
}

export function unwrapSnapshot<T>(snapshot: SnapshotEnvelope<T> | T): { data: T; fetchedAt?: string } {
  if (snapshot && typeof snapshot === 'object' && 'data' in snapshot) {
    const envelope = snapshot as SnapshotEnvelope<T>;
    return { data: envelope.data, fetchedAt: envelope.fetchedAt };
  }
  return { data: snapshot as T };
}

const importantStatusOrder = ['blocked', 'doing', 'todo', 'done'];

export function getStatusCounts(items: ProjectItem[]) {
  return importantStatusOrder.reduce<Record<string, number>>((counts, status) => {
    counts[status] = items.filter((item) => item.status === status).length;
    return counts;
  }, {});
}

export function getFeaturedItems(items: ProjectItem[], limit = 8): ProjectItem[] {
  const statusRank: Record<string, number> = { blocked: 0, doing: 1, todo: 2, done: 3 };
  return [...items]
    .sort((a, b) => (statusRank[a.status] ?? 4) - (statusRank[b.status] ?? 4) || a.repository.localeCompare(b.repository) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function getActiveRepositories(stats: StatsData, projects: ProjectsData, limit = 6) {
  const itemCounts = projects.items.reduce<Record<string, number>>((counts, item) => {
    counts[item.repository] = (counts[item.repository] || 0) + 1;
    return counts;
  }, {});

  return [...(stats.repositories || [])]
    .map((repo) => ({
      ...repo,
      taskCount: itemCounts[repo.fullName || repo.name] || itemCounts[repo.name] || 0,
      lastActive: repo.pushedAt || repo.updatedAt || '',
    }))
    .sort((a, b) => b.taskCount - a.taskCount || Date.parse(b.lastActive || '0') - Date.parse(a.lastActive || '0'))
    .slice(0, limit);
}

export function freshnessLabel(fetchedAt?: string, now = new Date()): { label: string; isStale: boolean } {
  if (!fetchedAt) return { label: 'Snapshot time unavailable', isStale: true };
  const then = new Date(fetchedAt);
  if (Number.isNaN(then.getTime())) return { label: 'Snapshot time invalid', isStale: true };
  const hours = Math.max(0, Math.round((now.getTime() - then.getTime()) / 36_000) / 100);
  return { label: `Updated ${hours < 1 ? 'less than 1 hour' : `${Math.round(hours)} hours`} ago`, isStale: hours > 12 };
}

export function formatSnapshotDate(fetchedAt?: string): string {
  if (!fetchedAt) return 'Snapshot pending';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(fetchedAt)) + ' UTC';
}
