# Parameter Declaration Contract Spike

## Problem

Before this spike, every `implementation.parameters` value across the 92-Pattern catalog was scalar: 126 entries across 80 current-contract Patterns, with no arrays, objects, or `null` values. The scalar representation could not distinguish an external runtime input, execution context, and a fixed grammar constant. It also could not declare requiredness or runtime value type.

## Contract

During P3 migration, an `implementation.parameters` value may be either a legacy scalar (`string`, `number`, or `boolean`) or a strict declaration:

```yaml
kind: runtime-input | context | constant
description: Non-empty parameter semantics.
required: true | false
valueType: string | number | boolean | object | array
value: only for constant
```

`runtime-input` and `context` forbid `value`. `constant` requires `value`, requires `required: false`, and validates that `value` matches `valueType`. Declaration objects reject unknown properties.

## Representative Migration

Eight current-contract Patterns migrated 16 parameter entries:

| Pattern | Declarations |
| --- | --- |
| VS-T02 | `speakerKey` runtime input |
| VS-I02 | `subjectCount` constant; `comparisonAxis` runtime input |
| VS-A01 | `cueIntent` constant |
| VS-E02 | `scenePair`, `boundaryId`, `direction` runtime inputs |
| VS-G02 | `scoreState`, `participantSet` runtime inputs |
| VS-S01 | `safeAreaProfile` context |
| VS-S03 | `primarySource`, `secondarySource` runtime inputs; `safeAreaProfile` optional context |
| VS-L05 | `primarySource`, `secondarySource`, `segmentId` runtime inputs |

The migration changes only `implementation.parameters`; recipes, semantic fields, implementation provenance, and other Pattern data remain unchanged.

## Runtime Input vs Context vs Constant

- **Runtime input** is authored scene or invocation data required by the selected Pattern, such as a speaker identity, source reference, scene pair, or score state.
- **Context** is execution-environment data, such as platform safe-area geometry. It may be required or optional without becoming scene content.
- **Constant** is a grammar-owned invariant, such as VS-I02's two subjects or VS-A01's impact cue intent. It is never unresolved at handoff time.

## Validation Rules

The schema validates all three declaration kinds, requiredness, non-empty descriptions, allowed value types, constant-only values, and exact constant value types. It rejects values on runtime inputs or context, constants without values, constants marked required, invalid kinds or value types, missing declaration fields, and arbitrary object parameters. Legacy scalars remain valid during migration.

## Transitional Legacy Support

Legacy scalar parameter support is transitional. A future Renderer Handoff Contract must not treat a legacy scalar as a fully declared runtime input. Until migration completes, it must not infer parameter kind, requiredness, or value type from a scalar description or value.

## Remaining Migration Inventory

- Current-contract Patterns: 81
- Current-contract Patterns with `implementation.parameters`: 80
- Migrated in this spike: 8 Patterns / 16 entries
- Still containing legacy scalar parameters: 72 Patterns / 110 entries
- Categories containing remaining legacy entries: audio, branding, captions, game UI, information, layout, reactions, retention, Shorts, transitions

The remaining inventory is intentionally not migrated by this spike.

## Decision

The new declaration contract is sufficient to represent runtime inputs, external context, and grammar constants without guessing. It should be used for future bounded migration batches. Renderer Handoff remains blocked until every parameter needed by a handoff is declared or explicitly excluded from that handoff.
