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

P0 scaffold only. The schema, TypeScript contracts, contribution boundary, and skill entry point exist; the pattern library, search, recommendation engine, adapters, and viewer do not.

## Layout

- `schema/` — portable JSON Schema and TypeScript draft
- `patterns/` — future one-pattern-per-YAML library, grouped by editing domain
- `src/` — future loading, searching, recommendation, validation, and CLI boundaries
- `skills/` — the small agent-facing routing skill
- `docs/` — provenance and schema decisions
- `viewer/` — optional human browser UI, deliberately out of P0 scope

## License

[MIT](LICENSE)
