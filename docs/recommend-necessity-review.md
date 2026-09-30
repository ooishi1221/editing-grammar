# Recommend Necessity Review

## Current Architecture

The active path is:

```text
User meaning → Agent intent → deterministic Search v2 → small candidate set
→ show selected Patterns → Agent comparison → selection or alternatives
→ renderer / Video Harness handoff
```

Search v2 ranks retrieval relevance from `id`, `title`, `purpose`, `goodFor`, `tags`, and `category`. It does not claim that its first result is the best editing decision. `avoidWhen` remains post-retrieval conflict metadata. The Agent Skill owns intent reformulation, scene interpretation, tone, brand, reference grammar, candidate comparison, and final selection.

## What Recommend Would Need To Do

A hypothetical recommendation input would be:

```text
editing intent
+ retrieved Patterns: purpose, goodFor, avoidWhen, tags, category, provenance
+ context: scene purpose, tone, brand constraints, reference grammar,
  neighboring edits, medium, platform
→ ordered or selected Pattern
```

A deterministic function can expose the retrieved fields, preserve search-match data, and report an exact `avoidWhen` conflict. It cannot correctly interpret whether "calm," "comedic," a specific brand constraint, or an adjacent edit makes one candidate preferable without receiving a pre-interpreted rule. Those inputs require semantic reasoning and scene-level judgment. An LLM-based Recommend layer would therefore repeat the Agent's role; a deterministic one would need fixed policy and would encode taste or incomplete context.

## Architecture A — Search + Agent

| Dimension | Assessment |
| --- | --- |
| Responsibility boundary | Clear: Search retrieves; Agent interprets and selects. |
| Duplicated judgment | None. |
| Determinism and explainability | Retrieval is deterministic; selection is explained by the Agent. |
| Tone, brand, scene context | Fully available to the Agent. |
| Provenance safety | Agent can distinguish observed, inferred, and proposal fields. |
| Schema coupling and maintenance | Low. |
| Agent-host portability | High; any host can search, show, and reason. |
| Rank-1 risk | Mitigated by Skill guidance, but every host must present comparison consistently. |
| Renderer integration | Agent can hand off selected IDs and fields directly. |

This remains sufficient for a capable Agent host, but candidate comparison is currently a convention in the Skill rather than a named output contract.

## Architecture B — Search + Comparator + Agent

| Dimension | Assessment |
| --- | --- |
| Responsibility boundary | Search retrieves; comparator exposes decision-relevant candidate facts; Agent selects. |
| Duplicated judgment | No winner or selection policy is duplicated. |
| Determinism and explainability | Deterministic presentation of stored fields and search metadata. |
| Tone, brand, scene context | Remains with the Agent, where semantic context belongs. |
| Provenance safety | Comparator can surface field provenance without reclassifying it. |
| Schema coupling and maintenance | Moderate and bounded to existing read-only fields. |
| Agent-host portability | High; hosts receive a stable comparison shape. |
| Rank-1 risk | Reduced because multiple candidates and boundaries remain visible. |
| Renderer integration | A selected candidate can pass through unchanged; comparator has no renderer policy. |

This adds a portable interface, not another decision-maker.

## Architecture C — Search + Recommend + Agent

| Dimension | Assessment |
| --- | --- |
| Responsibility boundary | Overlaps with Agent selection unless context is reduced to fixed rules. |
| Duplicated judgment | High: intent interpretation, tradeoffs, and selection occur twice. |
| Determinism and explainability | Deterministic rules are explainable but incomplete; LLM ranking is contextual but repeats Agent reasoning. |
| Tone, brand, scene context | Requires a new context contract or ignores important constraints. |
| Provenance safety | Proposal fields risk being presented as ranking certainty. |
| Schema coupling and maintenance | High: every new context signal invites ranking policy. |
| Agent-host portability | Lower: hosts must adopt the same ranking assumptions. |
| Rank-1 risk | High: an ordered result invites "best Pattern" interpretation. |
| Renderer integration | Encourages passing an opaque winner instead of an explicit decision. |

No demonstrated capability requires this layer today.

## Scenario Review

| Scenario | Search v2 candidates | Information after `show` | Can the Agent decide now? | Added Recommend value |
| --- | --- | --- | --- | --- |
| Ongoing speaker identification vs name/role introduction | VS-T02, VS-B03 | purpose, `goodFor`, reciprocal `avoidWhen` boundaries | Yes: recurring utterance identity versus first introduction | Semantic only; scene timing decides. |
| Speech-position tracking vs Shorts readability | VS-T13, VS-S02 | reading-position versus small-screen sequential-caption contexts | Yes: speech synchronization versus mobile readability | Semantic only; medium and reading speed decide. |
| Emphasize a spoken word vs a factual number | VS-T11, VS-R01, VS-I05 | caption emphasis, reaction emphasis, one-number memorability | Yes: language, reaction, or information task differs | Semantic only; no stable global winner. |
| Compare products on criteria vs show both reactions | VS-I02, VS-L02 | shared-axis comparison versus simultaneous visibility boundaries | Yes: common criterion is explicit in the brief | None beyond exposing the boundary. |
| Explain a document while retaining the speaker | VS-L03, VS-L06 | simultaneous document/speaker visibility and layout purpose | Yes: relative importance of face and material is scene context | Semantic only. |
| Keep dialogue flowing vs mark a new chapter | VS-E02, VS-E04 | smooth continuity versus explicit topic boundary | Yes: transition intent is stated by the scene | None beyond candidate comparison. |
| Leave emotional afterglow vs create abrupt silence | VS-T09, VS-E09, VS-A03 | verbal afterglow, reaction pause, intentional audio interruption | Yes: sound continuity and emotional tone are contextual | Semantic only; ranking would hard-code taste. |
| Explain a procedure vs show current progress | VS-I03, VS-G06 | first-time sequence explanation versus current-state tracking | Yes: teaching versus orientation is a cognitive-task distinction | None beyond reciprocal boundaries. |
| Recap for memory vs summary for later reference | VS-C05, VS-I13 | short retention recap versus structured reference summary | Yes: desired next viewer action decides | Semantic only. |
| Make one number memorable vs compare quantities | VS-I05, VS-I06, VS-I07 | one-value emphasis, visual comparison, precise multi-condition reading | Yes: number count and task are available in the brief | None beyond surfacing alternatives. |
| Preserve cut audio continuity vs intentionally stop music | VS-A08, VS-A03 | continuity versus intentional interruption boundaries | Yes: desired auditory continuity is contextual | Semantic only. |
| Make viewers continue vs ask for a specific response | VS-C01, VS-C03, VS-C04 | opening motivation, follow action, comment participation | Yes: requested viewer action chooses the Pattern | None beyond a comparison shape. |

Across all twelve scenarios, Search v2 can retrieve plausible candidates and `show` exposes enough structured information for Agent selection. Where a further decision is needed, it depends on scene meaning, tone, brand, medium, or neighboring edits rather than a missing deterministic ranking rule.

## Failure Modes

A Recommend engine would risk:

- duplicating Agent intent and context reasoning;
- converting `proposal` metadata such as `goodFor` and `avoidWhen` into false ranking certainty;
- hard-coding taste into global weights or policy;
- ranking from incomplete scene context;
- treating lexical or semantic similarity as editing quality;
- hiding alternatives that are valid for different materials;
- coupling retrieval to selection policy;
- making brand, tone, and reference constraints harder to override;
- encouraging "rank #1 = correct" behavior.

## Candidate Comparison Contract

The useful bounded capability is a read-only Candidate Comparison Contract. It may be formalized later without adding a selector:

```text
CandidateComparison[]
  pattern: id, title, category
  retrieval: matched positive fields, positive score, avoidWhen conflicts
  decision data: purpose, goodFor, avoidWhen, tags
  provenance: evidence summaries and scoped source information
```

It must preserve multiple candidates and their search order, assign no winner, add no global recommendation score, and make no claim that a `proposal` is source-observed. An Agent can then apply its own context to compare candidates before renderer handoff.

## Decision

**B. Do not implement Recommend; formalize Candidate Comparison Contract.**

Search v2 already solves deterministic candidate retrieval, while the Agent already owns the semantic inputs that decide among plausible candidates. A comparator would make the existing comparison discipline portable and explicit without duplicating judgment or converting ranking into taste policy. The decision does not require Search or Pattern-schema changes.

## Implementation status

The Candidate Comparison Contract is implemented as the read-only `buildCandidateComparisons` layer and the `compare` CLI command. It preserves Search v2 order and exposes retrieval metadata, stored semantic decision fields, and complete evidence without a winner, recommendation score, or selection policy.
