# KP-DEV-HQ v2.0 Portfolio Maintenance

Updated: 2026-07-16

## Content architecture

- Portfolio profile information lives in `site/src/data/profile.ts`.
- Navigation lives in `site/src/data/navigation.ts` and is validated by `site/src/tests/portfolio-foundation.test.ts`.
- Projects, case studies, expertise domains, experience entries, research notes, labs metadata, and contact intents live in `site/src/data/portfolio.ts`.
- Public snapshot contracts stay under `site/public/data/*.json` and must preserve the envelope shape `{ "fetchedAt": string, "data": ... }`.

## Adding projects or case studies

1. Add a `PortfolioProject` entry with a factual status and evidence level.
2. Add or link a `CaseStudy` when there is enough public-safe context.
3. Do not invent outcomes, metrics, telemetry, customers, or operational details.
4. Run `npm test`, `npm run typecheck`, and `npm run build` from `site/`.

## Developer HQ snapshots

Snapshot scripts may warn when optional scopes are unavailable. That is acceptable when committed JSON still has the expected envelope shape and pages render clear freshness/warning states.

## Accessibility and performance

Core portfolio pages should render meaningful HTML without JavaScript. Client islands are reserved for theme switching, charts, diagrams, and labs. Prefer `client:visible` or `client:idle` for below-fold/heavy labs.

## Rollback

Revert the PR that introduced the content or code change, rerun GitHub Pages, and verify `/`, `/projects`, `/developer-hq`, and `/404` still build. Do not change Terraform Cloud workspace variables as part of content rollback unless a separate infrastructure change explicitly requires it.
