# Composition Reference Research v0.1

2026-10-01 / Editing Grammar v0.2 Phase 0。対象baselineはv0.1.0、`4a7c793743ffb00d5e8b7720ebb9edfcb1bac94e`。この文書のv0.1は**調査版番号**であり、製品の新releaseではない。

## 調査方法

Sourceを読む → 実動画の画面を確認 → 共通構造を抽象化 → 既存92 Patternと照合、の順で実施した。先にruntime enumや新Patternは作っていない。

動画は公開プレイヤーのdecoded frame、または公開動画ファイルの指定時刻frameを直接確認した。タイトル・説明・字幕の文字だけから構図を推定していない。長尺では冒頭・説明場面と選択した窓の1秒間隔、短尺・CMでは複数の離れた時刻と一部の密な窓を採取した。**全編を通して見た記録でも、全カットの網羅ログでもない**。timecodeは動画の内容時刻であり、厳密な編集点ではない。隣接サンプル間にも未記録のカットがあり得る。

第三者の画像・動画・ロゴはrepoに含めない。再確認用のURL、timecode、画面のテキスト記録のみを残す。広告・読み込み画面・プレイヤーUIが混入したframeは除外した。TikTokのU01は再生を確認できず`visual_unverified`として除外。ミュートで視覚確認しているため、音声の連続性、発話内容の正確さ、拍との同期は未検証。

- **observed**: その時刻に見える人物・文字・枠・対象・配置・状態変化。
- **inferred**: `beat_role`、`editorial_job`、複数画面から抽象化したSequence。作者の意図を直接確認したという意味ではない。
- **proposal**: Editing Grammar向けの候補名・収録区分・将来契約案。研究用ラベルを正式なenumとして扱わない。

データ正本は[sources.yaml](../research/composition/sources.yaml)と[observations.yaml](../research/composition/observations.yaml)。Observation内の意味解釈はnested `evidence_type: inferred`で区別した。カメラ移動の機構やUI適合が判断できない場合はunknown相当を明示した。

## Source構成と観測件数

| 指標 | 実数 | 数え方 |
| --- | ---: | --- |
| 使用した外部source | 72 | guidance 27 + 実動画44 + 既存source library 1 |
| Tier 1 / Tier 2 guidance | 27 | 文書数。発行主体は9系統。Adobeの複数記事を独立した制作組織とは数えない |
| 直接視覚確認した実動画 | 44 | 同一creativeの再投稿やframeを別動画に数えない |
| 日本YouTube長尺 | 15 | NOBROCK 6 + その他9。MVはこの最低15本に含めない |
| 縦型short-form | 15 | YouTube Shorts 9 / TikTok 5 / X 1 |
| TV / CM | 10 | 公式TVクリップ4 / 企業CM6 |
| 追加MV | 3 | 米津玄師、藤井風、Creepy Nutsの公式動画 |
| 追加X横型広告 | 1 | Naranja X。縦型件数には含めない |
| Frame observation | 213 | 213の時刻付き画面状態。213の異なるショットという意味ではない |
| 字形・文字処理の追加確認 | 12 | 213観測の内数。正確な使用フォント名は未同定 |
| Frame候補 | 30 | うち複数実動画で確認した候補21 |
| Sequence候補 | 12 | うち複数実動画で確認した関係11 |
| 未視覚確認 | 1 | U01。使用source・動画・観測件数から除外。registryは除外分を含む73件 |

目的抽出に向くサンプルを選んだ便宜標本である。NOBROCK・QuizKnock、公式広告、取得可能な動画に偏りがある。TikTokは広告事例に偏り、X縦型は1本、MVは3本。投稿年・国・制作者の代表性や視聴成果は検証していない。これらの件数から業界の利用率や効果の因果関係は推定しない。

### guidanceを何の根拠にしたか

| 系統 | Sources | 確認した範囲 / 限界 |
| --- | --- | --- |
| Google / YouTube | G01–03 | Shortsの縦型、タイトな画、人物・商品の視認性、ブランドと行動案内。safe zoneは配信面依存。冒頭のショット数を固定規則にはしない |
| TikTok | G05–06, G20–22, G24 | static/pan/tilt/push/zoom、字幕とtext overlay、hook/body/close、実演、DuetとStitchの相違。広告助言の効果数値は転用しない |
| X | G07–08 | mobile visibility、縦全画面、商品・メッセージ・CTA。公式ページの静止モックアップは実動画ではない |
| Thinkbox | G10 | pack shot・商品・ブランドの識別と文字量。主にスポンサー提供クレジットの文脈であり通常CM全体に一律適用しない |
| Adobe | G11–17 | ショットサイズ、角度、二人・集団・OTS・POV、coverage、B-roll、storyboard、thirdsとその例外 |
| BBC Academy | G18 | 顔と動作のcoverage、肩越し、別角度。教材内のtwo-shotの用法には文脈差がある |
| Morisawa / Fontworks・Monotype / Adobe | G25–30 | 書体の印象・字形の識別性・放送用文字設計。メーカー/教育資料であり、視聴者への心理効果を測った実験ではない |
| QuizKnock制作担当者 | G19 | 発話・反応・寄り引き・Shortsのテロップの役割。自社制作の実践であり日本動画全体の規則ではない |

特に[Google safe zones](https://support.google.com/google-ads/answer/9128498)、[TikTok Creative Guidance](https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en)、[X creative guidance](https://business.x.com/en/advertising/creative-best-practices)、[BBC coverage教材](https://downloads.bbc.co.uk/academy/collegeofproduction/docs/five_essential_shots_ts.pdf)を、配置・文法・配信条件を分ける根拠にした。

## Frame Composition

単一の「構図名」に詰め込むと、撮影距離と情報の役割が混ざる。観測から区別できたのは次の関係である。名称は研究上の整理で、採用済み仕様ではない。

| 観点 | 観測またはreferenceで確認した内容 | 代表例 |
| --- | --- | --- |
| Framing | 場所を含むwide、全身、上半身、顔、手元・商品細部 | N02、Y08、S05、MV02。極端な寄りと通常のcloseは区別 |
| Subject relation | 一人、二人/集団、肩越し、人物と商品 | N03、TV01、X01、C02。POVは広告の文章だけでは認定しない |
| Arrangement | 同時二分割、上下二ソース、inset、三領域、主素材＋文字 | N06、S01、TT02、Y10、C05 |
| Dominance | 人物の顔、資料、商品、数字、文字が一時的に優先 | Y10、S03、S02、MV03。顔が見えることと顔が主役であることは違う |
| Text relation | 顔の上、胸元、下、側方、独立パネル、人物/商品と重なる文字 | S01、TT01、TV03、C04、S09 |
| Reading direction | 本当の縦書き、横書きの複数行、文字を大きく縦長にしたもの | TV03/C04/MV03、S01/TT01、S03。三つを同じ「縦並び」にしない |
| Negative space | 対象の脇を文字・ブランドに割り当てる | C02、C05、X02。三分割線との一致を実測したわけではない |

[Adobeのthirds教材](https://www.adobe.com/au/creativecloud/photography/discover/rule-of-thirds.html)は中央配置等の例外も認める。写真の助言を動画へ転用すること自体はinferredであり、「人物は必ず三分割交点」は導かない。カメラを物理的に近づけること、レンズのzoom、編集crop、別カメラへのcutは、見かけのサイズ変化だけでは識別できない。

## テロップ × カット × コマ割り × 演出

「テロップは下」は全領域の基準にできない。一方、上部にある文字を全て発話字幕として扱うのも誤りである。

| 構造と実例 | 文字の役割・配置 | カット / 枠との関係 | 抽象化できること |
| --- | --- | --- | --- |
| N01@03:00→03:01→03:08 | 下の発話・ツッコミ | 話者寄り→二人の反応→司会単独 | 文字の強調と注目人物の切替は別々に起こり得る |
| S01@00:10–00:20 | 上の問題パネル→胸元の反応 | 問題を残した人物画から、料理の下段帯を追加し、反応へ寄る | question persistence / releaseと画の主役交替を関連付ける |
| S09@00:16–00:19 | 上の企画名は持続、下の問題を解除 | 三人→一人。問題パネルから通常の胸元字幕へ | 永続見出し・問題・発話を別レイヤーとして扱う |
| S02@00:19→00:25→00:30 | 胸元複数行→中央の巨大文字→文字なし | 基準となる人物関係はほぼ保持 | 文字優先度だけ変える演出もある。全てをreframeにしない |
| TT01@00:01–00:06 | 顔の上の状況説明は固定 | 表情・手の反応だけが変化 | 切らずに反応を見せる選択も成立 |
| TV03@00:01 / C04@00:28 / MV03@01:02 | 側方の本当の縦書き | 氏名紹介 / 商品コピー / 歌詞で役割が違う | 書字方向を意味Patternと分離して再利用 |
| S06@00:16→00:18→00:30 | 下の逐次説明と右下キャラクター | 上の関係図→黒背景の強調→地図へ | narrator layerを保ちながら資料の意味を切り替える |
| TT06@00:05→00:15→00:20 | 内側の映像枠の下に説明、後にCTAと矢印 | 縦キャンバス中央の横長映像を維持 | キャンバス座標と素材内座標、CTAと発話字幕を混同しない |

文字の出現・解除・優先度は画面上で確認した。使用font名・縁取りの数値・easing・フレーム数・発話の単語単位同期は未確認。字形と縁取りの見える特徴は下記12画面で追加記録した。MVの歌詞やCMコピーは全文転記しない。

## フォント・文字処理が与える印象

フォントは今回の構図調査に追加した。**同じ言葉でも字形は印象に関わるが、書体名だけから感情や編集目的を決定しない。** 以下はメーカー/教育資料の説明と、画面からの解釈を分けた整理である。視聴者実験はしていない。

### 制作資料から確認できたこと

| 観点 | 資料で示される用途・印象 / 判断上の注意 | 根拠 |
| --- | --- | --- |
| 角ゴシックの中の差 | 骨格、かな、線の処理で中立・機械的・肉声的などの印象が変わり得る。「ゴシックは全て同じ声」ではない | [Morisawa G25](https://note.morisawa.co.jp/n/na1ea11487e12) |
| 明朝・serif系 | 伝統や権威の連想は制作上の一例。日本語と欧文、本文と強調見出しで文脈が違う | [Adobe G28](https://www.adobe.com/creativecloud/design/discover/serif-vs-sans-serif.html) |
| 画面向け明朝 | 細い横画の視認性に配慮した放送用の再設計がある。明朝を単純に太くする処理とは別 | [Fontworks G26](https://lets-site.jp/fontstory/column/archives/5) |
| 丸みと親しみ | 丸い骨格による印象と、字の空間・濁点などの識別性は別の設計軸 | [Morisawa G27](https://www.morisawa.co.jp/fonts/specimen/detail/864) |
| 手書き・印刷物を思わせる温度 | ゴシック系にも墨だまりや有機的な骨格がある。「柔らかさ＝丸ゴシックだけ」としない | [Morisawa G30](https://note.morisawa.co.jp/n/n033b195efa1a) |
| 読みやすさと用途 | 字の判別性、線の太さ、表示環境を見て判断する。UDという名称だけで動画全般の読了を保証しない | [Morisawa G29](https://www.morisawa.co.jp/products/fonts/bizplus/lineup/) |

### 実動画の字形 × 配置 × カット

12画面の`typography`をobservations.yamlに追加した。`observed_features`は見える特徴、`family_hypothesis`と`impression`はinferred、`exact_font_name`は全件未同定。ロゴや加工文字を市販フォントと同一視していない。

| 実例 | 画面で確認した特徴 | 構図・演出との関係（解釈） |
| --- | --- | --- |
| N02@03:00 / X01@00:01 | 前者は太細差のある大きい下文字＋縁/影、後者は小さな白い胸元文字。両方とも明朝系に見える | 強いツッコミと控えめな発話補助で役割が違う。「明朝＝静か」という固定対応への反例 |
| S02@00:19→00:25 | 胸元の複数行から、人物を覆い画面外にはみ出す巨大文字へ | 二人の基本関係を保ちながら文字を主役にする。同じfontかどうかを断定せず、サイズ/占有/縁を分ける |
| S09@00:19 | 上の太い企画名と、胸元の色文字＋複数の縁 | 顔へ寄った後も企画名は持続。書体処理は情報レイヤーの役割分担と一緒に読む |
| TT06@00:05 / TV03@00:01 | 白帯の黒文字、縦の氏名と横の発言、背景から文字を離す処理 | 背景・文字方向・氏名/発話の違いを保持。縦書きそのものを感情演出と呼ばない |
| MV03@01:02 / C04@00:28 | 顔両側の太い縦書き / 商品両側の縦書きと輪郭差 | 歌詞graphicと商品コピーで同じ方向を再利用。拍同期や書体加工の方法は未確定 |
| S03@00:05 | 縦長の細い欧文字の前に商品 | 文字が背景構図になる。縦書き、condensed font、拡大変形は同義ではない |
| C02@00:59 / C06@00:14 | 余白内の小さな日本語コピー＋brand / 太い訴求文と別階層の注意文 | 落ち着いたbrand提示と強い訴求の差は、フォントだけでなく余白・色・人物・文言にも依存 |

**収録案（proposal）:** 文字の意味役割、主従、書字方向、保持/解除はCompositionとの接点として残す。ブランドの声、具体的font、weight、縁取り、改行、実寸は外部の表現設計とrendererに残す。選んだfontによる文字幅・高さの変化は配置に影響するので、実際のframeで顔/商品/他の文字との競合を確認する必要がある。数値のデフォルトにはしない。

手書き書体や丸ゴシックの固有使用を今回の映像だけから確定する根拠は弱い。怖さ・信頼感・高級感などをfont別の確定ラベルにしたり、視聴維持率が上がると主張したりしない。VS-T09などのTaste-dominant Patternを、この調査を理由に自動実装へ変更しない。

## Composition Sequence

Frame候補の列挙だけでは、「Patternを替えたのに全部同じ画」に対処できない。`Q01–Q12`に、**意味役割の移行 → 見せる対象・優先度・距離の移行**をinferredとして記録した。

| 関係 | 例 | 留意点 |
| --- | --- | --- |
| 共同状況→話者/反応→共同状況 | Y08、S09（Q01） | baseへ戻ることも意味がある |
| 話者→受け手/応答 | N01、TV01、X01（Q02） | 人物IDと関係を保持。ランダムな別人の顔ではない |
| 説明→対象/資料→説明 | TV03、S03、S08（Q03） | 視覚連鎖は確認。J/Lカット等の音声連続は未認定 |
| 問題→結果/反応 | Y15、S01、S09（Q04） | 問題文字が残る場合と消える場合を記録 |
| 発話→文字強調→reset | S02、N06（Q05） | 顔の大きさを必ず変える必要はない |
| 全体→細部→文脈 | TT04、X01、S03（Q06） | 指定対象の同一性と戻り先が重要 |
| 人物/使用→商品同定 | C03、TT02、C02（Q08） | 全例が同じ四段階の順ではない |
| 併置→主資料全画面 | Y10、S07（Q09） | 領域数だけでなく主従の変化 |
| 内容→行動/ブランド終端 | C05、C06、X02（Q10） | pack shot、logo、CTAは違う仕事 |
| 演者↔ダンス/環境/動作 | MV01、MV02（Q11） | 曲の拍・楽節同期は未検証 |
| 同じ画を保ち文字・反応だけ更新 | TT01、TT06、MV01（Q12） | 構図を変えない例も研究の一部 |

Q07の工程→結果はS07で確認したが、今回の同形連鎖の実動画反復数は1。教材のcoverage支持と、実例の反復は別々に扱う。ショット数、カット密度、平均ショット長は測っていない。

## Platform差・Genre差

### 日本YouTubeとテレビ

NOBROCKはN01/N06のトーク、N02のドッキリ、N03の行動検証、N04/N05の複数人・監視/反応構造を含む6本。下の大きいテロップは実在するが、全体引き、単独の顔、監視映像、上下の企画見出し、分割された顔も使われる。構図と字幕を一つのpresetに固定する根拠にはならない。

TVは徹子の部屋（対話）、ZIP!（情報）、ANN（ニュース）、いろはに千鳥（バラエティ）の公式クリップ。TV01では相手への視点交替、TV03では人物→関連対象→人物が見える。クリップ編集が放送全編と同じであるとは主張しない。

日本語の反応テロップは発話の補助だけでなく、編集者の解釈、問題/企画の持続、人物の識別を兼ねる。[QuizKnock制作担当者の説明](https://web.quizknock.com/oshigotodiary2?page=2)も、寄り引きや文字の使い分けが文脈次第であることを裏付ける。長尺Y11とTV02の観測窓では集団画を保持しており、反応のたびに顔アップへ切るわけではない。

### Vertical-native / SNS

Shortsは会話・クイズ・コメディ・商品・美容Before/After・解説・工程を含む。画面が縦でも、文字は上・胸元・下・側方へ分かれ、映像二ソースの上下と横書き多行も別物だった。TikTokはTop Adsと公式guide内の公開embedで実画面を確認。X01の縦型ドラマでも胸元字幕、対面の切返し、封筒のinsertが成立している。

ネイティブTikTok Duetの直接反復観測は不足。[公式playbook](https://ads.tiktok.com/business/library/TikTok_SMB_Creative_Playbook_Holiday_Edition.pdf)の同時併置とStitchの順次接続は確認したが、S07のinsetをTikTok機能そのものの利用証拠とはしない。TT01の「Duet」はアプリ名である。

### TV CM / Web CM

日清食品、資生堂、Google、サントリー、UNIQLO、メルカリの6本で、食品、beauty、端末、飲料、衣服、サービスを横断した。商品使用・人物、細部/質感、単独商品、パッケージ群、ブランド終端は区別できる。C04の縦書きコピー、C05の三領域、C06のサービスCTAもあり、CMを一律のproduct-center構図には還元できない。

[Google ABCD](https://support.google.com/google-ads/answer/14783551?hl=en)と[Thinkboxのスポンサーcreative guidance](https://www.thinkbox.tv/how-to-use-tv/sponsorship-and-content/tv-sponsorship/tv-sponsorship-creative-guidelines)は商品・ブランド識別を支持する。ただし制作目的と適用面が異なるので、二資料の助言をそのまま全CMの尺・文字量・座標規則にしない。

### MV

MV01「Lemon」は近い正方形の有効画を横長containerに収め、群像の歌手とダンス/室内を切り替える。01:01–01:08では同じ集団構図を保つ。MV02「きらり」は人物から通路全景、バイク細部、移動、ダンスへ視点を変える。MV03「Bling-Bang-Bang-Born」コラボMVでは文字自体が主役になり、側方の縦書き、人物全身、反復するキャラクター列を使う。

MVの3本は写実performance・身体表現・アニメ/歌詞graphicの差を見る追加標本。全MVを代表しない。「音楽の拍に合わせてcutした」「歌詞のその単語で構図を変えた」は音声を検証していないため未確定。

## 強い反復と弱い根拠

「複数sourceで観測」と「定番として採用可能」は同じ判定にしない。候補別の観測URLと既存coverageは[Coverage Matrix](composition-coverage-matrix.md)を参照。

| 判定根拠 | 支持される範囲 | 制限 |
| --- | --- | --- |
| A: 独立したTier 1/2が複数 | サイズ/coverage（Adobe+BBC）、商品同定（Google+Thinkbox）、UI保護（Google+TikTok+X） | 同じpublisherの別記事だけではAにしない |
| B: guidance + 複数実例 | 顔/反応への主役移行、資料併置と対象挿入、文字役割の分離 | 正確な座標や毎回の順番までは支持しない |
| C: 異なるgenre/platformで同じ関係 | 上/胸元の文字、横書き積層、顔と側方文字、構図保持 | 見た目が似るだけで同じ編集目的にまとめない |

弱いもの: 全画面数字→反応の連鎖、光学POVの直接実例、ネイティブDuetの反復、三領域の反復、歌詞の時間同期、精密なmatch-on-action、safe zoneへの実際の適合。プロ教材で定義が存在することと、この標本内で反復を確認できたことは分けた。数値訴求自体はS03で見えるが「数字だけの全画面」は未確認。

## 既存テロップ研究との整合

[source-audit.md](source-audit.md)はsource libraryの92カードを監査したもの。19件が実例・手法参考、73件が応用デザイン案、参照リンクは106件。これは92本の元動画を直接確認したという意味ではない。詳細dialogの制作値はlibrary側の提案である。

[元library](https://youtube-editing-visual-library.ayami.chatgpt.site/)の公開データを再確認した。`VN`にはNOBROCKの`jnQmkQ0WOAY`、03:00が明示され、VS-T08とVS-T09が参照している。「NOBROCKも使われていたはず」という推測ではない。ただし全92の明示sourceがNOBROCKという意味でもない。今回のN02@03:00は別途画面確認した。元libraryのfont名や制作開始値を実動画のobserved値に格上げしない。

## Search gap（別課題）

v0.1.0で実行した `npm run search -- "数字を大きく"` はVS-I14（purpose / 60）とVS-T08（goodFor / 40）を返し、VS-I05を返さなかった。対照の `npm run search -- "数値"` はVS-I05を返した。これは日常表現から既存の数値強調目的への検索到達性の問題であり、構図Patternの欠落ではない。Search・重み・Patternの語彙は変更していない。

## 既存runtimeの確認

研究成果以外の変更はない。`npm run build`成功、`npm run validate`は92 loaded / 92 valid / 0 errors、`npm test`は82 passed / 0 failed。research YAMLのparse、重複ID、source/timecode参照、必須Observation項目、文書のローカルlinkも確認した。これは研究データの整合性確認であり、全ての意味解釈が正しいという自動保証ではない。

## 収録への含意

候補は[architecture review](composition-architecture-review-v0.2.md)でDecision Cとした。frame属性の再利用と、意味の移行に応じたcomposition関係を二層で検討する。**毎カット構図を変える規則、勝手な構図選択、固定されたgeometryは作らない。** 今回は研究成果だけを保存し、実装や新Pattern作成は行わない。
