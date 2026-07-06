# Repository Operating Guide

## Scope
These instructions apply to the full `cywf.github.io` repository. This repo publishes KP's public portfolio and command center through GitHub Pages.

## Architecture
- `site/` is the Astro application that builds the live site.
- `site/src/pages/` contains static routes. The home page is a snapshot-backed command center; `/development-board` is the full cross-project task board.
- `site/src/lib/` contains shared data shaping and presentation utilities used by pages and tests.
- `site/src/scripts/` contains CI-only snapshot fetchers for repository stats, discussions, and project/task data.
- `site/public/data/*.json` are public snapshot contracts consumed by the site. Preserve these paths and envelope shape: `{ "fetchedAt": string, "data": ... }`.
- `assets/`, root `index.html`, and `_config.yml` are preserved legacy dashboard inputs. The Pages workflow copies them into `site/public/legacy/` before build.

## Commands
Run commands from `site/` unless noted otherwise.

```bash
npm ci              # install exact dependencies in CI/fresh clones
npm install         # local dependency install/update
npm run dev         # local Astro dev server at http://localhost:4321
npm run build       # production static build to site/dist
npm run preview     # preview the production build
npm run typecheck   # Astro/TypeScript diagnostics (can be slow in constrained containers)
npm test            # utility tests for command-center data behavior
```

## Data and secrets conventions
- Snapshot scripts must degrade gracefully when optional token scopes are unavailable.
- Do not place secrets in source, public data, workflow logs, commits, or PR text.
- GitHub Actions may use `GITHUB_TOKEN`; Projects v2 access requiring stronger scopes should remain CI-only (for example a `PROJECTS_TOKEN` secret if introduced later).
- Keep scheduled snapshot behavior and GitHub Pages deploy behavior compatible with `.github/workflows/pages.yml`.

## Quality bar
- Preserve WCAG AA contrast and keyboard-accessible navigation.
- Keep Lighthouse categories at 90+ unless a PR explicitly documents an external constraint.
- Add tests for changed data shaping or fallback behavior.
- Prefer structural/product improvements over cosmetic churn, and keep PRs coherent and reviewable.
