import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 412, height: 860 }, isMobile: true, hasTouch: true });
await p.goto("http://localhost:3000" + process.argv[2], { waitUntil: "networkidle" });
await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 412 || el.scrollWidth > 412) out.push(`${el.tagName}.${String(el.className).slice(0, 80)} w=${Math.round(r.width)} sw=${el.scrollWidth}`);
  }
  return out.slice(0, 25);
});
console.log(r.join("\n"));
await b.close();
