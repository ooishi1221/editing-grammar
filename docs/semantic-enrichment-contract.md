# Semantic Enrichment Contract

Semantic enrichment is library metadata, not a source observation.

- `tags` classify the Pattern with one to three concise lowercase kebab-case concepts. They are `inferred` evidence at confidence `0.8`, scoped to `tags`.
- `goodFor` gives one or two plausible decision contexts beyond the source purpose. It is `proposal` evidence at confidence `0.5`, scoped with `avoidWhen`.
- `avoidWhen` gives one or two false-positive or decision-boundary contexts where an adjacent Pattern is likely more appropriate. It is `proposal` evidence at confidence `0.5`, scoped with `goodFor`.

The observed catalog facts, source metadata, source classification, and normalized OSS category remain unchanged. Semantic enrichment does not add descriptions, visual or audio details, timing, renderer data, implementation recipes, requirements, failure modes, or related Patterns. Lexical Search remains limited to `id`, `title`, `purpose`, and `category` until a separate review.
