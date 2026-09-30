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

Search only retrieves plausible candidates. It currently matches `id`, `title`, `purpose`, and `category`; it does not rank `tags`, `goodFor`, `avoidWhen`, descriptions, or implementation fields.

```sh
npm run search -- "話者を識別"
npm run search -- "比較" --category information
npm run search -- "余韻" --limit 8
```

### 4. Reformulate once or twice if needed

When a conversational query is weak, shorten it, remove incidental context, replace it with editing-purpose wording, or try an adjacent intent. Do not load all 92 Patterns to compensate.

For example, 「最後ちょっと寂しい感じで終わらせたい」 can be searched as 「余韻」 and then 「感情の場面を区切る」. Do not fabricate Pattern names or add hidden search synonyms.

### 5. Inspect a small candidate set

Read only the relevant candidates returned by search.

```sh
npm run show -- VS-T02
```

`show` returns the full Pattern, including evidence and provenance. The expected discipline is search → small candidate list → show relevant IDs → reason; never `loadPatterns()` followed by reading all 92 YAML files by default.

### 6. Compare and select

Compare only fields that are present: title, purpose, category, provenance, and any available structured fields. Do not invent `goodFor` or `avoidWhen` when their arrays are empty.

Search rank #1 is a closer lexical match, not the automatic answer. Consider user meaning, tone, brand, references, scene context, and neighboring edits. Return multiple plausible options when they apply to different editing materials.

### 7. Hand off implementation when requested

Pass only selected Pattern IDs and relevant fields to the downstream renderer or Video Harness. Editing Grammar is not a renderer or timeline editor.

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

- load all 92 Patterns by default;
- treat Search rank #1 as the answer;
- choose by popularity or by an arbitrary 「YouTubeっぽく」 label;
- copy a reference's visual appearance;
- treat proposal fields as observed facts;
- invent missing `goodFor` or `avoidWhen`;
- add hidden Search synonyms, modify YAML for one query, or hard-code Pattern IDs as answers;
- treat one Pattern as universally correct.
