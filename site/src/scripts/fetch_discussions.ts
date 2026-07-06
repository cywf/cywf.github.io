import { GITHUB_TOKEN, REPO_OWNER, fetchGraphQL, fetchPublicRepositories, writeSnapshot } from './github';

interface Discussion {
  number: number;
  title: string;
  url: string;
  author: string;
  createdAt: string;
  comments: number;
  category: string;
  repository: string;
}

interface DiscussionsData {
  repoCount: number;
  discussions: Discussion[];
}

interface DiscussionsQueryResult {
  repository: {
    discussions: {
      nodes: Array<{
        number: number;
        title: string;
        url: string;
        createdAt: string;
        author: { login: string } | null;
        comments: { totalCount: number } | null;
        category: { name: string } | null;
      }>;
    };
  } | null;
}

const DISCUSSIONS_QUERY = `
  query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussions(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          number
          title
          url
          author {
            login
          }
          createdAt
          comments {
            totalCount
          }
          category {
            name
          }
        }
      }
    }
  }
`;

async function fetchDiscussions(): Promise<DiscussionsData> {
  const repositories = await fetchPublicRepositories();

  if (!GITHUB_TOKEN) {
    console.warn('No GITHUB_TOKEN found, skipping discussions fetch');
    return {
      repoCount: repositories.length,
      discussions: [],
    };
  }

  const discussions = await Promise.all(
    repositories.map(async (repository) => {
      try {
        const result = await fetchGraphQL<DiscussionsQueryResult>(DISCUSSIONS_QUERY, {
          owner: REPO_OWNER,
          name: repository.name,
        });

        return (result.repository?.discussions.nodes || []).map((discussion) => ({
          number: discussion.number,
          title: discussion.title,
          url: discussion.url,
          author: discussion.author?.login || 'Unknown',
          createdAt: discussion.createdAt,
          comments: discussion.comments?.totalCount || 0,
          category: discussion.category?.name || 'General',
          repository: repository.fullName,
        }));
      } catch (error) {
        console.warn(`Warning: Failed to fetch discussions for ${repository.fullName}`, error);
        return [];
      }
    })
  );

  return {
    repoCount: repositories.length,
    discussions: discussions
      .flat()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 25),
  };
}

async function main() {
  console.log('Fetching discussions...');
  const data = await fetchDiscussions();
  const snapshot = writeSnapshot('discussions.json', data);

  console.log('✓ Discussions saved to public/data/discussions.json');
  console.log(`  Snapshot time: ${snapshot.fetchedAt}`);
  console.log(`  Repositories scanned: ${data.repoCount}`);
  console.log(`  Total discussions: ${data.discussions.length}`);
}

main().catch(console.error);
