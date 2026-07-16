import assert from 'node:assert/strict';
import statsSnapshot from '../../public/data/stats.json' with { type: 'json' };
import projectsSnapshot from '../../public/data/projects.json' with { type: 'json' };
import { unwrapSnapshot, type ProjectsData, type StatsData } from '../lib/command-center';

const { data: stats, fetchedAt: statsFetchedAt } = unwrapSnapshot<StatsData>(statsSnapshot);
const { data: projects, fetchedAt: projectsFetchedAt } = unwrapSnapshot<ProjectsData>(projectsSnapshot);

assert.equal(typeof statsFetchedAt, 'string', 'stats snapshot keeps fetchedAt envelope metadata');
assert.ok(Array.isArray(stats.commitActivity), 'stats commitActivity is an array');
for (const point of stats.commitActivity) {
  assert.equal(typeof point.week, 'string', 'generated commit activity points expose week labels');
  assert.equal(typeof point.commits, 'number', 'generated commit activity points expose commit counts');
}

assert.equal(typeof projectsFetchedAt, 'string', 'projects snapshot keeps fetchedAt envelope metadata');
assert.ok(Array.isArray(projects.boards), 'projects boards is an array');
for (const board of projects.boards) {
  assert.ok(board.scope === 'repository' || board.scope === 'user', `project board scope is supported: ${board.scope}`);
}

console.log('snapshot contract compatibility ok');
