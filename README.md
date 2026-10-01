# Editing Grammar

[![CI](https://github.com/ooishi1221/editing-grammar/actions/workflows/ci.yml/badge.svg)](https://github.com/ooishi1221/editing-grammar/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/ooishi1221/editing-grammar)](https://github.com/ooishi1221/editing-grammar/releases/latest)
[![MIT License](https://img.shields.io/github/license/ooishi1221/editing-grammar)](LICENSE)

Bad AI video editing often comes from asking a model to invent editing
decisions from scratch. Editing Grammar gives AI agents a structured editing
vocabulary instead:

- Search 93 reusable editing Patterns by intent.
- Compare candidates without forcing a winner.
- Bind explicit scene inputs instead of guessing.
- Apply optional Composition Grammar for attention and shot relationships.
- Hand renderer-neutral instructions to Remotion, FFmpeg, or another video
  pipeline.

Patterns describe why an edit exists. Composition describes what should receive
attention and what should stay, change, disappear, or return. The renderer
decides the pixels.

## Why this exists

“Make this part more impactful” can lead an AI agent to invent random zooms,
arbitrary caption styles, unnecessary layout changes, or renderer-specific
magic numbers.

Editing Grammar keeps the decision boundary explicit:

```text
Meaning
  → Editing Pattern
  → optional Composition
  → explicit Handoff
  → Renderer
```

It is structured editorial grammar, not a prompt collection or an automatic
director.

## 30-second example

Search v2 can retrieve an existing Pattern from a natural-language editing
intent:

```sh
npm run search -- "数字を大きく"
```

This retrieves `VS-I05 — 数値ドン`. Search provides candidates only; the Agent
still compares the result with the scene and makes the editorial choice.

```sh
npm run compare -- "数字を大きく"
npm run handoff -- VS-I05 --values '{"valueId":"value-01","claimId":"claim-01"}'
```

Compare preserves purpose, fit boundaries, and provenance without choosing a
winner. Handoff validates supplied identities and leaves any missing required
input explicit.

## Pattern is not enough

The same short-form scene can need different screen relationships:

```text
two-person context
        ↓
strong reaction
        ↓
numeric reveal
        ↓
same speaker continues
```

An Agent may express that relationship with:

```text
CF-01 group-baseline
        ↓
CF-02 selected-person-reaction
        ↓
VS-I05 + optional CF-05 text-dominant-over-context
        ↓
CS-04 HOLD
```

Composition can change when meaning changes and explicitly HOLD when it should
not. These are Agent choices, not automatic mappings from Pattern IDs.

## Four-layer model

| Layer | Responsibility |
| --- | --- |
| Editing Pattern | Why the edit exists |
| Composition Frame | What receives attention now |
| Composition Sequence | What is preserved, changed, released, or restored |
| Renderer | Exact geometry, font, timing, crop, animation, and assets |

Editing Grammar remains renderer-neutral. Remotion and FFmpeg are downstream
examples, not runtime dependencies.

## What you get

Current v0.2.0 includes:

- 93 Editing Patterns, including 82 current-contract Patterns
- 6 Composition Frame References
- 4 Composition Sequence References
- 8 Text Roles
- Deterministic Search v2 and Candidate Comparison
- Typed Pattern Handoff and optional Scene Composition Handoff
- Explicit unresolved inputs
- Observed / inferred / proposal provenance
- 112 tests and GitHub Actions CI validation

## Quickstart

```sh
git clone https://github.com/ooishi1221/editing-grammar.git
cd editing-grammar
npm ci
npm run validate
```

Validation covers every production catalog:

```text
93 patterns loaded
93 patterns valid
6 composition frame references valid
4 composition sequence references valid
8 composition text roles valid
0 errors
```

Then use the public workflow:

```sh
npm run search -- "数字を大きく"
npm run compare -- "数字を大きく"
npm run show -- VS-I05
npm run handoff -- VS-I05 --values '{"valueId":"value-01","claimId":"claim-01"}'
```

## Composition Grammar

Composition is optional. Use it when scene meaning needs an explicit attention
relationship or a preserve/change/release/restore relationship across nearby
beats.

Run the executable source-level builder example:

```sh
npx tsx examples/composition-builder.ts
```

It loads CF-01 and CF-02, binds authored targets, and uses CS-01 to express a
baseline → reaction → baseline relationship without renderer geometry or
automatic Pattern selection.

## Provenance

AI systems often blur what a source actually showed, what a library inferred,
and what a library merely proposes. Editing Grammar keeps those separate:

- `observed` — directly supported by a source
- `inferred` — a library generalization
- `proposal` — library guidance or a proposed value

The library never silently turns a proposal into a source fact. Search v2
`retrievalTerms` are explicit, Pattern-owned, proposal-provenance vocabulary
for deterministic lexical access; they are not hidden global query expansion.

## What this is not

Editing Grammar is not:

- A renderer
- An NLE
- An automatic director
- An asset generator
- A winner-ranking recommendation engine

It supplies structured editorial grammar to an Agent and a downstream video
system.

## Explore

- [Quickstart walkthrough](examples/quickstart.md)
- [Agent integration guide](examples/agent-integration.md)
- [Composition workflow](examples/composition-agent-workflow.md)
- [Composition builder example](examples/composition-builder.ts)
- [Architecture overview](docs/architecture-overview.md)
- [Renderer Handoff Contract](docs/renderer-handoff-contract.md)
- [Pattern JSON Schema](schema/pattern.schema.json)
- [v0.2.0 Release](docs/releases/v0.2.0.md)

## Who this is for

- AI coding agents building video workflows
- Teams generating video with Remotion or FFmpeg pipelines
- Developers building AI-assisted editors
- Researchers exploring structured editorial reasoning

## Current release

**v0.2.0**

- 93 Patterns: 82 current-contract, 3 historical-exception, 8 semantic-only
- 6 Frame References, 4 Sequence References, and 8 Text Roles

v0.1.0 remains the original source-audited 92-Pattern baseline. v0.2.0 adds
Composition Grammar, Agent Composition workflow, VS-I15 Product Identity, and
Pattern-owned retrievalTerms.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
