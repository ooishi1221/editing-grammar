# Editing Grammar

[![CI](https://github.com/ooishi1221/editing-grammar/actions/workflows/ci.yml/badge.svg)](https://github.com/ooishi1221/editing-grammar/actions/workflows/ci.yml)

Editing Grammar is an agent-readable intermediate layer that turns video-editing intent into portable editing patterns and renderer handoffs.

```text
Editing intent
  → Search
  → Candidate Patterns
  → Compare
  → Agent Selection
  → Portable Handoff
  → Video Harness / Renderer Adapter
```

Patterns are candidates, not rules. Editing Grammar defines structural editing language; an Agent makes contextual editorial decisions; a renderer performs concrete execution. It is not an AI video editor, NLE, renderer, or automatic recommender.

## Quickstart

```sh
git clone https://github.com/ooishi1221/editing-grammar.git
cd editing-grammar
npm ci
npm run validate
```

Validation reports the complete catalog:

```text
93 patterns loaded
93 patterns valid
0 errors
```

Retrieve candidates, compare a small set, then build a handoff for the Pattern the Agent selects:

```sh
npm run search -- "二つの商品を同じ条件で比較したい"
npm run compare -- "二つの商品を同じ条件で比較したい"
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
```

The current search returns `VS-I02 — 二項比較` first for this query. Compare returns structured candidate data rather than a winner. The resolved handoff includes:

```json
{
  "pattern": { "id": "VS-I02", "title": "二項比較" },
  "status": "current-contract",
  "inputs": {
    "suppliedValues": { "comparisonAxis": "price" },
    "unresolved": []
  }
}
```

See [examples/quickstart.md](examples/quickstart.md) for the complete command walkthrough.

## Why the handoff exists

For the intent “compare two products using the same criteria,” Search can retrieve candidate Patterns. The Agent may select `VS-I02` because its purpose is comparison on a shared axis. `comparisonAxis` remains explicit:

```sh
npm run handoff -- VS-I02
```

```json
{ "inputs": { "unresolved": ["comparisonAxis"] } }
```

Supplying the criterion resolves it:

```sh
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
```

This separates Pattern grammar from scene facts. The library does not guess that the comparison axis is price.

## Catalog and provenance

The v0.1.0 release baseline contains the original 92 source-audited Patterns.
Current main is v0.2 development with 93 Patterns:

- **82 current-contract** — portable implementation grammar is available.
- **3 historical exceptions** — older experimental implementation metadata is isolated by default.
- **8 semantic-only** — editorial semantics are useful, but no renderer-neutral execution grammar is invented.

Each field is backed by explicit evidence:

- `observed` — directly supported by a source.
- `inferred` — a library generalization.
- `proposal` — a library suggestion or implementation guidance.

Editing Grammar never silently turns a proposal into a source fact. See [schema decisions](docs/schema-decisions.md), the [semantic enrichment contract](docs/semantic-enrichment-contract.md), and the [implementation enrichment summary](docs/implementation-enrichment-summary.md).

## Agent workflow

```text
Meaning / task
  → reformulate editing intent
  → Search
  → Compare
  → Agent decides
  → Handoff
  → downstream renderer
```

Search rank measures retrieval relevance, **not** an automatic editing decision. Compare does not choose a winner. Handoff assumes that an Agent has already selected one or more Patterns and validates only the declared inputs needed downstream. The [Agent Skill](skills/editing-grammar/SKILL.md) describes this discipline.

## Integration example

Dialogue line: “Wait, why are there six fingers?!”

An Agent may interpret this as a high-intensity reaction or punchline. Illustrative candidates could include strong speech treatment, local emphasis, and an impact cue. They are not selected automatically.

Editing Grammar returns structural grammar plus declared inputs. A Remotion, FFmpeg, or other adapter supplies exact fonts, colors, pixel positions, animation curves, concrete assets, and timeline implementation. [Renderer Handoff Contract](docs/renderer-handoff-contract.md) defines this boundary.

## Public surface

- [Quickstart walkthrough](examples/quickstart.md)
- [Agent integration guide](examples/agent-integration.md)
- [Architecture overview](docs/architecture-overview.md)
- [P3 handoff closeout](docs/p3-renderer-handoff-closeout.md)
- [Renderer Handoff Contract](docs/renderer-handoff-contract.md)
- [JSON Schema](schema/pattern.schema.json)

## Current state

**Release: v0.1.0**

v0.1.0 is the first public contract release of Editing Grammar. P0 through P3 cover source audit, semantic enrichment, implementation grammar, typed input declarations, deterministic Search v2, Candidate Comparison, and Portable Renderer Handoff. Renderer adapters and npm publishing remain out of scope.

## License

[MIT](LICENSE)
