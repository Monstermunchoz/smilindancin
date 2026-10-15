import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 412, height: 860 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
for (const path of process.argv.slice(2)) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    document.documentElement.style.overflowX = "visible";
    const W = window.visualViewport.width, sw = document.documentElement.scrollWidth, vv = window.visualViewport.width;
    const fam = getComputedStyle(document.body).fontFamily;
    const loaded = [...document.fonts].filter(f => f.status === "loaded").map(f => f.family);
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      if (r.right > W + 1) {
        // is it clipped by an ancestor that itself fits?
        let a = el.parentElement, clipped = false;
        while (a) { const c = getComputedStyle(a); if (c.overflowX !== "visible") { const ar = a.getBoundingClientRect(); if (ar.right <= W + 1) { clipped = true; break; } } a = a.parentElement; }
        if (!clipped) out.push(`${el.tagName}.${String(el.className).slice(0,70)} R=${Math.round(r.right)} "${(el.textContent||"").trim().slice(0,30)}"`);
      }
    }
    return { W, sw, vv, fam: fam.slice(0, 60), loaded: [...new Set(loaded)], out: out.slice(0, 8) };
  });
  console.log(path, JSON.stringify(r, null, 1));
}
await b.close();
