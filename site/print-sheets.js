// 表と裏を並べた印刷シートを組み立てる。print.html と data/ の試作ページで共用する。
// buildSheets(cards, mode, front, back)
//   mode: "pair"（A4横に表｜裏を2×2、真ん中で折る）/ "duplex"（A4縦3×3の表シートと、左右を入れ替えた裏シート）
//   front(c, i), back(c, i): カード1枚分のHTMLを返す関数
(() => {
const W = 63, H = 88;

const css = `
  @page{size:A4 landscape;margin:0}
  @page port{size:A4 portrait;margin:0}
  .sheet{background:#fff;margin:10mm auto;position:relative;overflow:hidden;break-after:page}
  .sheet.land{width:297mm;height:210mm}
  .sheet.port{width:210mm;height:297mm;page:port}
  .slot{position:absolute;width:63mm;height:88mm}
  .slot .card{width:63mm}
  .slot .tcard{border-radius:0;box-shadow:none}
  .slot .back{width:63mm;height:88mm}
  .sheet .tag{position:absolute;font:7pt/1 system-ui,sans-serif;color:#999}
  .sheet .mark{position:absolute;background:#000}
  .sheet .mark.v{width:.15mm;height:6mm}
  .sheet .mark.h{height:.15mm;width:6mm}
  .sheet .mark.fold{background:none;border-left:.2mm dashed #000;width:0}
  @media print{body{background:none!important}.sheet{margin:0}.no-print{display:none!important}}`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

window.SHEET_MODES = {
  pair: { label: "表と裏を並べる（折って使う）", howto: "A4横で印刷（⌘P・倍率100%・余白なし・背景のグラフィックをオン）。外側のトンボで切り、真ん中の点線で山折りして貼り合わせると両面カードになる。" },
  duplex: { label: "両面印刷（表シート→裏シート）", howto: "A4縦・両面印刷（長辺とじ）・倍率100%・余白なし・背景のグラフィックをオン。裏シートは左右を入れ替えてあるので、表と裏が重なる。" },
};

const mm = v => `${Math.round(v * 100) / 100}mm`;
const vmark = (x, y) => `<span class="mark v" style="left:${mm(x - .075)};top:${mm(y)}"></span>`;
const hmark = (x, y) => `<span class="mark h" style="left:${mm(x)};top:${mm(y - .075)}"></span>`;
const slot = (x, y, html) => `<div class="slot" style="left:${mm(x)};top:${mm(y)}">${html}</div>`;

// 列の位置 xs・行の位置 ys に並んだ枠の外側にトンボを打つ
function cropMarks(xs, ys, w, h) {
  let html = "";
  const top = ys[0], bottom = ys[ys.length - 1] + h, left = xs[0], right = xs[xs.length - 1] + w;
  const xl = [...new Set(xs.flatMap(x => [x, x + w]))], yl = [...new Set(ys.flatMap(y => [y, y + h]))];
  xl.forEach(x => { html += vmark(x, top - 8) + vmark(x, bottom + 2); });
  yl.forEach(y => { html += hmark(left - 8, y) + hmark(right + 2, y); });
  return html;
}

function pairSheets(cards, front, back) {
  const gapX = 15, gapY = 14;
  const x0 = (297 - 4 * W - gapX) / 2, y0 = (210 - 2 * H - gapY) / 2;
  const xs = [x0, x0 + 2 * W + gapX], ys = [y0, y0 + H + gapY];
  let out = "";
  for (let i = 0; i < cards.length; i += 4) {
    let body = cropMarks(xs, ys, 2 * W, H);
    cards.slice(i, i + 4).forEach((c, k) => {
      const x = xs[k % 2], y = ys[Math.floor(k / 2)];
      body += slot(x, y, front(c, i + k)) + slot(x + W, y, back(c, i + k));
      body += `<span class="mark fold" style="left:${mm(x + W - .1)};top:${mm(y - 8)};height:6mm"></span>`;
      body += `<span class="mark fold" style="left:${mm(x + W - .1)};top:${mm(y + H + 2)};height:6mm"></span>`;
    });
    out += `<section class="sheet land">${body}</section>`;
  }
  return out;
}

function duplexSheets(cards, front, back) {
  const x0 = 10.5, y0 = 16.5, xs = [0, 1, 2].map(i => x0 + W * i), ys = [0, 1, 2].map(i => y0 + H * i);
  let out = "";
  for (let i = 0; i < cards.length; i += 9) {
    let f = cropMarks(xs, ys, W, H), b = cropMarks(xs, ys, W, H);
    cards.slice(i, i + 9).forEach((c, k) => {
      const col = k % 3, row = Math.floor(k / 3);
      f += slot(xs[col], ys[row], front(c, i + k));
      b += slot(xs[2 - col], ys[row], back(c, i + k));
    });
    const n = i / 9 + 1;
    out += `<section class="sheet port"><span class="tag" style="left:10.5mm;top:5mm">${n}枚目・表</span>${f}</section>`;
    out += `<section class="sheet port"><span class="tag" style="right:10.5mm;top:5mm">${n}枚目・裏</span>${b}</section>`;
  }
  return out;
}

window.buildSheets = (cards, mode, front, back) =>
  mode === "duplex" ? duplexSheets(cards, front, back) : pairSheets(cards, front, back);

// 印刷モードの切り替えリンク（?mode=）
window.sheetModeLinks = current => Object.entries(SHEET_MODES).map(([k, v]) => {
  const q = new URLSearchParams(location.search); q.set("mode", k);
  return `<a class="${k === current ? "on" : ""}" href="?${q}">${v.label}</a>`;
}).join("　");
})();
