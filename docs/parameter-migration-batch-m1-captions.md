# Parameter Migration Batch M1 — Captions

## Scope

Migrated `implementation.parameters` only for VS-T01, VS-T03, VS-T04, VS-T05, VS-T06, VS-T07, VS-T08, VS-T10, VS-T12, VS-T13, and VS-T14. Recipes, semantic fields, implementation provenance, and all other Pattern data remain unchanged.

## Migration result

- Patterns migrated: 11
- Parameter entries migrated: 18
- Runtime inputs: 17
- Context entries: 0
- Constants: 1

VS-T14's `editorialLayer` is the sole constant because it denotes a grammar-owned layer identity. Every other migrated entry is supplied utterance, speaker, emotion, intensity, annotation, language, or reading-position data required by its recipe.

## Remaining inventory

- Fully declared parameter Patterns: 19, including the original 8 contract-spike Patterns
- Current-contract Patterns still containing legacy scalar parameters: 61
- Legacy scalar parameter entries remaining: 92

The remaining legacy inventory is intentionally retained for later migration batches. Transitional scalar support remains enabled.

## Classification review

No parameter kind was inferred from a scalar value alone. Classification used the Pattern recipe and structural semantics: utterance, speaker, state, and annotation references are runtime inputs; VS-T14's editorial layer is a fixed grammar constant. No classification ambiguity was found in this batch.
