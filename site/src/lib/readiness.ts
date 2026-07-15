export type ReadinessBand = 'Production-ready' | 'Stable' | 'Active but needs hardening' | 'Prototype' | 'Dormant/incomplete';

export interface ReadinessInput {
  hasReadme?: boolean;
  description?: string | null;
  homepage?: string | null;
  pagesUrl?: string | null;
  hasWiki?: boolean;
  hasPages?: boolean;
  licenseName?: string | null;
  licenseSpdx?: string | null;
  hasWorkflow?: boolean;
  pushedAt?: string | null;
  updatedAt?: string | null;
  openPRs?: number | null;
  openIssuesOnly?: number | null;
  latestReleaseOrTag?: string | null;
}

export interface ReadinessResult { score: number; band: ReadinessBand; recommendedNextAction: string; checks: Record<string, boolean>; }

export function readinessBand(score: number): ReadinessBand {
  if (score >= 85) return 'Production-ready';
  if (score >= 70) return 'Stable';
  if (score >= 50) return 'Active but needs hardening';
  if (score >= 25) return 'Prototype';
  return 'Dormant/incomplete';
}

function recentWithin90Days(input: ReadinessInput): boolean {
  const source = input.pushedAt || input.updatedAt;
  if (!source) return false;
  const ageDays = (Date.now() - new Date(source).getTime()) / 86_400_000;
  return Number.isFinite(ageDays) && ageDays <= 90;
}

/**
 * Production readiness rubric, 100 points total:
 * README (10), description (5), homepage/demo (10), wiki/docs (10), license (10),
 * CI workflow (15), activity within 90 days (10), reviewable PR queue (10), tracked issue queue (10),
 * and release/tag signal (10). Missing/unknown values score 0 so public pages never imply false certainty.
 */
export function scoreProductionReadiness(input: ReadinessInput): ReadinessResult {
  const checks = {
    readme: !!input.hasReadme,
    description: !!input.description?.trim(),
    homepage: !!(input.homepage?.trim() || input.pagesUrl?.trim()),
    docs: !!(input.hasWiki || input.hasPages || input.homepage?.trim()),
    license: !!(input.licenseName || input.licenseSpdx),
    workflow: !!input.hasWorkflow,
    recent: recentWithin90Days(input),
    prsReviewable: typeof input.openPRs === 'number' && input.openPRs <= 5,
    issuesTracked: typeof input.openIssuesOnly === 'number' && input.openIssuesOnly <= 25,
    release: !!input.latestReleaseOrTag,
  };
  const score =
    (checks.readme ? 10 : 0) +
    (checks.description ? 5 : 0) +
    (checks.homepage ? 10 : 0) +
    (checks.docs ? 10 : 0) +
    (checks.license ? 10 : 0) +
    (checks.workflow ? 15 : 0) +
    (checks.recent ? 10 : 0) +
    (checks.prsReviewable ? 10 : 0) +
    (checks.issuesTracked ? 10 : 0) +
    (checks.release ? 10 : 0);
  const band = readinessBand(score);
  const recommendedNextAction = !checks.readme ? 'Add or refresh the README.'
    : !checks.docs ? 'Publish wiki/docs or a project docs page.'
    : !checks.workflow ? 'Add CI workflow coverage.'
    : !checks.license ? 'Add a public license.'
    : !checks.homepage ? 'Add a homepage/demo link.'
    : !checks.release ? 'Cut a release or tag.'
    : !checks.prsReviewable ? 'Review and merge or close open PRs.'
    : !checks.issuesTracked ? 'Triage issues into an explicit backlog.'
    : 'Keep monitoring health and freshness.';
  return { score, band, recommendedNextAction, checks };
}
