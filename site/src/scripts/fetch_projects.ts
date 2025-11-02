import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'cywf.github.io';

interface ProjectItem {
  title: string;
  status: string;
  labels: string[];
  assignees: string[];
  url: string;
}

async function fetchProjects(): Promise<ProjectItem[]> {
  if (!GITHUB_TOKEN) {
    console.warn('No GITHUB_TOKEN found, using issues as fallback');
    return fetchIssuesAsFallback();
  }

  try {
    // Try to fetch from GitHub Projects v2 using GraphQL
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          projectsV2(first: 1) {
            nodes {
              items(first: 100) {
                nodes {
                  content {
                    ... on Issue {
                      title
                      url
                      labels(first: 10) {
                        nodes {
                          name
                        }
                      }
                      assignees(first: 10) {
                        nodes {
                          login
                        }
                      }
                    }
                  }
                  fieldValues(first: 10) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                        field {
                          ... on ProjectV2SingleSelectField {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

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

    const result = await response.json();
    
    if (result.errors || !result.data?.repository?.projectsV2?.nodes?.[0]) {
      console.log('No Projects v2 found, falling back to issues...');
      return fetchIssuesAsFallback();
    }

    const items = result.data.repository.projectsV2.nodes[0].items.nodes;
    
    return items.map((item: any) => {
      const content = item.content;
      let status = 'todo';
      
      // Try to find status from field values
      const statusField = item.fieldValues?.nodes?.find((fv: any) => 
        fv.field?.name?.toLowerCase() === 'status'
      );
      if (statusField?.name) {
        status = statusField.name.toLowerCase().replace(/\s+/g, '-');
      }

      return {
        title: content?.title || 'Untitled',
        status,
        labels: content?.labels?.nodes?.map((l: any) => l.name) || [],
        assignees: content?.assignees?.nodes?.map((a: any) => a.login) || [],
        url: content?.url || '',
      };
    }).filter((item: ProjectItem) => item.title !== 'Untitled');
  } catch (error) {
    console.error('Error fetching projects:', error);
    return fetchIssuesAsFallback();
  }
}

async function fetchIssuesAsFallback(): Promise<ProjectItem[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'cywf-portfolio-site',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }

    const issues = await response.json();

    return issues.map((issue: any) => {
      // Determine status from labels
      let status = 'todo';
      const labels = issue.labels.map((l: any) => l.name);
      
      if (labels.some((l: string) => l.toLowerCase().includes('done') || l.toLowerCase().includes('closed'))) {
        status = 'done';
      } else if (labels.some((l: string) => l.toLowerCase().includes('progress') || l.toLowerCase().includes('doing'))) {
        status = 'doing';
      } else if (issue.state === 'closed') {
        status = 'done';
      }

      return {
        title: issue.title,
        status,
        labels,
        assignees: issue.assignees.map((a: any) => a.login),
        url: issue.html_url,
      };
    });
  } catch (error) {
    console.error('Error fetching issues as fallback:', error);
    return [];
  }
}

async function main() {
  console.log('Fetching project data...');
  const projects = await fetchProjects();
  
  const outputPath = join(process.cwd(), 'public', 'data', 'projects.json');
  writeFileSync(outputPath, JSON.stringify(projects, null, 2));
  
  console.log('✓ Project data saved to', outputPath);
  console.log(`  Total items: ${projects.length}`);
}

main().catch(console.error);
