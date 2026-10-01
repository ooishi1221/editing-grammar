# Evaluator Production Contract Design

## 1. P0 findings

The experimental Evaluator proved three deterministic checks from explicit adapter metadata:

- E03 detected a caption/protected-target collision with rectangle evidence.
- E05 checked a designated region against supplied safe-area insets.
- E07 confirmed that a selected CS-04 HOLD kept its frame, subject bindings, and region bindings stable.

The canonical synthetic vertical fixture produced E03 `fail`, E05 `pass`, and E07 `pass`. Bounded mutations also proved `pass`, `fail`, and `skipped` behavior. No raw video, vision model, renderer adapter, or platform preset database was needed.

## 2. Problem with the experimental boundary

The spike's execution report used `protected-target` roles and `safeAreaRequired` flags. Those fields express what must be protected or constrained, which is editorial policy rather than a renderer fact.

A production boundary must keep these concerns separate:

| Layer | Responsibility |
| --- | --- |
| Selected Contract | The Agent's selected Pattern and optional Scene Composition Handoff. |
| Evaluation Expectations | Explicit constraints that apply to this rendered scene. |
| Execution Report | Renderer-neutral facts about what was rendered. |
| Evaluator | Deterministically compares expectations and selected contract against execution facts. |

The renderer must report regions and state lineage without deciding which region an editorial policy must protect.

## 3. Selected Contract vs Expectations vs Execution

**Selected Contract** remains the existing Pattern and `SceneCompositionHandoff`. It supplies authored identities, Frame selections, text states, and Sequence selections. It remains valid without evaluation.

**Evaluation Expectations** are an optional, explicit companion object. They name check-specific constraints that cannot safely be inferred from every Pattern or Composition selection. E03 names which rendered caption must avoid which rendered target; E05 names which rendered regions must stay inside a supplied safe area.

**Execution Report** records actual canvas, rendered regions, composition states, and state lineage. It does not contain `protected-target`, `safeAreaRequired`, or a subjective assessment.

**Decision: Evaluation Policy ownership C — hybrid.** Applicability and semantic invariants come from the selected contract where available, especially CS-04. Explicit expectations bind the concrete rendered regions and safe-area constraints that the generic grammar cannot infer.

## 4. Evaluation Expectations contract

The first production object should be scene-scoped, optional, and deliberately small:

```ts
interface SceneEvaluationExpectations {
  checks: EvaluationExpectation[];
}

type EvaluationExpectation =
  | {
      id: string;
      checkId: "E03";
      captionRegionId: string;
      avoidRegionIds: string[];
    }
  | {
      id: string;
      checkId: "E05";
      regionIds: string[];
      safeAreaId: string;
    }
  | {
      id: string;
      checkId: "E07";
      sequenceReferenceId: "CS-04";
      preserveStateIds: string[];
    };
```

`id` lets results name the exact authored expectation. E03 and E05 require explicit region IDs because neither a caption nor a target should acquire a universal protection rule implicitly.

E07 does not author a before/after pair. `sequenceReferenceId` and `preserveStateIds` scope the expectation to the selected CS-04 relationship; those preserved IDs must match the selected Sequence binding. The evaluator derives the required stable aspects from CS-04 and asks execution lineage which rendered states realize that relationship.

The shape does not need an additional `reason` or source field in P0: the expectation ID, check ID, and selected contract provide its auditable basis. A future use case may justify optional provenance, but it is not required to evaluate E03, E05, or E07.

## 5. Execution Report contract

The production report should contain only renderer-neutral observations:

```ts
interface SceneExecutionReport {
  canvas: { width: number; height: number };
  regions: Array<{
    id: string;
    bounds?: { x: number; y: number; width: number; height: number };
    authoredIds?: string[];
  }>;
  compositionStates: Array<{
    id: string;
    frameReferenceId: string;
    subjectBindings: Record<string, string>;
    regionBindings: Record<string, string>;
  }>;
  stateLineage: Array<{
    sequenceReferenceId: string;
    preserveStateIds: string[];
    beforeStateId: string;
    afterStateId: string;
  }>;
}
```

The report does not contain `role`, `protected-target`, `safeAreaRequired`, or aesthetic evaluation. It may omit bounds for a declared region when the adapter cannot report a rectangle; an expectation that needs those bounds becomes `skipped`, provided the rest of the report remains structurally valid.

`authoredIds` provides a traceable, opaque link from selected authored targets or text states to rendered regions. It does not require computer vision or a new universal target taxonomy.

The safe area is intentionally absent from this report. It is an evaluation context constraint, not a fact about a particular rendered region.

## 6. Identity and lineage

Identity must travel without inference:

```text
Scene Composition Handoff text state: caption-current
  → adapter region authoredIds: [caption-current]
  → execution region: caption-main

Scene Composition target binding: selectedSubject = guest
  → adapter region authoredIds: [guest]
  → execution region: guest-face
```

Execution state IDs identify actual renderer states. `stateLineage` connects an actual before/after pair to the selected CS-04 relationship by reporting the sequence reference and the preserved authored state IDs. This lineage is an execution observation, not an authored duplicate command to compare two states.

The adapter must preserve the selected IDs verbatim. It must not use face detection, asset guessing, or region matching to manufacture identity.

## 7. E03 production semantics

E03 runs for each explicit E03 expectation. It reads `captionRegionId` and `avoidRegionIds` from the expectation, then looks up rendered bounds by ID in the execution report.

- Positive-area intersection: `fail`.
- No intersection with every named avoid region: `pass`.
- A declared named region lacks usable rectangle bounds: `skipped`.

The failure evidence includes the expectation ID, caption region ID, protected region ID, and structured intersection rectangle with area. No role inference is allowed.

## 8. E05 production semantics

E05 runs for each explicit E05 expectation. The expectation names `regionIds` and a `safeAreaId`; an optional evaluation context supplies the matching rectangle:

```ts
interface EvaluationContext {
  safeAreas?: Record<string, { left: number; top: number; right: number; bottom: number }>;
}
```

The evaluator derives the allowed rectangle from the report canvas and that context's insets.

- Every named region fully inside: `pass`.
- Any named region outside: `fail`.
- Named region has no usable bounds, or the named safe area is unavailable: `skipped`.

There are no TikTok, YouTube, or Instagram presets. The calling project or platform layer supplies insets through the evaluation context.

**Decision: Safe-area ownership B — evaluation context.** A platform profile may create that context upstream, but neither the selected handoff nor renderer observation should declare which editorial regions require it.

## 9. E07 production semantics

E07 applies only where both conditions hold:

1. the selected Scene Composition Handoff contains a matching CS-04 Sequence selection whose `preserve` state IDs match the E07 expectation; and
2. the execution report contains matching state lineage.

The required comparison aspects are derived from CS-04: frame reference, subject bindings, and region bindings must remain equal. Caption copy, text content, and expression state are outside the comparison because CS-04 permits those state changes.

The adapter provides the actual before/after state pair through `stateLineage`; an Agent does not hand-author a duplicate pair. If the expected CS-04 selection or the matching execution lineage is unavailable, E07 is `skipped`.

**Decision: E07 comparison C — hybrid.** The selected contract derives what must hold, while execution lineage identifies the actual state pair that realized it. The current handoff deliberately has no timeline or stable sequence-selection ID, so it cannot safely derive a renderer before/after pair by itself.

## 10. Validation rules

Production validation has two levels: JSON Schema validates shape; evaluator input validation validates cross-references and semantics before any check runs.

The following are invalid input and must throw a clear validation error, never become `skipped`:

- missing canvas or non-finite/non-positive canvas dimensions;
- missing, non-finite, zero, or negative rectangle width/height where bounds are supplied;
- duplicate region IDs or duplicate composition state IDs;
- negative safe-area insets, or insets that leave no drawable safe rectangle;
- an expectation that references an unknown execution region ID;
- an E07 expectation whose CS-04/preserve state IDs do not match a selected CS-04 Sequence selection;
- execution lineage that references an unknown state ID or unknown sequence reference;
- an execution composition state whose frame reference is unknown to the supplied Composition catalog.

`skipped` is reserved for structurally valid input where an applicable check lacks required observable evidence: for example, a declared region has no rectangle bounds, an evaluation context omits a named safe area, or a valid selected CS-04 has no matching renderer lineage.

Rectangles use absolute pixels, `(0, 0)` at top-left, positive axis-aligned `x/y/width/height`. Percentages, transforms, rotated boxes, polygons, masks, and video-pixel analysis are deferred. Bounds may extend outside the canvas because that is a meaningful execution fact; a particular expectation such as E05 can then fail it.

## 11. Result and evidence contract

The P0 result shape remains sufficient with one addition: every result names the expectation that was checked.

```ts
interface EvaluationResult {
  checks: Array<{
    id: "E03" | "E05" | "E07";
    expectationId?: string;
    status: "pass" | "warn" | "fail" | "skipped";
    message: string;
    evidence?: object;
  }>;
  hasFailures: boolean;
}
```

`warn` remains in the status vocabulary but has no P0 use case; no warning condition should be invented. `hasFailures` is mechanical only and is not a quality, confidence, beauty, recommendation, or winner score.

Evidence is structured:

- E03: caption and avoided region IDs, intersection rectangle, and area.
- E05: checked region ID, actual bounds, and allowed safe-area bounds.
- E07: before/after state IDs plus a structured diff of `frameReferenceId`, `subjectBindings`, and `regionBindings`.

**Decision: E07 failure evidence uses a structured diff, not opaque serialized signatures.** Serialized signatures remain a useful internal comparison implementation detail, but the result must show the specific changed fields an Agent or CI consumer can act on.

## 12. Ownership / packaging decision

**Decision: Evaluator ownership A — a separate module inside the editing-grammar repository.**

The evaluator consumes Editing Grammar's selected Composition semantics and needs the same schema/provenance discipline for its optional contracts. Keeping the first bounded production module in this repository makes the OSS surface discoverable and avoids package/repository overhead. It remains renderer-neutral: adapters stay in Creative Video Harness or renderer projects.

The module must be optional and independently importable. It does not make evaluation metadata required for Search, Compare, Pattern Handoff, or Composition Handoff.

## 13. Backward compatibility

This is an additive v0.3 contract:

- Existing v0.2 Pattern-only and Composition Handoff workflows remain valid.
- Evaluation Expectations and Execution Reports are optional.
- No existing Pattern, Composition Reference, Search behavior, or Handoff shape needs to change merely to support evaluation.
- A user that does not emit adapter metadata receives no new requirement and can omit the evaluator entirely.

Reference Examples remain an independent experimental layer. Taste remains project context, not evaluator policy or Pattern truth.

## 14. Future renderer adapter requirements

A future Creative Video Harness or Remotion adapter must emit exactly these facts for the initial checks:

1. rendered canvas width and height;
2. stable, unique rendered region IDs and their absolute pixel bounds when available;
3. opaque authored IDs associated with each rendered region, including selected targets and text states;
4. stable, unique execution composition state IDs;
5. each state's actual frame reference, subject bindings, and region bindings;
6. lineage records that connect actual before/after states to CS-04 and its preserved authored state IDs.

The adapter does not decide protected regions, safe-area obligations, visual quality, or platform presets. The caller supplies E03/E05 expectations and safe-area context.

## 15. Alternatives rejected

- **Policy derived entirely from Pattern/Composition:** rejected because neither contract can determine which exact rendered caption must avoid which target, or which regions need a platform constraint.
- **Fully explicit policy including E07 before/after pairs:** rejected because it duplicates execution lineage and turns the Agent into a timeline author.
- **Execution roles and `safeAreaRequired` flags:** rejected because they conflate renderer facts with editorial constraints and invite hidden global behavior.
- **Evaluator as a new package or repository now:** rejected because the first three checks are small, grammar-adjacent, and gain little from release or dependency separation.
- **Evaluator inside Creative Video Harness:** rejected because the evaluator is renderer-neutral and should compare a shared grammar contract rather than become one harness implementation detail.
- **Vision-first evaluator:** rejected because P0 already proves useful deterministic checks from explicit metadata; vision is needed later only for undeclared or perceptual facts.

## 16. Final production recommendation

Productionize an optional, renderer-neutral Evaluator module in this repository with explicit scene Evaluation Expectations, a schema-validated Execution Report, and E03/E05/E07 only.

The selected contract remains the source of semantic intent. Expectations state check-specific obligations. The execution report reports only observed geometry and lineage. This lets the evaluator explain the exact expectation it checked without allowing execution metadata to invent editorial intent.

## 17. Exact next implementation batch

Implement one additive batch only:

- `schema/evaluator.schema.json` and mirrored TypeScript types for Evaluation Expectations, Evaluation Context, Execution Report, and results;
- one optional evaluator module in this repository, with E03/E05/E07;
- focused schema, validation, cross-reference, result-evidence, and backward-compatibility tests;
- one synthetic fixture migrated from the spike.

Do not implement a renderer adapter, platform preset database, vision check, Reference Example production contract, new Pattern, or catalog-wide migration.
