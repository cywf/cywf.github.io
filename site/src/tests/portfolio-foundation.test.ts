import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { primaryNavigation, developerHqNavigation, allRoutes } from '../data/navigation';
import { profile } from '../data/profile';
import { caseStudyDrafts, expertiseDomains, flagshipProjects } from '../data/expertise';
import { buildDeveloperHqSummary } from '../lib/developer-hq';

assert.equal(profile.brand, 'KP-DEV-HQ');
assert.ok(primaryNavigation.some((item) => item.href === '/developer-hq'));
for (const route of ['/about','/expertise','/projects','/experience','/research','/contact','/developer-hq']) {
  assert.ok(allRoutes.some((item) => item.href === route), `${route} is registered`);
  assert.ok(existsSync(new URL(`../pages${route === '/' ? '/index' : route}.astro`, import.meta.url)), `${route} page exists`);
}
assert.ok(developerHqNavigation.some((item) => item.href === '/dashboard'));
assert.ok(expertiseDomains.length >= 4);
assert.ok(flagshipProjects.every((project) => project.evidence));
assert.ok(caseStudyDrafts.every((study) => study.statusNote.includes('placeholder')));
const summary = buildDeveloperHqSummary({ repoCount: 1, stars: 0, forks: 0, watchers: 0, languages: {}, commitActivity: [], repositories: [], docsWikiCoverage: 50 }, { repoCount: 1, boardCount: 1, itemCount: 0, boards: [], items: [] }, { repoCount: 1, discussions: [] });
assert.equal(summary.totals.repos, 1);
assert.equal(summary.docsCoverage, 50);
console.log('portfolio-foundation tests passed');
