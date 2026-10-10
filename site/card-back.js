// カードの裏面（顔写真＋名前）。Canvaの見本（images/back/canva-original.png）の柄を
// SVGで作り直し、柄×配色の組み合わせで全員ちがうデザインにする。
// 座標はカード 63×88mm を 630×880 とした単位（1単位 = 0.1mm）。
(() => {
const W = 630, H = 880;

// 見本から拾ったレトロ配色。light が地、dark が柄。
const PALETTES = [
  { light: "#ecdac4", dark: "#4a1712" },   // チョコ市松
  { light: "#fcefd6", dark: "#48694a" },   // 深緑
  { light: "#fbe1cf", dark: "#f57d22" },   // オレンジ
  { light: "#9fc0e3", dark: "#570207" },   // えんじ×空色
  { light: "#89afd0", dark: "#6c151f" },   // 青×えんじ線
  { light: "#f6bf2d", dark: "#d9861c" },   // からし
  { light: "#efe4cc", dark: "#3f9a9c" },   // ティール
  { light: "#efe3cc", dark: "#b24d1f" },   // れんが
  { light: "#f3ead2", dark: "#6f7a2e" },   // オリーブ
  { light: "#f2e6cf", dark: "#26385f" },   // 紺
  { light: "#fbe2dc", dark: "#d4566a" },   // 珊瑚
  { light: "#efe0d5", dark: "#5e2a4e" },   // ぶどう
];
const OVALS = ["#c4caae", "#e68036", "#bb998b", "#879275", "#aad4df"];  // 写真がないときの楕円
const NAME_COLORS = ["#e68036", "#ffc700", "#45190f"];

// ---- 乱数（カードごとに固定） ----
function rngFrom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353), h = h << 13 | h >>> 19;
  return () => {
    h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const between = (r, a, b) => a + (b - a) * r();
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const f = n => Math.round(n * 10) / 10;
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const dist = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));

// ---- 柄。どれも (乱数, 配色, 3色目) → SVG文字列 ----
const PATTERNS = {
  // ゆがんだ市松（見本1〜3）
  wavyChecker(r, p) {
    const n = Math.floor(between(r, 4, 7)), s = W / n, A = between(r, 22, 45), L = between(r, 450, 800);
    const p1 = r() * 6.3, p2 = r() * 6.3;
    const warp = (x, y) => [x + A * Math.sin(y / L * 6.283 + p1), y + A * Math.sin(x / L * 6.283 + p2)];
    let out = "";
    for (let i = -1; i <= n; i++) for (let j = -1; j * s < H + s; j++) {
      if ((i + j) % 2) continue;
      const pts = [];
      const edge = (x0, y0, x1, y1) => { for (let k = 0; k < 6; k++) pts.push(warp(x0 + (x1 - x0) * k / 6, y0 + (y1 - y0) * k / 6)); };
      const x = i * s, y = j * s;
      edge(x, y, x + s, y); edge(x + s, y, x + s, y + s); edge(x + s, y + s, x, y + s); edge(x, y + s, x, y);
      out += `<polygon points="${pts.map(q => q.map(f).join(",")).join(" ")}"/>`;
    }
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g fill="${p.dark}">${out}</g>`;
  },
  // まっすぐな市松。ときどき45度
  checker(r, p) {
    const s = between(r, 70, 110), rot = r() < .5 ? 45 : 0;
    let out = "";
    for (let i = -8; i < 16; i++) for (let j = -8; j < 18; j++) if ((i + j) % 2 === 0) out += `<rect x="${f(i * s)}" y="${f(j * s)}" width="${f(s)}" height="${f(s)}"/>`;
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g fill="${p.dark}" transform="rotate(${rot} ${W / 2} ${H / 2})">${out}</g>`;
  },
  // 手描きっぽい格子（見本4）
  grid(r, p) {
    const s = between(r, 60, 85), sw = between(r, 6, 10);
    const line = (x0, y0, x1, y1) => {
      const k = 8, pts = [];
      for (let i = 0; i <= k; i++) pts.push([x0 + (x1 - x0) * i / k + between(r, -2, 2), y0 + (y1 - y0) * i / k + between(r, -2, 2)]);
      return `<polyline points="${pts.map(q => q.map(f).join(",")).join(" ")}"/>`;
    };
    let out = "";
    for (let x = s / 2; x < W; x += s) out += line(x, -10, x, H + 10);
    for (let y = s / 2; y < H; y += s) out += line(-10, y, W + 10, y);
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g stroke="${p.dark}" stroke-width="${f(sw)}" fill="none" stroke-linecap="round">${out}</g>`;
  },
  // 方眼紙（見本9）
  graph(r, p) {
    const s = between(r, 18, 26);
    let thin = "", thick = "";
    const add = (i, d) => { if (i % 4) thin += d; else thick += d; };
    for (let i = 0, x = 0; x < W + s; i++, x += s) add(i, `M${f(x)} 0V${H}`);
    for (let i = 0, y = 0; y < H + s; i++, y += s) add(i, `M0 ${f(y)}H${W}`);
    return `<rect width="${W}" height="${H}" fill="${p.light}"/>
      <path d="${thin}" stroke="${p.dark}" stroke-opacity=".45" stroke-width="1.6"/>
      <path d="${thick}" stroke="${p.dark}" stroke-opacity=".7" stroke-width="3"/>`;
  },
  // 放射線（見本5・6）
  sunburst(r, p, accent) {
    const n = 2 * Math.floor(between(r, 12, 20)), cx = W / 2, cy = between(r, 360, 480), R = 1300, a0 = r();
    const cols = r() < .5 ? [p.dark, p.light] : [p.dark, p.light, accent, p.light];
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = (i + a0) / n * 6.283, b = (i + 1 + a0) / n * 6.283;
      out += `<path fill="${cols[i % cols.length]}" d="M${cx} ${f(cy)}L${f(cx + R * Math.cos(a))} ${f(cy + R * Math.sin(a))}L${f(cx + R * Math.cos(b))} ${f(cy + R * Math.sin(b))}Z"/>`;
    }
    return `<rect width="${W}" height="${H}" fill="${p.light}"/>${out}`;
  },
  // 縦ストライプ（見本7・8）
  stripes(r, p, accent) {
    const a = between(r, 18, 45), b = between(r, 10, 30), thin = between(r, 4, 8), withThin = r() < .6;
    let out = "", x = between(r, -30, 0);
    while (x < W) {
      out += `<rect x="${f(x)}" width="${f(a)}" height="${H}" fill="${p.dark}"/>`;
      x += a + b;
      if (withThin) { out += `<rect x="${f(x)}" width="${f(thin)}" height="${H}" fill="${accent}"/>`; x += thin + b; }
    }
    return `<rect width="${W}" height="${H}" fill="${p.light}"/>${out}`;
  },
  // 斜めストライプ
  diagonal(r, p) {
    const a = between(r, 22, 40), b = between(r, 22, 40), rot = pick(r, [30, 45, -30, -45]);
    let out = "";
    for (let x = -700; x < 1400; x += a + b) out += `<rect x="${f(x)}" y="-600" width="${f(a)}" height="2100"/>`;
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g fill="${p.dark}" transform="rotate(${rot} ${W / 2} ${H / 2})">${out}</g>`;
  },
  // 水玉
  dots(r, p) {
    const s = between(r, 55, 80), rad = s * between(r, .18, .3);
    let out = "";
    for (let j = 0, y = 0; y < H + s; j++, y += s * .87) for (let x = (j % 2) * s / 2; x < W + s; x += s) out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}"/>`;
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g fill="${p.dark}">${out}</g>`;
  },
  // ギンガムチェック
  gingham(r, p) {
    const s = between(r, 40, 60);
    let v = "", h = "";
    for (let x = 0; x < W; x += 2 * s) v += `<rect x="${f(x)}" width="${f(s)}" height="${H}"/>`;
    for (let y = 0; y < H; y += 2 * s) h += `<rect y="${f(y)}" width="${W}" height="${f(s)}"/>`;
    return `<rect width="${W}" height="${H}" fill="${p.light}"/><g fill="${p.dark}" opacity=".5">${v}</g><g fill="${p.dark}" opacity=".5">${h}</g>`;
  },
  // 波線ボーダー
  waves(r, p, accent) {
    const band = between(r, 40, 65), A = between(r, 12, 26), L = between(r, 160, 320), vertical = r() < .4;
    const len = vertical ? H : W, span = vertical ? W : H;
    let out = "", i = 0;
    for (let y = -band * 2; y < span + band; y += band, i++) {
      if (i % 2) continue;
      const wave = (yy, dir) => {
        const pts = [];
        for (let x = 0; x <= len + 20; x += 20) pts.push([dir > 0 ? x : len - x, yy + A * Math.sin((dir > 0 ? x : len - x) / L * 6.283)]);
        return pts;
      };
      const pts = [...wave(y, 1), ...wave(y + band, -1)].map(([x, yy]) => vertical ? [yy, x] : [x, yy]);
      out += `<polygon fill="${i % 4 ? accent : p.dark}" points="${pts.map(q => q.map(f).join(",")).join(" ")}"/>`;
    }
    return `<rect width="${W}" height="${H}" fill="${p.light}"/>${out}`;
  },
  // 同心円
  rings(r, p, accent) {
    const s = between(r, 35, 55), cx = pick(r, [0, W / 2, W]), cy = pick(r, [0, H / 2, H]);
    const cols = r() < .5 ? [p.dark, p.light] : [p.dark, p.light, accent, p.light];
    let out = "";
    for (let i = Math.ceil(1100 / s); i > 0; i--) out += `<circle cx="${cx}" cy="${cy}" r="${f(i * s)}" fill="${cols[i % cols.length]}"/>`;
    return `<rect width="${W}" height="${H}" fill="${p.light}"/>${out}`;
  },
};
const PATTERN_NAMES = Object.keys(PATTERNS);

// 柄×配色の組み合わせを、同じ柄・同じ配色が隣り合わないように並べる。
// index 番目のカードにはこの並びの index 番目を使うので、組み合わせ数（11×12）までは全員ちがう。
const COMBOS = (() => {
  const r = rngFrom("takumi-lab-back");
  const all = [];
  PATTERN_NAMES.forEach(pt => PALETTES.forEach((_, pl) => all.push({ pattern: pt, palette: pl })));
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const out = [];
  while (all.length) {
    const prev = out[out.length - 1];
    let k = all.findIndex(c => !prev || (c.pattern !== prev.pattern && c.palette !== prev.palette));
    out.push(all.splice(k < 0 ? 0 : k, 1)[0]);
  }
  return out;
})();

// 名前の幅をざっくり見積もる（em単位）
function textWidth(s) {
  let w = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    w += c > 0x2e80 ? 1 : /[A-Z]/.test(ch) ? .74 : ch === " " ? .3 : .58;
  }
  return w;
}
const isCJK = s => /[⺀-￿]/.test(s);
// 名前と顔を重ねないための配置案。どれも名前のアーチ（いちばん下が y≈250）より下に顔が来る。
//   oval: 楕円 / photoTop: 写真が見えはじめる高さ / face: 顔の中心と幅（c.face があるとき）
const OVAL = { cx: W / 2, cy: 438, rx: 258, ry: 405 };
const smile = (jp, dy = 0) => `M40 ${(jp ? 185 : 175) + dy} Q${W / 2} ${(jp ? 285 : 300) + dy} ${W - 40} ${(jp ? 185 : 175) + dy}`;
// 名前を外に出す案の楕円。上は名前の下（y=215）、下はフッターの帯の上（y=755）に収める
const ABOVE_OVAL = { cx: W / 2, cy: 485, rx: 212, ry: 270 };
// 楕円 o の上側に、gap だけ外へ離した同心の弧（左下→上→右下）
const hugArc = (o, gap) => {
  const a = o.rx + gap, b = o.ry + gap, t0 = Math.PI * 1.08, t1 = Math.PI * 1.92;
  const p = t => [f(o.cx + a * Math.cos(t)), f(o.cy + b * Math.sin(t))];
  return `M${p(t0).join(" ")} A${f(a)} ${f(b)} 0 0 1 ${p(t1).join(" ")}`;
};
const LAYOUTS = {
  // 写真を名前の下で水平に切る
  cut: { label: "水平に切る", oval: OVAL, photoTop: 265, face: { cx: W / 2, cy: 510, w: 175 }, namePath: jp => smile(jp) },
  // 写真を楕円いっぱいに入れ、上を楕円の色に溶かす
  fade: { label: "上をぼかす", oval: OVAL, photoTop: 200, fade: [215, 345], face: { cx: W / 2, cy: 540, w: 170 }, namePath: jp => smile(jp) },
  // 写真の上端を名前と同じカーブにする
  arch: { label: "アーチ窓", oval: OVAL, photoTop: 265, photoClip: `M0 268 Q${W / 2} 398 ${W} 268 V${H} H0Z`, photoEdge: `M0 268 Q${W / 2} 398 ${W} 268`,
    face: { cx: W / 2, cy: 545, w: 170 }, namePath: jp => smile(jp) },
  // 名前を帯に載せ、写真は楕円いっぱい
  ribbon: { label: "リボン", oval: OVAL, photoTop: 33, face: { cx: W / 2, cy: 520, w: 175 }, namePath: (jp, size) => smile(jp, size * .02),
    ribbon: (size, jp) => {
      const d = smile(jp, -size * .3), h = size * 1.12;
      return `<path d="${d}" fill="none" stroke="#45190f" stroke-width="${f(h + 10)}"/><path d="${d}" fill="none" stroke="#fdf3dc" stroke-width="${f(h)}"/>`;
    } },
  // 名前を楕円の外（上）に出し、楕円を名前とフッターの間に収める。写真は必ず楕円を埋める
  above: { label: "名前を外に（∩）", oval: ABOVE_OVAL, photoTop: ABOVE_OVAL.cy - ABOVE_OVAL.ry, cover: true, sticker: true,
    face: { cx: W / 2, cy: 500, w: 160 }, namePath: jp => `M40 ${jp ? 238 : 245} Q${W / 2} ${jp ? 95 : 85} ${W - 40} ${jp ? 238 : 245}` },
  // 名前を楕円の上の縁に沿わせる（楕円と同じ中心の弧）
  aboveHug: { label: "名前を外に（楕円に沿う）", oval: ABOVE_OVAL, photoTop: ABOVE_OVAL.cy - ABOVE_OVAL.ry, cover: true, sticker: true,
    face: { cx: W / 2, cy: 500, w: 160 }, namePath: (jp, size) => hugArc(ABOVE_OVAL, 32 + (jp ? 0 : size * .08)) },
  // 逆向きのアーチ（∪）
  aboveSmile: { label: "名前を外に（∪）", oval: ABOVE_OVAL, photoTop: ABOVE_OVAL.cy - ABOVE_OVAL.ry, cover: true, sticker: true,
    face: { cx: W / 2, cy: 500, w: 160 }, namePath: jp => `M40 ${jp ? 140 : 145} Q${W / 2} ${jp ? 232 : 238} ${W - 40} ${jp ? 140 : 145}` },
};
const DEFAULT_LAYOUT = "above";
window.BACK_LAYOUTS = Object.fromEntries(Object.entries(LAYOUTS).map(([k, v]) => [k, v.label]));

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// c: cards.json の1件。index: 何番目のカードか（デザインの割り当てに使う）
// c.back = { pattern, palette } があればそれを優先する
window.renderBack = function (c, index, layout) {
  const combo = { ...COMBOS[index % COMBOS.length], ...(c.back || {}) };
  const r = rngFrom(`${combo.pattern}-${combo.palette}-${index}`);
  const pal = PALETTES[combo.palette] || PALETTES[0];
  const others = PALETTES.filter(q => q !== pal && dist(q.dark, pal.dark) > 80 && dist(q.dark, pal.light) > 80);
  const accent = pick(r, others).dark;
  const nameCols = NAME_COLORS.filter(col => dist(col, pal.dark) > 110 && dist(col, pal.light) > 110);
  const nameCol = pick(r, nameCols.length ? nameCols : NAME_COLORS);
  const oval = pick(r, OVALS.filter(o => dist(o, nameCol) > 90));
  const id = `bk${index}`;

  const name = String(c.back_name ?? c.name ?? "");
  const jp = isCJK(name);
  let size = Math.min(jp ? 150 : 200, 470 / Math.max(textWidth(name), .1));
  const shadow = dist(nameCol, "#45190f") < 60 ? "#fdf3dc" : "#45190f";
  const photo = c.photo || c.art;
  const L = LAYOUTS[c.back_layout || layout || DEFAULT_LAYOUT] || LAYOUTS[DEFAULT_LAYOUT];
  if (L.sticker) size = Math.min(size, jp ? 125 : 165);
  const ov = L.oval;
  const ellipse = attrs => `<ellipse cx="${ov.cx}" cy="${ov.cy}" rx="${ov.rx}" ry="${ov.ry}" ${attrs}/>`;
  const namePath = L.namePath(jp, size);

  // 写真。c.face（元写真での顔の位置。0〜1の x,y,w,h）と c.photo_size [幅,高さ] があれば、
  // 顔が L.face の位置・大きさに来るように置く。なければ写真の見える範囲に中央合わせ。
  let img = "", fade = null;
  if (photo) {
    const top = L.photoTop, rx0 = ov.cx - ov.rx, rx1 = ov.cx + ov.rx, ry1 = ov.cy + ov.ry;
    let box, edge = L.fade;
    if (c.face && c.photo_size) {
      const [iw, ih] = c.photo_size, fc = c.face;
      // 顔の上に写真が足りない人は少し引く（顔の大きさは目標の7割まで）
      const target = L.face.w / (fc.w * iw), headroom = (L.face.cy - top) / ((fc.y + fc.h / 2) * ih);
      // cover の案（名前が楕円の外）は顔を上に寄せてよいので、顔の中心が楕円の上端から110以上下にあれば足りる
      const room = L.cover ? (110 / ((fc.y + fc.h / 2) * ih)) : headroom;
      let s = Math.max(Math.min(target, Math.max(room, target * .7)), (rx1 - rx0) / iw, (ry1 - top) / ih);
      // c.center：顔が写真の端に寄っていても楕円の真ん中に来るよう、そのぶん拡大する（隣の人を外に出す）
      if (c.center) { const fx = fc.x + fc.w / 2; s = Math.max(s, (L.face.cx - rx0) / (fx * iw), (rx1 - L.face.cx) / ((1 - fx) * iw)); }
      let x = L.face.cx - (fc.x + fc.w / 2) * iw * s, y = L.face.cy - (fc.y + fc.h / 2) * ih * s;
      // 横と下は必ず埋める。上は顔の位置を優先し、写真が足りなければ楕円の色を見せて境目をぼかす
      x = Math.min(rx0, Math.max(rx1 - iw * s, x)); y = Math.max(ry1 - ih * s, y);
      if (L.cover) y = Math.min(top, y);
      if (y > top) edge = [y, y + 110];
      box = `x="${f(x)}" y="${f(y)}" width="${f(iw * s)}" height="${f(ih * s)}" preserveAspectRatio="none"`;
    } else {
      box = `x="${rx0}" y="${top}" width="${rx1 - rx0}" height="${ry1 - top}" preserveAspectRatio="xMidYMid slice"`;
    }
    if (edge) fade = edge;
    img = `<g clip-path="url(#${id}o)"${fade ? ` mask="url(#${id}m)"` : ""}><image href="${esc(photo)}" ${box}/></g>`;
  }

  return `<svg class="back" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" data-pattern="${combo.pattern}" data-palette="${combo.palette}">
  <defs>
    <clipPath id="${id}c"><rect width="${W}" height="${H}"/></clipPath>
    <clipPath id="${id}o">${L.photoClip ? `<path d="${L.photoClip}"/>` : `<rect y="${L.photoTop}" width="${W}" height="${H}"/>`}</clipPath>
    <clipPath id="${id}e">${ellipse("")}</clipPath>
    <path id="${id}p" d="${namePath}"/>
    ${fade ? `<linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${f(fade[0])}" x2="0" y2="${f(fade[1])}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${id}f)"/></mask>` : ""}
    <filter id="${id}g" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${index + 1}"/>
      <feColorMatrix values="0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .22 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <g clip-path="url(#${id}c)">
    ${PATTERNS[combo.pattern](r, pal, accent)}
    <rect width="${W}" height="${H}" fill="#000" filter="url(#${id}g)"/>
    ${ellipse(`fill="${oval}"`)}
    <g clip-path="url(#${id}e)">${img}${L.photoEdge ? `<path d="${L.photoEdge}" fill="none" stroke="#1a1a1a" stroke-width="2.4"/>` : ""}</g>
    ${ellipse(`fill="none" stroke="#1a1a1a" stroke-width="2.4"`)}
    <rect y="764" width="${W}" height="75" fill="#fdf3dc" opacity=".94"/>
    <!-- 研究会ロゴの青 -->
    <g class="lab" text-anchor="middle" font-size="60">
      <text x="${W / 2}" y="820" fill="#0176a8" textLength="540" lengthAdjust="spacingAndGlyphs">Shimizu Takumi Lab.</text>
    </g>
    ${L.ribbon ? L.ribbon(size, jp) : ""}
    <g class="nm${jp ? " jp" : ""}" text-anchor="middle" font-size="${f(size)}"${L.sticker ? ` stroke="#fdf3dc" stroke-width="${f(size * .16)}" stroke-linejoin="round" paint-order="stroke"` : ""}>
      ${L.ribbon ? "" : `<text fill="${shadow}" transform="translate(4 5)"><textPath href="#${id}p" startOffset="50%">${esc(name)}</textPath></text>`}
      <text fill="${L.ribbon ? (dist(nameCol, "#fdf3dc") < 120 ? "#45190f" : nameCol) : nameCol}"><textPath href="#${id}p" startOffset="50%">${esc(name)}</textPath></text>
    </g>
  </g>
</svg>`;
};
window.BACK_COMBOS = COMBOS.length;
})();
