# KP-DEV-HQ Phase 0 baseline

Date: 2026-07-16
Branch: feature/kp-dev-hq-portfolio-foundation
Environment: CYWF-PORTFOLIO

## Command results from `site/`

- `node --version`: `v20.20.2`
- `npm --version`: `11.4.2` with warning `Unknown env config "http-proxy"`.
- `npm ci`: failed with exit code 128 because npm attempted `git --no-replace-objects ls-remote ssh://git@github.com/ramya-rao-a/css-parser.git` and the container reported `ssh: Could not resolve hostname github.com: Temporary failure in name resolution`.
- `npm test`: failed with exit code 127 because `tsx` was not installed after `npm ci` failed: `sh: 1: tsx: not found`.
- `npm run typecheck`: failed with exit code 127 because `astro` was not installed after `npm ci` failed: `sh: 1: astro: not found`.
- `npm run build`: failed with exit code 127 because `astro` was not installed after `npm ci` failed: `sh: 1: astro: not found`.

## Package and dependency observations

- `site/src/pages/docs.astro` imports `marked` directly.
- `site/package-lock.json` already contained `node_modules/marked` transitively, but `site/package.json` did not declare it directly before this change. This PR adds `marked` as a direct dependency to make the import explicit.
- Package scripts before this PR included `dev`, `build`, `preview`, `typecheck`, `astro`, and `test`.

## Route and file inventory

Pre-change public Astro routes included `/`, `/404`, `/dashboard`, `/development-board`, `/discussions`, `/docs`, `/dev-hq`, `/visualizer`, `/statistics`, `/create-issue`, and `/labs`.

Snapshot contracts under `site/public/data/` use the public envelope shape `{ "fetchedAt": string, "data": ... }` and include discussions, projects, repositories, dev-hq-spec, docs-index, stats, work-items, and lab graph JSON files.

## Known defects and risks identified

- The GitHub Pages workflow ran `npm run typecheck || echo ...`, making typecheck non-blocking.
- The deployment workflow did not run `npm test` before build.
- Labs components use `client:load` hydration and should remain isolated from core portfolio routes.
- `/development-board` is dense and should receive a dedicated mobile/accessibility pass.
- `/visualizer` export can produce low-value/empty graph JSON when snapshots are empty.
- `/dashboard` preserves a legacy iframe; that compatibility path should remain but carries iframe review risk.
- The previous homepage was operations-first instead of professional portfolio-first.
