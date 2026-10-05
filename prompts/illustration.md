# イラスト生成プロンプト

写真がない人のカードの絵を作る。`cards.json` の `illustration_prompt` を、下の共通スタイルと組み合わせて画像生成AI（Gemini など）に渡す。

## 共通スタイル（全員分で揃える）

```
Trading card character illustration, anime-inspired flat illustration, vibrant colors,
soft glowing aura in {COLOR} tones, simple gradient background, character centered,
upper body, friendly and energetic mood, 16:10 aspect.
{ILLUSTRATION_PROMPT}
Absolutely no text, no labels, no letters, no numbers anywhere.
```

- `{COLOR}` には、カードの `color` を英語にしたものを入れる（例：青 → blue）
- `{ILLUSTRATION_PROMPT}` には、`cards.json` の `illustration_prompt` を入れる

## 注意

- 顔立ち・人種・性別を推測して描写しない。本人に似せる必要はない（似せたい人は写真を出してもらう）
- 30人分の絵柄を揃えるため、共通スタイルの文面は変えない
- 文字が入ってしまった場合は、生成された画像を参照画像として「remove all text, keep everything else」で直す
- 生成が間に合わない人は `art_emoji` で代用する
