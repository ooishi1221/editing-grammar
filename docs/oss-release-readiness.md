# OSS Release Readiness

## Public Surface

- README: public entry point, quickstart, workflow, integration boundary
- Quickstart and Agent examples: executable local workflow
- Architecture: responsibility boundaries
- Contributing: data and provenance rules
- CI: build, validation, and tests on Node 24
- License: MIT

## Core Freeze State

- P0 complete
- P1 complete
- P2 complete
- P3 complete

## Automated Checks

`npm run build`, `npm run validate`, and `npm test` validate the current catalog. `.github/workflows/ci.yml` runs the same checks for pushes to `main` and pull requests targeting `main`.

## v0.1.0 Release Criteria

v0.1.0 release criteria are satisfied: the public surface, executable examples, contributor guidance, and CI are in place, and the core P0 through P3 contracts are frozen.

No known technical blocker to a GitHub v0.1.0 release.
