import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { VOLCANOES } from '../app/data/volcanoes';

const widths = [320, 390, 768, 1024, 1440, 1920];
const routes = [
  { path: '/', heading: /The earth.*is not.*finished\./s, name: 'home' },
  { path: '/atlas', heading: /The atlas\./, name: 'atlas' },
  { path: '/expeditions', heading: /Where the.*ground moves\./s, name: 'expeditions' },
  ...VOLCANOES.map(record => ({ path: `/expedition/${record.slug}`, heading: new RegExp(record.display[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), name: `expedition-${record.slug}` })),
  { path: '/subsurface', heading: /Below the.*surface\./s, name: 'subsurface' },
  { path: '/evidence', heading: /The ground.*on record\./s, name: 'evidence' },
  { path: '/method', heading: /A field guide.*uncertainty\./s, name: 'method' },
];
const screenshotRoutes = new Set(['home', 'atlas', 'expedition-kilauea', 'subsurface', 'evidence']);

async function settleArtwork(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(async image => {
      image.loading = 'eager';
      await image.decode().catch(() => undefined);
    }));
  });
}

test.beforeAll(async () => { await mkdir('artifacts/screenshots', { recursive: true }); });

test.describe('public archive at all six requested widths', () => {
  for (const width of widths) {
    for (const route of routes) {
      test(`${route.name} / ${width}px: rendered, accessible, and within the viewport`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
        const response = await page.goto(route.path, { waitUntil: 'networkidle' });
        expect(response?.status()).toBe(200);
        expect(await response?.text()).toMatch(/<h1[\s>]/);
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toHaveCount(1);
        await expect(heading).toBeVisible();
        await expect(heading).toHaveText(route.heading);
        await expect(page).toHaveTitle(/NOT YET LAND/);
        await settleArtwork(page);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const brokenImages = await page.evaluate(() => Array.from(document.images).filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute('src')));
        expect(brokenImages).toEqual([]);
        const missingAlt = await page.locator('img:not([alt])').count();
        expect(missingAlt).toBe(0);
        await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
        if (route.name === 'home' || ((width === 390 || width === 1440) && screenshotRoutes.has(route.name))) {
          const viewport = width === 390 ? 'mobile' : width === 1440 ? 'desktop' : `${width}px`;
          await page.screenshot({ path: `artifacts/screenshots/${route.name}-${viewport}.png`, fullPage: true, animations: 'disabled' });
        }
        expect(errors).toEqual([]);
      });
    }
  }
});

test('atlas search, empty feedback, geographic selection, and real expedition URLs', async ({ page }) => {
  await page.goto('/atlas', { waitUntil: 'networkidle' });
  const search = page.getByRole('searchbox', { name: 'Search field sites' });
  const result = page.locator('[aria-label="Field site selection"]').getByRole('button');
  await search.fill('Kilauea');
  await expect(page.getByRole('status')).toContainText('1 field site found');
  await expect(result).toHaveCount(1);
  await expect(result).toContainText('Kīlauea');
  await search.fill('Etna');
  await expect(result).toHaveCount(1);
  await result.click();
  await expect(page.locator('#atlas-selected-record').getByRole('heading')).toHaveText('Etna');
  await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/etna');
  await search.fill('no site matches this query');
  await expect(page.getByRole('status')).toContainText('No field sites found');
  await search.fill('');
  const pin = page.getByRole('button', { name: 'Select Reykjanes', exact: true });
  await pin.click();
  await expect(pin).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#atlas-selected-record').getByRole('heading')).toHaveText('Reykjanes');
  await page.getByRole('link', { name: 'Begin expedition' }).click();
  await expect(page).toHaveURL(/\/expedition\/reykjanes$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Reykjanes');
});

test('mobile navigation traps keyboard focus and Escape restores the trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Site navigation' });
  await expect(dialog).toBeVisible();
  const first = dialog.getByRole('link').first();
  const last = dialog.getByRole('link').last();
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(first).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('dialog').getByRole('link', { name: /Below the Surface/ }).click();
  await expect(page).toHaveURL(/\/subsurface$/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

for (const record of VOLCANOES) {
  test(`${record.name}: the keyboard instrument reaches both named phases`, async ({ page }) => {
    await page.goto(`/expedition/${record.slug}`, { waitUntil: 'networkidle' });
    const range = page.getByRole('slider', { name: `${record.interaction} progression`, exact: true });
    await range.focus();
    await range.press('End');
    await expect(range).toHaveValue('3');
    await expect(page.locator('#moduleStepName')).toHaveText(record.moduleSteps[3]);
    await expect(page.locator('#moduleStepCaption')).toHaveText('STEP 04 / CONCEPT MODEL');
    await expect(page.locator('#stageArt')).toHaveAttribute('data-phase', '3');
    await expect(page.locator('#stageOverlay')).toHaveCSS('opacity', '0.97');
    await range.press('Home');
    await expect(page.locator('#moduleStepName')).toHaveText(record.moduleSteps[0]);
    await expect(range).toHaveAttribute('aria-valuetext', `Step 1 of 4: ${record.moduleSteps[0]}`);
    await expect(page.getByRole('link', { name: /Open original source:/i })).toHaveAttribute('href', record.sourceUrl);
  });
}

test('subsurface commands and keyboard input change the actual diagram boundary', async ({ page }) => {
  await page.goto('/subsurface', { waitUntil: 'networkidle' });
  const range = page.getByRole('slider', { name: 'Reveal percentage of the conceptual underground cross-section' });
  await expect(range).toHaveValue('50');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '550');
  await page.getByRole('button', { name: 'INTERIOR / 100%', exact: true }).click();
  await expect(range).toHaveValue('100');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '1100');
  await expect(page.locator('#cutSeam')).toHaveAttribute('d', 'M1100 0V620');
  await expect(page.locator('#cutMarker')).toHaveAttribute('cx', '1100');
  await page.getByRole('button', { name: 'SURFACE / 0%', exact: true }).click();
  await expect(range).toHaveValue('0');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '0');
  await range.focus();
  await range.press('ArrowRight');
  await expect(range).toHaveValue('1');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '11');
  await expect(page.locator('#cutLabel')).toHaveText('SECTION OPEN / 1%');
});

test('evidence comparison moves the visible clipping boundary and preserves its concept label', async ({ page }) => {
  await page.goto('/evidence', { waitUntil: 'networkidle' });
  const range = page.getByRole('slider', { name: 'Compare two conceptual terrain studies', exact: true });
  const alternate = page.getByRole('img', { name: /Alternative illustrative relief/ });
  await range.focus();
  await range.press('End');
  await expect(range).toHaveValue('100');
  await expect(alternate).toHaveAttribute('style', /100%/);
  await range.press('Home');
  await expect(range).toHaveValue('0');
  for (let step = 0; step < 25; step += 1) await range.press('ArrowRight');
  await expect(range).toHaveValue('25');
  await expect(range).toHaveAttribute('aria-valuetext', '25% study A; 75% study B');
  await expect(alternate).toHaveAttribute('style', /25%/);
  await expect(page.getByText('STUDY A / ILLUSTRATION', { exact: true })).toBeVisible();
  await expect(page.getByText('STUDY B / ILLUSTRATION', { exact: true })).toBeVisible();
  await settleArtwork(page);
  await page.screenshot({ path: 'artifacts/screenshots/evidence-comparison-25-percent.png', fullPage: true, animations: 'disabled' });
});

test('the archive stays usable with WebGL unavailable and reduced motion requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextId)) return null;
      return (original as (this: HTMLCanvasElement, id: string, options?: unknown) => RenderingContext | null).call(this, contextId, options);
    } as typeof original;
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => document.createElement('canvas').getContext('webgl2'))).toBeNull();
  await page.getByRole('link', { name: 'Enter the atlas' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/The atlas\./);
  await page.getByRole('button', { name: 'Select Kīlauea', exact: true }).click();
  await page.getByRole('link', { name: 'Begin expedition' }).click();
  const instrument = page.getByRole('slider', { name: 'Trace the flow progression' });
  await instrument.focus();
  await instrument.press('End');
  await expect(page.locator('#moduleStepName')).toHaveText('New land remains');
  const duration = await page.locator('#moduleTarget').evaluate(element => parseFloat(getComputedStyle(element).animationDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
  await page.goto('/subsurface', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'INTERIOR / 100%', exact: true }).click();
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '1100');
});

test.describe('touch controls', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('a touch visitor can select a field site and operate the two native instruments', async ({ page }) => {
    await page.goto('/atlas', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Select Reykjanes', exact: true }).tap();
    await expect(page.locator('#atlas-selected-record').getByRole('heading')).toHaveText('Reykjanes');
    await page.getByRole('link', { name: 'Begin expedition' }).tap();
    const range = page.getByRole('slider', { name: 'Expose the fracture progression' });
    await range.scrollIntoViewIfNeeded();
    const bounds = await range.boundingBox();
    expect(bounds).not.toBeNull();
    await range.tap({ position: { x: (bounds?.width ?? 200) * 0.9, y: (bounds?.height ?? 16) / 2 } });
    await expect.poll(async () => Number(await range.inputValue())).toBeGreaterThan(1);
    await expect(page.locator('#moduleStepCaption')).not.toHaveText('STEP 02 / CONCEPT MODEL');
    await page.goto('/subsurface', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'INTERIOR / 100%', exact: true }).tap();
    await expect(page.locator('#clipInterior')).toHaveAttribute('width', '1100');
    await page.getByRole('button', { name: 'SURFACE / 0%', exact: true }).tap();
    await expect(page.locator('#clipInterior')).toHaveAttribute('width', '0');
  });
});
