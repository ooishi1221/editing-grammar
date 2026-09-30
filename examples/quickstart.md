# Quickstart walkthrough

From the repository root:

```sh
npm run validate
```

```text
92 patterns loaded
92 patterns valid
0 errors
```

Search with a concise editing intent:

```sh
npm run search -- "二つの商品を同じ条件で比較したい"
```

```text
5 candidates (v2)
VS-I02 — 二項比較 [information]
  purpose: 差を同じ軸で比較
```

Compare the top three candidates as JSON. This is retrieval evidence and decision data, not a recommendation:

```sh
npm run compare -- "二つの商品を同じ条件で比較したい"
```

```json
[
  {
    "rank": 1,
    "pattern": { "id": "VS-I02", "title": "二項比較", "category": "information" }
  }
]
```

Inspect the selected Pattern when needed:

```sh
npm run show -- VS-I02
```

Build a handoff without the required comparison axis. It remains explicit rather than guessed:

```sh
npm run handoff -- VS-I02
```

```json
{ "inputs": { "unresolved": ["comparisonAxis"] } }
```

Supply the known scene value to resolve the handoff:

```sh
npm run handoff -- VS-I02 --values '{"comparisonAxis":"price"}'
```

```json
{ "inputs": { "suppliedValues": { "comparisonAxis": "price" }, "unresolved": [] } }
```

A semantic-only Pattern returns no invented execution grammar:

```sh
npm run handoff -- VS-B04
```

```json
{ "status": "semantic-only", "grammar": null }
```

Historical metadata is excluded by default. Request it explicitly when a downstream integration needs to inspect older proposals:

```sh
npm run handoff -- VS-T11 --include-historical
```

The result keeps portable grammar separate and returns older metadata only under `historicalMetadata`.
