# Parameter Migration Batch M2 — Reactions and Layout

## Scope

Migrated only `implementation.parameters` for 19 current-contract Patterns:

- Reactions: VS-R01, VS-R02, VS-R03, VS-R04, VS-R05, VS-R06, VS-R07, VS-R08, VS-R11, VS-R12
- Layout: VS-L01, VS-L02, VS-L03, VS-L04, VS-L06, VS-L07, VS-L08, VS-L09, VS-L10

VS-L05 was already declared. Semantic-only VS-R09 and VS-R10 remain unchanged.

## Result

| Measure | Count |
| --- | ---: |
| Migrated parameter entries | 23 |
| `runtime-input` declarations | 21 |
| `context` declarations | 1 |
| `constant` declarations | 1 |
| Fully declared current-contract Patterns | 38 |
| Remaining legacy-scalar Patterns | 42 |
| Remaining legacy-scalar entries | 69 |

`VS-L02.subjectCount` is a grammar-owned constant. `VS-L09.targetFrame` is execution context because it describes the output environment; the other migrated values are supplied scene or event inputs.

## Boundary

No parameter kind was inferred from its scalar value alone. Classification used each Pattern's existing recipe and structural semantics. No recipes, evidence, semantic fields, or visual/audio/timing data changed. In particular, `visual.motion.parameters` remains unchanged.
