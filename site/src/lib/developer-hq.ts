import { getActiveRepositories, getFeaturedItems, getStatusCounts, type DiscussionsData, type ProjectsData, type StatsData } from './command-center';

export function buildDeveloperHqSummary(stats: StatsData, projects: ProjectsData, discussions: DiscussionsData) {
  const statusCounts = getStatusCounts(projects.items || []);
  const repos = getActiveRepositories(stats, projects, 6);
  const recentDiscussions = (discussions.discussions || []).slice(0, 5);
  const dataWarnings = [...(stats.dataWarnings || [])];
  return {
    statusCounts,
    repos,
    priorityItems: getFeaturedItems(projects.items || [], 6),
    recentDiscussions,
    docsCoverage: stats.docsWikiCoverage ?? 0,
    readinessDistribution: stats.readinessDistribution || {},
    dataWarnings,
    totals: { repos: stats.repoCount || projects.repoCount || 0, tasks: projects.itemCount || 0, boards: projects.boardCount || 0, discussions: discussions.discussions?.length || 0 },
  };
}
