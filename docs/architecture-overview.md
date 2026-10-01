# Editing Grammar Architecture

## Problem

LLMs can describe editing creatively, while renderers require bounded structured instructions. Editing Grammar connects those layers without turning retrieval relevance into an editorial verdict.

## Layers

```text
Meaning / Intent
→ Pattern Search
→ Candidate Comparison
→ Agent Decision
→ Pattern Grammar
→ optional Composition Pass
→ Scene Handoff
→ Renderer Adapter
```

## Responsibility Boundary

Editing Grammar owns vocabulary, retrieval, comparison data, portable structural grammar, declared inputs, provenance, and handoff validation.

The Agent owns meaning, contextual choice, Taste, brand and reference reasoning, and Pattern selection.

Renderer or Video Harness owns assets, exact geometry, timeline coordinates, fonts and colors, exact animation values, platform implementation, and execution.

## Non-goals

Editing Grammar is not an NLE, renderer, automatic recommender, video editor, asset library, or reference-copying system.

## Current State

P0 through P3 are complete. Current v0.2 development adds an optional
Composition layer without changing the independent Pattern contract.

- 93 total Patterns
- 82 current-contract
- 3 historical-exception
- 8 semantic-only
- 6 reusable Frame References
- 4 Sequence References
- 8 Text Roles

Pattern and Composition selection remain independent. Scene-level Composition
Handoff is optional, and renderer adapters retain ownership of concrete
geometry.

See the [Renderer Handoff Contract](renderer-handoff-contract.md) for the portable downstream boundary.
