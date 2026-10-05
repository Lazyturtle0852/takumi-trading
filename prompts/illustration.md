# イラスト生成プロンプト

写真がない人のカードの絵を作る。`cards.json` の `illustration_prompt` を、下の共通スタイルと組み合わせて画像生成AI（Gemini など）に渡す。

## 共通スタイル（全員分で揃える）

```
{ILLUSTRATION_PROMPT}
Anime-style trading card character illustration, clean bold lineart, cel shading,
vivid saturated colors, {COLOR} as the main lighting color, upper body, confident smile,
dynamic pose, detailed thematic background filling the whole frame.
Absolutely no text, no labels, no letters, no numbers anywhere.
```

- アスペクト比は 4:3 で生成する（カードの絵の枠に合わせて上下が少し切れる）
- ダミーの見本（`site/images/sample/`）はこのスタイルで生成した

- `{COLOR}` には、カードの `color` を英語にしたものを入れる（例：青 → blue）
- `{ILLUSTRATION_PROMPT}` には、`cards.json` の `illustration_prompt` を入れる

## 注意

- 顔立ち・人種・性別を推測して描写しない。本人に似せる必要はない（似せたい人は写真を出してもらう）
- 30人分の絵柄を揃えるため、共通スタイルの文面は変えない
- 文字が入ってしまった場合は、生成された画像を参照画像として「remove all text, keep everything else」で直す
- 生成が間に合わない人は `art_emoji` で代用する
