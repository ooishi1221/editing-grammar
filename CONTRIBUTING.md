# Contributing

## Pattern rules

- Keep one Pattern per YAML file under `patterns/`.
- Treat Patterns as candidates, not rules or universal recommendations.
- Preserve `observed`, `inferred`, and `proposal` provenance separately.
- Do not copy third-party images, video, logos, or audio into this repository.
- Add implementation values only with `proposal` provenance; do not present them as source facts.
- Current `implementation.parameters` must use typed declarations for runtime inputs, context, or constants.
- New Pattern IDs must be explicitly classified for Portable Handoff. They must never silently fall into `current-contract`.

Before opening a PR, review distinctness against similar Patterns and run:

```sh
npm ci
npm run build
npm run validate
npm test
```

The schema and validation rules are the source of truth for data shape. See [schema decisions](docs/schema-decisions.md) and the [Renderer Handoff Contract](docs/renderer-handoff-contract.md).
