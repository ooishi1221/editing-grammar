# Composition Reference Fixture Spike

These YAML files are an experimental fixture set for v0.2 Phase 0 follow-up. They are not production schemas, catalog Patterns, renderer plans, recommendations, or an extension of Search/Handoff.

The files test the two-layer Decision C from the composition research:

1. Frame references describe who or what is primary within one screen relationship.
2. Sequence references describe what a meaning transition preserves, changes, releases, or restores across states.

All reference labels and the fixture shape are proposals. Their evidence points only to verified records in `research/composition/sources.yaml` and `research/composition/observations.yaml`; the normalization itself is `inferred`. They do not claim that every source used a fixed template.

## Pattern boundary

Patterns retain the editorial job. A frame reference expresses the current attention, subject relation, region relation, and text role. A sequence reference expresses a relationship between states. Renderer/Harness work still resolves concrete geometry, fonts, assets, timing, safe-area geometry, and execution.

`VS-L01` can select the group baseline intent represented by CF-01 without being altered. CF-02 can accompany `VS-R01`, `VS-R02`, or `VS-R11` when an authored subject is selected. CF-03 relates to `VS-L05` and `VS-L10`; CF-04 to `VS-L03` and `VS-L04`, without requiring an inset to be circular. CF-05 can coexist with `VS-T08`, `VS-T11`, or `VS-I05` without merging their distinct editorial meanings.

CF-06 is deliberately a fixture rather than a new Pattern. It exposes product identity as a reusable composition requirement so a later review can decide whether a reference alone is enough or whether an independent Pattern is justified.

## Text roles

Position is not a text role. The fixture uses only contextual strings such as `persistent-context`, `speech-caption`, `reaction-caption`, `question`, `answer/result`, `source-proof`, `product-copy`, and `cta`. They are not formal enums. A top-positioned string can be a persistent label, a question, or a product copy; its role is supplied by the scene.

## Non-randomness

CS-04 models an affirmative hold: when subject relation, regions, and framing still serve the context, only text or expression may change. It has `mandatory_cut: false`. All sequence references similarly describe meaning relationships and never prescribe a shot count or a mandatory cut.

## Validation

`tests/composition-fixtures.test.ts` validates fixture counts, IDs, evidence links, catalog Pattern IDs, non-mandatory sequence behavior, and the absence of renderer geometry fields. It intentionally does not validate a production schema because this spike must not create one.
