# Schema decisions

## Three-Pattern Spike — 2026-09-30

- YAML remains the contribution unit. JSON Schema is the portable runtime contract.
- `category` is now the fixed OSS taxonomy from the initial scaffold. This makes invalid-category validation meaningful without introducing a separate taxonomy layer.
- `evidence` changed from one object to a non-empty array. Each item has a required `scope`, so a source observation and an OSS proposal can coexist without giving proposal fields observed provenance.
- An `observed` evidence item must contain `source.name`, `source.location`, `source.category`, and `source.classification`. This preserves source taxonomy and classification without adding them to the Pattern core.
- `description` is optional. A Pattern without an independent source description must not generate one just to satisfy the schema.
- `scope` is a non-empty list of dot paths that identify a Pattern field or subtree, such as `title`, `visual.motion`, or `implementation`. Array indexes, wildcards, and JSONPath are rejected.
- `confidence` remains a `0..1` number. The spike uses `1.0` for briefed source facts and `0.5` for tentative implementation proposals; it does not claim a scientific calibration.
- `visual`, `audio`, `timing`, and `implementation` now validate only the fields exercised by the three samples. They stay optional. No renderer registry, adapter contract, or field-level provenance engine was added.
- Abstract tags such as `typography`, `visual-structure`, and `audio` are `inferred`, not source observations. The OSS category remains a `proposal` mapping.
