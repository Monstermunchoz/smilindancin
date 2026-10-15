import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000" + (process.argv[2] || "/"), { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const w = document.documentElement.clientWidth; const out = []; document.querySelectorAll("body *").forEach((el) => { const r = el.getBoundingClientRect(); if (r.right > w + 1 && r.width > 0 && getComputedStyle(el).position !== "fixed") out.push(`${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`); }); return { sw: document.documentElement.scrollWidth, w, out: out.slice(0, 12) }; });
console.log(r);
await b.close();
