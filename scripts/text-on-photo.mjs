// Détecte tout texte affiché par-dessus une photo (règle : aucun texte sur les photos).
import { chromium } from "playwright";
const pages = ["/", "/shop", "/shop/tee-together", "/shop/sweat-we-push-the-sky", "/shop/tee-groovers-never-miss-the-drop", "/collections", "/collections/smilers-dancers", "/collections/drops-2026", "/events", "/events/mexico-show-2026", "/events/isla-electronica-2025", "/journal", "/journal/mexico-show-2026-le-film", "/about", "/billetterie", "/billetterie/smilin-dancin-festival-2027", "/contact", "/faq"];
const widths = (process.env.W || "390,1440").split(",").map(Number);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let bad = 0;
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const path of pages) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    const r = await p.evaluate(async () => {
      const out = new Set();
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += innerHeight) {
        scrollTo(0, y); await new Promise((r) => setTimeout(r, 120));
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = n.textContent.trim(); if (t.length < 2) continue;
          const el = n.parentElement; if (!el || el.closest("header nav, [aria-hidden=true], .marquee, script, style, svg")) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const rc of rg.getClientRects()) {
            if (rc.width < 4 || rc.bottom < 0 || rc.top > innerHeight) continue;
            const stack = document.elementsFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2);
            if (stack.some((e) => e.tagName === "IMG" && !e.closest("header") && e.getBoundingClientRect().width > 120)) out.add(t.slice(0, 50));
          }
        }
      }
      return [...out];
    });
    if (r.length) { bad++; console.log(`[${w}] ${path}: ${r.join(" | ")}`); }
  }
  await p.close();
}
console.log(bad ? `${bad} pages avec du texte sur une photo` : "AUCUN TEXTE SUR LES PHOTOS");
await b.close();
