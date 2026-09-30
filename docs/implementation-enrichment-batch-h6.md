# P2 Implementation Enrichment — Batch H6

Batch H6 adds renderer-neutral proposal guidance to three short-form Patterns and two functional branding Patterns. The records preserve supplied caption, source-role, loop, topic, and participant metadata without deciding their content or appearance.

| Pattern | Fields added | Portable structural behavior | External context / state | Omitted Taste / platform details | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-S02 | visual, timing, implementation | Preserve supplied short caption units and reading order through an authored sequence. | Transcript, segmentation, reading speed, and platform context. | Character count, line count, duration, and caption style. | None. |
| VS-S03 | visual, implementation | Keep speaker and demonstration sources concurrently visible in stable vertical-oriented regions. | Source priority, safe-area profile, and crop or reframing decisions. | Region ratios, geometry, and safe-area coordinates. | None. |
| VS-S04 | visual, timing, implementation | Connect a declared ending and compatible opening state without a terminal stop. | Opening or ending assets, correspondence, narrative intent, and audio decision. | Loop duration and transition treatment. | None. |
| VS-B02 | visual, timing, implementation | Expose current topic state and update its label when supplied topic changes. | Topic hierarchy, copy, and brand system. | Typography and title treatment. | None. |
| VS-B03 | visual, timing, implementation | Bind participant identity and role metadata at an authored introduction beat, then update or retire it. | Participant identity, role or title, introduction timing, and brand system. | Lower-third shape, placement, and brand styling. | None. |

## Review

The current schema is sufficient. `visual` expresses role and association invariants, `timing` marks authored sequences and update boundaries, and `implementation.recipe` accepts portable external state through semantic parameters.

Recurring parameter vocabulary is `utteranceSequence`, `primarySource`, `secondarySource`, `safeAreaProfile`, `loopStatePair`, `boundaryId`, `topicId`, `topicLabel`, `participantId`, and `roleMetadata`. These describe supplied state and relationships, not renderer controls.

No recipe felt forced. Platform context remains an external input: the grammar does not determine caption segmentation, UI geometry, crop aesthetics, or compatible loop states. Branding remains structural only: topic and participant metadata can be bound to content without selecting type, palette, logo, or lower-third appearance.

The C/E exclusions remain semantic-only: VS-B01 has no useful renderer-neutral implementation layer, while VS-B04, VS-B05, and VS-B06 are Taste-dominant. VS-S01 remains covered by the approved P2 spike.
