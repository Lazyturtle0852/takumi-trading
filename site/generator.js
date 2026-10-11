// 運営用のお題ジェネレーター。
// 引いたものは「使用済み」になり、全部使うまで同じものは出ない。
// 当日に追加・削除した項目はこのブラウザに保存される（ほかの端末には共有されない）。
//
// mountGenerator(el, {
//   key: "gesture",            保存用のキー
//   items: ["…", "見出し｜補足"], 「｜」で区切ると2行目以降が小さく出る
//   labels: ["多数派", "ズレ役"],  「｜」で区切った各部分に付けるラベル（任意）
//   secret: true,              引いた直後は伏せておき、タップで表示（演者にだけ見せる用）
//   button: "お題を引く",
// })
(function () {
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function render(item, labels) {
    const parts = item.split("｜");
    if (labels) {
      return parts.map((p, i) => `<div class="gen-part"><span class="gen-lbl">${esc(labels[i] || "")}</span>${esc(p)}</div>`).join("");
    }
    return `<div class="gen-main">${esc(parts[0])}</div>` + (parts[1] ? `<div class="gen-sub">${esc(parts.slice(1).join(" ／ "))}</div>` : "");
  }

  window.mountGenerator = function (el, opt) {
    const K = "gen:" + opt.key;
    let items = store.get(K + ":items") || opt.items.slice();
    let used = new Set(store.get(K + ":used") || []);
    let current = null, hidden = false;
    const save = () => { store.set(K + ":items", items); store.set(K + ":used", [...used]); };

    el.classList.add("gen");
    el.innerHTML = `
      <div class="gen-card" aria-live="polite"><div class="gen-empty">ボタンを押して引く</div></div>
      <div class="gen-ctrl">
        <button type="button" class="draw gen-draw">${esc(opt.button || "お題を引く")}</button>
        <span class="gen-count"></span>
      </div>
      <details class="gen-edit">
        <summary>項目を見る・追加する</summary>
        <form class="gen-add"><input type="text" placeholder="${opt.labels ? opt.labels.join("｜") + " の形で入力" : "新しい項目（「｜」で補足を付けられる）"}"><button type="submit">追加</button></form>
        <ul class="gen-list"></ul>
        <div class="gen-tools">
          <button type="button" class="gen-reset-used">使用済みを戻す</button>
          <button type="button" class="gen-reset-all">最初の項目に戻す</button>
        </div>
      </details>`;
    const card = el.querySelector(".gen-card");
    const count = el.querySelector(".gen-count");
    const list = el.querySelector(".gen-list");

    function show() {
      if (current == null) { card.innerHTML = `<div class="gen-empty">ボタンを押して引く</div>`; return; }
      card.innerHTML = hidden
        ? `<div class="gen-hidden">タップして表示<small>演者だけが見る</small></div>`
        : render(current, opt.labels);
      card.classList.remove("spin"); void card.offsetWidth; card.classList.add("spin");
    }
    function refresh() {
      const left = items.filter(i => !used.has(i)).length;
      count.textContent = `残り ${left} ／ ${items.length}`;
      list.innerHTML = items.map((it, i) =>
        `<li class="${used.has(it) ? "used" : ""}"><span>${esc(it)}</span><button type="button" data-i="${i}" aria-label="削除">×</button></li>`).join("");
    }

    el.querySelector(".gen-draw").addEventListener("click", () => {
      let pool = items.filter(i => !used.has(i));
      if (!pool.length) { used.clear(); pool = items.slice(); }
      if (!pool.length) return;
      current = pool[Math.floor(Math.random() * pool.length)];
      used.add(current); hidden = !!opt.secret;
      save(); show(); refresh();
    });
    card.addEventListener("click", () => { if (opt.secret && current != null) { hidden = !hidden; show(); } });
    el.querySelector(".gen-add").addEventListener("submit", e => {
      e.preventDefault();
      const inp = e.target.querySelector("input"), v = inp.value.trim();
      if (v && !items.includes(v)) { items.push(v); save(); refresh(); }
      inp.value = "";
    });
    list.addEventListener("click", e => {
      const b = e.target.closest("button[data-i]"); if (!b) return;
      const it = items[+b.dataset.i];
      items.splice(+b.dataset.i, 1); used.delete(it); save(); refresh();
    });
    el.querySelector(".gen-reset-used").addEventListener("click", () => { used.clear(); save(); refresh(); });
    el.querySelector(".gen-reset-all").addEventListener("click", () => {
      items = opt.items.slice(); used.clear(); store.del(K + ":items"); store.del(K + ":used");
      current = null; show(); refresh();
    });
    refresh();
  };

  // チームA〜Dの順番をシャッフルする
  window.mountShuffle = function (el, names) {
    el.classList.add("shuffle");
    el.innerHTML = `<div class="shuffle-out">${names.map(n => `<span>${esc(n)}</span>`).join("")}</div>
      <button type="button" class="draw">順番を決める</button>`;
    const out = el.querySelector(".shuffle-out");
    el.querySelector("button").addEventListener("click", () => {
      const a = names.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      out.innerHTML = a.map((n, i) => `<span><small>${i + 1}番</small>${esc(n)}</span>`).join("");
      out.classList.remove("spin"); void out.offsetWidth; out.classList.add("spin");
    });
  };

  // 1〜n から1つ選ぶ（ズレ役の番号など）
  window.mountPicker = function (el, opt) {
    el.classList.add("picker");
    el.innerHTML = `<label>人数 <input type="number" min="2" max="40" value="${opt.n || 8}"></label>
      <button type="button" class="draw">${esc(opt.button || "番号を引く")}</button>
      <div class="picker-out">―</div>`;
    const out = el.querySelector(".picker-out");
    el.querySelector("button").addEventListener("click", () => {
      const n = Math.max(2, +el.querySelector("input").value || 2);
      out.textContent = `${Math.floor(Math.random() * n) + 1} 番`;
      out.classList.remove("spin"); void out.offsetWidth; out.classList.add("spin");
    });
  };
})();
