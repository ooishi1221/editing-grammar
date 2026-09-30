# P2 Implementation Enrichment — Batch H4

Batch H4 adds renderer-neutral proposal guidance to nine transition Patterns and five audio Patterns. It consumes authored boundaries, temporal decisions, beat data, result states, and ambient sources without choosing those inputs or their aesthetic treatment.

| Pattern | Fields added | Portable structural behavior | External editorial / data context | Omitted Taste / renderer details | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-E01 | timing, implementation | Remove only a supplied interval and join surrounding authored beats with semantic continuity. | Non-essential decision and segment boundaries. | Cut timing and visual treatment. | None. |
| VS-E02 | audio, timing, implementation | Carry one scene audio source across a visual boundary to preserve continuity. | Scene boundary, lead or trail decision, and source audio. | Overlap duration and mix values. | None. |
| VS-E03 | visual, timing, implementation | Compress a longer process into representative ordered moments. | Moment selection, chronology, and narrative importance. | Cadence and transition style. | None. |
| VS-E04 | visual, timing, implementation | Insert an explicit section boundary and retain its label association. | Section hierarchy and title copy. | Title-card styling. | None. |
| VS-E05 | visual, timing, implementation | Move between adjacent states while preserving declared narrative direction. | Direction and source states. | Distance, easing, and blur. | None. |
| VS-E06 | visual, timing, implementation | Use a temporary blended handoff to preserve a declared time-passage or afterglow relationship. | Transition meaning and scene pair. | Blend curve and duration. | None. |
| VS-E07 | visual, timing, implementation | Align an edit around a declared visual correspondence. | Matching elements and edit points. | Automatic visual-match detection. | None. |
| VS-E08 | visual, timing, implementation | State an elapsed interval at a chronology boundary while retaining the surrounding order. | Elapsed interval, label copy, and boundary. | Card style and duration. | None. |
| VS-E10 | timing, implementation | Compress less-important portions of a bounded segment while retaining its designated peak. | Segment, peak event, and compression intent. | Speed curve and ratio. | None. |
| VS-A02 | audio, timing, implementation | Emit a generic notification cue at a supplied information-appearance event. | Event and audio-appropriateness decision. | Asset and gain. | None. |
| VS-A04 | audio, timing, implementation | Align selected editable events to supplied beats while retaining editorial priority. | Beat grid, editable events, and editorial priority. | BPM assumptions and beat treatment. | None. |
| VS-A05 | audio, timing, implementation | Emit a generic directional cue synchronized to a declared movement event. | Movement event and direction. | Asset and mix. | None. |
| VS-A06 | audio, timing, implementation | Map a supplied result state to a distinct feedback cue at its event. | Result truth or state, accessibility needs, and cue asset. | Asset and feedback tone. | None. |
| VS-A08 | audio, timing, implementation | Retain ambient continuity across an authored edit boundary. | Ambient source, room compatibility, and mix decision. | Noise processing and levels. | None. |

## Review

The current schema is sufficient. `timing` carries supplied temporal boundaries and beat relationships, `audio` records cue intent and synchronization without binding an asset, `visual` records only structural transition behavior, and `implementation.recipe` connects supplied inputs to preservation rules.

Recurring parameters are `segmentId`, `scenePair`, and `boundaryId` for authored temporal structures; `direction` and `visualMatch` for declared transitions; and `cueEvent`, `beatGrid`, `editableEvents`, `resultState`, and `ambientSource` for audio timing and continuity. `momentSequence`, `sectionId`, `elapsedInterval`, and `peakEvent` remain specific external inputs.

No recipe felt forced. Audio describes cue identity and synchronization; timing describes the authored event or boundary. The actual asset, mix, and accessibility policy remain external. Beat alignment can conflict with editorial meaning when a beat would move or obscure a more important spoken, narrative, or scene boundary; the recipe explicitly preserves the higher-priority editorial decision. No Pattern needs reclassification.
