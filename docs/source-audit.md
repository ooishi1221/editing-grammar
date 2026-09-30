# Full 92-Pattern Source Audit

## Scope and provenance

Audit baseline: schema freeze 6bee603cf76728065e8c518d077b663df363897c. The source reviewed was [YouTube Editing / Visual Library Japan v0.3](https://youtube-editing-visual-library.ayami.chatgpt.site/). All 92 catalog cards and their detail dialogs were inspected. No third-party video, image, screenshot, logo, SVG, or PNG is copied into this repository.

The source site labels every detail dialog's numeric and production specifications as independent starting-value proposals. This audit therefore records only the catalog facts and the stated evidence classification as OBSERVED. It does not turn card values, renderer choices, timing values, fonts, colors, or source examples into inferred or proposal Pattern data.

### Audit key

- **VL**: the source-library URL above, available for every row.
- **Location**: the source-library detail dialog for the listed ID.
- **C**: catalog facts observed for every row: ID, title, original category, stated purpose, and classification.
- **R**: C plus the dialog's one to three external reference links and its stated observation/coverage note. This is used only where the source classifies the entry as 実例・手法を参考.
- **P**: C plus the dialog's one to three method/reference links, while the source itself classifies the Pattern as 応用デザイン案.
- **M**: missing as source facts: independently observed exact visual/audio/timing/implementation parameters, renderer recipe, goodFor, avoidWhen, and failure modes. The source's displayed specification values are labelled as proposals, not observations.
- **Schema fit**: Yes means the frozen schema can hold the observed core facts and source metadata. An eventual YAML will still require separately scoped proposal values for required semantic fields that are absent from the source.

## Aggregate

- **Actual total:** 92.
- **Source classification:** 実例・手法を参考 19; 応用デザイン案 73.
- **Detail references:** every dialog contains 1–3 external reference links; the source exposes 106 links across 92 dialogs. Their URLs remain on the source site and are not copied as media.
- **Missing-data pattern:** all 92 lack source-observed implementation parameters; all dialogs explicitly frame their card values as production starting-value proposals.
- **Frozen-schema fit:** all 92 fit. No Pattern requires a new core field to preserve the observed catalog facts.

## Entries
### 発話テロップ (14)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-T01 | 標準字幕 | 発話を補助する | 実例・手法を参考 | detail / VS-T01 | VL | C+R | M | Yes | — |
| VS-T02 | 話者カラー | 話者を識別する | 実例・手法を参考 | detail / VS-T02 | VL | C+R | M | Yes | — |
| VS-T03 | 感情カラー | 気持ちの強さを示す | 実例・手法を参考 | detail / VS-T03 | VL | C+R | M | Yes | — |
| VS-T04 | ツッコミ | 意外性を短く強調 | 実例・手法を参考 | detail / VS-T04 | VL | C+R | M | Yes | — |
| VS-T05 | 心の声 | 内心を演出として補足 | 実例・手法を参考 | detail / VS-T05 | VL | C+R | M | Yes | — |
| VS-T06 | 画面外話者 | 画角外の声を特定 | 応用デザイン案 | detail / VS-T06 | VL | C+P | M | Yes | — |
| VS-T07 | 小声・ささやき | 発話の弱さを示す | 応用デザイン案 | detail / VS-T07 | VL | C+P | M | Yes | — |
| VS-T08 | 絶叫・大声 | 声量のピークを可視化 | 実例・手法を参考 | detail / VS-T08 | VL | C+R | M | Yes | — |
| VS-T09 | 明朝の余韻 | 発話に余韻をつくる | 実例・手法を参考 | detail / VS-T09 | VL | C+R | M | Yes | — |
| VS-T10 | 注釈・補足 | 誤解を防ぐ補足 | 実例・手法を参考 | detail / VS-T10 | VL | C+R | M | Yes | — |
| VS-T11 | 語句強調 | 文中の核を目立たせる | 応用デザイン案 | detail / VS-T11 | VL | C+P | M | Yes | — |
| VS-T12 | 二言語字幕 | 原語と訳を対比する | 応用デザイン案 | detail / VS-T12 | VL | C+P | M | Yes | — |
| VS-T13 | 逐語・追従字幕 | 現在の発話位置を示す | 応用デザイン案 | detail / VS-T13 | VL | C+P | M | Yes | — |
| VS-T14 | 編集者コメント | 編集者の視点を別レイヤーで足す | 応用デザイン案 | detail / VS-T14 | VL | C+P | M | Yes | — |

### 強調・リアクション (12)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-R01 | パンチイン | 表情や重要語へ寄る | 実例・手法を参考 | detail / VS-R01 | VL | C+R | M | Yes | — |
| VS-R02 | 超顔アップ | 表情を画面の主役にする | 応用デザイン案 | detail / VS-R02 | VL | C+P | M | Yes | — |
| VS-R03 | 暗転＋ズーム | 周辺情報を抑える | 実例・手法を参考 | detail / VS-R03 | VL | C+R | M | Yes | — |
| VS-R04 | フリーズ | 見落としやすい瞬間を止める | 応用デザイン案 | detail / VS-R04 | VL | C+P | M | Yes | — |
| VS-R05 | リプレイ | 出来事を再確認する | 応用デザイン案 | detail / VS-R05 | VL | C+P | M | Yes | — |
| VS-R06 | 集中線 | 中心へ視線を集める | 実例・手法を参考 | detail / VS-R06 | VL | C+R | M | Yes | — |
| VS-R07 | スローモーション | 動作や表情を読み取らせる | 応用デザイン案 | detail / VS-R07 | VL | C+P | M | Yes | — |
| VS-R08 | 画面シェイク | 衝撃を画面全体に伝える | 応用デザイン案 | detail / VS-R08 | VL | C+P | M | Yes | — |
| VS-R09 | モノクロ落胆 | 落胆を簡潔に表す | 応用デザイン案 | detail / VS-R09 | VL | C+P | M | Yes | — |
| VS-R10 | マンガ吹き出し | 反応を記号化する | 応用デザイン案 | detail / VS-R10 | VL | C+P | M | Yes | — |
| VS-R11 | リアクション連打 | 同じ反応の累積を見せる | 応用デザイン案 | detail / VS-R11 | VL | C+P | M | Yes | — |
| VS-R12 | 対象の切り抜き強調 | 物を背景から分離する | 応用デザイン案 | detail / VS-R12 | VL | C+P | M | Yes | — |

### 情報・解説 (14)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-I01 | 定義カード | 知らない言葉を理解させる | 応用デザイン案 | detail / VS-I01 | VL | C+P | M | Yes | — |
| VS-I02 | 二項比較 | 差を同じ軸で比較 | 応用デザイン案 | detail / VS-I02 | VL | C+P | M | Yes | — |
| VS-I03 | ステップ図解 | 作業の順番を示す | 応用デザイン案 | detail / VS-I03 | VL | C+P | M | Yes | — |
| VS-I04 | 因果・関係図 | 要素の関係を整理 | 応用デザイン案 | detail / VS-I04 | VL | C+P | M | Yes | — |
| VS-I05 | 数値ドン | 重要な数値を記憶させる | 応用デザイン案 | detail / VS-I05 | VL | C+P | M | Yes | — |
| VS-I06 | 棒グラフ | 量の差を比較 | 実例・手法を参考 | detail / VS-I06 | VL | C+R | M | Yes | — |
| VS-I07 | データ表 | 複数条件を正確に読ませる | 応用デザイン案 | detail / VS-I07 | VL | C+P | M | Yes | — |
| VS-I08 | タイムライン | 時間の順序を可視化 | 応用デザイン案 | detail / VS-I08 | VL | C+P | M | Yes | — |
| VS-I09 | 矢印・囲み | 細部の位置を示す | 応用デザイン案 | detail / VS-I09 | VL | C+P | M | Yes | — |
| VS-I10 | 地図・ルート | 場所と移動経路を示す | 応用デザイン案 | detail / VS-I10 | VL | C+P | M | Yes | — |
| VS-I11 | ランキング | 順位と比較を示す | 応用デザイン案 | detail / VS-I11 | VL | C+P | M | Yes | — |
| VS-I12 | 引用カード | 他者の発言を区別する | 応用デザイン案 | detail / VS-I12 | VL | C+P | M | Yes | — |
| VS-I13 | 箇条書きまとめ | 複数の要点を整理 | 応用デザイン案 | detail / VS-I13 | VL | C+P | M | Yes | — |
| VS-I14 | 出典・条件表示 | 数字や主張の範囲を示す | 実例・手法を参考 | detail / VS-I14 | VL | C+R | M | Yes | — |

### レイアウト (10)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-L01 | 全体引き・対談 | 参加者の関係を見せる | 実例・手法を参考 | detail / VS-L01 | VL | C+R | M | Yes | — |
| VS-L02 | 二分割 | 二者の反応を同時に見せる | 応用デザイン案 | detail / VS-L02 | VL | C+P | M | Yes | — |
| VS-L03 | 資料＋PIP | 資料と話者を同時に出す | 実例・手法を参考 | detail / VS-L03 | VL | C+R | M | Yes | — |
| VS-L04 | 丸ワイプ | 表情を小さく添える | 応用デザイン案 | detail / VS-L04 | VL | C+P | M | Yes | — |
| VS-L05 | B-roll差し込み | 話題の対象を見せる | 応用デザイン案 | detail / VS-L05 | VL | C+P | M | Yes | — |
| VS-L06 | 映像＋文字の左右構成 | 説明と対象を整理 | 応用デザイン案 | detail / VS-L06 | VL | C+P | M | Yes | — |
| VS-L07 | 三分割 | 三者・三案を比較 | 応用デザイン案 | detail / VS-L07 | VL | C+P | M | Yes | — |
| VS-L08 | 上下・ビフォーアフター | 同じ対象の差を示す | 応用デザイン案 | detail / VS-L08 | VL | C+P | M | Yes | — |
| VS-L09 | 縦素材の背景拡張 | 異なる縦横比を収める | 応用デザイン案 | detail / VS-L09 | VL | C+P | M | Yes | — |
| VS-L10 | 手元・操作の拡大窓 | 細かい操作を読ませる | 応用デザイン案 | detail / VS-L10 | VL | C+P | M | Yes | — |

### テンポ・遷移 (10)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-E01 | ジャンプカット | 不要な間を詰める | 応用デザイン案 | detail / VS-E01 | VL | C+P | M | Yes | — |
| VS-E02 | J・Lカット | 会話や場面を滑らかにつなぐ | 実例・手法を参考 | detail / VS-E02 | VL | C+R | M | Yes | — |
| VS-E03 | モンタージュ | 長い過程を短く要約 | 応用デザイン案 | detail / VS-E03 | VL | C+P | M | Yes | — |
| VS-E04 | 章扉 | 話題の区切りを示す | 応用デザイン案 | detail / VS-E04 | VL | C+P | M | Yes | — |
| VS-E05 | 横スライド | 方向性を持って遷移 | 応用デザイン案 | detail / VS-E05 | VL | C+P | M | Yes | — |
| VS-E06 | フェード・ディゾルブ | 時間経過・余韻を表す | 応用デザイン案 | detail / VS-E06 | VL | C+P | M | Yes | — |
| VS-E07 | マッチカット | 画の共通点で場面を結ぶ | 応用デザイン案 | detail / VS-E07 | VL | C+P | M | Yes | — |
| VS-E08 | 時間経過カード | 省略した時間を知らせる | 応用デザイン案 | detail / VS-E08 | VL | C+P | M | Yes | — |
| VS-E09 | 間を残す | 反応を待たせる | 応用デザイン案 | detail / VS-E09 | VL | C+P | M | Yes | — |
| VS-E10 | 速度ランプ | 過程を圧縮し山場を残す | 応用デザイン案 | detail / VS-E10 | VL | C+P | M | Yes | — |

### 音 (8)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-A01 | インパクトSE | 強調の瞬間を同期させる | 実例・手法を参考 | detail / VS-A01 | VL | C+R | M | Yes | — |
| VS-A02 | ポップ・通知SE | 情報の出現を知らせる | 応用デザイン案 | detail / VS-A02 | VL | C+P | M | Yes | — |
| VS-A03 | 無音・BGM停止 | 違和感や間をつくる | 応用デザイン案 | detail / VS-A03 | VL | C+P | M | Yes | — |
| VS-A04 | BGMの拍に合わせる | 編集テンポを揃える | 応用デザイン案 | detail / VS-A04 | VL | C+P | M | Yes | — |
| VS-A05 | スイッシュ | 画面移動を補助する | 応用デザイン案 | detail / VS-A05 | VL | C+P | M | Yes | — |
| VS-A06 | 正解・不正解音 | 判定を耳でも伝える | 応用デザイン案 | detail / VS-A06 | VL | C+P | M | Yes | — |
| VS-A07 | 感情・余韻ジングル | 感情の場面を区切る | 応用デザイン案 | detail / VS-A07 | VL | C+P | M | Yes | — |
| VS-A08 | 環境音・ルームトーン | 音の不自然な断絶を避ける | 応用デザイン案 | detail / VS-A08 | VL | C+P | M | Yes | — |

### 企画進行UI (8)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-G01 | ルール説明 | 企画の理解を揃える | 応用デザイン案 | detail / VS-G01 | VL | C+P | M | Yes | — |
| VS-G02 | スコア表示 | 競争の現在地を見せる | 応用デザイン案 | detail / VS-G02 | VL | C+P | M | Yes | — |
| VS-G03 | カウントダウン | 残り時間を見せる | 応用デザイン案 | detail / VS-G03 | VL | C+P | M | Yes | — |
| VS-G04 | 問題・選択肢 | 考える対象を明示 | 応用デザイン案 | detail / VS-G04 | VL | C+P | M | Yes | — |
| VS-G05 | 結果発表 | 結末を伝える | 応用デザイン案 | detail / VS-G05 | VL | C+P | M | Yes | — |
| VS-G06 | 進捗・ステップ表示 | 長い企画の現在地を示す | 応用デザイン案 | detail / VS-G06 | VL | C+P | M | Yes | — |
| VS-G07 | ミッション・目標 | 視聴者とゴールを共有 | 応用デザイン案 | detail / VS-G07 | VL | C+P | M | Yes | — |
| VS-G08 | ゲージ・達成率 | 進み具合を連続的に示す | 応用デザイン案 | detail / VS-G08 | VL | C+P | M | Yes | — |

### ブランド・装飾 (6)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-B01 | チャンネルマーク | 発信元を示す | 実例・手法を参考 | detail / VS-B01 | VL | C+R | M | Yes | — |
| VS-B02 | 番組・話題見出し | 現在の話題を示す | 実例・手法を参考 | detail / VS-B02 | VL | C+R | M | Yes | — |
| VS-B03 | ローワーサード | 人物名・役割を紹介 | 応用デザイン案 | detail / VS-B03 | VL | C+P | M | Yes | — |
| VS-B04 | マンガ・ゲーム装飾 | 企画内の演出トーンを変える | 応用デザイン案 | detail / VS-B04 | VL | C+P | M | Yes | — |
| VS-B05 | 紙メモ・質感ベース | 説明を親しみやすく見せる | 応用デザイン案 | detail / VS-B05 | VL | C+P | M | Yes | — |
| VS-B06 | 画面枠・レターボックス | 映像のトーンを区切る | 応用デザイン案 | detail / VS-B06 | VL | C+P | M | Yes | — |

### 視聴維持・CTA (6)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-C01 | 冒頭ダイジェスト | 見る理由を先に示す | 応用デザイン案 | detail / VS-C01 | VL | C+P | M | Yes | — |
| VS-C02 | 疑問・先出し | 答えへの関心をつくる | 応用デザイン案 | detail / VS-C02 | VL | C+P | M | Yes | — |
| VS-C03 | 登録・フォロー案内 | 次の接点を案内 | 応用デザイン案 | detail / VS-C03 | VL | C+P | M | Yes | — |
| VS-C04 | コメント誘導 | 具体的な参加を促す | 応用デザイン案 | detail / VS-C04 | VL | C+P | M | Yes | — |
| VS-C05 | 要点のおさらい | 理解を定着させる | 応用デザイン案 | detail / VS-C05 | VL | C+P | M | Yes | — |
| VS-C06 | エンド画面 | 次の動画への導線をつくる | 応用デザイン案 | detail / VS-C06 | VL | C+P | M | Yes | — |

### Shorts特化 (4)

| ID | Title | Stated purpose | Source classification | Source location | Source URL | Source specification present | Source specification absent | Schema fit | Ambiguity / concern |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VS-S01 | 縦画面の安全配置 | 縦UIとの重なりを減らす | 応用デザイン案 | detail / VS-S01 | VL | C+P | M | Yes | — |
| VS-S02 | 短文・逐次字幕 | 小画面で発話を追わせる | 応用デザイン案 | detail / VS-S02 | VL | C+P | M | Yes | — |
| VS-S03 | 縦の上下分割 | 実演と話者を同時に見せる | 応用デザイン案 | detail / VS-S03 | VL | C+P | M | Yes | — |
| VS-S04 | ループ接続 | 末尾から冒頭へつなぐ | 応用デザイン案 | detail / VS-S04 | VL | C+P | M | Yes | — |
## Duplicate and similar-pattern candidates

No exact duplicate is confirmed from the source's stated purposes. The following need a distinctness decision during YAML conversion, but should remain separate until that review:

- VS-R01 パンチイン and VS-R02 超顔アップ: both increase facial emphasis; the stated purposes differ between directing attention and making the face the primary subject.
- VS-R04 フリーズ and VS-R05 リプレイ: both revisit a moment; one stops a moment and the other repeats an event.
- VS-I02 二項比較, VS-L02 二分割, and VS-L07 三分割: the information Pattern is comparison by a shared axis, while the layout Patterns are simultaneous presentation arrangements.
- VS-I03 ステップ図解 and VS-G06 進捗・ステップ表示: one explains a procedure, the other communicates a project's current position.
- VS-I08 タイムライン and VS-G06 進捗・ステップ表示: temporal explanation versus ongoing progress state.
- VS-I11 ランキング and VS-G02 スコア表示: ordered comparison versus current competitive state.
- VS-I13 箇条書きまとめ and VS-C05 要点のおさらい: information organization versus retention-oriented recap.
- VS-T13 逐語・追従字幕 and VS-S02 短文・逐次字幕: speech-position tracking versus small-screen readability.
- VS-E09 間を残す and VS-A03 無音・BGM停止: temporal pause versus audio intervention.
- VS-B03 ローワーサード and VS-T02 話者カラー: identity introduction versus speaker identification within captions.

## Ambiguous category boundaries

- Captions / 強調・リアクション: VS-T11 語句強調 and VS-R01 パンチイン can serve the same emphasis intent through different media.
- 情報・解説 / レイアウト: VS-I02, VS-I08, VS-I11 and VS-L02, VS-L07, VS-L08 have adjacent comparison or sequencing uses.
- 情報・解説 / 企画進行UI: VS-I03, VS-I08, VS-I11 overlap conceptually with VS-G02, VS-G06, VS-G08 but differ in explanatory versus live-state roles.
- テンポ・遷移 / 音: VS-E09 and VS-A03 are coordinated pause treatments with different primary editing materials.
- 発話テロップ / Shorts特化: VS-T13 and VS-S02 have related caption behavior but different display context.

## Schema review result

- **Patterns that do not fit the frozen schema:** none.
- **Schema reopen required:** no. The audit exposes absent source detail, not an unrepresentable observed field.
- **Ready for 89 YAML conversion:** yes, after a conversion plan keeps catalog facts as observed and scopes every semantic/implementation addition as inferred or proposal. This audit does not create any YAML.
