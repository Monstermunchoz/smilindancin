import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const h2s = await p.$$("h2");
for (const h of h2s) {
  await h.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
  const info = await h.evaluate((el) => { const w = el.closest("[style]") || el; return { t: el.textContent.slice(0, 30), op: getComputedStyle(el.parentElement).opacity, pop: getComputedStyle(w).opacity, clip: getComputedStyle(w).clipPath }; });
  console.log(info);
}
await p.screenshot({ path: "/tmp/claude-0/-home-claude/c12d08ce-f9ab-55ea-a49b-3e31178949db/scratchpad/shots/campaign.png" });
await b.close();
