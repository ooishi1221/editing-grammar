# Creative Video Harness Evaluator Handoff

## Process boundary

Creative Video Harness can invoke Editing Grammar as an external process after
it writes one scene evaluation input document:

```text
input JSON/YAML/YML file
  → editing-grammar evaluate <input-file>
  → stdout SceneEvaluationResult JSON
  → process exit code
```

Use `npm run evaluate -- <input-file>` from this repository during local
development. The CLI is the current interoperability boundary; there is no
Python SDK, HTTP server, or IPC protocol.

Exit codes are deterministic:

- `0`: evaluation completed and no check failed. PASS and SKIPPED may coexist.
- `1`: evaluation completed and at least one check failed.
- `2`: input, parse, schema, cross-reference, or evaluator validation error.

Stdout is only the `SceneEvaluationResult` JSON. Diagnostics are written to
stderr.

## Input document

The input document contains these four top-level objects:

```yaml
selectedComposition: {}
expectations: {}
context: {}
executionReport: {}
```

`selectedComposition` is the existing `SceneCompositionInput` shape. The CLI
loads Editing Grammar's production Composition catalog and builds the real
`SceneCompositionHandoff`; callers cannot inject an arbitrary handoff.

`expectations` holds explicit E03/E05/E07 obligations. `context` supplies
named safe-area insets. `executionReport` contains only facts emitted by the
Harness or its renderer adapter.

## Required execution metadata

The future Harness adapter must emit the following in `executionReport`:

### canvas

- `width`
- `height`

Both are positive absolute rendered pixels.

### regions

Each rendered region needs:

- unique `id`
- optional `bounds`: absolute `x`, `y`, `width`, `height`
- optional opaque `authoredIds`

For example, an authored text state `caption-current` can be preserved as an
`authoredIds` entry on rendered `caption-main`; selected subject `guest` can
be preserved on rendered `guest-face`.

### compositionStates

Each execution composition state needs:

- unique `id`
- `frameReferenceId`
- `subjectBindings`
- `regionBindings`

Bindings report the adapter's actual rendered composition relationship. They
contain no renderer geometry.

### stateLineage

Each actual CS-04 relationship needs:

- `sequenceReferenceId`
- `preserveStateIds`
- `beforeStateId`
- `afterStateId`

This tells the Evaluator which before/after execution states realized a
selected HOLD relationship. It does not ask the Agent to author renderer
timeline pairs.

## Harness must not decide policy

The Harness reports execution facts. It must not decide:

- protected target policy;
- `safeAreaRequired` flags;
- aesthetic quality;
- a winner, recommendation, or best Pattern.

The Agent or project authors E03/E05/E07 expectations explicitly. Evaluation
Context supplies safe areas; it does not embed TikTok, YouTube, or Instagram
presets in the Evaluator.

## Initial checks

The production Evaluator currently supports only:

- **E03**: an explicitly named caption region avoids explicitly named regions;
- **E05**: explicitly named regions remain inside a named safe area;
- **E07**: selected CS-04 HOLD frame, subject bindings, and region bindings
  remain stable across emitted state lineage.

Missing observable bounds, optional safe-area context, or missing matching
CS-04 lineage produce `skipped`. Malformed metadata and unknown references produce exit `2`;
they must not be hidden as skipped.
