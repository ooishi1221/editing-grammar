# Composition Coverage Matrix

対象: v0.1.0 の92 Pattern。これは観測候補に対するcoverageであり、92 Patternを42件に数え直した表ではない。全92のpurposeを照合し、関係するPatternのportable recipeを確認した。

- Frame候補30、Sequence候補12。合計42候補: **covered 13 / partial 16 / missing 4 / not-a-pattern 9**。
- covered = 編集目的・構造を既存Patternで表せる。全ての見た目が実装済みという意味ではない。
- partial = 目的や局所操作は既存だが、共通属性・状態間関係が不足。
- missing = 独立した目的または構図連鎖の契約がない。新Pattern追加を自動承認する区分ではない。
- not-a-pattern = 距離・配置等の属性、保持選択、または外部条件。単体で新Patternにしない。

Source IDは[sources.yaml](../research/composition/sources.yaml)、timecode付き観測は[observations.yaml](../research/composition/observations.yaml)。表の抽象化とcoverage判断は **inferred**、収録案は **proposal**。

## Frame composition

| Candidate | 実例 / guidance | Coverage | Existing IDs | Gap / notes |
| --- | --- | --- | --- | --- |
| F01 wide / full / medium / MCU / close / extreme-close | [N02](https://www.youtube.com/watch?v=jnQmkQ0WOAY), [Y08](https://www.youtube.com/watch?v=ed6g5SaJo-E), [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM), [S05](https://www.youtube.com/watch?v=giI28dpYhX0), [MV02](https://www.youtube.com/watch?v=TcLLpZBWsck); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G14](https://www.adobe.com/uk/creativecloud/video/production/cinematography/camera-shots-and-angles/sequence-shot.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | not-a-pattern | VS-L01, VS-R02 | 距離は複数の編集目的が再利用する属性。固定スケール値にしない。 |
| F02 two-shot / group baseline | [N01](https://www.youtube.com/watch?v=k3VjAdy1pig), [Y11](https://www.youtube.com/watch?v=oeFmoGZlslE), [TV01](https://www.youtube.com/watch?v=4yqW-dWpAFA), [Y15](https://www.youtube.com/watch?v=gTvXLlB4-wI); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | covered | VS-L01 | 参加者の同時可視性を既存で表せる。 |
| F03 speaker / reaction dominant view | [N01](https://www.youtube.com/watch?v=k3VjAdy1pig), [N02](https://www.youtube.com/watch?v=jnQmkQ0WOAY), [Y08](https://www.youtube.com/watch?v=ed6g5SaJo-E), [TV01](https://www.youtube.com/watch?v=4yqW-dWpAFA), [X01](https://x.com/midnight_ticket/status/1943596283916161055); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G19](https://web.quizknock.com/oshigotodiary2?page=2) | partial | VS-R01, VS-R02, VS-R11 | 寄る操作はあるが、別人物の反応を選ぶ視点関係は明示されない。 |
| F04 over-the-shoulder | [N03](https://www.youtube.com/watch?v=pJQpl0wJWmE), [X01](https://x.com/midnight_ticket/status/1943596283916161055); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | not-a-pattern | VS-L01 | 人物間の視点属性。新しい編集目的とは限らない。 |
| F05 optical POV | —; [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | not-a-pattern | — | 広告captionのPOVだけでは主観映像と判定しない。今回の実動画では確証不足。 |
| F06 subject plus negative space for copy | [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM), [C05](https://www.youtube.com/watch?v=NECMSTWyMpw), [X02](https://x.com/NaranjaX/status/1673776712725991424), [S01](https://www.youtube.com/watch?v=OpHXyAvQzUc); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G03](https://support.google.com/google-ads/answer/14783551?hl=en) | not-a-pattern | VS-L06 | 人物と文字の関係属性。余白のピクセル量は外部。 |
| F07 centered subject / product | [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM), [C03](https://www.youtube.com/watch?v=SgdAE_6iK80), [TT04](https://ads.tiktok.com/business/creativecenter/topads/7632668312939069458/pc/en), [MV01](https://www.youtube.com/watch?v=SX_ViT4Ra7k); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G10](https://www.thinkbox.tv/how-to-use-tv/sponsorship-and-content/tv-sponsorship/tv-sponsorship-creative-guidelines) | not-a-pattern | — | 中心配置自体に新しい編集目的はない。 |
| F08 symmetrical environment | [MV02](https://www.youtube.com/watch?v=TcLLpZBWsck); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html) | not-a-pattern | — | 環境の反復形状は一例。対称配置を固定テンプレート化しない。 |
| F09 two sources in separate regions | [N06](https://www.youtube.com/watch?v=cVUUZJnJTXI), [S02](https://www.youtube.com/watch?v=QU8ae8VlM_w); [G20](https://ads.tiktok.com/business/library/TikTok_SMB_Creative_Playbook_Holiday_Edition.pdf) | covered | VS-L02 | 同時表示は既存で表せる。比較軸はVS-I02側。 |
| F10 material + face / reaction inset | [Y09](https://www.youtube.com/watch?v=hio2XdBPW5Y), [Y10](https://www.youtube.com/watch?v=L0wOdGLDI0k), [S07](https://www.youtube.com/watch?v=v8p1uRsQYNk); [G13](https://www.adobe.com/uk/creativecloud/video/discover/b-roll.html), [G20](https://ads.tiktok.com/business/library/TikTok_SMB_Creative_Playbook_Holiday_Edition.pdf) | covered | VS-L03, VS-L04 | 丸形でなくても既存のportable recipeは反応の副画面を扱う。 |
| F11 three concurrent regions | [C05](https://www.youtube.com/watch?v=NECMSTWyMpw); — | covered | VS-L07 | 三領域は既存。実例は一つで反復の主張は保留。 |
| F12 caption roles across upper / chest / lower layers | [N01](https://www.youtube.com/watch?v=k3VjAdy1pig), [S01](https://www.youtube.com/watch?v=OpHXyAvQzUc), [S09](https://www.youtube.com/watch?v=t8tlXuUwyck), [TT01](https://ads.tiktok.com/business/creativecenter/topads/7542734366412128272/pc/en), [TT06](https://ads.tiktok.com/business/creativecenter/topads/7678595929332711442/pc/en); [G19](https://web.quizknock.com/oshigotodiary2?page=2), [G06](https://ads.tiktok.com/business/library/TikTok_CreativeCodes_May2023.pdf) | partial | VS-T01, VS-T04, VS-T10, VS-T14, VS-B02, VS-S02 | 役割は既存。画面内の文字優先順位とカットを跨ぐ持続関係は未統一。 |
| F13 true vertical writing beside subject | [TV03](https://www.youtube.com/watch?v=5KwpWuYXt6k), [C04](https://www.youtube.com/watch?v=K7DT1uY3QXo), [MV03](https://www.youtube.com/watch?v=mLW35YMzELE); — | partial | VS-B03, VS-T10, VS-T13 | 同じ縦書きでも氏名・商品コピー・歌詞の意味は別。書字方向を再利用する層がない。 |
| F14 stacked horizontal lines | [S01](https://www.youtube.com/watch?v=OpHXyAvQzUc), [S02](https://www.youtube.com/watch?v=QU8ae8VlM_w), [TT01](https://ads.tiktok.com/business/creativecenter/topads/7542734366412128272/pc/en), [TT06](https://ads.tiktok.com/business/creativecenter/topads/7678595929332711442/pc/en); — | not-a-pattern | VS-S02 | 横書き複数行と縦書きを別属性にする。行数固定は不要。 |
| F15 text becomes dominant during emphasis | [N02](https://www.youtube.com/watch?v=jnQmkQ0WOAY), [S02](https://www.youtube.com/watch?v=QU8ae8VlM_w), [Y09](https://www.youtube.com/watch?v=hio2XdBPW5Y), [MV03](https://www.youtube.com/watch?v=mLW35YMzELE); [G06](https://ads.tiktok.com/business/library/TikTok_CreativeCodes_May2023.pdf), [G19](https://web.quizknock.com/oshigotodiary2?page=2) | partial | VS-T08, VS-T11, VS-C02 | 大きい文字だけで絶叫と判定しない。人物との優先関係は別。 |
| F16 single-value emphasis / number dominance | [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64); — | covered | VS-I05 | 価格提示を観測。数字だけの全画面→反応という連鎖の反復は未確認。 |
| F17 chart / relationship graphic | [Y10](https://www.youtube.com/watch?v=L0wOdGLDI0k), [S06](https://www.youtube.com/watch?v=9kMkT3bBvZU); [G12](https://www.adobe.com/creativecloud/video/discover/shot-list.html) | covered | VS-I04, VS-I06, VS-I07 | 構造は既存。歴史的I04の扱いは維持。 |
| F18 map / geography | [S06](https://www.youtube.com/watch?v=9kMkT3bBvZU); — | covered | VS-I10 | 地図は既存。一例から地理演出一般の頻度は言わない。 |
| F19 source material / screen detail dominates | [Y09](https://www.youtube.com/watch?v=hio2XdBPW5Y), [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64), [X02](https://x.com/NaranjaX/status/1673776712725991424); — | partial | VS-L05, VS-I12, VS-I14 | 対象を示すことは既存。出典を見せる画と証明の真偽は分離。 |
| F20 before / after paired states | [S02](https://www.youtube.com/watch?v=QU8ae8VlM_w); [G22](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-for-beauty-personal-care/pc/en) | covered | VS-L08, VS-I02 | 既存L08は固定上下を要求せず左右比較も表せる。単一実動画。 |
| F21 vertical two-source stack | [S01](https://www.youtube.com/watch?v=OpHXyAvQzUc), [TT02](https://www.tiktok.com/@colourmeprettycosmetics/video/7151165944394550529); [G20](https://ads.tiktok.com/business/library/TikTok_SMB_Creative_Playbook_Holiday_Edition.pdf) | covered | VS-S03, VS-L02 | 話者＋実演はS03、その他二素材はL02。縦分割の新Patternは不要。 |
| F22 full-frame insert / detail cutaway | [C03](https://www.youtube.com/watch?v=SgdAE_6iK80), [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64), [S05](https://www.youtube.com/watch?v=giI28dpYhX0), [X01](https://x.com/midnight_ticket/status/1943596283916161055); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G13](https://www.adobe.com/uk/creativecloud/video/discover/b-roll.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | partial | VS-L05, VS-L10 | L10は副画面。全画面insertと元ショットへの視点接続は別属性。 |
| F23 product hero / pack shot for identity | [C01](https://www.youtube.com/watch?v=m_lThKHsOKA), [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM), [C03](https://www.youtube.com/watch?v=SgdAE_6iK80), [C04](https://www.youtube.com/watch?v=K7DT1uY3QXo), [C05](https://www.youtube.com/watch?v=NECMSTWyMpw); [G03](https://support.google.com/google-ads/answer/14783551?hl=en), [G10](https://www.thinkbox.tv/how-to-use-tv/sponsorship-and-content/tv-sponsorship/tv-sponsorship-creative-guidelines), [G24](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-consumer-electronics/pc/en) | missing | VS-B01, VS-C06, VS-L05 | 商品・パッケージの識別を終端/要所で確立する責務。発信元ロゴや次動画導線とは異なる。 |
| F24 product in use / demonstration | [C03](https://www.youtube.com/watch?v=SgdAE_6iK80), [TT02](https://www.tiktok.com/@colourmeprettycosmetics/video/7151165944394550529), [TT04](https://ads.tiktok.com/business/creativecenter/topads/7632668312939069458/pc/en), [S08](https://www.youtube.com/watch?v=v-_d2e7x4KA); [G24](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-consumer-electronics/pc/en) | covered | VS-L05 | 話題対象の映像という目的は既存。商品カテゴリ別Patternの大量追加は不要。 |
| F25 spokesperson and product correspondence | [C01](https://www.youtube.com/watch?v=m_lThKHsOKA), [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM), [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64), [S05](https://www.youtube.com/watch?v=giI28dpYhX0); [G03](https://support.google.com/google-ads/answer/14783551?hl=en), [G24](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-consumer-electronics/pc/en) | partial | VS-L01, VS-L05 | 人物と商品の主従・同一性を保持する関係はparticipantSetだけでは明確でない。 |
| F26 critical content protected from platform UI | —; [G01](https://business.google.com/us/ad-solutions/youtube-ads/shorts-ads/), [G02](https://support.google.com/google-ads/answer/9128498), [G05](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en), [G07](https://business.x.com/en/advertising/creative-best-practices) | covered | VS-S01 | プラットフォームのsafeAreaProfile。作品単体フレームだけからUI適合を認定しない。 |
| F27 inner material frame in another aspect canvas | [TT06](https://ads.tiktok.com/business/creativecenter/topads/7678595929332711442/pc/en), [MV01](https://www.youtube.com/watch?v=SX_ViT4Ra7k); — | partial | VS-L09, VS-B06 | 既存L09は縦素材の背景拡張。逆方向や正方形内枠を一般化するかは別設計。 |
| F28 lyric typography participates in composition | [MV03](https://www.youtube.com/watch?v=mLW35YMzELE); — | partial | VS-T13, VS-T11, VS-B04 | 発話字幕と歌詞は異なる。音声同期未検証で新Pattern昇格は保留。 |
| F29 diagram above narrator/avatar | [S06](https://www.youtube.com/watch?v=9kMkT3bBvZU); — | partial | VS-L03, VS-L06 | 主従は既存。左右/上下を再利用属性として整理する余地。 |
| F30 held framing while state changes | [Y11](https://www.youtube.com/watch?v=oeFmoGZlslE), [TT01](https://ads.tiktok.com/business/creativecenter/topads/7542734366412128272/pc/en), [TT06](https://ads.tiktok.com/business/creativecenter/topads/7678595929332711442/pc/en), [MV01](https://www.youtube.com/watch?v=SX_ViT4Ra7k); — | not-a-pattern | VS-E09 | 同じ構図の保持は正常。E09の意図した時間の間と静的な構図は同義ではない。 |

## Composition sequence

各Qのtimecode列はobservations.yamlのsequence_relations。離れたサンプル間に未記録のカットがあり得るため、矢印は順序関係を表し、全てが隣接カットという意味ではない。

| Candidate | 実例 / guidance | Coverage | Existing IDs | Gap / notes |
| --- | --- | --- | --- | --- |
| Q01 baseline → selected person / reaction → baseline | [Y08](https://www.youtube.com/watch?v=ed6g5SaJo-E), [S09](https://www.youtube.com/watch?v=t8tlXuUwyck); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G19](https://web.quizknock.com/oshigotodiary2?page=2) | partial | VS-L01, VS-R01, VS-R02 | 個別の寄り/引きはあるが選択対象と基準画への復帰を跨Patternで宣言できない。 |
| Q02 speaker A → speaker B / listener reaction | [N01](https://www.youtube.com/watch?v=k3VjAdy1pig), [TV01](https://www.youtube.com/watch?v=4yqW-dWpAFA), [X01](https://x.com/midnight_ticket/status/1943596283916161055); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | missing | VS-L01, VS-R02, VS-R11 | 同時可視性・拡大・反応連打とは異なる、発話/応答の視点交替。 |
| Q03 speaker → supporting visual → speaker | [TV03](https://www.youtube.com/watch?v=5KwpWuYXt6k), [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64), [S08](https://www.youtube.com/watch?v=v-_d2e7x4KA); [G13](https://www.adobe.com/uk/creativecloud/video/discover/b-roll.html) | covered | VS-L05 | L05の挿入と復帰で目的は既存。音声連続性は本観測では未検証。 |
| Q04 question retained → answer / reaction changes view | [Y15](https://www.youtube.com/watch?v=gTvXLlB4-wI), [S01](https://www.youtube.com/watch?v=OpHXyAvQzUc), [S09](https://www.youtube.com/watch?v=t8tlXuUwyck); [G19](https://web.quizknock.com/oshigotodiary2?page=2) | partial | VS-G04, VS-G05, VS-R02 | 問題表示の持続/解除と顔への寄りの連携を明示する層がない。 |
| Q05 ordinary caption → emphasis → reset | [S02](https://www.youtube.com/watch?v=QU8ae8VlM_w), [N06](https://www.youtube.com/watch?v=cVUUZJnJTXI); [G19](https://web.quizknock.com/oshigotodiary2?page=2), [G06](https://ads.tiktok.com/business/library/TikTok_CreativeCodes_May2023.pdf) | partial | VS-T04, VS-T08, VS-T11 | 意味的な強調は既存。文字優先度の一時変更と構図状態の復帰を分離して表す。 |
| Q06 context → detail insert → person / whole return | [TT04](https://ads.tiktok.com/business/creativecenter/topads/7632668312939069458/pc/en), [X01](https://x.com/midnight_ticket/status/1943596283916161055), [S03](https://www.youtube.com/watch?v=R6yNUnRXZ64); [G11](https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html), [G14](https://www.adobe.com/uk/creativecloud/video/production/cinematography/camera-shots-and-angles/sequence-shot.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | partial | VS-L05, VS-L10 | 対象同一性と戻り先をframe関係として共通化する余地。 |
| Q07 materials / process details → result | [S07](https://www.youtube.com/watch?v=v8p1uRsQYNk); [G14](https://www.adobe.com/uk/creativecloud/video/production/cinematography/camera-shots-and-angles/sequence-shot.html), [G18](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf) | covered | VS-E03, VS-I03 | 実演映像の過程圧縮はE03。順序説明図I03とは別。今回の厳密な連鎖実例は一件。 |
| Q08 person/use context → product detail / identity | [C03](https://www.youtube.com/watch?v=SgdAE_6iK80), [TT02](https://www.tiktok.com/@colourmeprettycosmetics/video/7151165944394550529), [C02](https://www.youtube.com/watch?v=7BbeFDTAqAM); [G03](https://support.google.com/google-ads/answer/14783551?hl=en), [G10](https://www.thinkbox.tv/how-to-use-tv/sponsorship-and-content/tv-sponsorship/tv-sponsorship-creative-guidelines), [G24](https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-consumer-electronics/pc/en) | missing | VS-L05, VS-C06 | 商品同定を着地点とする意味連鎖。全例が同じ四段順序を取るとは主張しない。 |
| Q09 inset + main view → material full frame | [Y10](https://www.youtube.com/watch?v=L0wOdGLDI0k), [S07](https://www.youtube.com/watch?v=v8p1uRsQYNk); [G13](https://www.adobe.com/uk/creativecloud/video/discover/b-roll.html) | partial | VS-L03, VS-L04, VS-L05 | 同時表示から単一対象への主役移動。個々のPatternの配列だけでは変化意図が残らない。 |
| Q10 content → action / brand end state | [C05](https://www.youtube.com/watch?v=NECMSTWyMpw), [C06](https://www.youtube.com/watch?v=xe1tT45BVbI), [X02](https://x.com/NaranjaX/status/1673776712725991424); [G03](https://support.google.com/google-ads/answer/14783551?hl=en), [G10](https://www.thinkbox.tv/how-to-use-tv/sponsorship-and-content/tv-sponsorship/tv-sponsorship-creative-guidelines) | partial | VS-C03, VS-C06, VS-B01 | 行動案内とブランド・商品同定は別。ロゴだけをCTAと呼ばない。 |
| Q11 performance ↔ dance / environment / action coverage | [MV01](https://www.youtube.com/watch?v=SX_ViT4Ra7k), [MV02](https://www.youtube.com/watch?v=TcLLpZBWsck); [G12](https://www.adobe.com/creativecloud/video/discover/shot-list.html), [G14](https://www.adobe.com/uk/creativecloud/video/production/cinematography/camera-shots-and-angles/sequence-shot.html) | missing | VS-E03, VS-L05, VS-A04 | 楽曲表現の視点交替は過程要約とは限らない。音声未検証のため拍同期の規則は提案しない。 |
| Q12 hold frame; update expression / text only | [TT01](https://ads.tiktok.com/business/creativecenter/topads/7542734366412128272/pc/en), [TT06](https://ads.tiktok.com/business/creativecenter/topads/7678595929332711442/pc/en), [MV01](https://www.youtube.com/watch?v=SX_ViT4Ra7k); — | not-a-pattern | VS-E09 | 変化しない選択も許す。強制的な毎カット変更は禁止。 |

## 重複追加しない判断

| 既存Pattern | 今回の照合結果 |
| --- | --- |
| VS-R01 パンチイン | 一時的な強調と基準画への復帰を扱う。映像上の寄りだけからデジタルcropか別カメラかは断定しない。 |
| VS-R02 超顔アップ | 顔を主役にする目的を扱う。MCU/close/extreme-closeの全てを一律に超顔アップと呼ばない。 |
| VS-I05 数値ドン | 数値の独立した情報beatは既存。位置や検索語の不足は新Patternを作る根拠にならない。 |
| VS-L01 全体引き・対談 | 参加者の関係と同時表示は既存。話者と受け手の交替順序とは別。 |
| VS-L02 二分割 | 二ソース同時表示を扱う。比較目的がある場合だけVS-I02を重ねる。 |
| VS-L03 資料＋PIP | 主資料と話者の主従関係を扱う。 |
| VS-L04 丸ワイプ | portable recipeはbounded reaction view。丸形を強制しないため四角い反応枠を重複追加しない。 |
| VS-L05 B-roll差し込み | 対象提示・説明への復帰を扱う。別画像への切替が全て音声連続B-rollだったとは観測していない。 |
| VS-L06 映像＋文字の左右構成 | recipeはdistinct stable regions。左右というタイトルだけを理由に上下版を新設しない。 |
| VS-L07 三分割 | 三ソースの安定同時表示は既存。C05の衣装三領域を参照。 |
| VS-L08 上下・ビフォーアフター | recipeはpaired-state comparison。S02の左右Before/Afterも既存目的で扱える。 |
| VS-L10 手元・操作の拡大窓 | 主画を残す副画面。全画面insertと混同せずF22のpartialにした。 |
| VS-T08 絶叫・大声 | supplied voice-intensityの可視化。大きい上字幕、数字、歌詞全般のPatternには拡張しない。 |

## Missingからの候補（まだ収録しない）

| Proposed name | Editorial job | Examples | Why existing is insufficient | Possible category | Confidence / action |
| --- | --- | --- | --- | --- | --- |
| 商品同定・パックショット | 商品とパッケージの識別を確立し、訴求の着地点を作る | C01@00:28, C03@00:28, C04@00:28; G03/G10 | B01は発信元、C06は次の行動先、L05は話題対象の挿入で、商品同定を保持する不変条件が異なる | information / branding（未決定） | 構造根拠は強い。新Pattern候補として次段で重複審査 |
| 発話・受け手の視点交替 | 発話とそれを受けた反応の関係を見せる | TV01@00:30→00:40→00:45, X01@00:01→00:15→00:30 | L01は同時表示、R02は寄り、R11は累積であり、相手への視点交替契約はない | composition-sequence referenceを優先 | 中。新EditingPatternよりSequence層で試す |
| 演奏・ダンス・情景の交替 | 同じ作品内の演者と身体/情景を往復する | MV01@01:00→01:01→02:30, MV02@01:03→01:04→01:06 | E03の過程圧縮やA04の拍同期だけでは目的が一致しない | composition-sequence research | 中以下。3 MVに限定、音声同期未確認。汎用Pattern採用は保留 |

F23とQ08は同じ商品同定の課題をframe/sequenceの両側から見ており、二つの新Patternを要求していない。歌詞演出F28、全画面数字→反応、光学POV、ネイティブDuetは追加Evidenceが必要。

## 書体調査との接続（42構図候補の件数には加算しない）

12画面を字形・文字処理の観点から追加確認した。詳細は[研究報告](composition-reference-research-v0.1.md)のフォント節とG25–30。正確な使用fontは全て未同定。

| 関係 | 既存coverage | 境界 |
| --- | --- | --- |
| 発話・感情・強弱・編集者の声 | VS-T01 / T03 / T04 / T07 / T08 / T14 | 意味役割は既存。font名から役割を逆算せず、書体・縁・大きさは外部表現設計 |
| 語句と読み進行の強調 | VS-T11 / T13 | 文字dominanceと構図の関係はF15/F28/Q05。T11の歴史的提案をsourceの書体値にしない |
| 番組名・人物名・brandの声 | VS-B02 / B03、Taste側のVS-T09 / B04 / B05 | 文字内容と結び付けは既存。具体的書体の選定を新Patternとして量産しない |
| 同じ構図で文字の強度だけ変化 | S02@00:19→00:25、N02@03:00、X01@00:01 | font familyと画面上の印象は一対一でない。配置・占有・文字役割を分ける |

書体資料は設計意図や制作上の傾向を支持し、実動画での観客の心理効果を証明するものではない。C/E exclusionsと歴史的例外の扱いは変更しない。
