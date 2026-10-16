import { chromium } from 'playwright';
const pages = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const path of pages) {
  const p = await b.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:1 });
  await p.goto('http://localhost:3000'+path,{waitUntil:'load', timeout:120000});
  const H = await p.evaluate(()=>document.documentElement.scrollHeight);
  for (let y=0;y<H;y+=600){ await p.evaluate(y=>scrollTo(0,y),y); await p.waitForTimeout(350); }
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(800);
  const name = path.replace(/[^a-z0-9]+/gi,'_') || 'home';
  await p.screenshot({ path:`/tmp/claude-0/shots/t_${name}.png`, fullPage:true });
  console.log(name, H);
  await p.close();
}
await b.close();
