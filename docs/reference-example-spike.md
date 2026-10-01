# Reference Example Spike

## 1. Problem observed in real AI usage

Search and Compare can expose plausible Pattern candidates, but prose alone
does not make visual hierarchy, information density, screen occupation,
relationship change, or intentional HOLD easy to compare. The missing step is:

```text
see an example
→ recognize the visual relationship
→ decide whether that direction fits this scene
```

This spike tests Reference Examples as an Agent inspection aid. It does not
automate selection or judge whether a treatment looks good.

## 2. Human reference-selection loop

A human can inspect a reference and say “this direction fits.” The equivalent
Agent flow is:

```text
Search
→ Compare candidates
→ inspect applicable Reference Example metadata and synthetic media
→ explain what would become primary, recede, change, or remain held
→ select with scene context and Taste
```

The example is illustrative evidence of a visual relationship. It is not the
only appearance a concept may take.

## 3. Reference Example responsibility

Reference Examples answer: “what kind of visual relationship does this concept
produce?” They do not answer: “which Pattern wins?”, “what is beautiful?”,
“what renderer settings should be used?”, or “will this perform better?”

Patterns retain the editing job. Frames retain current attention and
relationship. Sequences retain preserve/change/release/restore semantics.
Renderer and Harness retain geometry, typography, timing, animation, assets,
and execution.

## 4. Non-goals

This spike does not change Pattern or Composition schemas, Search ranking,
Handoff behavior, Taste, outcome tracking, embeddings, vector retrieval, or
renderer implementation. It does not add third-party media or a full catalog
of 93 examples.

## 5. Experimental contract

The experimental catalog is
[catalog.yaml](../examples/reference-catalog/catalog.yaml). Each entry contains
only:

- stable ID;
- one target under appliesTo;
- title;
- still or before-after SVG media path;
- demonstrates;
- doesNotDemonstrate;
- synthetic provenance.

doesNotDemonstrate is essential: it keeps a visual sample from being misread as
a renderer preset, copy target, universal Taste, or quality claim. The contract
is validated only by
[reference-examples.test.ts](../tests/reference-examples.test.ts).

## 6. Selected P0 examples

| Target | Media | Visual relationship |
| --- | --- | --- |
| VS-I05 数値ドン | before-after | supplied number becomes primary while context recedes |
| VS-R02 超顔アップ | before-after | selected reaction becomes primary from shared context |
| VS-L03 資料＋PIP | still | material remains primary with a secondary speaker |
| CF-01 group-baseline | still | related subjects share readable context |
| CF-02 selected-person-reaction | before-after | attention shifts from group to selected subject |
| CF-05 text-dominant-over-context | before-after | text gains priority while context remains visible |
| CS-04 HOLD | before-after | subject relation and regions hold while text state changes |

## 7. Synthetic media policy

Every committed asset is a repository-authored SVG with neutral shapes,
abstract labels, and no external imagery. No YouTube, TikTok, TV, CM, film,
audio, screenshot, logo, or clip is copied into this repository.

Research URLs and timecodes remain research evidence. Canonical example media
is a separate synthetic or licensed asset class.

## 8. Agent consumption flow

An Agent can load catalog.yaml, look up a target ID, read demonstrates and
doesNotDemonstrate, and inspect the linked SVG when multimodal visual input is
available. The metadata still communicates the structural relationship when an
Agent cannot inspect media.

No external API, embedding, or vector database is required. Search remains
unchanged:

```text
Search → Candidate Patterns → Compare → inspect Reference Examples → Agent Decision
```

## 9. Results

### VS-I05: prose only versus prose plus example

The Pattern prose identifies numeric emphasis, but does not by itself state
whether the number becomes the first visual priority or whether context
disappears. RE-P-VS-I05 makes the relationship explicit: the number dominates
while context remains visible and secondary. It also excludes font, position,
duration, and animation decisions.

### CF-01, CF-02, and CF-05

The three Frame examples distinguish three relationships that prose can blur:
shared group context, selected-person priority, and text priority over retained
context. The before-after form is useful for CF-02 and CF-05 because the
change of attention is the point; CF-01 is readable as one still.

### CS-04 HOLD

RE-S-CS-04 uses matching before/after subject positions and regions while only
the caption state changes. This makes HOLD legible as an affirmative decision,
not a missing reframe or lack of editing.

### Agent explanation result

**Yes.** With an example plus metadata, an Agent can say what becomes primary,
what remains context, and what renderer responsibility is still unresolved.
The doesNotDemonstrate field prevents that explanation from becoming a renderer
preset.

## 10. Failure cases

The SVGs do not establish aesthetic suitability for a real brand, prove final
render quality, convey motion timing, resolve a particular scene target, or
replace a multimodal Agent’s contextual judgment. Synthetic labels and neutral
figures also cannot validate real-world character, product, or asset
recognition.

## 11. Recommendation

**Decision A — Reference Example Layer is useful. Proceed to production
contract design.**

The spike demonstrates that small synthetic before/after examples plus
machine-readable descriptions improve explanation of visual relationships
without changing Search, selecting an option, or leaking renderer geometry.

This does not change the Evaluator-first priority recorded in the v0.3
direction review. Production design should next decide the external companion
ownership, licensing record, and a minimal stable metadata contract before any
broader example catalog is adopted.
