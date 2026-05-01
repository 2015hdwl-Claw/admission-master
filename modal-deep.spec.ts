import { test } from '@playwright/test';
test('modal deep inspection', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://admission-master.vercel.app/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.click('button:has-text("專題範本庫")');
  await page.waitForTimeout(2000);
  // Inspect the fixed overlay and its children
  const modalData = await page.evaluate(() => {
    const overlay = document.querySelector('div.fixed.inset-0');
    if (!overlay) return { found: false };
    const children = Array.from(overlay.children).map(c => ({
      tag: c.tagName,
      cls: c.className.toString().slice(0, 200),
      rect: { w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height), x: Math.round(c.getBoundingClientRect().x), y: Math.round(c.getBoundingClientRect().y) },
      scrollH: c.scrollHeight, clientH: c.clientHeight,
      overflow: getComputedStyle(c).overflow,
      overflowY: getComputedStyle(c).overflowY,
      childCount: c.children.length,
      text: c.textContent ? c.textContent.trim().slice(0, 200) : '',
    }));
    // Also get grandchildren of the inner container
    let innerChildren = [];
    if (children.length > 0) {
      const inner = children[0];
      innerChildren = Array.from(overlay.children[0].children).map(c => ({
        tag: c.tagName,
        cls: c.className.toString().slice(0, 200),
        rect: { w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) },
        text: c.textContent ? c.textContent.trim().slice(0, 100) : '',
      }));
    }
    return {
      found: true,
      overlayRect: { w: Math.round(overlay.getBoundingClientRect().width), h: Math.round(overlay.getBoundingClientRect().height) },
      children,
      innerChildren,
    };
  });
  console.log('MODAL DEEP:', JSON.stringify(modalData, null, 2));
  // Check if modal content is scrollable
  const scrollInfo = await page.evaluate(() => {
    const overlay = document.querySelector('div.fixed.inset-0');
    if (!overlay) return null;
    const inner = overlay.querySelector('div[class*=max-h], div[class*=overflow], div[class*=scroll]') || overlay.firstElementChild;
    if (!inner) return null;
    return {
      scrollHeight: inner.scrollHeight,
      clientHeight: inner.clientHeight,
      scrollTop: inner.scrollTop,
      canScroll: inner.scrollHeight > inner.clientHeight,
      overflow: getComputedStyle(inner).overflow,
      overflowY: getComputedStyle(inner).overflowY,
      maxH: getComputedStyle(inner).maxHeight,
    };
  });
  console.log('SCROLL INFO:', JSON.stringify(scrollInfo, null, 2));
  // Check touch targets inside modal
  const modalBtns = await page.evaluate(() => {
    const overlay = document.querySelector('div.fixed.inset-0');
    if (!overlay) return [];
    return Array.from(overlay.querySelectorAll('button,a,[role=button]')).map(b => ({
      text: (b.textContent||'').trim().slice(0,60),
      w: Math.round(b.getBoundingClientRect().width),
      h: Math.round(b.getBoundingClientRect().height),
      min: Math.min(Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)),
      ok: Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) >= 44,
    }));
  });
  console.log('MODAL BTNS:', JSON.stringify(modalBtns, null, 2));
  // Check if body scroll is locked
  const bodyScroll = await page.evaluate(() => {
    const b = document.body;
    const html = document.documentElement;
    return {
      bodyOverflow: getComputedStyle(b).overflow,
      bodyPosition: getComputedStyle(b).position,
      htmlOverflow: getComputedStyle(html).overflow,
      canScrollBody: b.scrollHeight > b.clientHeight,
    };
  });
  console.log('BODY SCROLL:', JSON.stringify(bodyScroll, null, 2));
  await page.screenshot({ path: 'C:/Users/ntpud/.claude/projects/mobile-ux-test/11-modal-deep.png', fullPage: true });
});
