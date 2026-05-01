import { test, Page } from '@playwright/test';
const URL = 'https://admission-master.vercel.app';
const M = { width: 375, height: 667 };
const OUT = 'C:/Users/ntpud/.claude/projects/mobile-ux-test';
const errs: string[] = [];
test.beforeEach(async ({ page }) => {
  errs.length = 0;
  page.on('console', msg => { if (msg.type() === 'error') errs.push(msg.text()); });
  page.on('pageerror', err => errs.push('PE: ' + err.message));
});
const isHyd = (e: string[]) => e.some(x => ['hydration','#418','#423','#422','Text content did not match','Minified React'].some(p => x.toLowerCase().includes(p.toLowerCase())));
const bodyOv = (p: Page) => p.evaluate(() => {
  const b = document.body;
  return { sw: b.scrollWidth, cw: b.clientWidth, sh: b.scrollHeight, ch: b.clientHeight, hOv: b.scrollWidth > b.clientWidth, vOv: b.scrollHeight > b.clientHeight };
});
const touchT = (p: Page) => p.evaluate(() => {
  return Array.from(document.querySelectorAll('button,a,[role=button],[type=submit]')).map(el => {
    const r = el.getBoundingClientRect();
    return { t: (el.textContent||'').trim().slice(0,50), w: Math.round(r.width), h: Math.round(r.height), min: Math.min(Math.round(r.width), Math.round(r.height)), ok: Math.min(r.width, r.height) >= 44 };
  });
});
const textTrunc = (p: Page) => p.evaluate(() => {
  const res: {tag:string,text:string}[] = [];
  document.querySelectorAll('p,h1,h2,h3,h4,h5,h6,span,a,li,td,th,label').forEach(el => {
    const h = el as HTMLElement, s = getComputedStyle(h), txt = (el.textContent||'').trim();
    if (!txt || txt.length < 5) return;
    if ((s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && h.scrollWidth > h.clientWidth + 1)
      res.push({ tag: el.tagName.toLowerCase(), text: txt.slice(0,80) });
  });
  return res;
});
const checkModal = (p: Page) => p.evaluate(() => {
  const m = document.querySelector('[role="dialog"],[data-radix-portal],[class*=modal],[class*=Modal],[class*=dialog],[class*=Dialog],[class*=overlay],[class*=Overlay]');
  if (!m) return { found: false };
  const r = m.getBoundingClientRect();
  return { found: true, w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight, ovH: r.width > innerWidth, ovV: r.height > innerHeight, canScroll: (m as HTMLElement).scrollHeight > (m as HTMLElement).clientHeight };
});test('/portfolio - hydration + overflow', async ({ page }) => {
  await page.setViewportSize(M);
  await page.goto(URL + '/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('=== PORTFOLIO ===');
  console.log('ERRORS:', JSON.stringify(errs, null, 2));
  console.log('HYDRATION:', isHyd(errs));
  console.log('BODY:', JSON.stringify(await bodyOv(page), null, 2));
  console.log('TRUNC:', JSON.stringify(await textTrunc(page), null, 2));
  await page.screenshot({ path: OUT + '/01-portfolio.png', fullPage: true });
});
test('/portfolio - modal', async ({ page }) => {
  await page.setViewportSize(M);
  await page.goto(URL + '/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + '/02-portfolio-bottom.png', fullPage: true });
  let clicked = false;
  const selectors = [
    'button:has-text("專題範本庫")',
    'a:has-text("專題範本庫")',
    'text=專題範本庫'
  ];
  for (const s of selectors) {
    try {
      const b = page.locator(s).first();
      if (await b.isVisible({ timeout: 2000 })) {
        const box = await b.boundingBox();
        if (box) console.log('TEMPLATE BTN:', Math.round(box.width) + 'x' + Math.round(box.height), '>=44:', Math.min(box.width,box.height) >= 44);
        await b.click(); clicked = true; console.log('CLICKED:', s); break;
      }
    } catch(e) {}
  }
  if (!clicked) {
    const all = await page.evaluate(() => Array.from(document.querySelectorAll('button,a,[role=button]')).map(b => ({ tag: b.tagName, txt: (b.textContent||'').trim().slice(0,80), pos: { x: Math.round(b.getBoundingClientRect().x), y: Math.round(b.getBoundingClientRect().y), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) } })));
    console.log('ALL BTNS:', JSON.stringify(all, null, 2));
  }
  await page.waitForTimeout(1500);
  const mi = await checkModal(page);
  console.log('MODAL:', JSON.stringify(mi, null, 2));
  await page.screenshot({ path: OUT + '/03-portfolio-modal.png', fullPage: true });
  if (mi.found) {
    await page.evaluate(() => {
      const m = document.querySelector('[role="dialog"],[data-radix-portal],[class*=modal],[class*=Modal],[class*=dialog],[class*=Dialog],[class*=overlay],[class*=Overlay]');
      if (m) { const s = (m.querySelector('[class*=scroll],[class*=content],[class*=body]') || m) as HTMLElement; s.scrollTop = s.scrollHeight; }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: OUT + '/04-portfolio-modal-scrolled.png', fullPage: true });
    console.log('MODAL TOUCH:', JSON.stringify(await touchT(page), null, 2));
  }
});
test('/portfolio - AI button', async ({ page }) => {
  await page.setViewportSize(M);
  await page.goto(URL + '/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const aiSelectors = [
    'button:has-text("AI 幫你改")',
    'text=AI 幫你改'
  ];
  for (const s of aiSelectors) {
    try {
      const b = page.locator(s).first();
      if (await b.isVisible({ timeout: 2000 })) {
        const box = await b.boundingBox();
        if (box) console.log('AI BTN:', Math.round(box.width) + 'x' + Math.round(box.height), '>=44:', Math.min(box.width,box.height) >= 44);
        await page.screenshot({ path: OUT + '/05-ai-btn.png', fullPage: true }); break;
      }
    } catch(e) { console.log('AI not found'); }
  }
  console.log('ALL TOUCH:', JSON.stringify(await touchT(page), null, 2));
});
test('/demo - form', async ({ page }) => {
  await page.setViewportSize(M);
  await page.goto(URL + '/demo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('=== DEMO ===');
  console.log('ERRORS:', JSON.stringify(errs, null, 2));
  console.log('HYDRATION:', isHyd(errs));
  console.log('BODY:', JSON.stringify(await bodyOv(page), null, 2));
  console.log('TRUNC:', JSON.stringify(await textTrunc(page), null, 2));
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input,textarea,select')).map(i => { const r = i.getBoundingClientRect(); return { type: (i as HTMLInputElement).type || i.tagName, name: (i as HTMLInputElement).name, w: Math.round(r.width), h: Math.round(r.height) }; }));
  console.log('INPUTS:', JSON.stringify(inputs, null, 2));
  console.log('TOUCH:', JSON.stringify(await touchT(page), null, 2));
  await page.screenshot({ path: OUT + '/06-demo.png', fullPage: true });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + '/07-demo-scrolled.png', fullPage: true });
});
test('/teacher - dashboard', async ({ page }) => {
  await page.setViewportSize(M);
  await page.goto(URL + '/teacher', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log('=== TEACHER ===');
  console.log('ERRORS:', JSON.stringify(errs, null, 2));
  console.log('HYDRATION:', isHyd(errs));
  console.log('BODY:', JSON.stringify(await bodyOv(page), null, 2));
  console.log('TRUNC:', JSON.stringify(await textTrunc(page), null, 2));
  console.log('TOUCH:', JSON.stringify(await touchT(page), null, 2));
  const ovEls = await page.evaluate(() => Array.from(document.querySelectorAll('*')).map(el => { const h = el as HTMLElement; if (h.scrollWidth > h.clientWidth + 5 && h.clientWidth > 0) { const s = getComputedStyle(h); if (s.overflowX !== 'visible') return { tag: el.tagName, cls: (el.className||'').toString().slice(0,80), sw: h.scrollWidth, cw: h.clientWidth }; } return null; }).filter(Boolean));
  console.log('OV_ELS:', JSON.stringify(ovEls, null, 2));
  await page.screenshot({ path: OUT + '/08-teacher.png', fullPage: true });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: OUT + '/09-teacher-scrolled.png', fullPage: true });
});
