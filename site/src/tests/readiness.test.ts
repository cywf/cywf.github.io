import { strict as assert } from 'node:assert';
import { scoreProductionReadiness, readinessBand } from '../lib/readiness';

const full = scoreProductionReadiness({ hasReadme: true, description: 'x', homepage: 'https://example.com', hasWiki: true, licenseSpdx: 'MIT', hasWorkflow: true, pushedAt: new Date().toISOString(), openPRs: 1, openIssuesOnly: 3, latestReleaseOrTag: 'v1.0.0' });
assert.equal(full.score, 100);
assert.equal(full.band, 'Production-ready');
assert.equal(readinessBand(70), 'Stable');
assert.equal(readinessBand(50), 'Active but needs hardening');
assert.equal(readinessBand(25), 'Prototype');
assert.equal(readinessBand(24), 'Dormant/incomplete');
const empty = scoreProductionReadiness({});
assert.equal(empty.score, 0);
assert.equal(empty.recommendedNextAction, 'Add or refresh the README.');
console.log('readiness tests passed');
