import { GITHUB_TOKEN, REPO_OWNER, fetchGraphQL, fetchJson, fetchPublicRepositories, getRestHeaders, writeSnapshot } from './github';
import { createProjectsQuery } from './project-queries';

interface ProjectItem {
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

interface ProjectBoard {
  title: string;
  url: string;
  scope: 'repository' | 'user';
  source: string;
  itemCount: number;
}

interface ProjectsData {
  repoCount: number;
  boardCount: number;
  itemCount: number;
  boards: ProjectBoard[];
  items: ProjectItem[];
}

interface ProjectFieldValueNode {
  name?: string;
  field?: {
    name?: string;
  };
}

interface ProjectBoardNode {
  title: string;
  url: string;
  items: {
    nodes: Array<{
      content:
        | {
            __typename: 'Issue' | 'PullRequest';
            title: string;
            url: string;
            repository: { nameWithOwner: string };
            labels: { nodes: Array<{ name: string }> };
            assignees: { nodes: Array<{ login: string }> };
          }
        | {
            __typename: 'DraftIssue';
            title: string;
          }
        | null;
      fieldValues: {
        nodes: ProjectFieldValueNode[];
      };
    }>;
  };
}

interface RepositoryProjectsQueryResult {
  repository: {
    projectsV2: {
      nodes: ProjectBoardNode[];
    };
  } | null;
}

interface UserProjectsQueryResult {
  user: {
    projectsV2: {
      nodes: ProjectBoardNode[];
    };
  } | null;
}

interface GitHubIssue {
  title: string;
  state: string;
  html_url: string;
  pull_request?: Record<string, unknown>;
  labels: Array<{ name: string }>;
  assignees: Array<{ login: string }>;
}

const REPOSITORY_PROJECTS_QUERY = createProjectsQuery(
  '$owner: String!, $name: String!',
  'repository(owner: $owner, name: $name)'
);

const USER_PROJECTS_QUERY = createProjectsQuery('$login: String!', 'user(login: $login)');

function normalizeStatus(status: string): string {
  const normalized = status.trim().toLowerCase();

  if (normalized.includes('done') || normalized.includes('closed') || normalized.includes('complete') || normalized.includes('merged')) {
    return 'done';
  }

  if (normalized.includes('blocked') || normalized.includes('hold') || normalized.includes('stuck')) {
    return 'blocked';
  }

  if (
    normalized.includes('progress') ||
    normalized.includes('doing') ||
    normalized.includes('review') ||
    normalized.includes('active') ||
    normalized.includes('current')
  ) {
    return 'doing';
  }

  return 'todo';
}

function getProjectStatus(fieldValues: ProjectFieldValueNode[]): { status: string; rawStatus: string } {
  const statusField = fieldValues.find((fieldValue) => fieldValue.field?.name?.toLowerCase() === 'status');
  const rawStatus = statusField?.name || 'Todo';

  return {
    rawStatus,
    status: normalizeStatus(rawStatus),
  };
}

function findFallbackStatus(labels: string[], state: string): string {
  return labels.find((label) => /done|closed|progress|doing|review|blocked|hold/i.test(label)) || (state === 'closed' ? 'Done' : 'Todo');
}

function mapProjectItems(
  boards: ProjectBoardNode[],
  scope: 'repository' | 'user',
  source: string
): { boards: ProjectBoard[]; items: ProjectItem[] } {
  const boardSummaries: ProjectBoard[] = [];
  const items: ProjectItem[] = [];

  boards.forEach((board) => {
    let itemCount = 0;

    board.items.nodes.forEach((item) => {
      const content = item.content;

      if (!content?.title) {
        return;
      }

      const { status, rawStatus } = getProjectStatus(item.fieldValues.nodes || []);
      const isDraft = content.__typename === 'DraftIssue';

      items.push({
        title: content.title,
        status,
        rawStatus,
        labels: isDraft ? [] : content.labels.nodes.map((label) => label.name),
        assignees: isDraft ? [] : content.assignees.nodes.map((assignee) => assignee.login),
        url: isDraft ? board.url : content.url,
        repository: isDraft ? source : content.repository.nameWithOwner,
        boardName: board.title,
        boardUrl: board.url,
        scope,
        itemType: isDraft ? 'draft' : content.__typename === 'PullRequest' ? 'pull_request' : 'issue',
      });
      itemCount += 1;
    });

    boardSummaries.push({
      title: board.title,
      url: board.url,
      scope,
      source,
      itemCount,
    });
  });

  return {
    boards: boardSummaries.filter((board) => board.itemCount > 0),
    items,
  };
}

async function fetchRepositoryProjects(repositoryName: string): Promise<{ boards: ProjectBoard[]; items: ProjectItem[] }> {
  try {
    const result = await fetchGraphQL<RepositoryProjectsQueryResult>(REPOSITORY_PROJECTS_QUERY, {
      owner: REPO_OWNER,
      name: repositoryName,
    });

    return mapProjectItems(result.repository?.projectsV2.nodes || [], 'repository', `${REPO_OWNER}/${repositoryName}`);
  } catch (error) {
    console.warn(`Warning: Failed to fetch Projects v2 for ${REPO_OWNER}/${repositoryName}`, error);
    return { boards: [], items: [] };
  }
}

async function fetchUserProjects(): Promise<{ boards: ProjectBoard[]; items: ProjectItem[] }> {
  try {
    const result = await fetchGraphQL<UserProjectsQueryResult>(USER_PROJECTS_QUERY, {
      login: REPO_OWNER,
    });

    return mapProjectItems(result.user?.projectsV2.nodes || [], 'user', REPO_OWNER);
  } catch (error) {
    console.warn(`Warning: Failed to fetch user-level Projects v2 for ${REPO_OWNER}`, error);
    return { boards: [], items: [] };
  }
}

async function fetchIssuesAsFallback(): Promise<ProjectsData> {
  try {
    const repositories = await fetchPublicRepositories();
    const fallbackItems = await Promise.all(
      repositories.map(async (repository) => {
        try {
          const issues = await fetchJson<GitHubIssue[]>(
            `https://api.github.com/repos/${repository.fullName}/issues?state=all&per_page=100`,
            { headers: getRestHeaders() }
          );

          return issues.map((issue) => {
            const labels = issue.labels.map((label) => label.name);
            const rawStatus = findFallbackStatus(labels, issue.state);

            return {
              title: issue.title,
              status: normalizeStatus(rawStatus),
              rawStatus,
              labels,
              assignees: issue.assignees.map((assignee) => assignee.login),
              url: issue.html_url,
              repository: repository.fullName,
              boardName: `${repository.name} issues`,
              boardUrl: repository.htmlUrl,
              scope: 'repository' as const,
              itemType: issue.pull_request ? 'pull_request' as const : 'issue' as const,
            };
          });
        } catch (error) {
          console.warn(`Warning: Failed to fetch fallback issues for ${repository.fullName}`, error);
          return [];
        }
      })
    );

    const items = fallbackItems.flat();
    const boards = repositories
      .map((repository) => ({
        title: `${repository.name} issues`,
        url: repository.htmlUrl,
        scope: 'repository' as const,
        source: repository.fullName,
        itemCount: items.filter((item) => item.repository === repository.fullName).length,
      }))
      .filter((board) => board.itemCount > 0);

    return {
      repoCount: repositories.length,
      boardCount: boards.length,
      itemCount: items.length,
      boards,
      items,
    };
  } catch (error) {
    console.error('Error fetching issues as fallback:', error);
    return {
      repoCount: 0,
      boardCount: 0,
      itemCount: 0,
      boards: [],
      items: [],
    };
  }
}

async function fetchProjects(): Promise<ProjectsData> {
  if (!GITHUB_TOKEN) {
    console.warn('No GITHUB_TOKEN found, using issues as fallback');
    return fetchIssuesAsFallback();
  }

  try {
    const repositories = await fetchPublicRepositories();
    const [userProjects, repositoryProjects] = await Promise.all([
      fetchUserProjects(),
      Promise.all(repositories.map((repository) => fetchRepositoryProjects(repository.name))),
    ]);

    const boards = [
      ...userProjects.boards,
      ...repositoryProjects.flatMap((projectSet) => projectSet.boards),
    ];
    const items = [
      ...userProjects.items,
      ...repositoryProjects.flatMap((projectSet) => projectSet.items),
    ];

    return {
      repoCount: repositories.length,
      boardCount: boards.length,
      itemCount: items.length,
      boards,
      items,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return fetchIssuesAsFallback();
  }
}

async function main() {
  console.log('Fetching project data...');
  const data = await fetchProjects();
  const snapshot = writeSnapshot('projects.json', data);

  console.log('✓ Project data saved to public/data/projects.json');
  console.log(`  Snapshot time: ${snapshot.fetchedAt}`);
  console.log(`  Repositories scanned: ${data.repoCount}`);
  console.log(`  Boards: ${data.boardCount}`);
  console.log(`  Total items: ${data.itemCount}`);
}

main().catch(console.error);
