// Détecte les mots coupés en deux lignes et les titres qui débordent de leur colonne (h1/h2/h3/.t-display).
import { chromium } from "playwright";
const pages = ["/", "/shop", "/shop/tee-together", "/shop/sweat-we-push-the-sky", "/shop/tee-groovers-never-miss-the-drop", "/shop/tee-electronic-music-events-clothing", "/collections", "/collections/smilers-dancers", "/collections/drops-2026", "/events", "/events/mexico-show-2026", "/events/isla-electronica-2025", "/journal", "/journal/mexico-show-2026-le-film", "/about", "/contact", "/faq", "/guide-des-tailles", "/livraison-retours", "/billetterie", "/billetterie/smilin-dancin-festival-2027", "/compte", "/checkout"];
const widths = (process.env.W || "360,390,412,768,1024,1280,1366,1536,1600,1920,2560").split(",").map(Number);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let bad = 0;
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const path of pages) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll("h1,h2,h3,.t-display")) {
        if (el.scrollWidth > el.clientWidth + 2) out.push("DÉBORDE: " + el.textContent.trim().slice(0, 30));
      }
      for (const el of document.querySelectorAll("h1,h2,h3,.t-display")) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = n.textContent; const re = /\S+/g; let m;
          while ((m = re.exec(t))) {
            if (m[0].length < 2) continue;
            const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
            const tops = new Set([...rg.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
            if (tops.size > 1) out.push(m[0]);
          }
        }
      }
      return [...new Set(out)];
    });
    if (r.length) { bad++; console.log(`[${w}] ${path}: ${r.join(" | ")}`); }
  }
  await p.close();
}
console.log(bad ? `${bad} pages avec mots coupés` : "AUCUN MOT COUPÉ");
await b.close();
