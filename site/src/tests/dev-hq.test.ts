import assert from 'node:assert/strict';
import specSnapshot from '../../public/data/dev-hq-spec.json' with { type: 'json' };
import { getCapabilityCounts, getPrioritizedCapabilities, type DevHqSpec } from '../lib/dev-hq';
import { unwrapSnapshot } from '../lib/command-center';

const { data: spec } = unwrapSnapshot<DevHqSpec>(specSnapshot);
const counts = getCapabilityCounts(spec.capabilities);

assert.equal(spec.productName, 'KP-DEV-HQ');
assert.equal(spec.version, '2.0');
assert.equal(counts.live + counts.ready + counts.planned, spec.capabilities.length);
assert.deepEqual(getPrioritizedCapabilities(spec.capabilities).map((item) => item.status).slice(0, 2), ['live', 'live']);
assert.ok(spec.principles.some((principle) => principle.includes('no secrets')));
console.log('dev-hq specification utilities ok');
