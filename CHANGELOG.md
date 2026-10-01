# Changelog

## [Unreleased]

## [0.2.0] - 2026-10-01

### Added

- Production Composition Grammar with 6 Frame References, 4 Sequence
  References, and 8 Text Roles.
- Optional scene-level Composition Handoff with explicit authored target
  bindings and unresolved required target handling.
- Agent Composition workflow and CS-04 HOLD semantics for intentional
  composition stability.
- VS-I15 商品同定・パックショット.
- Pattern-level `retrievalTerms` for deterministic Search v2 lexical access.
- Executable Composition builder example.
- Composition catalog validation through `npm run validate`.

### Improved

- Search v2 lexical access.
- Frozen holdout Recall@5 from 16/20 to 20/20.
- 「数字を大きく」 now retrieves VS-I05 through explicit Pattern-owned
  `retrievalTerms`.

### Compatibility

- Existing v0.1 Pattern workflows remain valid.
- Composition is optional.
- SceneImplementationHandoff composition is an additive field.
- `retrievalTerms` is optional.
- No intentional breaking changes.

## [0.1.0] - 2026-10-01

### Added

- Audited 92-Pattern editing catalog.
- JSON Schema and TypeScript Pattern contract.
- Explicit `observed`, `inferred`, and `proposal` provenance separation.
- Deterministic catalog validation.
- Search v2, Candidate Comparison, and Agent Skill workflow.
- Renderer-neutral P2 implementation grammar where useful.
- Typed implementation parameter declarations.
- Portable Renderer Handoff with semantic-only and historical-exception handling.
- Executable quickstart and Agent integration examples.
- Architecture and contributor documentation.
- GitHub Actions CI.

### Contract status

- 92 total Patterns.
- 81 current-contract Patterns.
- 3 historical-exception Patterns.
- 8 semantic-only Patterns.
- 80 parameterized current-contract Patterns.
- `VS-E09` intentionally has no parameters.
- 0 legacy `implementation.parameters` entries.

### Not included

- Renderer adapter.
- Rendering engine.
- Automatic recommendation or winner selection.
- npm publication.
- Web UI product.
