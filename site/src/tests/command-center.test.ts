import assert from 'node:assert/strict';
import { freshnessLabel, getFeaturedItems, getStatusCounts, unwrapSnapshot, type ProjectItem } from '../lib/command-center';

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
console.log('command-center utilities ok');
