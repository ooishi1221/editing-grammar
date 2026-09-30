# Implementation Coverage Audit

## Summary

This audit reviews the 85 Patterns outside the approved seven-Pattern P2 spike. It asks whether a renderer-neutral structural proposal would add useful execution grammar; it does not require every Pattern to gain implementation fields.

| Bucket | Count | Meaning |
| --- | ---: | --- |
| A. Structurally enrichable | 18 | Portable trigger, state change, and invariant can be stated directly. |
| B. Enrichable but context-dependent | 59 | Portable behavior exists, but scene inputs determine how it is used. |
| C. Taste-dominant | 7 | Additional guidance would mainly prescribe aesthetic policy. |
| D. Schema-friction | 0 | No audited Pattern has a portable behavior the current schema cannot express. |
| E. No useful implementation layer | 1 | Semantic intent remains useful, but renderer-neutral instructions would be tautological. |

The 77 A/B Patterns are candidates for bounded future work, not a mandate to enrich them all. The eight C/E Patterns should remain semantic-only unless a later, non-Taste need is demonstrated.

### Historical three-Pattern spike

| Pattern | P2 contract status | Audit treatment |
| --- | --- | --- |
| VS-T11 語句強調 | Partial historical exception | Its token-level recipe is useful, but numeric motion defaults, easing, and renderer candidates do not match the new P2 portability boundary. Its proposal scope also combines semantic and implementation fields. Preserve unchanged. |
| VS-I04 因果・関係図 | Partial historical exception | Node/relationship structure is useful, but renderer candidates and combined semantic/implementation proposal scope predate P2. Preserve unchanged. |
| VS-A03 無音・BGM停止 | Partial historical exception | The edit-point and music-bed behavior is useful, but renderer candidates and combined proposal scope predate P2. Preserve unchanged. |

## Pattern Matrix

`Fields` lists the portable fields worth considering in a later proposal. `—` means no useful portable addition. No row authorizes an implementation change.

### Captions

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-T01 | 標準字幕 | captions | B | visual, timing, implementation | Segment utterances and keep the active text readable. | Transcript, hierarchy, language. | Type, font, position, animation. | — |
| VS-T03 | 感情カラー | captions | B | visual, timing, implementation | Attach one emotion discriminator to the active utterance. | Emotion interpretation and speaker intent. | Palette and intensity mapping. | — |
| VS-T04 | ツッコミ | captions | B | visual, timing, implementation | Insert a short reaction annotation at the surprise beat. | What is surprising and editorial voice. | Copy, shape, animation, styling. | — |
| VS-T05 | 心の声 | captions | B | visual, timing, implementation | Separate inner-voice text from spoken dialogue. | What counts as inner voice. | Typography and treatment. | — |
| VS-T06 | 画面外話者 | captions | B | visual, timing, implementation | Attribute an utterance to an offscreen speaker. | Speaker identity and source. | Label design and placement. | — |
| VS-T07 | 小声・ささやき | captions | B | visual, timing, implementation | Mark low-intensity speech while retaining legibility. | Voice-intensity interpretation. | Type scale, opacity, texture. | — |
| VS-T08 | 絶叫・大声 | captions | B | visual, timing, implementation | Mark a voice-intensity peak at its utterance. | Voice-intensity threshold. | Scale, motion, palette, audio mix. | — |
| VS-T09 | 明朝の余韻 | captions | C | — | The semantic pause is useful, but the named expression is typographic mood. | Scene tone and text. | Typeface, spacing, animation, mood. | — |
| VS-T10 | 注釈・補足 | captions | B | visual, implementation | Attach a bounded clarification to its referenced statement. | Claim needing clarification and hierarchy. | Annotation style and placement. | — |
| VS-T11 | 語句強調 | captions | B | existing visual, implementation | Mark a caption token and emphasize only that token. | Keyword choice. | Existing numeric scale, easing, and renderer candidates remain historical. | No schema gap; historical scope is partial. |
| VS-T12 | 二言語字幕 | captions | B | visual, implementation | Keep original and translation aligned as paired text. | Translation, reading priority, language direction. | Typography, line order, spacing. | — |
| VS-T13 | 逐語・追従字幕 | captions | B | visual, timing, implementation | Advance a visible reading position through utterance tokens. | Token timing and language segmentation. | Highlight treatment and timing granularity. | — |
| VS-T14 | 編集者コメント | captions | B | visual, timing, implementation | Add a distinct editorial layer without merging it into dialogue. | Editorial judgment and comment timing. | Voice, copy, styling, placement. | — |

### Reactions

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-R02 | 超顔アップ | reactions | B | visual, timing, implementation | Reframe around a selected face and restore the wider view. | Subject selection and framing source. | Crop geometry, scale, duration. | — |
| VS-R03 | 暗転＋ズーム | reactions | B | visual, timing, implementation | Suppress surrounding detail and emphasize one target. | Target and emphasis reason. | Darkness, contrast, zoom amount, easing. | — |
| VS-R04 | フリーズ | reactions | A | visual, timing, implementation | Hold a selected frame for inspection, then resume. | Frame selection. | Hold length and annotation styling. | — |
| VS-R05 | リプレイ | reactions | A | timing, implementation | Replay a bounded event segment while preserving its order. | Segment start/end. | Replay speed, markers, audio treatment. | — |
| VS-R06 | 集中線 | reactions | B | visual, implementation | Direct attention toward one selected center. | Focus target. | Line style, density, color, motion. | — |
| VS-R07 | スローモーション | reactions | A | timing, implementation | Reduce playback speed for a selected motion-analysis segment. | Segment boundaries. | Speed ratio, interpolation, audio behavior. | — |
| VS-R08 | 画面シェイク | reactions | A | visual, timing, implementation | Apply a brief global impact response at an event. | Impact event. | Shake path, amplitude, duration. | — |
| VS-R09 | モノクロ落胆 | reactions | C | — | The meaning is emotional contrast; implementation would be a color-grade policy. | Emotional interpretation. | Monochrome grade, contrast, transition. | — |
| VS-R10 | マンガ吹き出し | reactions | C | — | A reaction symbol is useful, but its appearance dominates the implementation. | Reaction content and timing. | Bubble language, shape, type, illustration. | — |
| VS-R11 | リアクション連打 | reactions | A | timing, implementation | Repeat bounded reaction beats while retaining their sequence. | Which reactions to accumulate. | Count, cadence, transition treatment. | — |
| VS-R12 | 対象の切り抜き強調 | reactions | B | visual, implementation | Isolate a selected object from surrounding material. | Target identity and segmentation source. | Matte quality, outline, shadow, crop. | — |

### Information

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-I01 | 定義カード | information | A | visual, timing, implementation | Present a term with its bounded definition at first use. | Term and definition content. | Card styling, type, entrance. | — |
| VS-I03 | ステップ図解 | information | A | visual, implementation | Render ordered steps with stable sequence correspondence. | Steps and dependencies. | Diagram styling and geometry. | — |
| VS-I04 | 因果・関係図 | information | B | existing visual, implementation | Render labeled nodes and directional relationships. | Concepts, relation labels, hierarchy. | Existing renderer candidates and layout styling remain historical. | No schema gap; historical scope is partial. |
| VS-I05 | 数値ドン | information | A | visual, timing, implementation | Present one selected value as a distinct information beat. | Value selection and claim context. | Scale, type, motion, color. | — |
| VS-I06 | 棒グラフ | information | A | visual, implementation | Map comparable quantities to aligned visual lengths. | Data, units, scale, labels. | Chart style, axis treatment, animation. | — |
| VS-I07 | データ表 | information | B | visual, implementation | Keep rows and columns aligned for exact multi-condition reading. | Data schema, sorting, reading priority. | Table styling, pagination, responsive geometry. | — |
| VS-I08 | タイムライン | information | A | visual, implementation | Map events into an ordered chronological sequence. | Events, dates, chronology scale. | Axis design, spacing, animation. | — |
| VS-I09 | 矢印・囲み | information | B | visual, timing, implementation | Bind an annotation to a selected detail. | Target coordinates and annotation content. | Arrow form, stroke, motion, label style. | — |
| VS-I10 | 地図・ルート | information | B | visual, implementation | Map locations and an ordered path between them. | Geographic data, route, projection. | Map source, camera, line style, labels. | — |
| VS-I11 | ランキング | information | B | visual, implementation | Order candidates by an external ranking rule. | Rank data, tie policy, criteria. | Table/card style and transition. | — |
| VS-I12 | 引用カード | information | B | visual, implementation | Separate quoted material from the current narrator layer. | Quote text, attribution, hierarchy. | Card type, typography, animation. | — |
| VS-I13 | 箇条書きまとめ | information | A | visual, implementation | Render a stable list of independently scannable key points. | Point selection and order. | Bullet style, line breaks, reveal timing. | — |
| VS-I14 | 出典・条件表示 | information | B | visual, implementation | Bind a claim to its source or applicability condition. | Source text, condition, legal wording. | Placement, type scale, disclosure policy. | — |

### Layout

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-L01 | 全体引き・対談 | layout | B | visual, implementation | Keep participating speakers and their relationship visible. | Participant count, active speaker, source framing. | Region geometry, crop, camera policy. | — |
| VS-L03 | 資料＋PIP | layout | B | visual, implementation | Keep material and speaker concurrently visible. | Material priority and speaker source. | PIP size, shape, placement. | — |
| VS-L04 | 丸ワイプ | layout | B | visual, implementation | Add a bounded reaction view while preserving primary material. | Reaction source and priority. | Circular mask, border, position. | — |
| VS-L05 | B-roll差し込み | layout | B | visual, timing, implementation | Insert a related visual while preserving narration continuity. | B-roll selection and in/out beats. | Asset, crop, duration, transition. | — |
| VS-L06 | 映像＋文字の左右構成 | layout | B | visual, implementation | Separate explanatory text from its visual target in stable regions. | Content hierarchy and reading direction. | Region ratios, typography, spacing. | — |
| VS-L07 | 三分割 | layout | B | visual, implementation | Keep three sources visible in distinct stable regions. | Source priority and comparison task. | Region geometry, crop, styling. | — |
| VS-L08 | 上下・ビフォーアフター | layout | A | visual, implementation | Maintain correspondence between two states of the same subject. | Subject pairing and change point. | Divider, labels, crop alignment. | — |
| VS-L09 | 縦素材の背景拡張 | layout | B | visual, implementation | Fit vertical material into a different frame while preserving the source. | Source aspect ratio and target frame. | Background fill, blur, crop policy. | — |
| VS-L10 | 手元・操作の拡大窓 | layout | B | visual, implementation | Expose a selected fine operation in a secondary view. | Operation target and source region. | Magnification, mask, position. | — |

### Transitions

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-E01 | ジャンプカット | transitions | B | timing, implementation | Remove a selected non-essential interval and join adjacent beats. | Editorial meaning of removable material. | Cut smoothing, visual continuity, audio repair. | — |
| VS-E02 | J・Lカット | transitions | B | audio, timing, implementation | Carry one scene's audio across an adjacent visual boundary. | Dialogue and scene boundary selection. | Audio overlap duration, mix, cut shape. | — |
| VS-E03 | モンタージュ | transitions | A | visual, timing, implementation | Sequence representative process moments while compressing elapsed work. | Moment selection and chronology. | Cadence, asset treatment, transition style. | — |
| VS-E04 | 章扉 | transitions | B | visual, timing, implementation | Insert a labeled boundary before a new topic section. | Topic hierarchy and label copy. | Title card style, animation, duration. | — |
| VS-E05 | 横スライド | transitions | B | visual, timing, implementation | Move between adjacent states with a declared directional relation. | Narrative direction and sources. | Distance, easing, motion blur. | — |
| VS-E06 | フェード・ディゾルブ | transitions | B | visual, timing, implementation | Blend adjacent scenes to mark time passage or afterglow. | Meaning of the transition. | Blend curve, duration, color treatment. | — |
| VS-E07 | マッチカット | transitions | B | visual, timing, implementation | Join two shots using a declared visual correspondence. | Matching elements and edit points. | Match tolerance, camera transform, transition polish. | — |
| VS-E08 | 時間経過カード | transitions | A | visual, timing, implementation | Insert an explicit elapsed-time notice at a chronology gap. | Time interval and copy. | Card style, timing, type. | — |
| VS-E10 | 速度ランプ | transitions | B | timing, implementation | Compress selected motion while retaining a designated peak. | Peak event and segment boundaries. | Speed curve, interpolation, audio handling. | — |

### Audio

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-A02 | ポップ・通知SE | audio | A | audio, timing, implementation | Emit a short non-asset-specific cue when information appears. | Information event and whether cue is appropriate. | Sound asset, gain, envelope. | — |
| VS-A03 | 無音・BGM停止 | audio | B | existing audio, timing, implementation | Stop or mute a music bed at a chosen contrast beat. | Beat choice and music context. | Existing renderer candidates and cue wording remain historical. | No schema gap; historical scope is partial. |
| VS-A04 | BGMの拍に合わせる | audio | B | audio, timing, implementation | Align editable beats to detected or supplied music beats. | Beat grid, music rights, edit priority. | Track, beat detection, mix and tolerance. | — |
| VS-A05 | スイッシュ | audio | B | audio, timing, implementation | Synchronize a transition cue to a declared screen movement. | Movement event and direction. | Sound asset, gain, envelope. | — |
| VS-A06 | 正解・不正解音 | audio | A | audio, timing, implementation | Emit distinct feedback cues for a declared result state. | Result state and accessibility needs. | Sound assets, loudness, style. | — |
| VS-A07 | 感情・余韻ジングル | audio | C | — | Emotional boundary is useful, but musical expression is asset and taste policy. | Tone and emotional beat. | Composition, asset, mix, licensing. | — |
| VS-A08 | 環境音・ルームトーン | audio | A | audio, timing, implementation | Maintain compatible bed continuity across an edit. | Ambient source and room context. | Recorded asset, noise treatment, mix. | — |

### Game UI

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-G01 | ルール説明 | game_ui | B | visual, timing, implementation | Present rule items before dependent participation. | Rules, sequence, comprehension threshold. | UI style, reveal cadence, copy. | — |
| VS-G02 | スコア表示 | game_ui | B | visual, implementation | Render current competitive state from supplied score data. | Scores, labels, update events. | Scoreboard style, animation, placement. | — |
| VS-G03 | カウントダウン | game_ui | B | visual, timing, implementation | Render a decreasing remaining-time state from a clock source. | Clock source, deadline semantics. | Type, cadence, alert sound. | — |
| VS-G04 | 問題・選択肢 | game_ui | B | visual, implementation | Present a question and bounded selectable options. | Question, option set, interaction mode. | UI hierarchy, selection treatment. | — |
| VS-G05 | 結果発表 | game_ui | B | visual, timing, implementation | Reveal a declared result after its decision beat. | Result and reveal timing. | Reveal animation, sound, styling. | — |
| VS-G06 | 進捗・ステップ表示 | game_ui | B | visual, implementation | Render current stage and remaining sequence from progress state. | Stage model and update event. | Progress UI style and placement. | — |
| VS-G07 | ミッション・目標 | game_ui | B | visual, implementation | Keep a declared goal visible while it remains relevant. | Goal, completion state, priority. | UI style, persistence rule, placement. | — |
| VS-G08 | ゲージ・達成率 | game_ui | B | visual, implementation | Map supplied progress values to a continuous displayed state. | Value source, range, update cadence. | Gauge style, easing, thresholds. | — |

### Branding

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-B01 | チャンネルマーク | branding | E | — | A mark identifies origin, but "render the mark" adds no useful renderer-neutral grammar. | Brand asset and usage policy. | Logo, placement, size, animation. | — |
| VS-B02 | 番組・話題見出し | branding | B | visual, timing, implementation | Present the current topic label at a section state change. | Topic hierarchy and label copy. | Brand type, card system, animation. | — |
| VS-B03 | ローワーサード | branding | B | visual, timing, implementation | Bind name and role metadata to a participant introduction. | Identity, role, introduction timing. | Brand typography, placement, motion. | — |
| VS-B04 | マンガ・ゲーム装飾 | branding | C | — | The category is an appearance treatment rather than portable execution grammar. | Tone and brand policy. | Illustration, symbols, palette, texture. | — |
| VS-B05 | 紙メモ・質感ベース | branding | C | — | Friendly explanatory texture is aesthetic policy. | Tone and content hierarchy. | Paper texture, handwriting, palette, type. | — |
| VS-B06 | 画面枠・レターボックス | branding | C | — | Tone separation through framing is primarily visual policy. | Desired tone and media format. | Frame geometry, color, aspect ratio. | — |

### Retention

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-C01 | 冒頭ダイジェスト | retention | B | visual, timing, implementation | Sequence selected future beats before the main narrative. | Teaser selection, spoiler policy, order. | Montage cadence, copy, transition. | — |
| VS-C02 | 疑問・先出し | retention | B | visual, timing, implementation | State an unresolved question before its answer is available. | Question, answer timing, narrative promise. | Copy, type, animation. | — |
| VS-C03 | 登録・フォロー案内 | retention | B | visual, timing, implementation | Present a follow action with its external destination. | Platform, destination, consent, timing. | CTA style, animation, copy. | — |
| VS-C04 | コメント誘導 | retention | B | visual, timing, implementation | Present a specific participation prompt before the response opportunity. | Prompt, platform, timing. | Copy, CTA styling, placement. | — |
| VS-C05 | 要点のおさらい | retention | A | visual, implementation | Re-present selected key points as a concise end-state recap. | Key-point selection and order. | List style, reveal timing, CTA adjacency. | — |
| VS-C06 | エンド画面 | retention | B | visual, timing, implementation | Present next-destination slots at the end-state. | Destination links, platform rules, timing. | Card layout, animation, branding. | — |

### Shorts

| ID | Title | Category | Bucket | Fields | Structural behavior | External context | Taste / renderer boundary | Friction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-S02 | 短文・逐次字幕 | shorts | B | visual, timing, implementation | Segment speech into sequential short caption units for small screens. | Transcript, language, reading speed, platform. | Typography, cadence, placement. | — |
| VS-S03 | 縦の上下分割 | shorts | B | visual, implementation | Keep demonstration and speaker in stable vertical regions. | Source priority, safe area, reframing. | Region geometry, crop, styling. | — |
| VS-S04 | ループ接続 | shorts | B | timing, implementation | Connect the ending state to a compatible opening state. | Opening/ending assets and narrative intent. | Match treatment, duration, sound transition. | — |

## Category Summary

| Category | Audit profile | Notes |
| --- | --- | --- |
| captions | Mostly contextual | Speech, speaker identity, language, and hierarchy are external; structure is still reusable. |
| reactions | Mixed | Freeze, replay, slow motion, shake, and repetition are structural; monochrome and manga treatments are Taste-driven. |
| information | Highly reusable | Diagrams, ordered structures, values, and annotations have clear portable grammar, with data inputs external. |
| layout | Mostly contextual | Stable multi-source layouts are reusable, but source priority and geometry remain scene-specific. |
| transitions | Mixed | Compression and chronology are reusable; editorial beat choice and transition polish remain contextual. |
| audio | Mixed | Cue synchronization and continuity are structural; emotional music and assets remain Taste-driven. |
| game_ui | Mostly contextual | State-display grammar is reusable but depends on externally supplied rule, score, goal, and progress models. |
| branding | Mostly Taste-driven | Topic and identity labels have structure; marks and decorative treatments remain brand policy. |
| retention | Mostly contextual | The temporal prompt structure is reusable; teaser, CTA, and destination choices remain editorial and platform-dependent. |
| shorts | Mostly contextual | Sequential captions, split regions, and loop connections are reusable but depend on platform and source geometry. |

## Implementation Contract Review

The approved P2 contract still holds. Implementation enrichment should remain:

- renderer-neutral;
- structural rather than appearance-prescriptive;
- `proposal` provenance with scoped evidence;
- free of exact Taste values and source production-value claims;
- free of renderer-specific assumptions;
- optional when it adds no useful execution grammar.

`visual`, `audio`, `timing`, and `implementation` are sufficient for all A/B rows. The recurring concepts of speaker discriminator and externally resolved safe-area geometry are expressible through existing layout and parameter fields. They do not create a demonstrated schema gap. Categories C/E should remain without implementation fields rather than receiving generic filler.

## Bounded Enrichment Plan

The following are review batches only. No batch is authorized by this audit, and no batch exceeds 20 Patterns.

| Batch | Pattern IDs | Shared structural grammar | Likely fields | Expected risk |
| --- | --- | --- | --- | --- |
| H0: historical exceptions | VS-T11, VS-I04, VS-A03 | Reconcile historical proposal scopes and renderer-specific fields against P2 without rewriting source facts. | Review only | High: provenance and freeze sensitivity. |
| H1: caption behaviors | VS-T01, VS-T03, VS-T04, VS-T05, VS-T06, VS-T07, VS-T08, VS-T10, VS-T12, VS-T13, VS-T14 | Utterance segmentation, attribution, annotation, and reading-state behavior. | visual, timing, implementation | Medium: transcript, speaker, and language inputs remain external. |
| H2: reaction and layout structures | VS-R02, VS-R03, VS-R04, VS-R05, VS-R06, VS-R07, VS-R08, VS-R11, VS-R12, VS-L01, VS-L03, VS-L04, VS-L05, VS-L06, VS-L07, VS-L08, VS-L09, VS-L10 | Targeted emphasis, replay, multi-source visibility, and source preservation. | visual, timing, implementation | Medium: subject selection, crop, and geometry must stay external. |
| H3: information structures | VS-I01, VS-I03, VS-I05, VS-I06, VS-I07, VS-I08, VS-I09, VS-I10, VS-I11, VS-I12, VS-I13, VS-I14 | Definitions, sequence, values, comparisons, chronology, and attribution. | visual, implementation | Medium: data, claims, labels, and hierarchy are external. |
| H4: timing and audio | VS-E01, VS-E02, VS-E03, VS-E04, VS-E05, VS-E06, VS-E07, VS-E08, VS-E10, VS-A02, VS-A04, VS-A05, VS-A06, VS-A08 | Beat boundaries, compression, continuity, cues, and elapsed-time signaling. | audio, visual, timing, implementation | Medium: editorial beat choice and audio assets/mix remain external. |
| H5: state and retention | VS-G01, VS-G02, VS-G03, VS-G04, VS-G05, VS-G06, VS-G07, VS-G08, VS-C01, VS-C02, VS-C03, VS-C04, VS-C05, VS-C06 | State presentation, prompts, goals, reveals, recap, and destinations. | visual, timing, implementation | Medium: platform, data state, CTA destination, and copy remain external. |
| H6: Shorts and functional branding | VS-S02, VS-S03, VS-S04, VS-B02, VS-B03 | Small-screen readable text, vertical regions, loop state, topic, and participant metadata. | visual, timing, implementation | Medium: platform geometry, source priority, and identity metadata remain external. |

The C/E Patterns outside these batches are VS-T09, VS-R09, VS-R10, VS-A07, VS-B01, VS-B04, VS-B05, and VS-B06. They should remain semantic-only unless a future review identifies renderer-neutral behavior beyond their current appearance or brand-policy meaning.
