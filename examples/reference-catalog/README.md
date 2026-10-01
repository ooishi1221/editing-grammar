# Experimental Reference Example Catalog

This directory is a P0 spike, not a production catalog or renderer preset
library. Each YAML entry pairs one Pattern, Composition Frame, or Composition
Sequence concept with a synthetic SVG and a machine-readable explanation.

The catalog supports this inspection path:

```text
Search and Compare candidates
→ inspect applicable Reference Example metadata and media
→ Agent decides with scene context and Taste
→ build Handoff
```

Examples illustrate visual relationships only. They do not select a Pattern,
set geometry, prescribe typography, prove quality, or copy third-party media.

All assets in the assets directory are repository-authored synthetic SVGs. They
contain no third-party screenshots, clips, audio, logos, or reference imagery.

The initial spike intentionally contains only:

- Patterns: VS-I05, VS-R02, VS-L03
- Frames: CF-01, CF-02, CF-05
- Sequence: CS-04

catalog.yaml is an experimental metadata contract. It is not part of the
Pattern or Composition production schemas, does not affect Search, and is
validated only by the spike test.
