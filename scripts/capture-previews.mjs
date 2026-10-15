import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
const localBrowser = '/home/salman/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const browser = await chromium.launch(existsSync(localBrowser) ? { executablePath: localBrowser } : {});
try {
  await mkdir('artifacts/screenshots', { recursive: true });
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `artifacts/screenshots/home-${name}-viewport.png`, animations: 'disabled' });
    if (name === 'mobile') {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.getByRole('dialog').getByRole('link').first().waitFor();
      await page.screenshot({ path: 'artifacts/screenshots/navigation-mobile.png', animations: 'disabled' });
    }
    await page.close();
  }
} finally { await browser.close(); }
