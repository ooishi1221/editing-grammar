# P2 Implementation Enrichment — Batch H2

Batch H2 adds renderer-neutral proposal guidance for nine reaction Patterns and nine layout Patterns. It encodes structural inputs, state changes, and invariants only; appearance, geometry, timing values, and renderer policy remain external.

| Pattern | Fields added | Portable structural behavior | External context | Omitted renderer / Taste details | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-R02 | visual, timing, implementation | Temporarily reframe a selected face or subject, then restore the base frame. | Target identity and source framing. | Crop geometry and duration. | None. |
| VS-R03 | visual, timing, implementation | Suppress surrounding information while temporarily emphasizing a selected target. | Target and editorial reason for emphasis. | Darkness and zoom treatment. | None. |
| VS-R04 | visual, timing, implementation | Hold a selected frame or beat, then resume source progression. | Freeze point. | Hold duration and annotation treatment. | None. |
| VS-R05 | timing, implementation | Replay a bounded segment in event order, then return to the current timeline. | Replay boundaries. | Playback speed and replay markers. | None. |
| VS-R06 | visual, implementation | Direct attention to a focus target while preserving its visibility. | Focus target. | Line appearance and motion. | None. |
| VS-R07 | timing, implementation | Reduce temporal progression through a selected analysis segment, then restore base playback. | Segment boundaries. | Speed ratio and interpolation. | None. |
| VS-R08 | visual, timing, implementation | Apply a temporary global response to an impact event, then restore frame stability. | Impact event. | Motion path and amplitude. | None. |
| VS-R11 | timing, implementation | Present an ordered reaction sequence while retaining its cumulative context. | Selected reaction beats. | Count and cadence. | None. |
| VS-R12 | visual, implementation | Isolate a selected object or subject while retaining its identity and context. | Target and segmentation or matte source. | Matte, outline, and shadow treatment. | None. |
| VS-L01 | visual, implementation | Keep relevant participants concurrently visible and spatially related. | Participant set, active speaker, and source framing. | Region geometry and camera policy. | None. |
| VS-L03 | visual, implementation | Keep primary material and a speaker source visible with stable role separation. | Source priority. | PIP geometry. | None. |
| VS-L04 | visual, implementation | Preserve primary material while exposing a bounded reaction as a secondary view. | Reaction source and priority. | Circular mask and placement. | None. |
| VS-L05 | visual, timing, implementation | Insert related B-roll across an authored interval while preserving narration continuity. | B-roll asset and entry or exit beats. | Transition style and duration. | None. |
| VS-L06 | visual, implementation | Keep explanatory text and corresponding visual in stable distinct regions. | Hierarchy and reading direction. | Left or right ratio. | None. |
| VS-L07 | visual, implementation | Maintain three distinct stable regions for concurrent sources. | Source priority and comparison intent. | Region geometry. | None. |
| VS-L08 | visual, implementation | Preserve correspondence between paired states of one subject. | State pairing and change point. | Divider and orientation. | None. |
| VS-L09 | visual, implementation | Preserve complete or critical vertical content while resolving unused frame area. | Target frame, crop policy, and source priority. | Background extension style. | None. |
| VS-L10 | visual, implementation | Expose a fine-detail secondary view while retaining its relation to the primary view. | Operation target and source region. | Magnification and window geometry. | None. |

## Review

The current schema is sufficient for this batch. `visual`, `timing`, and `implementation.recipe` express the portable behavior; `implementation.parameters` carries only semantic inputs consumed by each recipe.

Recurring parameter concepts are `targetId` for a directly selected subject or operation target, `segmentId` for a bounded replay, analysis, or insertion interval, and `primarySource` / `secondarySource` for role-bearing two-source layouts. `sourceSet`, `participantSet`, `statePair`, `sourceAspectRatio`, `targetFrame`, `sourceRegion`, `frameTarget`, `impactEvent`, and `reactionSequence` remain specific to their structural inputs.

No recipe felt forced, and no Pattern needs reclassification as Taste-dominant or without a useful implementation layer. There were no parameter naming collisions: `targetId` and `segmentId` retain the same semantic roles across the batch, while source-role parameters are used only where roles are explicit.
