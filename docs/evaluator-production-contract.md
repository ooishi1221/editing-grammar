# Editing Grammar Evaluator Production Contract

## Responsibility boundary

The optional Evaluator verifies whether explicit scene constraints survived execution. It does not select Patterns, judge aesthetic quality, recommend edits, predict performance, inspect raw video, or infer missing subjects and assets.

It compares four separate inputs:

```text
Selected Composition Contract
  + Evaluation Expectations
  + Evaluation Context
  + Execution Report
  → Evaluator
  → pass | warn | fail | skipped
```

The selected Composition contract states the Agent's editorial decision. Expectations state the concrete constraints to test. Context provides external platform constraints. The execution report contains only facts emitted by a renderer adapter or harness.

## Evaluation Expectations

`SceneEvaluationExpectations` contains independent, uniquely named checks. The first production contract supports only:

- **E03** — `captionRegionId` must avoid every explicitly named `avoidRegionIds`.
- **E05** — explicitly named `regionIds` must remain inside `safeAreaId`.
- **E07** — `CS-04` with explicitly named `preserveStateIds` must preserve its rendered HOLD state.

There is no implicit policy such as “all captions avoid all faces.” Multiple expectations with the same check ID are valid and produce separate results.

## Evaluation Context

`EvaluationContext` optionally supplies named safe-area insets:

```ts
{
  safeAreas: {
    "short-vertical": { left: 60, top: 120, right: 60, bottom: 240 }
  }
}
```

Insets are absolute pixels relative to the execution canvas. This module ships no platform database or TikTok, YouTube, or Instagram presets. A caller supplies the applicable safe area.

## Execution Report

`SceneExecutionReport` records renderer-neutral observations:

- `canvas` dimensions;
- stable rendered `regions`, optional absolute bounds, and optional opaque authored IDs;
- actual `compositionStates`, each with a frame reference plus subject and region bindings;
- `stateLineage` linking actual before/after states to a selected Sequence relationship.

Regions cannot contain policy fields such as `protected-target` or `safeAreaRequired`. The adapter reports what it rendered; expectations decide what must be protected or constrained.

Rectangles use absolute, finite, axis-aligned pixels. `(0, 0)` is the top-left of the canvas. Width and height must be positive. A rectangle may extend beyond canvas edges as an execution fact; E05 can then fail it. Percentages, transforms, rotated rectangles, polygons, masks, and video-pixel analysis are outside this contract.

## E03: caption avoids named regions

E03 resolves its explicit region IDs from the execution report and compares their bounds. Any positive-area intersection fails. No intersections pass. Existing regions without observable bounds skip the check.

Failure evidence lists the expectation, caption region, every collided avoided region, and each intersection rectangle with area.

## E05: regions stay inside a named safe area

E05 resolves safe-area insets from `EvaluationContext`, derives allowed canvas bounds, then checks every named region. A region outside fails. Missing optional safe-area context or missing observable region bounds skips the check.

## E07: CS-04 HOLD is preserved

E07 requires an expectation whose `preserveStateIds` exactly match a selected `CS-04` Sequence preserve binding. The renderer adapter emits a matching state-lineage record with before/after execution state IDs.

The evaluator compares only the HOLD invariants:

- `frameReferenceId`
- `subjectBindings`
- `regionBindings`

It intentionally ignores caption copy, expression state, content values, and timing. A changed invariant fails with a structured field-level diff. Missing valid lineage skips the check.

## Validation and skipped results

Malformed inputs throw `EvaluatorInputError`; they never become skipped. Invalid cases include duplicate IDs, invalid or non-finite geometry, impossible supplied safe areas, unknown region/state/reference IDs, malformed bindings, and an E07 preserve set that does not match the selected CS-04 contract.

`skipped` is only for structurally valid input where required observable evidence is absent: a declared region has no bounds, a named safe area was not supplied, or a selected CS-04 has no matching execution lineage.

## Result contract

`evaluateScene(...)` returns:

```ts
{
  checks: Array<{
    id: "E03" | "E05" | "E07";
    expectationId: string;
    status: "pass" | "warn" | "fail" | "skipped";
    message: string;
    evidence?: Record<string, unknown>;
  }>;
  hasFailures: boolean;
}
```

`warn` remains reserved vocabulary; the initial checks do not manufacture a warning condition. `hasFailures` is mechanical and is not a quality, beauty, confidence, recommendation, or winner score.

## Future adapter requirements

A future renderer adapter must emit canvas dimensions, unique region IDs and bounds, authored identity links, execution composition states, and CS-04 before/after lineage. It must not infer protected targets, decide safe-area obligations, invent assets, or claim visual quality.

The Evaluator is renderer-neutral and optional. Existing Pattern Search, Pattern Handoff, and Scene Composition Handoff workflows require no evaluator input.
