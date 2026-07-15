# Public Project PoC Registry

This directory is the authoritative inventory for the public-project proof-of-concept program.

## Current baseline

- Inventory owner: Hermes / portfolio program
- Source: live GitHub repository inventory for `cywf`
- Baseline date: 2026-07-15
- Public repositories: 113
- Initial state: unassessed; no repository is counted as a verified PoC without evidence

## PoC gate

A repository may be marked `poc_status=verified` only when all of the following are recorded:

1. A concise problem statement and intended user.
2. A reproducible setup path from a clean environment.
3. One working happy-path demonstration.
4. Automated smoke test or exact repeatable verification command.
5. No committed secrets and dependency/security checks appropriate to the stack.
6. README evidence link and a named next maturity step.

Use `poc_status=gap` when the project has been assessed and misses one or more gates. Use `unknown` only before assessment.

## Portfolio operating rule

Hermes may create, split, reprioritize, or defer implementation tasks, but may not mark a PoC verified without evidence. The G8S capacity plan reserves 20% for agent self-improvement; portfolio PoC work competes within the remaining delivery allocation and WIP limits.

## Refresh

Refresh the CSV from the GitHub account inventory before each monthly portfolio review. New public repositories enter as `unassessed`.
