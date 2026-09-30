# P2 Implementation Enrichment — Batch H1

## Scope

This batch enriches exactly eleven caption Patterns. Every added implementation-oriented field is library `proposal` metadata at confidence `0.5`, with a separate scope that names only the added top-level fields. VS-T02 and VS-T11 remain unchanged.

| Pattern | Fields added | Portable behavior | External context | Deliberately omitted Taste / renderer detail | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-T01 | `visual`, `timing`, `implementation` | Segment supplied speech into readable units and keep the current unit readable. | Transcript, language, reading hierarchy. | Type, font, position, animation. | None. |
| VS-T03 | `visual`, `timing`, `implementation` | Apply a stable discriminator for an externally interpreted emotion state. | Emotion classification. | Palette and intensity mapping. | None. |
| VS-T04 | `visual`, `timing`, `implementation` | Attach a short reaction annotation to a selected surprise beat. | Editorial judgment and annotation copy. | Comic style, shape, animation. | None. |
| VS-T05 | `visual`, `timing`, `implementation` | Keep inner voice as a distinct dialogue layer associated with a subject or beat. | Inner-voice classification and subject identity. | Typography and visual voice. | None. |
| VS-T06 | `visual`, `timing`, `implementation` | Bind an offscreen speaker identity to the current utterance while it remains offscreen. | Speaker identity and source. | Label shape and placement. | None. |
| VS-T07 | `visual`, `timing`, `implementation` | Mark an utterance as low-intensity while preserving readability. | Voice-intensity interpretation. | Opacity, size, texture. | None. |
| VS-T08 | `visual`, `timing`, `implementation` | Mark a high-intensity utterance and return to base caption behavior afterward. | Intensity threshold and editorial importance. | Scale, motion, palette, loudness. | None. |
| VS-T10 | `visual`, `implementation` | Bind a bounded clarification to its referenced statement or region. | Clarification copy and hierarchy. | Arrow, card, and placement appearance. | None. |
| VS-T12 | `visual`, `implementation` | Maintain correspondence and separate language identity for source and translation units. | Translation, language direction, reading priority. | Line order, typography, spacing. | None. |
| VS-T13 | `visual`, `timing`, `implementation` | Advance reading position through tokenized utterance alignment while preserving context. | Tokenization, timing data, language segmentation. | Highlight style and granularity. | None. |
| VS-T14 | `visual`, `timing`, `implementation` | Present an authored editorial comment as a layer distinct from speaker dialogue. | Comment content, editorial judgment, insertion beat. | Visual voice and style. | None. |

## Review

- **Schema sufficiency:** The existing `visual`, `timing`, and `implementation` fields express all H1 structural behaviors without a schema change.
- **Recurring parameters:** `utteranceId`, `speakerKey`, `emotionState`, `voiceIntensity`, `annotationTarget`, `languagePair`, `readingPosition`, and `editorialLayer` name portable scene inputs rather than renderer controls.
- **Forced recipes:** None. VS-T03, VS-T07, and VS-T08 depend on external interpretation, but their state-to-caption binding is still a useful structural contract.
- **Taste boundary:** No H1 Pattern needs palette, typography, screen position, motion curve, exact timing, or renderer-specific implementation. None should be reconsidered as Taste-dominant on the basis of this batch.
