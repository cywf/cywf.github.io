import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'cywf.github.io';

interface RepoData {
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  commitActivity: { week: string; commits: number }[];
}

async function fetchRepoData(): Promise<RepoData> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'cywf-portfolio-site',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    // Fetch repository info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { headers }
    );
    
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repo: ${repoResponse.statusText}`);
    }
    
    const repoData = await repoResponse.json();

    // Fetch languages
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/languages`,
      { headers }
    );
    const languages = languagesResponse.ok ? await languagesResponse.json() : {};

    // Fetch commit activity (last 12 weeks)
    const commitActivityResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/stats/commit_activity`,
      { headers }
    );
    
    let commitActivity: { week: string; commits: number }[] = [];
    if (commitActivityResponse.ok) {
      const activityData = await commitActivityResponse.json();
      if (Array.isArray(activityData)) {
        commitActivity = activityData.slice(-12).map((week: any) => ({
          week: new Date(week.week * 1000).toLocaleDateString(),
          commits: week.total,
        }));
      }
    }

    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      watchers: repoData.watchers_count || 0,
      languages,
      commitActivity,
    };
  } catch (error) {
    console.error('Error fetching repo data:', error);
    // Return default data on error
    return {
      stars: 0,
      forks: 0,
      watchers: 0,
      languages: { JavaScript: 50, TypeScript: 30, CSS: 20 },
      commitActivity: [],
    };
  }
}

async function main() {
  console.log('Fetching repository data...');
  const data = await fetchRepoData();
  
  const outputPath = join(process.cwd(), 'public', 'data', 'stats.json');
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('✓ Repository data saved to', outputPath);
  console.log(`  Stars: ${data.stars}, Forks: ${data.forks}, Watchers: ${data.watchers}`);
  console.log(`  Languages: ${Object.keys(data.languages).length}`);
  console.log(`  Commit activity: ${data.commitActivity.length} weeks`);
}

main().catch(console.error);
