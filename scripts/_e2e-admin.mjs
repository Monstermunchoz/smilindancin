import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog', d=>d.accept());
await p.goto('http://localhost:3000/admin/login',{waitUntil:'load',timeout:150000});
await p.fill('input[type=password]','smilin-admin'); await p.keyboard.press('Enter');
await p.waitForURL(/\/admin$/,{timeout:90000});
// Produit
await p.goto('http://localhost:3000/admin/products/new',{waitUntil:'load',timeout:150000});
await p.setInputFiles('input[type=file][accept="image/*"]','/tmp/claude-0/test.jpg');
await p.waitForSelector('img[src^="/api/files/"], img[src*="%2Fapi%2Ffiles%2F"]',{timeout:60000});
await p.fill('input[placeholder="Ex. Groovers"]','Tote bag Disco');
await p.fill('textarea[placeholder^="Ce qui rend"]','Tote bag en coton bio, visuel boule à facettes.');
await p.click('text=En vente');
await p.click('text=Créer le produit');
await p.waitForURL(/\/admin\/products\/p-/,{timeout:60000});
const pid = p.url().split('/').pop();
console.log('produit créé', pid);
await p.screenshot({path:'/tmp/claude-0/shots/a-prod.png'});
// visible en boutique ?
const shop = await (await ctx.request.get('http://localhost:3000/shop/tote-bag-disco')).status();
console.log('fiche publique', shop);
// Fournisseur
await p.goto('http://localhost:3000/admin/factures?tab=fournisseurs',{waitUntil:'load'});
await p.click('text=+ Nouveau fournisseur');
await p.fill('input[placeholder="Ex. Atelier Brodeur Lyon"]','Imprimerie Lumière');
await p.click('[role=dialog] >> text=Comm');
await p.click('[role=dialog] >> text=Ajouter');
await p.waitForTimeout(1500);
// Facture avec PDF
await p.goto('http://localhost:3000/admin/factures?tab=factures',{waitUntil:'load'});
await p.click('text=+ Nouvelle facture');
await p.selectOption('[role=dialog] select >> nth=0',{label:'Imprimerie Lumière'});
await p.fill('input[placeholder="Ex. Flyers Mexico Show ×2000"]','Flyers Festival 2027');
await p.fill('[role=dialog] input[inputmode=decimal] >> nth=0','250');
await p.setInputFiles('[role=dialog] input[type=file]','/tmp/claude-0/facture.pdf');
await p.waitForSelector('[role=dialog] a[href^="/api/files/"]',{timeout:30000});
await p.click('[role=dialog] >> text=Ajouter');
await p.waitForTimeout(1800);
await p.screenshot({path:'/tmp/claude-0/shots/a-fact.png'});
const fileHref = await p.getAttribute('a[href^="/api/files/"]','href');
const anon = await b.newContext(); const st = (await anon.request.get('http://localhost:3000'+fileHref)).status();
console.log('PDF privé, accès anonyme ->', st, '; admin ->', (await ctx.request.get('http://localhost:3000'+fileHref)).status());
// Envoi
await p.goto('http://localhost:3000/admin/factures?tab=envois',{waitUntil:'load'});
await p.click('text=+ Nouvel envoi');
await p.fill('[role=dialog] input >> nth=0','Camille Martin');
await p.click('[role=dialog] >> text=Ajouter');
await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/shots/a-envois.png'});
// Tableau de bord
await p.goto('http://localhost:3000/admin',{waitUntil:'load'}); await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/shots/a-dash.png', fullPage:true});
await p.goto('http://localhost:3000/admin/products',{waitUntil:'load'}); await p.waitForTimeout(1500);
await p.screenshot({path:'/tmp/claude-0/shots/a-shop.png'});
// Suppression du produit test
await p.goto('http://localhost:3000/admin/products/'+pid,{waitUntil:'load'});
await p.click('text=Supprimer le produit'); await p.waitForURL(/\/admin\/products$/,{timeout:30000});
console.log('produit supprimé, fiche ->', (await ctx.request.get('http://localhost:3000/shop/tote-bag-disco')).status());
// Mobile
const m = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, storageState: await ctx.storageState() });
const mp = await m.newPage();
for (const [u,n] of [['/admin','m-dash'],['/admin/factures','m-fact'],['/admin/products/new','m-new']]) { await mp.goto('http://localhost:3000'+u,{waitUntil:'load'}); await mp.waitForTimeout(1500); await mp.screenshot({path:`/tmp/claude-0/shots/a-${n}.png`, fullPage: n==='m-dash'}); }
console.log('erreurs', errs);
await b.close();
