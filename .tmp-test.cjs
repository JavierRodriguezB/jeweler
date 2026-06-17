const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForSelector('h1');
  await page.waitForTimeout(2500);
  // remove all overflow/clip restrictions around the headline to test if glyph shape changes
  await page.evaluate(() => {
    document.querySelectorAll('h1 span').forEach(el => {
      el.style.overflow = 'visible';
      el.style.marginBottom = '0';
      el.style.paddingBottom = '0';
    });
  });
  const h1 = await page.$('h1');
  await h1.screenshot({ path: '.tmp-h1-unclipped.png' });
  await browser.close();
})();
