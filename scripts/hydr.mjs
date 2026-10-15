import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("console", (m) => { if (m.type() === "error") console.log(m.text().slice(0, 3000)); });
await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await b.close();
