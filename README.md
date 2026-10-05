# インテリジェントなチームを作れ！

たくみ研 SBC合宿（2026/10/13）で行う、『チームインテリジェンス』輪読を活かしたトレーディングカードゲームの仕様・プロンプト置き場。

ゼミ生全員の「強み」をカードにし、お題に合わせて3人のチームを編成して競う。勝つ鍵は**誰が何を得意としているかを知っていること**。チームインテリジェンスの「知識」の観点、つまりメンバー同士がお互いの強みを把握している状態を、遊びながらつくることがねらい。

- ルール説明ページ: https://lazyturtle0852.github.io/takumi-trading/ （ソースは [`site/index.html`](site/index.html)）
- ルール仕様: [`docs/rules.md`](docs/rules.md)
- 事前フォームの設問: [`docs/form.md`](docs/form.md)
- カードの仕様: [`docs/card-spec.md`](docs/card-spec.md)
- AIに渡すプロンプト: [`prompts/`](prompts/)

## 目的と成功の基準

1. 楽しく盛り上がる
2. 合宿後、各メンバーが「〇〇のことなら△△さんに聞けばいい」を少なくとも数人分言える

合宿後の継続利用（Webでの公開など）は今回のスコープ外。

## 当日の概要

| 項目 | 内容 |
|---|---|
| 時間 | 60分 |
| プレイヤー | 新規生7人（じゃんけんで1人シード）のトーナメント、全6試合 |
| 観戦者 | 残りのゼミ生全員（約23人）。審査員として投票する |
| 1試合 | お題を引く → 山札を半分に分ける → 2分で3人のチームを作る → プレゼン → 観客投票＋相性ボーナス |
| 最終判断 | たくみさん |

詳細は [`docs/rules.md`](docs/rules.md)。

## 制作の流れ

```
Googleフォーム ──CSV──▶ AI（prompts/card-data.md） ──cards.json──▶ HTMLテンプレート ──▶ 印刷用PDF
                         └ 写真なしの人だけ prompts/illustration.md でイラスト生成
```

1. 事前フォーム（[`docs/form.md`](docs/form.md)）で回答を集め、スプレッドシートからCSVで書き出す
2. CSVと [`prompts/card-data.md`](prompts/card-data.md) をAIに渡し、カード用のJSON（`cards.json`）を作る
3. JSONの `review_flags` を人が確認して直す
4. 写真がない人のイラストを [`prompts/illustration.md`](prompts/illustration.md) で生成する
5. HTMLテンプレートに流し込み、63×88mm・A4に9枚の印刷用PDFを書き出す（テンプレートは未実装）

## スケジュール

| 日付 | やること |
|---|---|
| 10/6（火） | 事前フォーム配布 |
| 10/9（金） | フォーム締切 |
| 10/10〜12 | カード生成・確認・印刷・カット |
| 10/13（火） | 合宿本番 |

締切に間に合わなかった人のカードは、当日その場で手書きする。

## 個人情報の扱い

- **このリポジトリには個人の回答・写真・生成したカードを入れない。** `data/` と `output/` は `.gitignore` で除外している
- `examples/` に置いているのは架空のダミーデータのみ
- 個人情報を含める必要が出たら、リポジトリを非公開に切り替える
- フォームには、回答をAIに入力することへの同意欄を設ける（[`docs/form.md`](docs/form.md)）

## ディレクトリ構成

```
.
├── README.md
├── docs/
│   ├── rules.md          ルール仕様
│   ├── form.md           事前フォームの設問と同意文
│   └── card-spec.md      カードの項目・文字数・レイアウト・印刷
├── prompts/
│   ├── card-data.md      CSV → cards.json に変換するプロンプト
│   └── illustration.md   写真なしの人のイラスト生成プロンプト
├── examples/
│   └── dummy_responses.csv   架空の回答（動作確認用）
└── site/
    ├── index.html        ルール説明ページ
    └── images/hero.jpg
```

ルール説明ページは `site/` を変更して `main` にpushすると GitHub Pages に自動で反映される。ローカルでは `python3 -m http.server -d site` で確認できる。
