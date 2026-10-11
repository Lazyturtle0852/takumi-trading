"""site/ のアクティビティページを生成する。

公開版（site/*.html）と運営版（site/staff/*.html）を同じ中身から作る。
公開版はルール説明だけ。運営版にはお題ジェネレーター・準備物・未決事項も載せる。

    python3 tools/build_pages.py
"""
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
VER = "v0.8（仮）"

# ------------------------------------------------------------------ お題データ（運営版のみ）
CARD_ODAI = [
    "ORFのブースを3日で準備せよ｜展示物・ポスター・デモ・当日の説明まで、全部ゼロから。",
    "学会締切まで48時間、英語論文がまだ半分｜しかも分析の図もまだ仮のまま。",
    "新歓で新入生を10人確保せよ｜説明会・SNS発信・個別フォローまで。",
    "商社の役員に研究を3分でピッチせよ｜専門外の人に価値を伝え、共同研究の約束を取り付ける。",
    "ハッカソン48時間で優勝せよ｜テーマは当日発表。動くプロダクトと発表が必要。",
    "ゼミ紹介動画を1週間で作れ｜企画・撮影・編集・公開まで。",
    "卒論の中間発表が明日。まだ何もない｜テーマの整理から、スライドと発表まで一晩で。",
    "100人規模のアンケート調査を設計・分析せよ｜設問設計、配布、集計、結果報告まで。",
    "海外大学のゼミと合同オンラインワークショップを開け｜英語での進行と、当日のファシリテーション。",
    "ゼミのWebサイトを全面リニューアルせよ｜中身の取材・文章・デザイン・実装まで。",
    "合宿の行き先と企画をゼロから決めて実行せよ｜予算・移動・コンテンツ・当日の運営。",
    "研究室の知見をまとめた「ゼミ生ハンドブック」を作れ｜聞き取り・整理・執筆・デザイン。",
]

GESTURE_ODAI = [f"{w}｜{g}" for g, ws in [
    ("動物", "ゴリラ ペンギン カンガルー ヘビ ゾウ フラミンゴ ナマケモノ カニ ウサギ ニワトリ"),
    ("スポーツ", "野球のピッチャー サッカーのPK バタフライ ボウリング スキージャンプ 卓球 相撲 ボクシング フィギュアスケート 綱引き"),
    ("職業", "美容師 寿司職人 消防士 オーケストラの指揮者 パイロット 歯医者 カメラマン DJ 交通整理の警察官 マジシャン"),
    ("日常", "歯みがき 寝坊して走る 満員電車 傘が裏返る 自撮り 料理の味見 洗濯物を干す コンタクトを入れる 自転車がパンク 熱いラーメンを食べる"),
    ("大学・研究室", "発表中にPCがフリーズ 締切前の徹夜 ミュートのまま話す 学食の行列 ホワイトボードで議論 バスに乗り遅れる 教授に質問しに行く グループワークで1人だけ寝ている レポートの提出忘れ 実験が爆発"),
    ("合宿・旅行", "キャンプファイヤー 花火 温泉 枕投げ 集合写真 バーベキュー 重いスーツケース 寝袋に入る カレーを作る 怪談"),
] for w in ws.split()]

JINRO_TASK = [
    "ゼミ合宿の企画を決めよう｜行き先・日程・やること",
    "新入生歓迎会を企画しよう｜場所・内容・呼び込み方",
    "大学生向けの新サービスを立ち上げよう｜何を作って、どう広めるか",
    "ORFの展示ブースを考えよう｜見せ方・配るもの・当番",
    "ゼミの年末パーティーを企画しよう｜会場・料理・出し物",
    "研究室のWebサイトをリニューアルしよう｜載せる中身と見せ方",
]
JINRO_PAIR = [
    "満足度を最大化｜コストを最小化",
    "参加人数を増やす｜1人ひとりの体験を深める",
    "話題性を出す｜失敗リスクを避ける",
    "全員が納得して決める｜とにかく早く決める",
    "新しいことに挑戦する｜確実にできることをやる",
]

# ------------------------------------------------------------------ ひな形
PAGES = [("index.html", "ホーム"), ("jinro.html", "① 推論"), ("gesture.html", "② 注意力"), ("cards.html", "③ 資源")]


def page(staff, fn, title, desc, img, eyebrow, h1, lead, facts, body, prev=None, nxt=None, head="", tail=""):
    p = "../" if staff else ""
    on = ' class="on"'
    nav = "".join(f'<a href="{h}"{on if h == fn else ""}>{t}</a>' for h, t in PAGES)
    if staff:
        nav += f'<a class="pub" href="../{fn}">公開版 ↗</a>'
    fx = "".join(f'<div class="fact"><div class="k">{k}</div><div class="v">{v}</div></div>' for k, v in facts)
    pg = ""
    if prev or nxt:
        pg = '<section><div class="wrap"><div class="pager">'
        pg += f'<a href="{prev[0]}"><small>← 前へ</small>{prev[1]}</a>' if prev else "<span></span>"
        pg += f'<a class="next" href="{nxt[0]}"><small>次へ →</small>{nxt[1]}</a>' if nxt else "<span></span>"
        pg += "</div></div></section>"
    n = iter(range(100))
    body = re.sub(r'<span class="num">\d*</span>', lambda m: f'<span class="num">{next(n):02d}</span>', body)
    body = body.replace("{P}", p)
    banner = ('<div class="draft-banner staff-banner">運営用ページ ── お題・準備物・未決事項つき（参加者には公開版を見せる）</div>'
              if staff else f'<div class="draft-banner">SBC合宿 10/13 アクティビティ {VER}</div>')
    robots = '\n<meta name="robots" content="noindex">' if staff else ""
    html = f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{"【運営】" if staff else ""}{title}</title>
<meta name="description" content="{desc}">{robots}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p}style.css">{head.replace("{P}", p)}
</head>
<body>

{banner}
<nav class="nav"><div class="wrap">{nav}</div></nav>

<header class="hero">
  <img src="{p}images/{img}" alt="">
  <div class="wrap">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{h1}</h1>
    <p class="lead">{lead}</p>
    <div class="facts">{fx}</div>
  </div>
</header>

<main>
{body}
{pg}
</main>

<footer>SBC合宿 2026 アクティビティ ── たくみ研 ／ {VER}{"（運営用）" if staff else ""}</footer>
{tail.replace("{P}", p)}</body>
</html>
'''
    out = os.path.join(ROOT, "staff" if staff else "", fn)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as f:
        f.write(html)


def js_list(items):
    return "[" + ",".join('"' + s.replace('"', '\\"') + '"' for s in items) + "]"


def tools_section(title, sub, blocks, note=""):
    inner = "".join(f'<div><h3>{h}</h3><div id="{i}"></div></div>' for h, i in blocks)
    note = f'<p class="note">{note}</p>' if note else ""
    return f'''<section id="tools">
  <div class="wrap">
    <h2><span class="num"></span>{title}</h2>
    <p class="sub">{sub}</p>
    <div class="tools">{inner}</div>
    {note}
  </div>
</section>
'''


def prep_section(prep, open_items):
    a = "".join(f"<li>{x}</li>" for x in prep)
    b = "".join(f"<li>{x}</li>" for x in open_items) or "<li>なし</li>"
    return f'''<section id="prep">
  <div class="wrap">
    <h2><span class="num"></span>準備物・未決事項</h2>
    <div class="grid g2">
      <div class="panel"><h3>準備物</h3><ul class="check">{a}</ul></div>
      <div class="panel"><h3>未決事項</h3><ul class="check open">{b}</ul></div>
    </div>
  </div>
</section>
'''


def steps(items):
    return "".join(f'''      <div class="step"><div>
        <div class="meta">{m}</div>
        <h3>{h}</h3>
        {b}
      </div></div>
''' for m, h, b in items)


# ------------------------------------------------------------------ ホーム
def act_row(href, img, no, name, desc, t0, t1, items):
    li = "".join(f"<li><span>{a}</span><b>{b}</b></li>" for a, b in items)
    return f'''      <div class="tt-row">
        <a class="tt-act" href="{href}"><img src="{{P}}images/{img}" alt=""><div class="body"><span class="no">{no}</span><h3>{name}</h3><p>{desc}</p><span class="go">ルールを見る →</span></div></a>
        <div class="tt-time"><div class="clock">{t0}<small>〜</small>{t1}</div><div class="dur">25分</div><ul>{li}</ul></div>
      </div>
'''


def mini_row(t0, t1, dur, name, desc):
    return f'''      <div class="tt-row mini"><div class="tt-act"><div class="body"><h3>{name}</h3><p>{desc}</p></div></div><div class="tt-time"><div class="clock">{t0}<small>〜</small>{t1}</div><div class="dur">{dur}</div></div></div>
'''


def build_home(staff):
    game = "ゲーム（やり方は未決）" if staff else "ゲーム"
    body = '''<section id="timetable">
  <div class="wrap">
    <h2><span class="num"></span>アクティビティとタイムテーブル</h2>
    <p class="sub">チームA〜D対抗。3つのアクティビティの合計点（＋料理の点）が一番多いチームが優勝。上から順に進める。時刻は開始からの経過時間。</p>
    <div class="tt">
''' + mini_row("0:00", "0:10", "10分", "全体説明", "チームA〜Dの確認、得点のつけ方、3つのアクティビティの流れ。") \
        + act_row("jinro.html", "jinro.jpg", "① 推論", "目的ズレ人狼", "1人だけ少し違うゴールを持ったまま議論し、誰がズレているかを当てる。", "0:10", "0:35",
                  [("ルール説明", "3分"), (game, "18分"), ("振り返り", "4分")]) \
        + act_row("gesture.html", "gesture.jpg", "② 注意力", "妨害ジェスチャー", "1チームずつジェスチャー。ほかの3チームは全力で気を散らす。", "0:35", "1:00",
                  [("ルール説明", "3分"), ("2分（90秒＋交代）× 4チーム × 2巡", "16分"), ("振り返り", "3分"), ("予備", "3分")]) \
        + act_row("cards.html", "hero.jpg", "③ 資源", "インテリジェントなチームを作れ！", "全員の強みが載ったカードから、お題に合う3人を選んでプレゼン。", "1:00", "1:25",
                  [("ルール説明", "3分"), ("8分 × 2ラウンド", "16分"), ("集計・予備", "6分")]) \
        + mini_row("1:25", "1:30", "5分", "表彰", "料理の点も足した合計で優勝チームを発表。") + '''    </div>
  </div>
</section>
'''
    tail = ""
    if staff:
        body += tools_section("チームの順番", "ジェスチャーの演技順などに。押すたびにシャッフル。", [("チームA〜D", "order")])
        body += '''<section id="prep">
  <div class="wrap">
    <h2><span class="num"></span>運営メモ（全体）</h2>
    <div class="grid g2">
      <div class="panel"><h3>共通の準備物</h3><ul class="check">
        <li>チームA〜Dの得点表（ホワイトボードの端。料理の点も同じ表に）</li>
        <li>タイマー（90秒・20秒・2分）</li>
        <li>プロジェクター（参加者には公開版を映す。お題は運営版から）</li>
        <li>各アクティビティの準備物は、それぞれのページに</li>
      </ul></div>
      <div class="panel"><h3>未決事項（全体）</h3><ul class="check open">
        <li>料理の点のつけ方と、各アクティビティの点の重み</li>
        <li>当日の開始時刻</li>
      </ul></div>
    </div>
    <p class="note">※ ジェネレーターで当日追加・削除した項目は、その端末のブラウザにだけ保存される。本番で使う端末で操作すること。</p>
  </div>
</section>
'''
        tail = '<script src="{P}generator.js"></script>\n<script>mountShuffle(document.getElementById("order"), ["チームA","チームB","チームC","チームD"]);</script>\n'
    page(staff, "index.html", "SBC合宿 アクティビティ", "SBC合宿 2026 チームインテリジェンス輪読アクティビティ", "home.jpg",
         "SBC合宿 2026 ／ チームインテリジェンス輪読アクティビティ", "チーム対抗<br>アクティビティ",
         "推論・注意力・資源の3つのゲームで、チームA〜Dが合計点を競う。",
         [("形式", "チームA〜D 対抗"), ("勝ち方", "3つ＋料理の合計点"), ("時間", "計90分"), ("内訳", "説明10＋25分×3＋表彰5")],
         body, tail=tail)


# ------------------------------------------------------------------ ① 目的ズレ人狼
def build_jinro(staff):
    body = '''<section id="why">
  <div class="wrap">
    <h2><span class="num"></span>ねらい</h2>
    <p class="sub">チームインテリジェンスの「推論」──目的の明確化と信頼</p>
    <p class="big-quote">目的が曖昧なまま進むと、チームは崩れる。それを遊びながら体感する。</p>
  </div>
</section>

<section id="howto">
  <div class="wrap">
    <h2><span class="num"></span>遊び方</h2>
    <p class="sub">カードは使わない。普通の人狼の、中身がチームインテリジェンス版。</p>
    <div class="steps">
''' + steps([
        ("はじめに", "共通の課題が出る", "<p>全員に同じ課題が出る。例：「ゼミ合宿の企画を決めよう」「新入生歓迎会を企画しよう」。</p>"),
        ("こっそり", "目的が配られる", "<p>ほとんどの人には同じ目的が、<b>1人（ズレ役）だけ少し違う目的</b>が、紙でこっそり配られる。自分がズレ役かどうかは自分にしか分からない。</p>"),
        ("議論", "課題を話し合う", "<p>目的は口に出さずに、課題の中身を議論する。ズレ役はバレないように話を合わせる。</p>"),
        ("投票", "ズレ役を当てる", "<p>誰の目的がズレているかを投票で当てる。最後に全員の目的を公開する。</p>"),
    ]) + '''    </div>
  </div>
</section>
'''
    tail = ""
    open_items = []
    if staff:
        pairs_table = '''<details class="gen-edit" style="width:100%;margin-top:20px"><summary>運営メモ：目的ペアの一覧（参加者に見せない）</summary>
    <p class="note">ズレは大きすぎるとすぐバレ、小さすぎると誰も気づかない。運営で一度読み合わせて調整する。</p>
    <div class="table-wrap"><table>
      <tr><th>多数派の目的</th><th>ズレ役の目的</th></tr>
''' + "".join(f'      <tr><td class="name">{a}</td><td>{b}</td></tr>\n' for a, b in (x.split("｜") for x in JINRO_PAIR)) + '''    </table></div></details>'''
        body += tools_section("配布ツール", "①課題を引いて投影 → ②目的ペアを引く（伏せたまま。運営だけタップで確認）→ ③人数を入れて配布モード。<b>端末を順番に回すと、1人ずつ「あなたの目的」だけが表示される</b>。多数派／ズレ役の区別は画面に出ない。",
                              [("① 課題（投影OK）", "g-task"), ("② 目的のペア（伏せてある）", "g-pair"), ("③ 配布モード（端末を回す）", "g-deal")],
                              note="ズレ役は配布のたびにランダムで決まる。答えは全員に配り終わったあと、「運営：答えを見る」を長押しで表示。卓が複数あるときは「次の卓を配る」で、同じ課題・ペアのままズレ役だけ引き直す。" + pairs_table)
        body += prep_section(["共通の課題（ジェネレーターに入っている）", "配布はこのページの配布モード（端末1台を回す）。予備に紙の目的カードも",
                              "運営で一度読み合わせて、ズレの幅を調整する"],
                             ["やり方：各チームの代表1人ずつで1卓を組んで全員で観るか、チーム内で番号を振って同じ番号同士で卓を組むか",
                              "得点のつけ方（ズレ役を当てたら？ ズレ役が逃げ切ったら？）",
                              "ゲーム18分の中の議論・投票の時間"])
        tail = ('<script src="{P}generator.js"></script>\n<script>\n'
                f'const gTask = mountGenerator(document.getElementById("g-task"), {{key:"jinro-task", items:{js_list(JINRO_TASK)}, button:"課題を引く"}});\n'
                f'const gPair = mountGenerator(document.getElementById("g-pair"), {{key:"jinro-pair", items:{js_list(JINRO_PAIR)}, labels:["多数派","ズレ役"], secret:true, secretNote:"運営だけが見る", button:"ペアを引く"}});\n'
                'mountDeal(document.getElementById("g-deal"), {n:4, task: gTask.current, pair: gPair.current});\n</script>\n')
    page(staff, "jinro.html", "目的ズレ人狼", "SBC合宿アクティビティ① 推論：目的ズレ人狼", "jinro.jpg",
         "アクティビティ ① ／ 推論 ／ 0:10〜0:35", "目的ズレ人狼",
         "1人だけ、少し違うゴールを持っている。議論しながら、誰の目的がズレているかを見抜け。",
         [("テーマ", "目的の明確化と信頼"), ("時間", "25分（説明3・ゲーム18・振り返り4）"), ("道具", "目的カード（カードゲームのカードは使わない）")],
         body, nxt=("gesture.html", "② 注意力：妨害ジェスチャー"), tail=tail)


# ------------------------------------------------------------------ ② 妨害ジェスチャー
def build_gesture(staff):
    body = '''<section id="why">
  <div class="wrap">
    <h2><span class="num"></span>ねらい</h2>
    <p class="sub">チームインテリジェンスの「注意力」──何に、いつ、どのように焦点を合わせるかが明確な状態</p>
    <p class="big-quote">ノイズだらけの中で、自分のチームの演者だけに焦点を合わせ続ける。</p>
  </div>
</section>

<section id="howto">
  <div class="wrap">
    <h2><span class="num"></span>遊び方</h2>
    <p class="sub">普通のジェスチャーゲーム ＋ 妨害 ＋ フォーカスモード。4チームが順番に演じて、これを2巡する。</p>
    <div class="steps">
''' + steps([
        ("90秒 × 1チーム", "1チームずつ演じる", "<p>演じるチームから演者が1人前に出て、お題を声を出さずにジェスチャーで伝える。チームの残りが答えを叫び、当たったら次のお題へ。<b>正解数がチームの得点</b>。演者は毎回交代。</p>"),
        ("そのあいだ", "ほかの3チームは妨害する", "<p>間違った答えを叫ぶ、手を振る、別のジェスチャーを見せる、歌う など、<b>気が散るようにする</b>のはOK。</p><p class=\"eg\">NG：演者や回答者に触る、演者の前に立って<b>視界を完全にふさぐ</b>。目的は「見えなくする」ではなく「散漫にする」。</p>"),
        ("1回だけ", "フォーカスモード", "<p>演じるチームは、自分の番に1回だけ「フォーカスモード！」を宣言できる。宣言から<b>20秒間、ほかのチームは静かに</b>する。どのお題で切るかがチームの判断。</p>"),
        ("30秒", "交代", "<p>次のチームの演者が前へ。90秒＋交代30秒で、1チーム2分。</p>"),
    ]) + '''    </div>
  </div>
</section>
'''
    tail = ""
    if staff:
        body += tools_section("お題ジェネレーター", "運営の端末で引いて<b>演者にだけ見せる</b>。引いた直後は伏せてあり、タップで表示。正解したら次を引く。",
                              [("お題", "g-odai"), ("演技の順番", "g-order")])
        body += '''<section id="debrief">
  <div class="wrap">
    <h2><span class="num"></span>振り返り（3分）</h2>
    <p class="sub">輪読の「注意力」につなげる問いかけ。</p>
    <div class="grid g2">
      <div class="panel"><h3>❓ 聞くこと</h3><p>「フォーカスモードを<b>いつ</b>使った？ なぜそこで？」</p></div>
      <div class="panel"><h3>📖 つなぐ話</h3><p>Slackのフォーカスモードを容認・推奨する話。集中する時間をチームで守ると成果が上がる。</p></div>
    </div>
  </div>
</section>
'''
        body += prep_section(["お題（ジェネレーターに60個。当日追加もできる）。紙で配るなら1チーム1回10枚程度 × 4チーム × 2巡",
                              "90秒タイマー、20秒タイマー", "得点係（正解数を数える）"],
                             ["得点の重み（正解1つ＝1点でよいか）"])
        tail = ('<script src="{P}generator.js"></script>\n<script>\n'
                f'mountGenerator(document.getElementById("g-odai"), {{key:"gesture", items:{js_list(GESTURE_ODAI)}, secret:true}});\n'
                'mountShuffle(document.getElementById("g-order"), ["チームA","チームB","チームC","チームD"]);\n</script>\n')
    page(staff, "gesture.html", "妨害ジェスチャー", "SBC合宿アクティビティ② 注意力：妨害ジェスチャー", "gesture.jpg",
         "アクティビティ ② ／ 注意力 ／ 0:35〜1:00", "妨害<br>ジェスチャー",
         "1チームずつジェスチャー。ほかの3チームは全力で気を散らす。ノイズの中で、自分の演者だけを見ろ。",
         [("テーマ", "焦点を合わせる"), ("時間", "25分（90秒 × 4チーム × 2巡）"), ("得点", "正解数"), ("切り札", "フォーカスモード 1回")],
         body, prev=("jinro.html", "① 推論：目的ズレ人狼"), nxt=("cards.html", "③ 資源：インテリジェントなチームを作れ！"), tail=tail)


# ------------------------------------------------------------------ ③ インテリジェントなチームを作れ！
def build_cards(staff):
    odai_step = ("お題カードをランダムに1枚引き（下のお題ジェネレーターで引いて投影）、会場全員に読み上げる。"
                 if staff else "運営がお題を1つ発表する。")
    body = '''<section id="why">
  <div class="wrap">
    <h2><span class="num"></span>ねらい</h2>
    <p class="sub">チームインテリジェンスの「知識」──メンバー同士がお互いの強みを把握していること</p>
    <p class="big-quote">「〇〇のことなら△△さんに聞けばいい」を、遊びながら全員の頭に入れる。</p>
    <div class="concept">
      <div class="panel"><h3>📇 知る</h3><p>事前フォームの回答から、全員分のカードを生成。強み・得意ジャンル・オリジナル技が一枚にまとまる。</p></div>
      <div class="panel"><h3>🧩 組む</h3><p>お題に合わせ、配られた手札から、チームで相談して2分で3人を選ぶ。<b>強みを読み込んでいるほど有利</b>。</p></div>
      <div class="panel"><h3>🎤 語る</h3><p>「なぜこの3人か」を代表がプレゼン。会場の全員が、選ばれた人の強みを一緒に知る。</p></div>
    </div>
  </div>
</section>

<section id="match">
  <div class="wrap">
    <h2><span class="num"></span>1ラウンドの流れ（8分 × 2ラウンド）</h2>
    <p class="sub">4チームが同じお題で同時に3人を選び、いちばん票を集めたチームに得点。</p>
    <div class="steps">
''' + steps([
        ("30秒", "お題を引く", f"<p>{odai_step}</p>"),
        ("30秒", "山札を4つに分ける", "<p>全員分のカードを1つの山札にまとめてシャッフルし、<b>4チームに均等に</b>配る（30枚なら7〜8枚ずつ）。</p>"),
        ("2分", "チームで3人を選ぶ", "<p>自分たちの手札だけから3枚を選び、チーム名をつける。強み・技・相性◎を<b>速く深く読めたチームが有利</b>。</p>"),
        ("45秒 × 4", "代表1人がプレゼン", "<p>各チーム<b>代表1人</b>が、選んだ3枚をホワイトボードにマグネットで貼って説明する。選ばれた3人はその場で前に立つ。「チーム名」「誰が何をするか」「なぜこの3人ならお題を達成できるか」。本人から一言コメントも可。代表はラウンドごとに交代。</p>"),
        ("1分", "投票 ＋ 相性ボーナス", "<p>全員が、<b>自分のチーム以外</b>でいちばん「インテリジェントなチーム」だと思ったところに挙手で1票。主張した<b>相性◎が成立していれば1つにつき＋2票</b>。最多票のチームに得点。</p><p class=\"eg\">成立の判定は、そのカードの<b>本人</b>が会場で「OK！」を出す。本人不在や意見が割れたときは<b>たくみさんが最終判断</b>。</p>"),
        ("1分", "カード回収", "<p>カードを回収してシャッフルし、次のラウンドへ。</p>"),
    ]) + '''    </div>
  </div>
</section>

<section id="cards">
  <div class="wrap">
    <h2><span class="num"></span>カードの見本（ダミー）</h2>
    <p class="sub">本番のカードは、事前フォームの回答から全員分を作ってある。これは見本。</p>
    <div class="cards" id="card-list"></div>
    <p class="note">※ 技は最大3つ。1つの分野に偏らず、その人のいろんな強みが見えるようにしている。</p>
  </div>
</section>

<section id="synergy">
  <div class="wrap">
    <h2><span class="num"></span>相性◎ボーナス</h2>
    <p class="sub">覚えるシナジー表はなし。相性は<b>カードそのもの</b>に書いてある。</p>
    <div class="grid g2">
      <div class="panel">
        <h3>🤝 カードの「相性◎」欄</h3>
        <p>全員のカードに「こんな人と一緒だとパフォーマンスが上がる！」が一文で書かれている（事前フォームで本人が回答）。</p>
        <p class="eg" style="margin-top:8px;color:var(--muted);font-size:14px">例：「アイデアを次々出す人と組むと、それを形にして輝く」</p>
      </div>
      <div class="panel">
        <h3>✅ 成立させるには</h3>
        <p>2分の編成中に相性欄を読み、条件に合う人を同じチームに入れる。プレゼンで「AさんとBさんは相性◎、なぜならBさんは〇〇だから」と<b>根拠つきで主張</b>し、カードの本人がOKを出せば成立。1つにつき＋2票。</p>
      </div>
    </div>
  </div>
</section>
'''
    tail = '<script src="{P}card.js"></script>\n<script src="{P}sample-cards.js"></script>\n<script>document.getElementById("card-list").innerHTML = SAMPLE_CARDS.map(c => renderCard({...c, art: c.art && "{P}" + c.art}, SAMPLE_CARDS.length)).join("");</script>\n'
    if staff:
        body += tools_section("お題ジェネレーター", "投影して全員に見せる。同じお題は全部使い切るまで出ない。当日追加もできる。", [("お題", "g-odai")],
                              note='印刷用レイアウトは <a href="../print.html">print.html</a>。')
        body += prep_section(["人物カード 全員分 × 1セット（A4普通紙・片面・9枚/枚 → 約4枚）。ラウンドごとに回収してシャッフル。予備にもう1セット",
                              "ホワイトボード＋マグネット（1ラウンドで12個、予備込みで16個）", "2分タイマー", "お題を投影するプロジェクター"],
                             ["1ラウンドの回し方（4チーム同時＋代表プレゼンの案。たくみさん判断で変わる可能性あり）",
                              "自分のチームのメンバーのカードを選んでよいか"])
        tail += ('<script src="{P}generator.js"></script>\n<script>\n'
                 f'mountGenerator(document.getElementById("g-odai"), {{key:"cards-odai", items:{js_list(CARD_ODAI)}}});\n</script>\n')
    page(staff, "cards.html", "インテリジェントなチームを作れ！", "SBC合宿アクティビティ③ 資源：インテリジェントなチームを作れ！", "hero.jpg",
         "アクティビティ ③ ／ 資源 ／ 1:00〜1:25", "インテリジェントな<br>チームを作れ！",
         "ゼミ生全員の「強み」がトレーディングカードになった。チームで相談してお題に合う最強の3人を選び、なぜその3人なのかを語り切れ。勝つ鍵は、<b>誰が何を得意としているかを知っていること</b>。",
         [("テーマ", "お互いの強みを知る"), ("時間", "25分（8分 × 2ラウンド）"), ("得点", "最多票のチームに"), ("道具", "人物カード")],
         body, prev=("gesture.html", "② 注意力：妨害ジェスチャー"), head='\n<link rel="stylesheet" href="{P}card.css">', tail=tail)


for staff in (False, True):
    build_home(staff)
    build_jinro(staff)
    build_gesture(staff)
    build_cards(staff)
print("built: site/*.html, site/staff/*.html")
