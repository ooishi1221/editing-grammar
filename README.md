# Editing Grammar

A structured, agent-readable vocabulary of video editing patterns.

## Purpose

- Structure video-editing expression patterns.
- Let an agent search editing candidates from an intended outcome.
- Treat patterns as candidates, not rules.
- Separate source, inference, and proposal.

## Non-goals

- Build an NLE.
- Replace Premiere Pro or After Effects.
- Copy the appearance of a specific YouTube channel.
- Put 92 patterns into one large prompt.
- Make a web UI the primary product.

## Architecture

```text
Meaning / Intent
        ↓
Editing Grammar Search
        ↓
Candidate Patterns
        ↓
Brand / Tone / Reference Filter
        ↓
Renderer / Video Harness
```

## Current status

**P0 COMPLETE.**

P0 includes:

- audited 92-Pattern source catalog;
- frozen Pattern schema;
- 92 one-pattern-per-YAML files;
- provenance separation: `observed` / `inferred` / `proposal`;
- deterministic validation and Dataset Integrity checks;
- deterministic lexical Search and the `show` command;
- retrieval tests and the Agent Skill workflow.

P0 remains frozen. Semantic enrichment and P2 Implementation Enrichment are complete. P2 adds renderer-neutral structural implementation guidance where useful; eight Taste-dominant or non-useful Patterns intentionally remain semantic-only, and three historical spike records remain documented exceptions. Editing Grammar is not a renderer. See the [Implementation Enrichment Summary](docs/implementation-enrichment-summary.md). Recommend is not implemented.

`implementation.parameters` uses typed declarations for runtime inputs, execution context, and grammar constants.

## Search

Search retrieves plausible candidates from an editing intent; it does not recommend a single best editing decision. The deterministic default is Search v2, which matches `id`, `title`, `purpose`, `goodFor`, `tags`, and `category`. `avoidWhen` is returned as candidate-comparison conflict metadata and never changes ranking. Use `--mode v1` for the frozen v1 lexical baseline.

```sh
npm run search -- "重要語を強調"
npm run search -- "比較したい" --category information
npm run search -- "比較したい" --mode v1
npm run show -- VS-E02
```

`show` returns one Pattern in full, including evidence and provenance. Search is deterministic; Recommend is not implemented. Queries that rely on unstated concepts or synonyms may still need Agent-side intent reformulation.

The [Agent Skill](skills/editing-grammar/SKILL.md) handles semantic query reformulation and candidate comparison; lexical Search remains deterministic retrieval.

## Compare

Compare packages a small Search v2 candidate set as structured JSON with retrieval evidence, decision fields, and provenance. It does not choose the best Pattern.

```sh
npm run compare -- "二つの商品を同じ条件で比較したい"
```

The default limit is 3; `--limit` accepts at most 5.

## Layout

- `schema/` — portable JSON Schema and TypeScript draft
- `patterns/` — future one-pattern-per-YAML library, grouped by editing domain
- `src/` — future loading, searching, recommendation, validation, and CLI boundaries
- `skills/` — the small agent-facing routing skill
- `docs/` — provenance and schema decisions
- `viewer/` — optional human browser UI, deliberately out of P0 scope

## License

[MIT](LICENSE)
