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

Semantic Enrichment and Recommendation are not part of P0. Current Search uses only `id`, `title`, `purpose`, and `category`.

## Search

Search retrieves plausible candidates from an editing intent; it does not recommend a single best editing decision. It currently matches only the uniformly populated `id`, `title`, `purpose`, and `category` fields.

```sh
npm run search -- "重要語を強調"
npm run search -- "比較したい" --category information
npm run show -- VS-E02
```

`show` returns one Pattern in full, including evidence and provenance. Semantic enrichment is not part of P0 search, so queries that rely on unstated concepts or synonyms may not retrieve an intended Pattern yet.

The [Agent Skill](skills/editing-grammar/SKILL.md) handles semantic query reformulation and candidate comparison; lexical Search remains deterministic retrieval.

## Layout

- `schema/` — portable JSON Schema and TypeScript draft
- `patterns/` — future one-pattern-per-YAML library, grouped by editing domain
- `src/` — future loading, searching, recommendation, validation, and CLI boundaries
- `skills/` — the small agent-facing routing skill
- `docs/` — provenance and schema decisions
- `viewer/` — optional human browser UI, deliberately out of P0 scope

## License

[MIT](LICENSE)
