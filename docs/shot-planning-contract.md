# Shot Planning Production Contract

## Responsibility

Shot Planning is an optional layer between Scene Composition and a downstream
timeline or renderer:

```text
Meaning → Pattern → Composition → Shot Plan → Timeline / Renderer → Evaluator
```

Patterns answer why an edit exists. Frame References describe attention in one
state. Sequence References define preserve/change/release/restore semantics.
A Shot Plan binds those selected states to ordered semantic beats: where a
state is established, changed, temporarily inserted, returned, or held.

The Agent authors a plan. The contract does not generate, rank, or recommend
plans.

## Semantic Scene

`SemanticScene` contains a non-empty `sceneId` and ordered `beats`. Each beat
has a unique `id`, a non-empty `meaning`, and optional upstream `sourceRange`:

```ts
{
  id: "beat-02",
  meaning: "guest punchline changes primary attention",
  sourceRange: { startMs: 2100, endMs: 3400 }
}
```

Ranges are existing source facts only. They use finite milliseconds, start at
zero or later, and end after they start. A Shot Plan references `beatId`; it
does not copy ranges into steps, create missing ranges, estimate duration, or
invent timestamps.

## Shot Plan

`ShotPlan` has `planId`, `sceneId`, and ordered `steps`. A production plan has
exactly one step for every authored beat, with no duplicate beat or step IDs,
and its order exactly matches the scene's beat order. This makes each
editorial decision inspectable without making every beat a new shot.

Every step has `id`, `beatId`, `decision`, and `rationale`. It may also name
existing `patternIds`, a scene-specific `frameSelectionId`, a scene-specific
`sequenceSelectionId`, or `returnToStepId`.

## Decision vocabulary

- `establish` begins the initial visual state.
- `switch` begins a different visual state at this beat.
- `insert` makes a temporary supporting visual state primary.
- `return` restores an earlier plan state after temporary emphasis.
- `hold` affirmatively keeps the current visual state.

`switch` means a new state starts; it does not require a hard cut. The
renderer decides how a state transition is realized.

## Pattern / Composition references

`patternIds` are optional existing Pattern IDs. Their order does not imply a
timeline. Shot Planning never selects a Pattern from a Frame or Sequence.

`establish`, `switch`, and `insert` require a `frameSelectionId` that exists
in the supplied `SceneCompositionHandoff`. A Frame Selection includes authored
target bindings and derived unresolved state, so a plan addresses the actual
scene state rather than only a reusable CF reference.

## Stable Sequence Selection IDs

Composition Sequence selections may now carry an optional authored `id`:

```yaml
- id: reaction-cycle
  referenceId: CS-01
  stateBindings: { ... }
```

The ID is optional for ordinary Composition use, preserving all v0.2 inputs.
When a Shot Plan supplies `sequenceSelectionId`, it must name one of these
explicit IDs. IDs are unique per scene; the builder never derives unstable
array-index IDs. This allows two `CS-01` instances to coexist and be addressed
unambiguously.

## Establish

The first and only `establish` step must be on the first beat. It requires a
frame selection and cannot use `returnToStepId`. A Sequence selection is
optional only when a genuine selected relationship applies.

## Switch

A `switch` requires a frame selection and semantic rationale. It may reference
a selected Sequence instance, but does not mandate any transition effect.

## Insert

An `insert` requires a frame selection and semantic rationale. It normally
names a selected Sequence that gives the temporary relationship meaning, such
as an authored CS-02 instance, without hard-coding that reference in the
contract.

## Return

A `return` requires `returnToStepId`, which must identify an earlier step.
It does not restate a frame selection. The builder resolves the referenced
step's visual state and reports it as `resolvedFrameSelectionId`.

## HOLD

A `hold` requires a `sequenceSelectionId` naming an actual selected `CS-04`
instance. It cannot declare a new frame selection. The builder resolves the
preceding current state as `resolvedFrameSelectionId`; CS-04 remains the sole
semantic authority for what may change while the composition stays stable.

## Resolved Handoff

`buildShotPlanHandoff({ patterns, composition, scene, plan })` validates all
cross-references and returns a deep-copied `ShotPlanHandoff`. Output preserves
authored plan fields and adds `resolvedFrameSelectionId` to every step for
downstream inspection. It adds no renderer instructions.

## Timing boundary

Semantic Scenes own optional source ranges. Shot Plan steps own only beat
references and semantic state decisions. A Harness may join a step to its beat
to obtain timing, but the grammar owns no frame counts, duration classes,
timestamps, or timing estimates.

## Anti-overcut rule

Complete beat coverage does not require one visual change per beat. Only
`switch`, `insert`, and `return` begin a different state. `hold` is an
intentional decision that the existing state remains correct. Every
`switch`, `insert`, and `return` requires an authored rationale tied to a
semantic change, never visual variety alone.

## Renderer boundary

Shot Plans contain no geometry, crop, duration, timestamp, transition effect,
animation curve, asset selection, or renderer syntax. Timeline extraction and
rendering remain downstream responsibilities. The Evaluator is unchanged and
does not yet evaluate Shot Plans.

## Backward compatibility

Shot Planning is optional. Existing Pattern-only and Composition-only v0.2
workflows remain valid. Composition Sequence selections without IDs remain
valid; only a Shot Plan that needs to address a Sequence instance requires its
explicit authored ID.

## Examples

The production fixtures cover:

- reaction: establish CF-01 → switch to CF-02 with VS-R02 → return → CS-04 HOLD;
- numeric reveal: establish speaker → switch to CF-05 with VS-I05 → HOLD;
- supporting material: establish speaker → insert CF-04 with VS-L03 → return.

See `tests/fixtures/shot-plan/` and the historical P0 examples in
`examples/shot-planning-spike/`.

## Non-goals

This contract does not implement a plan generator, recommendation, candidate
ranking, timeline editor, renderer adapter, timing estimator, new Evaluator
checks, or Creative Video Harness integration.
