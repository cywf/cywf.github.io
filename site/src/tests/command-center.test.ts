import assert from 'node:assert/strict';
import { freshnessLabel, getFeaturedItems, getStatusCounts, unwrapSnapshot, type ProjectItem } from '../lib/command-center';
import { buildProjectsQuery } from '../lib/projects-query';

const items: ProjectItem[] = [
  { title: 'C task', status: 'todo', rawStatus: 'Todo', labels: [], assignees: [], url: '#', repository: 'z/repo', boardName: 'Board', boardUrl: '#', scope: 'user', itemType: 'issue' },
  { title: 'A task', status: 'blocked', rawStatus: 'Blocked', labels: [], assignees: [], url: '#', repository: 'a/repo', boardName: 'Board', boardUrl: '#', scope: 'user', itemType: 'issue' },
  { title: 'B task', status: 'doing', rawStatus: 'In progress', labels: [], assignees: [], url: '#', repository: 'a/repo', boardName: 'Board', boardUrl: '#', scope: 'user', itemType: 'pull_request' },
];

assert.deepEqual(getStatusCounts(items), { blocked: 1, doing: 1, todo: 1, done: 0 });
assert.deepEqual(getFeaturedItems(items, 2).map((item) => item.title), ['A task', 'B task']);
assert.deepEqual(unwrapSnapshot({ fetchedAt: '2026-07-06T00:00:00Z', data: { ok: true } }), { fetchedAt: '2026-07-06T00:00:00Z', data: { ok: true } });
assert.equal(freshnessLabel('2026-07-06T00:00:00Z', new Date('2026-07-06T03:00:00Z')).isStale, false);
assert.equal(freshnessLabel('2026-07-05T00:00:00Z', new Date('2026-07-06T03:00:00Z')).isStale, true);

const repositoryProjectsQuery = buildProjectsQuery('repository');
const userProjectsQuery = buildProjectsQuery('user');
const normalizedRepositoryProjectsQuery = repositoryProjectsQuery.replace(/\s+/g, ' ').trim();
const normalizedUserProjectsQuery = userProjectsQuery.replace(/\s+/g, ' ').trim();

assert.ok(normalizedRepositoryProjectsQuery.includes('query($owner: String!, $name: String!)'));
assert.ok(normalizedRepositoryProjectsQuery.includes('repository(owner: $owner, name: $name)'));
assert.ok(normalizedUserProjectsQuery.includes('query($login: String!)'));
assert.ok(normalizedUserProjectsQuery.includes('user(login: $login)'));
assert.ok(normalizedRepositoryProjectsQuery.includes('projectsV2(first: 10, orderBy: { field: UPDATED_AT, direction: DESC })'));
assert.ok(normalizedUserProjectsQuery.includes('projectsV2(first: 10, orderBy: { field: UPDATED_AT, direction: DESC })'));
assert.ok(normalizedRepositoryProjectsQuery.includes('repository { nameWithOwner }'));
assert.ok(normalizedRepositoryProjectsQuery.includes('labels(first: 10) { nodes { name } }'));
assert.ok(normalizedRepositoryProjectsQuery.includes('assignees(first: 10) { nodes { login } }'));
assert.ok(normalizedRepositoryProjectsQuery.includes('fieldValues(first: 20) { nodes { ... on ProjectV2ItemFieldSingleSelectValue'));
assert.ok(normalizedUserProjectsQuery.includes('repository { nameWithOwner }'));
assert.ok(normalizedUserProjectsQuery.includes('labels(first: 10) { nodes { name } }'));
assert.ok(normalizedUserProjectsQuery.includes('assignees(first: 10) { nodes { login } }'));
assert.ok(normalizedUserProjectsQuery.includes('fieldValues(first: 20) { nodes { ... on ProjectV2ItemFieldSingleSelectValue'));
assert.equal((repositoryProjectsQuery.match(/ProjectV2ItemFieldSingleSelectValue/g) || []).length, 1);
assert.equal((userProjectsQuery.match(/ProjectV2ItemFieldSingleSelectValue/g) || []).length, 1);

console.log('command-center utilities ok');
