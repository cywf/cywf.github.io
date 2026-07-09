const PROJECTS_V2_SELECTION = `
  projectsV2(first: 10, orderBy: { field: UPDATED_AT, direction: DESC }) {
    nodes {
      title
      url
      items(first: 100) {
        nodes {
          content {
            __typename
            ... on Issue {
              title
              url
              repository {
                nameWithOwner
              }
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
            ... on PullRequest {
              title
              url
              repository {
                nameWithOwner
              }
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
            ... on DraftIssue {
              title
            }
          }
          fieldValues(first: 20) {
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
`;

export function buildProjectsQuery(scope: 'repository' | 'user'): string {
  if (scope === 'repository') {
    return `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          ${PROJECTS_V2_SELECTION}
        }
      }
    `;
  }

  return `
    query($login: String!) {
      user(login: $login) {
        ${PROJECTS_V2_SELECTION}
      }
    }
  `;
}
