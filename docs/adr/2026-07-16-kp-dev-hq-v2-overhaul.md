# ADR: KP-DEV-HQ v2.0 full portfolio overhaul

Date: 2026-07-16

## Status

Accepted for PR review.

## Context

The public site needed to be a professional portfolio first, with Developer HQ treated as an operational evidence subsystem rather than the lead product experience.

## Decision

Implement a static-first Astro portfolio architecture with typed content data, complete public routes, labeled evidence levels, GitHub Pages compatibility, and blocking CI quality gates.

## Routes added or materially changed

- `/` portfolio-first homepage
- `/about`
- `/expertise`
- `/projects`
- `/case-studies`
- `/experience`
- `/research`
- `/labs`
- `/architecture`
- `/contact`
- `/developer-hq`
- Preserved operational/legacy routes: `/dashboard`, `/statistics`, `/discussions`, `/development-board`, `/create-issue`, `/docs`, `/visualizer`, `/dev-hq`, `/404`

## Quality gates recorded

- `npm ci` failed in this container when online GitHub access for `@emmetio/css-parser` was blocked by the proxy; `npm ci --offline` completed from cache.
- `npm test` passed.
- `npm run typecheck` passed and is blocking in the Pages workflow.
- `npm run build` passed.

## Public safety

The content intentionally labels active-development, documented-design, and concept-research work. It does not expose secrets, Terraform Cloud values, private operations, phone numbers, fake telemetry, or invented business outcomes.

## Remaining limitations

- Richer quantified outcomes require owner-approved public evidence.
- Screenshots should be captured in an environment with a browser binary available.
