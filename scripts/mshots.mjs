import { chromium } from "playwright";
const out = process.env.OUT;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const list = JSON.parse(process.argv[2]);
for (const [path, y, name] of list) {
  await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  if (y === "bottom") await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); else await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}/${name}.png` });
}
await b.close();
