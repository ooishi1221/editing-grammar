# Agent integration

Use Editing Grammar as a retrieval and handoff boundary, not as an automatic director.

1. Derive a concise editing intent from scene meaning.
2. Run Search to retrieve a small candidate set.
3. Use Compare and, when needed, `show` to inspect candidates.
4. Make the contextual selection using tone, brand, reference, and neighboring edits.
5. Gather the selected Pattern's declared runtime inputs and context inputs.
6. Build a Handoff and inspect `unresolved` required keys.
7. Obtain missing scene or application facts; never guess them.
8. Pass the portable handoff to Video Harness or a renderer adapter.

```text
meaning → intent → search → compare → agent selection → handoff → renderer
```

Search ranking is retrieval relevance. Compare has no winner field. Handoff has no renderer selection, conflict resolution, or execution behavior.

For a selected Pattern, use:

```sh
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
```

The downstream system owns assets, geometry, brand styling, timing coordinates, and renderer syntax.
