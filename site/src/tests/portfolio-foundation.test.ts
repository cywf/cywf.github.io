import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { primaryNavigation, developerHqNavigation, allRoutes } from '../data/navigation';
import { profile } from '../data/profile';
import { caseStudies, expertiseDomains, labs, projects } from '../data/portfolio';
import { buildDeveloperHqSummary } from '../lib/developer-hq';

assert.equal(profile.brand, 'KP-DEV-HQ');
for (const route of ['/about','/expertise','/projects','/case-studies','/experience','/research','/labs','/architecture','/contact','/developer-hq']) {
  assert.ok(allRoutes.some((item) => item.href === route), `${route} is registered`);
  assert.ok(existsSync(new URL(`../pages${route === '/' ? '/index' : route}.astro`, import.meta.url)), `${route} page exists`);
}
assert.ok(primaryNavigation.find((item) => item.href === '/case-studies'));
assert.ok(developerHqNavigation.some((item) => item.href === '/dashboard'));
assert.ok(expertiseDomains.length >= 6);
const evidenceLevels = ['verified-public','documented-design','active-development','concept-research'];
assert.ok(projects.length >= 4);
for (const project of projects) {
  assert.ok(project.slug && project.name && project.problem);
  assert.ok(evidenceLevels.includes(project.evidenceLevel));
  assert.equal(project.public, true);
}
assert.ok(caseStudies.length >= 3);
for (const study of caseStudies) {
  assert.ok(study.limitations.length > 0, `${study.slug} limitations are labeled`);
  assert.ok(evidenceLevels.includes(study.evidenceLevel));
}
assert.ok(labs.every((lab) => lab.privacy && lab.limitations && lab.hydration));
const summary = buildDeveloperHqSummary({ repoCount: 1, stars: 0, forks: 0, watchers: 0, languages: {}, commitActivity: [], repositories: [], docsWikiCoverage: 50 }, { repoCount: 1, boardCount: 1, itemCount: 0, boards: [], items: [] }, { repoCount: 1, discussions: [] });
assert.equal(summary.totals.repos, 1);
assert.equal(summary.docsCoverage, 50);
console.log('portfolio-foundation tests passed');
