---
name: editing-grammar
description: Retrieve and compare video editing Pattern candidates from a scene's editing intent.
---

# Editing Grammar

## When to use

Use this skill when choosing an editing expression for a scene: captions, emphasis, explanation, layouts, transitions, audio, audience retention, or Shorts.

## Core boundary

Meaning decides the editing intent. Search retrieves Pattern candidates. Patterns are candidates, not rules.

The Agent understands intent, reformulates a query, compares candidates, and presents alternatives when appropriate. The Search CLI remains deterministic and lexical. Reference, brand, tone, and scene context refine a final choice; they do not make the library copy a reference's appearance.

## Workflow

### 1. Understand meaning

Identify what the viewer needs to notice, understand, compare, feel, remember, follow, anticipate, or do next. Start from this cognitive task, not from an effect name.

### 2. Identify a concise editing intent

Turn the meaning into short catalog-oriented wording.

- 「この数字だけ覚えてほしい」 → 「重要な数値を見せる」
- 「誰が話してるか分かりづらい」 → 「話者を識別」
- 「工程の順番を理解させたい」 → 「作業の順番を示す」

### 3. Search

Search only retrieves plausible candidates. Its default deterministic v2 mode matches `id`, `title`, `purpose`, `goodFor`, `retrievalTerms`, `tags`, and `category`. `retrievalTerms` are explicit Pattern-owned lexical vocabulary, not hidden or global query expansion. `goodFor` is evidence of candidate fit; `avoidWhen` is post-retrieval boundary information for comparing candidates and does not affect rank. Use `--mode v1` only when the frozen lexical baseline is specifically needed.

```sh
npm run search -- "話者を識別"
npm run search -- "比較" --category information
npm run search -- "余韻" --limit 8
npm run search -- "比較" --mode v1
```

### 4. Reformulate once or twice if needed

When a conversational query is weak, the Agent must reformulate the intent: shorten it, remove incidental context, replace it with editing-purpose wording, or try an adjacent intent. Do not load all 93 Patterns to compensate.

For example, 「最後ちょっと寂しい感じで終わらせたい」 can be searched as 「余韻」 and then 「感情の場面を区切る」. Do not fabricate Pattern names or add hidden/global search synonyms. Audited Pattern-level `retrievalTerms` may improve lexical recall without changing a Pattern's purpose or making it a recommendation: 「数字を大きく」 can retrieve VS-I05 through explicit retrieval vocabulary. Ambiguous colloquial requests such as 「エモく終わらせたい」 still require Agent-side reformulation.

### 5. Compare a small candidate set

Use `compare` for the top candidates before reading full YAML. It returns structured retrieval evidence, semantic decision fields, and complete provenance; it does not recommend a winner or interpret tone, brand, or reference context.

```sh
npm run compare -- "話者を識別"
```

`show` returns one Pattern in full when comparison identifies a candidate that needs deeper inspection. The expected discipline is search → compare a small candidate list → show relevant IDs if needed → reason; never `loadPatterns()` followed by reading all 93 YAML files by default.

### 6. Compare and select

Compare title, purpose, category, provenance, and available structured fields. Use `goodFor` to judge candidate fit and `avoidWhen` to identify a plausible candidate's decision boundary. Do not invent semantic values when a field is absent.

Search rank #1 is a closer lexical match, not the automatic answer. Compare does not recommend. Consider user meaning, tone, brand, references, scene context, and neighboring edits. Return multiple plausible options when they apply to different editing materials.

### 7. Run a Composition Pass when it adds a semantic relationship

Pattern selection answers **what editing job should happen**. Composition
selection answers **what receives attention and which relationships should
change or stay**. Run this optional pass after Pattern selection when:

- primary attention changes;
- a speaker or reaction subject changes;
- material, evidence, operation, or detail becomes important;
- text temporarily becomes dominant;
- an exact product or package must remain identifiable;
- multiple screen regions change roles;
- neighboring beats need preserve, release, or restore behavior;
- the application baseline is becoming semantically misleading; or
- an intentional HOLD decision is useful.

Omit Composition when the current baseline already communicates the meaning,
neighboring beats retain the same visual relationship, or a change would add
noise. Do not run it mechanically for every Pattern.

The current Composition catalog is deliberately small and may be inspected in
full after Pattern selection: six Frame References (CF-01 through CF-06), four
Sequence References (CS-01 through CS-04), and eight Text Roles. There is no
Composition Search or automatic Pattern-to-Composition mapping.

#### Frame References

- **CF-01 group-baseline** — use when related people or subjects need to remain
  understandable as one shared context.
- **CF-02 selected-person-reaction** — use when one authored person or reaction
  should become primary relative to a broader context.
- **CF-03 contextual-detail-insert** — use when attention temporarily moves to
  an authored object, operation, evidence, or detail.
- **CF-04 material-with-secondary-person** — use when material is primary while
  a speaker or reaction remains secondary.
- **CF-05 text-dominant-over-context** — use when text should temporarily become
  primary while the visual context remains meaningful.
- **CF-06 product-identity** — use when an exact supplied product or package
  must remain identifiable. VS-I15 商品同定・パックショット may independently
  express the editorial job when exact product identification is required; do
  not auto-map either selection to the other.

These are independent choices. Do not encode rules such as VS-R02 → CF-02,
VS-T08 → CF-05, VS-I05 → CF-05, or VS-L05 → CF-03. Those combinations can be
plausible, but scene meaning decides. For example, a loud line may use
text-dominant composition or may remain in a held baseline.

#### Sequence References

Inspect neighboring semantic beats only when a relationship between states
matters. A Sequence Reference is optional and is never a timeline or required
cut plan.

- **CS-01 baseline-to-reaction-to-baseline** — shared context → selected
  person/reaction → shared context. It expresses temporary priority and a
  possible return relationship, not three mandatory cuts.
- **CS-02 explanation-to-supporting-visual-to-return** — explanation → authored
  material/detail → explanation context. The supporting visual must correspond
  to the authored explanation; never invent B-roll.
- **CS-03 persistent-question-to-reaction-or-result** — distinguish what
  persists, changes priority, is released, and is restored. Keep program label,
  question, and answer/result as separate states.
- **CS-04 hold-composition-update-state-only** — use when subject relation,
  main regions, and baseline framing still serve the scene while text or a
  small expression state changes.

CS-04 HOLD is affirmative. Do not change composition merely because a new
utterance begins, captions change, expression changes slightly, or a small
reaction occurs. HOLD is neither missing editing nor lack of coverage.

### 8. Bind declared Pattern inputs

Build each selected Pattern handoff with only known runtime or context inputs.
Inspect its unresolved required keys, obtain missing scene or application facts,
and never guess a missing value or treat a grammar constant as caller input.

~~~sh
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
~~~

Missing implementation fields are intentional for semantic-only Patterns; do
not invent them. Historical exceptions may contain older renderer or Taste
proposals, which require explicit handoff opt-in. Implementation fields remain
library proposal, not source-observed production values.

### 9. Build Pattern Handoff(s)

Inspect selected Patterns with show, then build their portable handoffs. A
single Pattern Handoff is not a timeline or renderer plan.

### 10. Build optional Scene Composition Handoff

The executable source-level path is:

```sh
npx tsx examples/composition-builder.ts
```

It imports `loadCompositionCatalog` and
`buildSceneCompositionHandoff` from `src/composition.ts`. Use it as the
minimal reference for explicit frame selection, target bindings, and sequence
state bindings; it does not select Patterns or renderer geometry.

For an authored Composition Pass:

1. Select Frame References for the states that need a relationship decision.
2. Bind only known target identities, for example CF-02
   selectedSubject = guest, CF-03 detailTarget = screenshot-01 and
   sourceContext = claim-03, CF-04 primaryMaterial = chart-01 and
   secondarySubject = presenter, or CF-06 productIdentity = package-01.
3. Use the Text Role catalog when text state matters:
   persistent-context, speech-caption, reaction-caption, question,
   answer-result, source-proof, product-copy, and cta.
4. Bind neighboring state IDs under preserve, change, release, and restore
   only when a Sequence Reference applies.
5. Build SceneCompositionHandoff and inspect derived unresolved target slots.
6. Attach that already-built, optional composition object to
   SceneImplementationHandoff.

If a required target is unknown, leave it unresolved. Never guess which person
reacted, which product is meant, which asset supports a claim, or which detail
should be shown. Do not use Pattern array order as timeline order.

Text role is not text position. Do not infer persistent, speech, or reaction
role from top, bottom, center, left, or right. Text state can persist, release,
or become active independently of other text states.

### 11. Pass both handoffs downstream

Pass selected Pattern Handoff(s), optional Scene Composition Handoff, and
external context to Video Harness or a renderer adapter. Composition may state
that a selected subject is primary, text dominates context, material is primary
with a secondary person, or a product remains identifiable. It does not set
coordinates, crop, fonts, durations, animation curves, safe-area pixels, or
renderer syntax.

Platform safe area is external platform context. Brand typography, assets, and
concrete execution remain renderer/Harness responsibilities. Editing Grammar is
not a renderer or timeline editor.

### 12. Optionally evaluate execution after rendering metadata exists

The optional Evaluator runs after a renderer or Video Harness has emitted
normalized execution metadata. It does not choose the edit or judge whether it
looks good; it checks explicit authored constraints against execution facts.

Use it when the renderer or Harness can emit region bounds, safe-area
compliance matters, named protected-region constraints exist, or a selected
CS-04 HOLD must be preserved. Omit it when no execution metadata or evaluation
expectations were authored. Do not substitute raw-video inference for missing
metadata.

Author expectations explicitly. For example, `caption-main` may be required to
avoid `guest-face`; this does not mean every caption automatically avoids every
face. The project or Agent owns that obligation before evaluation.

The renderer/Harness reports facts such as canvas dimensions, region bounds,
authored IDs, composition states, and state lineage. It must not put policy
fields such as `protected-target` or `safeAreaRequired` in its execution
report. Evaluation Context supplies named safe-area insets.

Run the process boundary with one JSON, YAML, or YML document containing
`selectedComposition`, `expectations`, `context`, and `executionReport`:

```sh
npm run evaluate -- scene-evaluation.yaml
```

The command writes only `SceneEvaluationResult` JSON to stdout. Exit `0` means
evaluation completed with no failures, `1` means one or more checks failed,
and `2` means input, validation, or cross-reference error. PASS and SKIPPED
may coexist with exit `0`.

## Provenance

- `observed`: directly supported by the source.
- `inferred`: generalized by this library.
- `proposal`: a suggested library or source-proposal-layer value.

Do not describe proposal implementation values as source-observed facts.

## Examples

### Important number

- Meaning: 「重要な数字だけ記憶させたい」
- Intent: 「重要な数値を見せる」
- Search: `npm run search -- "重要な数値"`
- Inspect: `npm run show -- VS-I05`（数値ドン）

### Comparison on one axis

- Meaning: 「二人の違いを同じ条件で比較したい」
- Intent: 「差を同じ軸で比較」
- Search: `npm run search -- "同じ軸で比較"`
- Inspect: `npm run show -- VS-I02`（二項比較）

### Speaker identification

- Meaning: 「誰が話してるか分かりにくい」
- Intent: 「話者を識別」
- Search: `npm run search -- "話者を識別"`
- Inspect: `npm run show -- VS-T02`（話者カラー）

### Ending with an afterglow

- Meaning: 「最後に余韻を残したい」
- Search nearby intents such as `余韻`, `感情の場面を区切る`, and `時間経過余韻`.
- Inspect VS-T09（明朝の余韻）, VS-E06（フェード・ディゾルブ）, and VS-A07（感情・余韻ジングル） rather than forcing one answer; they can suit different editing materials.

## Anti-patterns

Do not:

- load all 93 Patterns by default;
- treat Search rank #1 as the answer;
- choose by popularity or by an arbitrary 「YouTubeっぽく」 label;
- copy a reference's visual appearance;
- treat proposal fields as observed facts;
- invent missing `goodFor` or `avoidWhen`;
- add hidden/global Search synonyms or hard-code Pattern IDs as answers; bounded,
  provenance-scoped Pattern-level `retrievalTerms` are allowed only when they
  provide reusable lexical access rather than a benchmark-specific alias;
- treat one Pattern as universally correct.
- reuse one baseline composition for every semantic beat;
- vary composition merely for visual variety;
- auto-map Pattern IDs to Composition IDs;
- infer missing Composition target bindings;
- treat text position as text role;
- treat Sequence References as mandatory cuts;
- treat Pattern array order as timeline order;
- use the Evaluator to choose Patterns, score aesthetic quality, or infer what
  a renderer did not report;
- put protected-target or safeAreaRequired policy into an Execution Report;
- turn malformed evaluation input into SKIPPED;
- resolve renderer geometry; or
- invent assets.
