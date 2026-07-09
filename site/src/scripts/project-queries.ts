const PROJECTS_QUERY_SELECTION = `
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

export function createProjectsQuery(variableDefinitions: string, targetField: string): string {
  return `
  query(${variableDefinitions}) {
    ${targetField} {
${PROJECTS_QUERY_SELECTION}
    }
  }
`;
}
