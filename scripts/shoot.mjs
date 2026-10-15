import { chromium } from "playwright";
const out = "/tmp/claude-0/-home-claude/c12d08ce-f9ab-55ea-a49b-3e31178949db/scratchpad/shots";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }).catch(() => chromium.launch());
const pages = process.argv.slice(2);
for (const vp of [{ n: "d", w: 1440, h: 900 }, { n: "m", w: 390, h: 844 }]) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  for (const path of pages) {
    await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle", timeout: 60000 });
    await p.waitForTimeout(2200);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(800);
    const name = (path === "/" ? "home" : path.replace(/[\/\[\]]/g, "_").replace(/^_/, "")) + "-" + vp.n + ".png";
    await p.screenshot({ path: `${out}/${name}`, fullPage: true });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(vp.n, path, sw ? "OVERFLOW-X!" : "ok");
  }
  if (errs.length) console.log(vp.n, "console errors:", [...new Set(errs)].slice(0, 8));
  await ctx.close();
}
await b.close();
