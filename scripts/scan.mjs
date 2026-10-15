import { chromium } from "playwright";
const pages = ["/", "/shop", "/shop/tee-together", "/shop/sweat-we-push-the-sky", "/shop/tee-groovers-never-miss-the-drop", "/shop/bob-smilin-dancin", "/collections", "/collections/smilers-dancers", "/events", "/events/mexico-show-2026", "/events/isla-electronica-2025", "/journal", "/journal/mexico-show-2026-le-film", "/about", "/contact", "/faq", "/guide-des-tailles", "/livraison-retours", "/legal/cgv", "/search?q=sweat", "/checkout", "/admin/login", "/nope", "/billetterie", "/billetterie/smilin-dancin-festival-2027", "/compte"];
const widths = (process.env.W || "360,390,412,768,1024").split(",").map(Number);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
let bad = 0;
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 860 }, isMobile: w < 800, hasTouch: w < 800 });
  for (const path of pages) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
    const r = await p.evaluate(() => { document.documentElement.style.overflowX = "visible"; const W = window.visualViewport.width; const sw = document.documentElement.scrollWidth; const wide = []; if (sw > W + 1) for (const el of document.querySelectorAll("main *, header *, footer *")) { const r = el.getBoundingClientRect(); if (r.width > W + 1 && !el.closest(".marquee")) { wide.push(el.tagName + "." + String(el.className).slice(0, 60) + " w=" + Math.round(r.width)); } } return { W, sw, wide: wide.slice(-3) }; });
    if (r.sw > r.W + 1) { bad++; console.log(`[${w}] ${path} sw=${r.sw}\n   ${r.wide.join("\n   ")}`); }
  }
  await p.close();
}
console.log(bad ? `${bad} cas de débordement` : `AUCUN DÉBORDEMENT (${pages.length} pages × ${widths.length} largeurs)`);
await b.close();
