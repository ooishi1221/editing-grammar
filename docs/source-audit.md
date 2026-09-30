# Source audit

## Three-Pattern Spike — 2026-09-30

This is a three-entry source audit only. The full 92-pattern audit is deliberately deferred. No third-party video, image, screenshot, logo, or channel artwork is stored in this repository.

The source facts below are those supplied for this spike from **YouTube Editing / Visual Library Japan v0.3** / **YouTube編集 ビジュアルパターン集**. The source PDF or site content is not present in this repository, so no page or timecode can be recorded here.

| ID | Title | Original category | Stated purpose | Source classification | Available specification | Missing specification |
| --- | --- | --- | --- | --- | --- | --- |
| VS-T11 | 語句強調 | 発話テロップ | 文中の核を目立たせる | 応用デザイン案 | ID, title, category, purpose, classification | Abstract type, motion trigger, duration, scale values, easing, renderer recipe, failure modes |
| VS-I04 | 因果・関係図 | 情報・解説 | 要素の関係を整理 | 応用デザイン案 | ID, title, category, purpose, classification | Abstract type, node/edge rules, layout geometry, motion, timing, renderer recipe, failure modes |
| VS-A03 | 無音・BGM停止 | 音 | 違和感や間をつくる | 応用デザイン案 | ID, title, category, purpose, classification | Abstract type, audio cue, duration, trigger, fade behavior, implementation recipe, failure modes |

### Provenance result

- The source observations are limited to ID, original category, title, purpose, and source classification. Original category and classification are preserved in each YAML at `evidence[].source`.
- Abstract classifications formerly represented as Typography / Visual, Information Layout / Visual Structure, and Audio are not source observations. Their Pattern tags are `inferred`.
- The OSS category mapping (`captions`, `information`, `audio`) is a library choice and is recorded as `proposal` in each YAML's evidence scope.
- `goodFor`, `avoidWhen`, timing, motion/layout/audio details, recipes, and renderer candidates are not supplied source facts. The YAML files mark them as tentative `proposal` with `0.5` confidence.
- `description` is optional and omitted from all three samples because no independent source description was supplied.
