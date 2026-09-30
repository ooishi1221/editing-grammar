# Renderer Handoff Contract

## Purpose

Handoff is a portable structural contract between Editing Grammar and Video Harness or renderer adapters. It is not a renderer plan: it chooses no renderer, resolves no geometry or assets, and performs no rendering.

## Shape

An `ImplementationHandoff` contains Pattern identity, status, portable grammar, typed input declarations, supplied values, unresolved required inputs, implementation provenance, and optional scene, brand, and platform context. `SceneImplementationHandoff` wraps ordered handoffs without resolving conflicts or shared inputs.

## Status

- `current-contract`: P2 implementation grammar under the current contract.
- `historical-exception`: a safe portable projection of VS-T11, VS-I04, or VS-A03.
- `semantic-only`: no execution grammar is supplied.

## Inputs

`inputs.declarations` copies Pattern parameter declarations. `inputs.suppliedValues` contains only valid caller values. Required runtime or context inputs that are absent remain in `inputs.unresolved`; optional inputs do not. Constants are neither unresolved nor caller-overridable.

Values are validated only at the declared top-level type: string, finite number, boolean, array, or non-null non-array object. Context is passed through unchanged and never implicitly satisfies a declaration.

## Historical exceptions

Default historical handoffs exclude older renderer or Taste proposals. `includeHistoricalMetadata: true` returns those excluded values under `historicalMetadata`, without moving them into portable grammar.

## Semantic-only Patterns

Semantic-only handoffs are valid with `grammar: null`, empty declarations, empty supplied values, empty unresolved inputs, and no implementation evidence.

## Multi-Pattern Wrapper

`buildSceneImplementationHandoff` preserves selection order and duplicates. It performs no reranking, timing order, shared-input inference, or conflict resolution.

## Examples

```sh
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
npm run handoff -- VS-T11 --include-historical
```

Video Harness or an adapter supplies concrete assets, timing, geometry, brand system, platform constraints, renderer syntax, and execution.
