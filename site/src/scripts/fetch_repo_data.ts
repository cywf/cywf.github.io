import { fetchJson, fetchPublicRepositories, getRestHeaders, writeSnapshot } from './github';

interface CommitActivityPoint {
  week: string;
  commits: number;
}

interface RepositoryStatistics {
  name: string;
  fullName: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  commitActivity: CommitActivityPoint[];
}

interface RepoData {
  repoCount: number;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  commitActivity: CommitActivityPoint[];
  repositories: RepositoryStatistics[];
}

interface GitHubCommitActivityWeek {
  total: number;
  week: number;
}

async function fetchLanguages(fullName: string): Promise<Record<string, number>> {
  try {
    return await fetchJson<Record<string, number>>(`https://api.github.com/repos/${fullName}/languages`, {
      headers: getRestHeaders(),
    });
  } catch (error) {
    console.warn(`Warning: Failed to fetch languages for ${fullName}`, error);
    return {};
  }
}

async function fetchCommitActivity(fullName: string): Promise<CommitActivityPoint[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}/stats/commit_activity`, {
      headers: getRestHeaders(),
    });

    if (response.status === 202) {
      console.warn(`Warning: Commit activity still generating for ${fullName}`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const activityData = (await response.json()) as GitHubCommitActivityWeek[];

    if (!Array.isArray(activityData)) {
      return [];
    }

    return activityData.map((week) => ({
      week: new Date(week.week * 1000).toISOString(),
      commits: week.total,
    }));
  } catch (error) {
    console.warn(`Warning: Failed to fetch commit activity for ${fullName}`, error);
    return [];
  }
}

function formatWeekLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function fetchRepoData(): Promise<RepoData> {
  try {
    const repositories = await fetchPublicRepositories();

    const repositoryStatistics = await Promise.all(
      repositories.map(async (repository) => {
        const [languages, commitActivity] = await Promise.all([
          fetchLanguages(repository.fullName),
          fetchCommitActivity(repository.fullName),
        ]);

        return {
          name: repository.name,
          fullName: repository.fullName,
          htmlUrl: repository.htmlUrl,
          stars: repository.stars,
          forks: repository.forks,
          watchers: repository.watchers,
          languages,
          commitActivity,
        };
      })
    );

    const languageTotals: Record<string, number> = {};
    const commitTotals = new Map<string, number>();

    repositoryStatistics.forEach((repository) => {
      Object.entries(repository.languages).forEach(([language, bytes]) => {
        languageTotals[language] = (languageTotals[language] || 0) + bytes;
      });

      repository.commitActivity.forEach((point) => {
        commitTotals.set(point.week, (commitTotals.get(point.week) || 0) + point.commits);
      });
    });

    const commitActivity = Array.from(commitTotals.entries())
      .sort(([leftWeek], [rightWeek]) => leftWeek.localeCompare(rightWeek))
      .slice(-12)
      .map(([week, commits]) => ({
        week: formatWeekLabel(week),
        commits,
      }));

    return {
      repoCount: repositoryStatistics.length,
      stars: repositoryStatistics.reduce((sum, repository) => sum + repository.stars, 0),
      forks: repositoryStatistics.reduce((sum, repository) => sum + repository.forks, 0),
      watchers: repositoryStatistics.reduce((sum, repository) => sum + repository.watchers, 0),
      languages: languageTotals,
      commitActivity,
      repositories: repositoryStatistics,
    };
  } catch (error) {
    console.error('Error fetching repo data:', error);
    return {
      repoCount: 0,
      stars: 0,
      forks: 0,
      watchers: 0,
      languages: {},
      commitActivity: [],
      repositories: [],
    };
  }
}

async function main() {
  console.log('Fetching repository data...');
  const data = await fetchRepoData();
  const snapshot = writeSnapshot('stats.json', data);

  console.log('✓ Repository data saved to public/data/stats.json');
  console.log(`  Snapshot time: ${snapshot.fetchedAt}`);
  console.log(`  Repositories: ${data.repoCount}`);
  console.log(`  Stars: ${data.stars}, Forks: ${data.forks}, Watchers: ${data.watchers}`);
  console.log(`  Languages: ${Object.keys(data.languages).length}`);
  console.log(`  Commit activity: ${data.commitActivity.length} weeks`);
}

main().catch(console.error);
