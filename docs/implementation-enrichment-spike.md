# P2 Implementation Enrichment Spike

## Scope

This spike adds renderer-neutral library `proposal` metadata to exactly seven Patterns. Each added field has a separate `proposal` evidence entry at confidence `0.5`, scoped only to the added field subtrees. No source production values, renderer candidates, deterministic flags, copyrighted assets, or implementation fields for the remaining 85 Patterns were added.

## Pattern review

| Pattern | Structural behavior encoded | Fields used | External scene context | Renderer-specific details left external | Schema friction |
| --- | --- | --- | --- | --- | --- |
| VS-T02 話者カラー | Detect active speaker; map identity to one stable caption discriminator; keep base caption readable. | `visual`, `timing`, `implementation` | Speaker identity source and caption style system. | Palette, font, glow, and caption renderer. | No dedicated discriminator field; `visual.layout.type` carries the structural role. |
| VS-R01 パンチイン | Temporarily crop or scale around an emphasis target, then return to base framing. | `visual`, `timing`, `implementation` | Which reaction or word deserves emphasis. | Crop algorithm, scale amount, easing, and frame duration. | None; motion and recipe express the behavior without numeric defaults. |
| VS-I02 二項比較 | Keep two subjects aligned to a shared comparison axis with stable criterion correspondence. | `visual`, `implementation` | Actual subjects, criteria, and the comparison claim. | Card styling, typography, and responsive layout rules. | None; portable `subjectCount` and `comparisonAxis` parameters are sufficient. |
| VS-L02 二分割 | Keep two sources simultaneously visible in stable separate regions. | `visual`, `implementation` | Source priority and whether each view needs reframing. | Region geometry, crop strategy, and visual styling. | None; no comparison-axis parameter was added because that is not this Pattern's behavior. |
| VS-A01 インパクトSE | Trigger a short, non-asset-specific audio accent with an emphasis event. | `audio`, `timing`, `implementation` | Which event merits the cue and whether sound is appropriate. | Sound asset, mix level, envelope, and licensing. | None; cue intent is enough for a renderer handoff. |
| VS-E09 間を残す | Preserve an authored reaction or decision pause instead of automatically filling it. | `timing`, `implementation` | Why the pause exists and the beat that ends it. | Exact duration, cut placement, and audio treatment. | None; duration remains intentionally non-numeric. |
| VS-S01 縦画面の安全配置 | Keep critical text and subjects inside externally resolved vertical safe-area geometry. | `visual`, `implementation` | Platform, UI risk zones, and which content is critical. | Pixel coordinates, device geometry, and platform-specific insets. | Safe-area geometry is named but deliberately resolved outside the Pattern. |

## Summary

- **Field sufficiency:** Existing `visual`, `audio`, `timing`, and `implementation` fields express all seven structural behaviors without a schema change.
- **Recipes:** `implementation.recipe` is useful as concise renderer-neutral execution grammar. It describes sequence and invariants without creating an adapter contract.
- **Parameters:** `speakerKey`, `emphasisTarget`, `subjectCount`, `comparisonAxis`, `cueIntent`, and `safeAreaProfile` remain portable because they name semantic inputs rather than fixed values.
- **Schema expansion pressure:** Speaker discrimination and safe-area geometry could motivate richer dedicated fields later, but the spike does not show a representation failure. The current layout and parameter fields carry the needed structure.
- **Taste boundary:** Palette, font, glow, scale amount, easing, exact duration, audio asset, mix level, card styling, crop geometry, and platform coordinates were deliberately omitted. Adding them here would turn portable grammar into appearance or renderer policy.
