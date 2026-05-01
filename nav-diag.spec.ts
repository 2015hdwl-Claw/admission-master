import { test } from '@playwright/test';
test('nav bar inspection', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://admission-master.vercel.app/portfolio', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // Check bottom nav / hamburger menu
  const navInfo = await page.evaluate(() => {
    // Find all nav-like elements
    const navs = Array.from(document.querySelectorAll('nav, [role=navigation], header, footer')).map(n => ({
      tag: n.tagName,
      cls: n.className.toString().slice(0, 200),
      rect: { w: Math.round(n.getBoundingClientRect().width), h: Math.round(n.getBoundingClientRect().height), y: Math.round(n.getBoundingClientRect().y) },
      childCount: n.children.length,
    }));
    // Find the hamburger/menu button
    const menuBtns = Array.from(document.querySelectorAll('button')).filter(b => {
      const svg = b.querySelector('svg');
      return svg && b.getBoundingClientRect().width <= 40 && b.getBoundingClientRect().height <= 40;
    }).map(b => ({
      text: (b.textContent||'').trim(),
      w: Math.round(b.getBoundingClientRect().width),
      h: Math.round(b.getBoundingClientRect().height),
      cls: b.className.toString().slice(0, 100),
    }));
    // Find all 0x0 elements (display:none or visibility:hidden)
    const hiddenEls = Array.from(document.querySelectorAll('button, a')).filter(b => {
      const r = b.getBoundingClientRect();
      return r.width === 0 && r.height === 0 && (b.textContent||'').trim().length > 0;
    }).map(b => ({
      tag: b.tagName,
      text: (b.textContent||'').trim().slice(0, 50),
      display: getComputedStyle(b).display,
      visibility: getComputedStyle(b).visibility,
      parentDisplay: b.parentElement ? getComputedStyle(b.parentElement).display : 'N/A',
    }));
    return { navs, menuBtns, hiddenEls };
  });
  console.log('NAV INFO:', JSON.stringify(navInfo, null, 2));
  // Try clicking the hamburger/menu button if found
  const menuBtn = page.locator('button:has(svg)').first();
  if (await menuBtn.isVisible({ timeout: 1000 })) {
    await menuBtn.click();
    await page.waitForTimeout(1000);
    const navBtns = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a')).filter(b => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (b.textContent||'').trim().length > 0;
      }).map(b => ({
        text: (b.textContent||'').trim().slice(0, 50),
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
        min: Math.min(Math.round(b.getBoundingClientRect().width), Math.round(b.getBoundingClientRect().height)),
        ok: Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height) >= 44,
      }));
    });
    console.log('MENU OPEN BTNS:', JSON.stringify(navBtns, null, 2));
    await page.screenshot({ path: 'C:/Users/ntpud/.claude/projects/mobile-ux-test/12-menu-open.png', fullPage: true });
  }
});
