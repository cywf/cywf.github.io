import assert from 'node:assert/strict';
import { createProjectsQuery } from '../scripts/project-queries';

const repositoryQuery = createProjectsQuery(
  '$owner: String!, $name: String!',
  'repository(owner: $owner, name: $name)'
);
const userQuery = createProjectsQuery('$login: String!', 'user(login: $login)');

assert.match(repositoryQuery, /query\(\$owner: String!, \$name: String!\)/);
assert.match(repositoryQuery, /repository\(owner: \$owner, name: \$name\)/);
assert.match(userQuery, /query\(\$login: String!\)/);
assert.match(userQuery, /user\(login: \$login\)/);

for (const query of [repositoryQuery, userQuery]) {
  assert.match(query, /projectsV2\(first: 10, orderBy: \{ field: UPDATED_AT, direction: DESC \}\)/);
  assert.match(query, /\.\.\. on Issue/);
  assert.match(query, /\.\.\. on PullRequest/);
  assert.match(query, /\.\.\. on DraftIssue/);
  assert.match(query, /fieldValues\(first: 20\)/);
}

console.log('fetch projects query builder ok');
