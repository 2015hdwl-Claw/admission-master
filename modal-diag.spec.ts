import { test } from '@playwright/test';
test('modal diagnostic', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://admission-master.vercel.app/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  // Click the button
  await page.click('button:has-text("專題範本庫")');
  await page.waitForTimeout(2000);
  // Dump ALL DOM state after click
  const allHTML = await page.evaluate(() => {
    const body = document.body;
    return {
      bodyHTML: body.innerHTML.length,
      dialogs: document.querySelectorAll('[role=dialog]').length,
      portals: document.querySelectorAll('[data-radix-portal]').length,
      fixedEls: Array.from(document.querySelectorAll('[style*=fixed],[class*=fixed],[class*=Fixed]')).map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0,100), rect: e.getBoundingClientRect() })),
      overlayEls: Array.from(document.querySelectorAll('[class*=overlay],[class*=Overlay],[class*=backdrop],[class*=Backdrop]')).map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0,100), rect: { w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) } })),
      sheetEls: Array.from(document.querySelectorAll('[class*=sheet],[class*=Sheet],[class*=drawer],[class*=Drawer],[class*=panel],[class*=Panel],[class*=popup],[class*=Popup],[class*=slide],[class*=Slide]')).map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0,100), visible: e.offsetHeight > 0, rect: { w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) } })),
    };
  });
  console.log('POST-CLICK STATE:', JSON.stringify(allHTML, null, 2));
  await page.screenshot({ path: 'C:/Users/ntpud/.claude/projects/mobile-ux-test/10-modal-diag.png', fullPage: true });
});
