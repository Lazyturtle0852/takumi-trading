// cards.json の1件からカードのHTMLを作る。表示ページと印刷ページで共用する。
(() => {
const TAG_ICON = {
  "統計": "📊", "プログラミング": "💻", "デザイン": "🎨", "英語": "🌏", "文章添削": "✍️",
  "プレゼン": "🎤", "企画": "💡", "リサーチ": "🔍", "動画編集": "🎬"
};
const COLORS = {
  "赤": ["#ff6b6b", "#b6324a"], "橙": ["#ffa65c", "#c25e12"], "黄": ["#ffd84d", "#b8901a"],
  "緑": ["#4fd1a1", "#17795a"], "水色": ["#7fe3ff", "#2b8fb8"], "青": ["#5aa9ff", "#1d4fa8"],
  "紫": ["#b48cff", "#5b34a8"], "ピンク": ["#ff8fd0", "#b83a85"], "黒": ["#555b6e", "#15171f"],
  "白": ["#f2f2f2", "#b9bcc6"]
};

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = tag => `<span class="ic" title="${esc(tag)}">${TAG_ICON[tag] || "★"}</span>`;
const list = items => `<ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;

window.renderCard = function (c, total) {
  const [c1, c2] = COLORS[c.color] || COLORS["青"];
  const art = c.art ? `<img src="${esc(c.art)}" alt="">` : esc(c.art_emoji || "⭐");
  const moves = (c.moves || []).slice(0, 3).map(m => `
      <div class="m">
        <div class="mh">${icon(m.tag)}<b>${esc(m.name)}</b></div>
        <p>${esc(m.effect)}</p>
      </div>`).join("");
  return `
  <div class="card"><div class="tcard" style="--c1:${c1};--c2:${c2}"><div class="in">
    <div class="hd">
      <span class="nm">${esc(c.name)}</span>
      <span class="rl"><b>${esc(c.role)}</b>${(c.tags || []).slice(0, 1).map(icon).join("")}</span>
    </div>
    <div class="art">${art}</div>
    <div class="info">
      <div class="row"><span class="lb">強み</span>${list(c.strengths || [])}</div>
      <div class="row"><span class="lb">頼れる</span><span>${esc(c.help)}</span></div>
      <div class="row"><span class="lb">相性◎</span><span>${esc(c.aisho)}</span></div>
    </div>
    <div class="mv">${moves}</div>
    <div class="ft"><span class="no">TK-${esc(c.id)}/${String(total ?? "").padStart(3, "0")}</span><span class="cp">「${esc(c.catch)}」</span><span>たくみ研 2026</span></div>
  </div></div></div>`;
};
})();
