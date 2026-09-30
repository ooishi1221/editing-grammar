# P2 Implementation Enrichment — Batch H5

Batch H5 adds renderer-neutral proposal guidance to eight game-state Patterns and six retention Patterns. Each record displays, preserves, or updates state supplied by the surrounding application; it does not calculate or choose that state.

| Pattern | Fields added | Portable structural behavior | External state / context | Omitted Taste / platform details | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-G01 | visual, timing, implementation | Present ordered rules before dependent action and retain their activity relation. | Rule content, prerequisite order, and comprehension threshold. | UI styling and presentation duration. | None. |
| VS-G02 | visual, implementation | Preserve participant-to-score correspondence and update supplied score state. | Score data, participant identity, and scoring rules. | Score transition treatment. | None. |
| VS-G03 | visual, timing, implementation | Display remaining state from an authoritative clock and resolve at completion. | Clock source, deadline, and completion semantics. | Countdown appearance. | None. |
| VS-G04 | visual, implementation | Present a question with bounded options without choosing an answer. | Question, options, interaction mode, and correctness logic. | UI chrome and option treatment. | None. |
| VS-G05 | visual, timing, implementation | Hold a supplied result until its authored reveal beat and preserve its source relation. | Result, reveal timing, and truth or calculation. | Reveal animation. | None. |
| VS-G06 | visual, implementation | Preserve a stage sequence, identify the current stage, and expose supplied remaining stages. | Stage model, current state, and updates. | Progress UI styling. | None. |
| VS-G07 | visual, implementation | Keep an active goal available until supplied goal state changes. | Goal, completion state, and priority. | Persistent goal treatment. | None. |
| VS-G08 | visual, implementation | Map supplied value and range to a continuous progress representation. | Value, range, and update events. | Gauge treatment. | None. |
| VS-C01 | visual, timing, implementation | Sequence supplied future beats before the main narrative and retain their source relation. | Teaser selection, spoiler policy, and order. | Opening treatment. | None. |
| VS-C02 | visual, timing, implementation | Present a supplied unresolved question until its authored answer point. | Question, answer timing, and narrative promise. | Suspense wording. | None. |
| VS-C03 | visual, timing, implementation | Present a supplied follow action and destination at an authored CTA beat. | Platform, destination, consent or policy, and copy. | CTA copy and platform assets. | None. |
| VS-C04 | visual, timing, implementation | Present a supplied participation prompt before its response opportunity. | Prompt copy, platform, and response context. | Prompt styling and comment submission. | None. |
| VS-C05 | visual, implementation | Re-present supplied key points as a concise recap while retaining order and grouping. | Key-point selection and ordering. | Recap treatment. | None. |
| VS-C06 | visual, timing, implementation | Hold supplied destination slots during the authored end-state interval. | Destination IDs, platform constraints, and end timing. | Fixed geometry and platform assets. | None. |

## Review

The current schema is sufficient. `visual` holds structural state relationships, `timing` marks supplied authored beats and state intervals, and `implementation.recipe` connects supplied state changes to stable presentation behavior.

Recurring state and parameter vocabulary includes `scoreState`, `resultState`, `currentStage`, `goalState`, `clockState`, `deadlineState`, `progressValue`, `progressRange`, `keyPointList`, `destinationId` / `destinationSet`, `ctaAction`, and `endState`. `ruleSequence`, `questionId`, `optionSet`, `teaserSequence`, `questionState`, and `participationPrompt` remain purpose-specific inputs.

No recipe felt forced. State ownership stays external: this grammar never calculates scores, determines answers or winners, infers goal completion, chooses teaser material, writes CTA copy, selects destinations, or makes consent and platform-policy decisions. No Pattern needs reclassification.

The only overlapping responsibilities with information Patterns are structural, not semantic: VS-G02 renders current supplied score state whereas VS-I11 preserves a supplied ranking; VS-G06 renders current progress whereas VS-I03 explains a procedure; VS-C05 presents a concise retention recap whereas VS-I13 preserves a structured reference summary. Their state inputs and intended decisions remain distinct.
