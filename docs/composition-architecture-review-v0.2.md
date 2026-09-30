# Composition Architecture Review v0.2

2026-10-01 / Phase 0 / baseline `4a7c793743ffb00d5e8b7720ebb9edfcb1bac94e`。

**Decision C: Composition Primitive Catalog + Composition Sequence Grammarの二層を設計対象とする。** この文書はarchitecture proposalであり、schema・enum・Pattern・runtimeへの実装ではない。

Evidence: [研究報告](composition-reference-research-v0.1.md)、[coverage matrix](composition-coverage-matrix.md)、[sources](../research/composition/sources.yaml)、[timecode observations](../research/composition/observations.yaml)。44動画の213画面状態、27 guidance文書（うち書体・文字処理の資料6件）を使用。意味役割の解釈はinferred、将来契約はproposal。

## 1. 現在のv0.1.0で足りないこと

v0.1.0には92の編集目的、81 current-contractの実装grammar、typed inputs、portable handoffがある。VS-R01は寄って戻る、VS-L05はB-rollを挿入して戻る等、局所的な時間関係も既にある。「時間を扱えない」という評価は誤り。

不足は**選択済みPatternをまたいで、どの対象を、どの距離・領域・文字優先度で見せ、意味が変わったとき何を保持/変更するかを共有する語彙**である。既存の自由記述を読めるAgentは個別に判断できるが、同じ意味の構図関係を別々の文章で渡しやすい。

典型例はS09@00:18→00:19。三人と問題パネルから一人の顔と発話字幕へ移る一方、上の企画名は残る。「顔寄り」「字幕」「クイズ」の別々のPatternがあっても、その持続と解除の関係は単純なPattern配列からは決まらない。

## 2. 観測されたFrame Primitive候補

研究用の整理軸は、framing、subject relation、arrangement、dominance、text relationship、reading direction、negative space。正式なenumとして採用したものではない。

- 距離: 全体/全身/上半身/顔/細部。N02、Y08、C02、S05、MV02にまたがる。
- 関係: 一人・二人・集団、肩越し、人物と商品。TV01、X01、C02等。
- 領域: 同時二分割、上下二ソース、副画面、三領域、全画面資料。N06、S01、Y10、C05等。
- 優先対象: 顔、資料、商品、文字。S02、Y10、MV03で切替が見える。
- 文字: 上・胸元・下・側方、保持する見出しと一時的な反応、縦書きと横書き多行。位置と意味役割を分ける。

30 Frame候補のうち21は複数実動画で確認。POVや厳密なthirdsのように教材では確認できても実動画の確証が不足するものは採用候補から区別する。同じ構図が会話、商品、MVで使われるため、Patternごとの一対一属性追加だけでは再利用関係を表しにくい。

## 3. 観測されたSequence Grammar候補

12関係のうち11で複数実動画を確認した。`observations.yaml`のQ01–Q12が対応する時刻とObservation IDを持つ。矢印は抽象化した順序関係であり、未観測のカットを埋めた完全な編集台本ではない。

- 共同状況 → 話者/受け手の寄り → 共同状況（Y08、S09）。
- 説明 → 対象/資料 → 話者へ戻る（TV03、S03、S08）。
- 問題を保持 → 結果/反応で主役を替える → 問題を解除（Y15、S01、S09）。
- 発話 → 文字を主役にする → 元の優先度へ（S02、N06）。
- 人物/利用 → 商品細部・同定（C03、TT02、C02）。
- 併置 → 資料単独（Y10、S07）。
- 同じ構図を保ち、文字/表情だけ更新（TT01、TT06、MV01）。

強い支持は距離の順番そのものより、**注意対象と情報役割が変わる関係**にある。wide→medium→closeを常時実行したり、同じ構図を連続利用禁止にしたりしない。MVのperformance交替は観測したが、拍・歌詞同期は未検証なので独立した音楽規則を確定しない。

## 4. 既存92でcoveredなもの

二人/集団の同時表示、二分割、資料＋話者、反応の副画面、三領域、Before/After、縦二ソース、数字の強調、図表・地図、話題対象の実演/B-roll、safe areaの外部委譲は既存で扱える。局所SequenceではVS-L05の挿入/復帰、VS-E03の工程要約も使える。

特にL04のportable grammarは円形を強制せず、L08は上下を強制しない。タイトルの形だけを読んで「四角ワイプ」「左右Before/After」を新設しない。coverageは42候補中covered 13。元の92 Patternの分類・意味は変更しない。

## 5. partialなもの

42候補中16。主な不足は字幕と画の主従、保持するlabelと解除するannotation、注目人物の交替、全画面insertと副画面の区別、商品と人物の対応、Patternを跨ぐ復帰先。

VS-T08は声の強さ、VS-I05は数値、VS-T11は語句を強調する。これらが同じ大きい文字を使う場合も、意味を統合しない。上字幕・縦書き・胸元字幕は別のPattern名の大量追加ではなく、再利用属性の候補にする。

## 6. missingなもの

42候補中4: F23商品同定/pack shot、Q02発話・受け手の視点交替、Q08商品同定への連鎖、Q11MVのperformance/情景交替。F23とQ08は同じ課題を二つの層から見たもの。4件の新Patternを直ちに要求する数ではない。

その他9候補はnot-a-pattern。サイズ、中央/余白配置、OTS、保持選択を全て編集目的Patternへ昇格させると、検索と意味の境界が崩れる。

## 7. 新Pattern候補

| 候補 | 編集上の仕事 / 根拠 | 既存との差 | 想定category / confidence |
| --- | --- | --- | --- |
| 商品同定・パックショット | 商品とpackageの識別を確立。C01@00:28、C03@00:28、C04@00:28、G03/G10 | B01発信元、C06次の行動、L05対象挿入のいずれとも同定の不変条件が一致しない | informationまたはbranding、未決定。構造根拠は強い |
| 発話・受け手の視点交替 | 相手への応答/反応を示す。TV01@00:30/40/45、X01@00:01/15/30 | L01同時表示、R02寄り、R11反応の累積だけでは対象関係が欠ける | 新PatternよりSequence referenceを優先。中 |
| 演者・身体・情景の交替 | MV01/MV02の演者と別coverageの往復 | E03過程圧縮とは必ずしも一致しない。A04拍同期は未検証 | Sequence研究。中以下、実装候補から保留 |

名称・category・confidenceは本研究のproposal。sourceの主張ではない。全画面数字・歌詞演出・Duetについては追加観測の不足を新Patternで埋めない。

## 8. Schemaへの影響

今回はschemaを変更しない。既存`visual.layout`や`visual.motion`への自由記述は可能だが、独立referenceの同一性や前後状態の関係を宣言する型はない。将来必要性を検証する最小概念は以下。

1. 再利用する構図referenceのidentityと、対象/文字レイヤーの関係。
2. authored意味役割の移行に対して、保持・変更・復帰する構図状態の関係。
3. この抽象化の根拠Observationとinferred/proposalの区別。

これらを`visual.composition`へ入れるか、独立catalogから参照するかの具体的なfield/APIは未承認。Cは二層の必要性の判断でありschema設計の先取りではない。geometry・秒数・asset・必須transitionのenumをこの段階で増やさない。

フォント調査は第三のruntime catalogを直ちに要求しない。12画面では太細差・縁・占有・配置の組合せが異なる役割を持ち、正確なfont名は未同定だった。書体familyから感情を自動決定するenumは作らない。文字の役割・優先度・書字方向をportableな関係として検討し、具体的font/weight/装飾とブランドの声は外部表現設計に置く。

## 9. Handoffへの影響

v0.1.0のHandoffは選択済みPatternのportable grammarとtyped inputを渡す。新referenceを将来渡す場合も、Agentが選んだreferenceと対象関係を明示的に保持するだけにする。

`SceneImplementationHandoff.patterns[]`の順序をtimelineと読み替えたり、同じ名前のinputを自動統合したりしない。Sequenceは編集候補の関係referenceであって実行計画ではない。未知の対象・復帰先・文字優先度を補完しない。semantic-onlyとhistorical-exceptionの扱いも維持する。

## 10. Searchへの影響

`数字を大きく`からVS-I05へ届かなかった問題は再現した。`数値`では届くため、既存意味への日常語の到達性の問題として別管理する。Composition Catalogを増やすだけでは直らない。

将来reference retrievalを検討するとしても、Patternの選択と構図候補の検索を区別し、既存Search v2のscoreを編集品質や構図の好ましさに変換しない。このPhaseではコードもタグ語彙も変更しない。

## 11. Agent Skillへの影響

将来の最小変更候補は、Pattern選択後に「今の主役と次の主役」「文字の役割」「保持/解除する情報」「同じ構図を保つ理由」を確認する手順。全カットへのvariation割当ではない。

Agentは意味・Taste・対象を決め、構図referenceを選ぶ。runtimeに自動的な最適構図の選択やwinner判定を持ち込まない。現行Skillは今回変更しない。

## 12. RendererとPlatform Contextの境界

| Editing Grammar / reference | Agent / application | Renderer / Harness |
| --- | --- | --- |
| 顔が主役、資料が副画面、反応後に基準画へ戻るという関係 | 対象のidentity、反応の意味、どこが強調beatか、brand方針、素材と権利 | 実際のcrop、x/y、pixel、font、palette、curve、timeline、asset配置と実行 |
| 読む文字と見せる対象の関係、source根拠 | 文字content、翻訳/分割、reading priority | 字形・改行・実寸・表示時間の解決 |
| 重要情報を保護する制約との接続 | 出力先/platform profileの供給 | UI overlayを踏まえた具体geometry |

フォントの字面や改行による占有範囲は、構図と切り離して最後に装飾するだけでは済まない。ただしGrammarが書体・サイズを固定する理由にはならず、renderer側が外部の書体選択を反映して可読性と対象保護を検証する。フォントの名称・ファイル・利用可能性を実動画の画像から推定して渡さない。

Compositionの「顔寄り」とPlatform Contextの「右側のengagement UIを避ける」は別。content-onlyのframeからsafe zone適合を認定しない。[Google](https://support.google.com/google-ads/answer/9128498)もoverlayの位置が形式・画面で変わると説明する。

## 13. Decision C

最も強い理由は、**同じframe構造が複数の編集目的で使われ、さらに意味の切替に伴う文字・対象・領域の持続/解除が、frame単体のラベルだけでは表せない**こと。S09の問題パネル解除、Y10のPIP→全画面、X01の人物→封筒→人物は、その異なる実例である。

- AだけではPatternとの一対一対応を過度に仮定する。
- Bは再利用を扱えるが、なぜ/いつ構図を変え、何を保つかが残らない。
- Cは単画面と意味に伴う状態関係を分けられる。
- Dを全体判断にはしない。coverageと複数sourceの反復は揃った。ただしPOV、歌詞同期、Duet等の個別項目は保留する。

反対の最も強い理由: v0.1.0にも自然言語recipeとAgent判断があり、独立catalogは維持する契約を増やす。今回の視覚観測だけで、二層化が生成動画の単調さを改善すると実証したわけではない。したがって次は小さいfixtureで追加構造の効用を確認し、効果がなければ拡張しない。

## 14. 次の最小Batch（提案のみ）

**Composition reference fixture spike**を一つだけ行う。renderer adapterや92 Patternの一括enrichmentは含めない。

- 6つのframe reference例: 共同状況、単独反応、全文脈の細部insert、資料＋話者、文字優先、商品同定。
- 4つのsequence reference例: Q01、Q03、Q04、Q12。必ず「保持」を含める。
- 実例と架空のsceneを区別し、N/S/TV各sourceへの根拠link、対象ID、文字の役割、基準画、未解決contextを手で記述する。Researchから直接production Pattern YAMLへ変換しない。
- 受け入れ条件: Patternの意味を変えず複数ジャンルへ再利用できること、テロップ位置と役割を混同しないこと、Sequenceが無条件のカット変更を要求しないこと、Handoffの順序をtimelineへ読み替えないこと、geometryを外部に残せること。
- fixtureレビュー後に最小のschema/参照方法を別途決める。商品同定Patternの採否、Searchの自然語到達性、音声同期のMV追加研究も別判断にする。

このPhaseでの変更は研究YAML二つと文書三つだけ。v0.1.0のPattern・schema・runtime・tests・Skill・README・packageとtagは維持する。
