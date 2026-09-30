# Historical Implementation Exceptions Review

## Context

VS-T11, VS-I04, and VS-A03 were created during the three-Pattern schema spike, before the P2 implementation-enrichment contract. P2 now uses separate source-less `proposal` evidence at confidence `0.5` for each implementation-oriented top-level subtree, renderer-neutral structural recipes, and no numeric Taste defaults or renderer candidates.

The review distinguishes a historical-contract mismatch from a provenance or runtime defect. The source-audit facts for all three remain separately scoped as `observed`; their semantic metadata is separately scoped as `inferred` or `proposal`.

## VS-T11

### Portable structural data

The keyword trigger, isolated keyword targeting, and token-level recipe remain useful portable grammar. They describe an authored caption token being marked and receiving a distinct local treatment.

### Historical-specific data

`durationFrames`, `easing`, `fromScale`, and `peakScale` are fixed production defaults. `rendererCandidates` binds the otherwise portable recipe to named renderer options. These values do not meet the later P2 portability boundary, but they are explicitly proposal data rather than source claims.

### Provenance review

The `observed` scope (`id`, `title`, `purpose`) is correct, and the source metadata is complete. The inferred `tags` scope is correct. The proposal scope truthfully covers normalized category, semantic decision metadata, motion, and implementation. No proposal field is included in observed scope, so no field is presented as source-observed.

The combined proposal scope prevents a consumer from distinguishing semantic proposals from implementation proposals by evidence entry alone, but every covered field has the same type, confidence, and absence of source metadata. Splitting it would improve P2 consistency only; it does not correct a false attribution or machine-readable ambiguity.

### Runtime impact

Search v2 reads only `id`, `title`, `purpose`, `goodFor`, `tags`, and `category`; the motion defaults and renderer candidates do not affect retrieval. Candidate Comparison returns semantic decision fields and evidence, but does not interpret or rank implementation. Validation confirms the existing scoped paths. The Skill directs an Agent not to describe proposal values as source-observed and to pass only selected relevant fields to a downstream renderer. No renderer adapter consumes `rendererCandidates`.

### Decision

Remain unchanged as a documented historical exception.

## VS-I04

### Portable structural data

The labeled-node and directional-relationship recipe is useful renderer-neutral relationship grammar. `relationship-diagram` communicates the intended structural representation.

### Historical-specific data

`position: center` and `safeArea: title-safe` are layout-policy proposals rather than portable invariants. `rendererCandidates` is a historical binding to named renderer options. They do not meet the P2 portability boundary, but remain clearly marked proposal data.

### Provenance review

The observed catalog scope and source metadata are correct, and `tags` remain correctly inferred. The proposal scope truthfully covers category, decision metadata, layout, and implementation. Neither placement, safe area, nor renderer candidates is presented as observed. A separate implementation proposal entry would be cleaner, but would not change provenance semantics because every covered field is already the same source-less proposal class.

### Runtime impact

Search v2 ignores all historical layout and implementation fields. Candidate Comparison preserves evidence without turning proposal fields into facts. Validation accepts all scopes because they reference stored subtrees. The Skill's handoff guidance does not require or select renderer candidates. No actual runtime consumer depends on center placement, title-safe policy, or renderer candidates.

### Decision

Remain unchanged as a documented historical exception.

## VS-A03

### Portable structural data

The edit-point trigger, context-dependent pause, and recipe to mute or stop the music bed at a selected pause already describe renderer-neutral structural behavior. `audio`, `timing`, and the recipe substantially fit the later P2 contract.

### Historical-specific data

`rendererCandidates` is the only direct mismatch with the P2 contract. `optional: false` and the exact cue labels are historical proposal policy, not source observation, but they do not introduce numeric defaults, assets, or renderer-specific operation.

### Provenance review

The observed catalog scope and complete source metadata are correct. The inferred tag scope is correct. The combined proposal scope truthfully identifies category, semantic decision metadata, audio, timing, and implementation as source-less proposals. It does not create a false observed claim. Splitting semantic and implementation scopes would be stylistic consistency rather than a provenance correction.

### Runtime impact

Search v2 uses only the semantic fields and does not score `audio`, `timing`, or renderer candidates. Candidate Comparison returns its semantic fields and evidence without recommendation logic. Validation accepts every existing scope. The Skill prevents proposal values from being described as source facts, and no renderer adapter exists to consume `rendererCandidates`. Leaving the record unchanged creates no current runtime problem.

### Decision

Remain unchanged as a documented historical exception.

## Cross-pattern conclusion

All three records have correct observed scopes, inferred tag scopes, and truthful proposal scopes. Their combined semantic and implementation proposal entries are older style, but no entry mixes evidence types, source metadata, or confidence levels. There is no incorrect provenance, no schema representation bug, and no machine-readable ambiguity that affects present consumers.

The P2 batches intentionally omit exact numeric or renderer-specific details for portability. That difference is a valid historical-contract distinction, not sufficient reason to rewrite P0-era proposal data. Preserving the records also retains the original spike evidence without presenting it as universal implementation policy.

## Recommended action

**A. Preserve all three unchanged as documented historical exceptions.**

Do not migrate VS-T11, VS-I04, or VS-A03 now. Reconsider a field-level migration only if a future renderer adapter treats `rendererCandidates`, fixed motion values, placement policy, or audio optionality as binding behavior, or if a provenance consumer cannot distinguish a field from its scoped proposal entry. Neither condition exists in the current runtime.
