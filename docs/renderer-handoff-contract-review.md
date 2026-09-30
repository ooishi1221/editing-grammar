# Renderer Handoff Contract Review

## Current Architecture

The current path is Agent intent → Search v2 → Candidate Comparison → Agent selection → `show` → selected Pattern grammar. P2 supplies renderer-neutral `visual`, `audio`, `timing`, and `implementation.recipe` proposals, but there is no portable boundary that tells a downstream consumer which values it must still receive before execution.

The reviewed current-contract Patterns demonstrate the intended structural layer: VS-T02 binds a supplied speaker identity to captions; VS-R01 applies a local emphasis around a supplied target; VS-I02 preserves a supplied shared comparison axis; VS-L05 relates B-roll to an authored interval; VS-A01 synchronizes a cue to an emphasis event; VS-E02 carries audio across a supplied scene boundary; VS-G02 displays supplied score state; VS-C03 binds a supplied CTA to a destination; VS-S01 consumes platform safe-area geometry; and VS-S04 connects supplied loop states.

## Proposed Handoff Shape

The next layer should be a read-only portable `ImplementationHandoff`, not a renderer adapter:

```text
ImplementationHandoff {
  pattern: { id, title, category },
  status: current-contract | historical-exception | semantic-only,
  grammar: { visual?, audio?, timing?, recipe? },
  inputs: { declarations, suppliedValues, unresolved },
  provenance: { implementationProposalEvidence },
  context: { scene, brand, platform }
}
```

`grammar` carries selected renderer-neutral structure only. `inputs.declarations` comes from Pattern metadata; `suppliedValues` come from the Agent, application, or Video Harness; `unresolved` makes absent inputs explicit. `context` is passed through for downstream use and is not interpreted by Editing Grammar. The contract chooses no renderer, executes nothing, selects no Taste, and does not convert proposals into source facts.

## Parameter Semantics Review

Current `implementation.parameters` entries are not a uniform machine-readable input declaration.

| Reviewed Pattern | Current parameter | Actual meaning | Handoff issue |
| --- | --- | --- | --- |
| VS-T02 | `speakerKey: "active speaker identity"` | Required external runtime input. | No requiredness or runtime type. |
| VS-R01 | `emphasisTarget: "subject or keyword"` | Required external target. | No target identity type or unresolved-state signal. |
| VS-I02 | `subjectCount: 2` | Fixed grammar invariant. | Indistinguishable from a supplied numeric default. |
| VS-I02 | `comparisonAxis: "shared criterion"` | Required external comparison data. | Same untyped map as a constant. |
| VS-L05 | `primarySource`, `secondarySource`, `segmentId` | Required source and timeline references. | No value type or reference semantics. |
| VS-A01 | `cueIntent: "impact accent"` | Grammar cue classification, not necessarily a runtime value. | Indistinguishable from input or default. |
| VS-E02 | `scenePair`, `boundaryId`, `direction` | Scene references plus authored context. | No requiredness or type. |
| VS-G02 | `scoreState`, `participantSet` | Required externally maintained state. | No object or collection type declaration. |
| VS-C03 | `ctaAction`, `destinationId` | Supplied action and destination references. | No supplied versus unresolved distinction. |
| VS-S01 | `safeAreaProfile` | Required platform context. | No distinction between runtime input and adapter-resolved context. |
| VS-S04 | `loopStatePair`, `boundaryId` | Required authored state pair and boundary. | No correspondence type or availability signal. |

The descriptions are useful to humans, but a renderer cannot reliably determine required versus optional inputs, runtime value type, fixed constants, or whether a value is already supplied. This is a real machine-readable ambiguity for the proposed handoff, not merely a consistency issue.

## External Context Boundary

| Layer | Responsibility |
| --- | --- |
| Pattern grammar | Selected Pattern identity, structural `visual` / `audio` / `timing`, recipe, and declared input semantics. |
| Handoff runtime inputs | Concrete speaker IDs, caption tokens, source and segment references, score state, participant identity, CTA destination, safe-area profile, beat grid, and other selected-Pattern values. |
| Agent / application context | Scene meaning, editorial selection, transcript segmentation, brand and tone policy, consent, source facts, ranking or correctness decisions, platform policy, and asset-rights decisions. |
| Renderer adapter configuration | Timeline placement, asset resolution, geometry, concrete timing, fonts, colors, audio mix, platform insets, renderer syntax, and execution. |

External context must not be pushed into Pattern YAML for convenience. The grammar consumes externally selected facts and state; it does not create them.

## Historical Exceptions

VS-T11, VS-I04, and VS-A03 remain `historical-exception` status. A portable handoff should expose their structural grammar and relevant proposal evidence, while placing numeric motion defaults, older placement policy, `optional: false`, and `rendererCandidates` under explicit historical metadata. These fields should not enter portable grammar by default or select a renderer. A downstream consumer may use them only through an explicit opt-in and must preserve their proposal provenance.

The combined proposal scopes are sufficient to preserve provenance in a read-only handoff. They do not require migration before a handoff contract exists.

## Semantic-only Behavior

Use a valid handoff with `status: semantic-only` and no execution grammar. It should list no invented inputs and make the absence explicit. The Agent or application may author an execution plan outside Editing Grammar, or a renderer may decline to execute it, but the library must not synthesize renderer instructions for VS-T09, VS-B01, VS-B04, or other semantic-only Patterns.

## Multi-pattern Handoff

Use a scene-level wrapper:

```text
SceneImplementationHandoff {
  patterns: ImplementationHandoff[]
}
```

Array order preserves Agent selection order only; it is not a recommendation or execution priority. Shared event IDs, targets, and source references belong in supplied runtime values or scene context. For example, VS-I05, VS-A01, and VS-R01 can bind to a common externally supplied event, but this contract must not resolve their timing, target, or asset conflicts. Conflict detection and timeline ordering remain Video Harness or adapter responsibilities.

## Video Harness Boundary

Editing Grammar sends selected Pattern identity, renderer-neutral structural grammar, semantic input declarations, supplied or unresolved input state, and relevant proposal provenance. Video Harness or a renderer adapter supplies timeline placement, assets, geometry, concrete timing values, platform safe areas, brand system, renderer syntax, and actual execution.

## Schema Sufficiency

The schema is sufficient for semantic retrieval and P2 structural guidance, but not for a reliable portable handoff contract. The smallest demonstrated gap is a discriminated parameter declaration inside `implementation.parameters` that distinguishes:

- `kind`: `runtime-input` | `context` | `constant`
- `description`: human-readable semantics
- `required`: whether an input or context value must be supplied
- `valueType`: `string` | `number` | `boolean` | `object` | `array`
- `value`: allowed only for a `constant`

This is one machine-readable parameter/input concept, not a request to add renderer configuration or scene facts to Patterns. Supplied runtime values remain in the future handoff object, outside the Pattern catalog.

## Decision

**B. Current schema is mostly sufficient, but a minimal parameter/input contract change is required first.**

P2 provides portable structural grammar and clear implementation provenance. Before implementing a library handoff layer, the Pattern schema must distinguish runtime inputs, external context, and fixed grammar constants with requiredness and type. Without that distinction, any handoff would either guess missing data or leave renderers unable to know what is required.
