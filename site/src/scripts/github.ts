import { writeFileSync } from 'fs';
import { join } from 'path';

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
export const REPO_OWNER = 'cywf';

const USER_AGENT = 'cywf-portfolio-site';

interface GitHubRepositoryResponse {
  name: string;
  full_name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  archived: boolean;
  fork: boolean;
  private: boolean;
  updated_at: string;
  pushed_at: string;
}

export interface PublicRepository {
  name: string;
  fullName: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  updatedAt: string;
  pushedAt: string;
}

export interface Snapshot<T> {
  fetchedAt: string;
  data: T;
}

export function getRestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': USER_AGENT,
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = 'Bearer ' + GITHUB_TOKEN;
  }

  return headers;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!GITHUB_TOKEN) {
    throw new Error('No GITHUB_TOKEN found');
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + GITHUB_TOKEN,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    const details = result.errors.map((error: { message?: string }) => error.message || 'Unknown error').join('; ');
    throw new Error(`GitHub GraphQL returned errors: ${details}`);
  }

  return result.data as T;
}

export async function fetchPublicRepositories(): Promise<PublicRepository[]> {
  const repositories: PublicRepository[] = [];
  const headers = getRestHeaders();

  for (let page = 1; page <= 10; page += 1) {
    const pageData = await fetchJson<GitHubRepositoryResponse[]>(
      `https://api.github.com/users/${REPO_OWNER}/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      { headers }
    );

    if (pageData.length === 0) {
      break;
    }

    repositories.push(
      ...pageData
        .filter((repository) => !repository.private && !repository.fork && !repository.archived)
        .map((repository) => ({
          name: repository.name,
          fullName: repository.full_name,
          htmlUrl: repository.html_url,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          watchers: repository.watchers_count,
          updatedAt: repository.updated_at,
          pushedAt: repository.pushed_at,
        }))
    );

    if (pageData.length < 100) {
      break;
    }
  }

  return repositories;
}

export function writeSnapshot<T>(filename: string, data: T): Snapshot<T> {
  const snapshot: Snapshot<T> = {
    fetchedAt: new Date().toISOString(),
    data,
  };

  const outputPath = join(process.cwd(), 'public', 'data', filename);
  writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  return snapshot;
}
