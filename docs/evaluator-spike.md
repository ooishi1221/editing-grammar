# Editing Grammar Evaluator P0 Spike

## 1. Problem

Editing Grammar can express an Agent's selected Pattern and Composition contract, but a renderer can still execute that decision incorrectly. This spike tests whether a small evaluator can catch concrete contract violations after execution metadata exists, without choosing the edit or judging visual taste.

## 2. Responsibility boundary

The Evaluator checks whether explicit selected contracts were respected. It does not select Patterns, rank candidates, assess beauty, predict performance, inspect raw video, or infer missing people, products, or assets. A renderer or future adapter supplies normalized metadata; the evaluator reports deterministic checks.

## 3. Inputs

`evaluateSceneComposition(selectedComposition, executionReport)` keeps intent and execution separate:

- `selectedComposition` is a real `SceneCompositionHandoff` built through `loadCompositionCatalog` and `buildSceneCompositionHandoff`.
- `executionReport` is an experimental normalized adapter report.

The report describes the rendered canvas, optional safe-area insets, named regions, and composition states. It is not a replacement renderer or a general media-analysis schema.

## 4. Normalized execution metadata

All rectangles use absolute pixels relative to the rendered canvas. `(0, 0)` is the top-left corner. Bounds have `x`, `y`, `width`, and `height`; the spike does not support percentages, transforms, rotated rectangles, or polygons.

```ts
interface NormalizedExecutionReport {
  canvas: { width: number; height: number };
  platformSafeArea?: { left: number; top: number; right: number; bottom: number };
  regions?: Array<{
    id: string;
    role: string;
    bounds?: { x: number; y: number; width: number; height: number };
    safeAreaRequired?: boolean;
  }>;
  compositionStates?: Array<{
    stateId: string;
    frameRef: string;
    subjectBindings?: Record<string, string>;
    regionBindings?: Record<string, string>;
  }>;
  holdComparison?: { beforeStateId: string; afterStateId: string };
}
```

## 5. E03 caption/protected-target overlap

E03 compares adapter-declared `caption` and `protected-target` rectangles. Any positive-area intersection is a `fail`; no intersection is a `pass`; absent usable caption or protected-target bounds is `skipped`.

On failure, evidence names both regions and reports the intersection rectangle and area. The check does not perform face detection: the adapter declares which rendered region is protected.

## 6. E05 safe-area compliance

E05 checks only regions explicitly marked `safeAreaRequired: true`. The safe rectangle is derived from the canvas and supplied insets. Every checked rectangle inside it passes; any checked rectangle outside fails; missing safe-area metadata or usable bounds skips the check.

No platform presets are encoded. A future adapter or application chooses the appropriate safe-area insets for its platform context.

## 7. E07 CS-04 HOLD preservation

E07 runs only if the selected `SceneCompositionHandoff` contains `CS-04`. It compares explicitly reported before and after composition states using a small HOLD signature:

- `frameRef`
- authored `subjectBindings`
- authored `regionBindings`

Caption copy and expression state are intentionally absent from the signature because they may change while CS-04 holds composition. Equal signatures pass; a changed signature fails; missing selection or comparison states skips.

## 8. Result contract

The experimental result contains individual, inspectable checks and a mechanical failure flag:

```ts
{
  checks: [{ id: "E03", status: "pass" | "warn" | "fail" | "skipped", message, evidence? }],
  hasFailures: boolean
}
```

It has no overall quality, beauty, confidence, or recommendation score.

## 9. Synthetic fixture

[`vertical-short-mixed.yaml`](../examples/evaluator-spike/fixtures/vertical-short-mixed.yaml) represents one 1080 x 1920 vertical short. It builds a real `CS-04` handoff using `CF-02`, then supplies a synthetic adapter report:

- the caption overlaps `guest-face`, so E03 fails with a 36,000-pixel collision area;
- the caption remains inside the supplied safe area, so E05 passes;
- the before and after HOLD signatures match, so E07 passes.

The fixture contains metadata only. It includes no third-party media, raw video, or visual analysis.

## 10. Test results

`tests/evaluator-spike.test.ts` verifies the canonical mixed report and bounded mutations:

- E03 changes to `pass` when the caption moves away;
- E03 becomes `skipped` without protected-target metadata;
- E05 changes to `fail` outside the supplied safe area;
- E05 becomes `skipped` without safe-area metadata;
- E07 changes to `fail` when the held frame reference changes;
- E07 becomes `skipped` without CS-04 or with a missing comparison state.

## 11. What requires adapter metadata

A future renderer adapter must emit canvas dimensions, safe-area insets when applicable, explicit region IDs and bounds, the opt-in safe-area flag, and before/after composition state signatures. It must also identify which visual regions represent the authored target bindings that the selected contract intends to protect.

## 12. What still requires vision

This spike cannot discover face, product, text, or subject regions from pixels. Detecting undeclared occlusion, verifying product recognizability, evaluating readability from rendered glyphs, or validating a renderer that emits no semantic metadata would require vision-assisted checks or richer upstream metadata.

## 13. Limitations

The spike covers only E03, E05, and E07. It validates rectangles and explicit state identity, not visual quality, asset truth, timing, typography, or causal outcome. The input contract is intentionally experimental and isolated under `examples/evaluator-spike/`; it is not exported from the main API or a production schema.

## 14. Decision

**A — YES: adapter metadata is sufficient for a useful deterministic P0.** The canonical fixture catches a concrete caption collision while independently confirming safe-area compliance and an intentional CS-04 HOLD. The next step, if approved separately, is production contract design for the smallest adapter metadata and evaluator boundary; it is not a renderer adapter or a vision system.
