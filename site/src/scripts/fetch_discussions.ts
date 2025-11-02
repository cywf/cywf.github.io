import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'cywf.github.io';

interface Discussion {
  number: number;
  title: string;
  url: string;
  author: string;
  createdAt: string;
  comments: number;
  category: string;
}

async function fetchDiscussions(): Promise<Discussion[]> {
  if (!GITHUB_TOKEN) {
    console.warn('No GITHUB_TOKEN found, skipping discussions fetch');
    return [];
  }

  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 25, orderBy: {field: CREATED_AT, direction: DESC}) {
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

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          owner: REPO_OWNER,
          name: REPO_NAME,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch discussions: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return [];
    }

    const discussions = result.data?.repository?.discussions?.nodes || [];
    
    return discussions.map((d: any) => ({
      number: d.number,
      title: d.title,
      url: d.url,
      author: d.author?.login || 'Unknown',
      createdAt: d.createdAt,
      comments: d.comments?.totalCount || 0,
      category: d.category?.name || 'General',
    }));
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return [];
  }
}

async function main() {
  console.log('Fetching discussions...');
  const discussions = await fetchDiscussions();
  
  const outputPath = join(process.cwd(), 'public', 'data', 'discussions.json');
  writeFileSync(outputPath, JSON.stringify(discussions, null, 2));
  
  console.log('✓ Discussions saved to', outputPath);
  console.log(`  Total discussions: ${discussions.length}`);
}

main().catch(console.error);
