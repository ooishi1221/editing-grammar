# Conversion policy

This source-conversion phase preserves catalog provenance without semantic or implementation enrichment.

- Observed data is limited to source ID, title, purpose, and source metadata.
- The normalized OSS category is a library mapping recorded as proposal.
- Required unknown semantic arrays use empty values: goodFor, avoidWhen, and tags.
- Optional absent data is omitted; no description is generated.
- No inferred tags, related patterns, failure modes, visual, audio, timing, or implementation data is added.
- Source detail-dialog production values are deferred for a later proposal-enrichment phase.
- Each audited source Pattern maps to exactly one YAML file.

The three existing spike YAMLs remain unchanged.
