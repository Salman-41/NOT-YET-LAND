import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial', timeout: 180_000 });
const directory = 'artifacts/spatial';

async function revealInstrument(page: Page, path = '/expedition/kilauea#terrain-study') {
  await page.goto(path, { waitUntil: 'networkidle' });
  const instrument = page.getByTestId('terrain-instrument');
  await instrument.scrollIntoViewIfNeeded();
  if ((await instrument.getAttribute('data-scene-state')) === 'static') await instrument.getByRole('button', { name: 'Load the 3D study', exact: true }).click();
  await expect(instrument).toHaveAttribute('data-scene-state', 'ready', { timeout: 120_000 });
  return instrument;
}

test.beforeAll(async () => { await mkdir(directory, { recursive: true }); });

test('measured landscape, selected field points, and partial/full geological sections render', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const instrument = await revealInstrument(page);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(instrument).toHaveAttribute('data-mode', 'surface');
  const surface = JSON.parse((await instrument.getAttribute('data-scene-metrics'))!);
  expect(surface.vertices).toBeGreaterThan(16000);
  expect(surface.triangles).toBeGreaterThan(32000);
  expect(surface.drawCalls).toBeGreaterThan(0);
  expect(surface.pixelRatio).toBeLessThanOrEqual(1.5);
  const canvas = page.locator('canvas');
  const renderer = await canvas.evaluate(element => {
    const gl = (element as HTMLCanvasElement).getContext('webgl2')!;
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER)), version: String(gl.getParameter(gl.VERSION)) };
  });
  await page.evaluate(() => document.fonts.ready);
  const stage = page.getByTestId('terrain-stage');
  const landscapeImage = await stage.screenshot({ path: `${directory}/kilauea-3d-landscape.png` });
  await instrument.getByRole('button', { name: 'Northern rim', exact: true }).click();
  await expect(instrument.getByRole('button', { name: 'Northern rim', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(instrument).toContainText('19.421° N');
  await instrument.getByRole('button', { name: 'Activate section', exact: true }).click();
  await expect(instrument).toHaveAttribute('data-mode', 'section');
  await expect(instrument).toHaveAttribute('data-section', '50');
  await expect(instrument).toHaveAttribute('data-scene-state', 'ready');
  const partial = await stage.screenshot({ path: `${directory}/geological-section-partial.png` });
  expect(createHash('sha256').update(partial).digest('hex')).not.toBe(createHash('sha256').update(landscapeImage).digest('hex'));
  await instrument.getByRole('button', { name: 'Full section / 100%', exact: true }).click();
  await expect(instrument.getByRole('slider', { name: 'Geological section reveal' })).toHaveValue('100');
  await expect(instrument).toHaveAttribute('data-section', '100');
  const full = await stage.screenshot({ path: `${directory}/geological-section-full.png` });
  expect(createHash('sha256').update(full).digest('hex')).not.toBe(createHash('sha256').update(partial).digest('hex'));
  const sectional = JSON.parse((await instrument.getAttribute('data-scene-metrics'))!);
  expect(sectional.geometries).toBeLessThan(surface.geometries + 12);
  await instrument.getByRole('button', { name: 'Surface view', exact: true }).click();
  await expect(instrument).toHaveAttribute('data-mode', 'surface');
  await expect(instrument).toHaveAttribute('data-section', '0');
  await page.getByRole('link', { name: 'CONTINUE BELOW THE SURFACE' }).click();
  await expect(page).toHaveURL(/\/subsurface$/);
  const next = await revealInstrument(page, '/subsurface');
  await expect(next).toHaveAttribute('data-mode', 'surface');
  await expect(page.locator('canvas')).toHaveCount(1);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => /terrain\/|VolcanicScene/.test(entry.name)).map(entry => ({ name: new URL(entry.name).pathname, durationMs: Math.round(entry.duration), transferSize: (entry as PerformanceResourceTiming).transferSize, decodedBytes: (entry as PerformanceResourceTiming).decodedBodySize })));
  await writeFile(`${directory}/performance-observations.json`, JSON.stringify({ measuredAt: new Date().toISOString(), viewport: page.viewportSize(), browser: await page.context().browser()!.version(), renderer, surface, sectional, resources, notes: ['CPU render submission is not GPU frame time or FPS.', 'Headless Chromium observations; not physical-device or Core Web Vitals results.'] }, null, 2));
  expect(errors).toEqual([]);
});

test('section updates, quality changes, offscreen suspension, and repeated releases remain bounded', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const instrument = await revealInstrument(page, '/subsurface');
  const baseline = JSON.parse((await instrument.getAttribute('data-scene-metrics'))!);
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
  await expect(instrument).toHaveAttribute('data-render-active', 'false');
  await page.getByTestId('terrain-stage').scrollIntoViewIfNeeded();
  await expect(instrument).toHaveAttribute('data-render-active', 'true');
  for (let i = 0; i < 3; i++) {
    await instrument.getByRole('button', { name: 'Activate section', exact: true }).click();
    const range = instrument.getByRole('slider', { name: 'Geological section reveal' });
    await range.focus(); await range.press('End');
    await expect(instrument).toHaveAttribute('data-section', '100');
    await range.press('Home');
    await expect(instrument).toHaveAttribute('data-mode', 'surface');
  }
  await instrument.getByLabel('RENDER DETAIL').selectOption('low');
  await expect(instrument).toHaveAttribute('data-scene-state', 'ready', { timeout: 90_000 });
  await expect(instrument).toHaveAttribute('data-quality', 'low');
  const lower = JSON.parse((await instrument.getAttribute('data-scene-metrics'))!);
  expect(lower.triangles).toBeLessThan(baseline.triangles);
  expect(lower.geometries).toBeLessThan(baseline.geometries + 6);
  for (let i = 0; i < 2; i++) {
    await instrument.getByRole('button', { name: 'Return to static study', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await instrument.getByRole('button', { name: 'Load the 3D study', exact: true }).click();
    await expect(instrument).toHaveAttribute('data-scene-state', 'ready', { timeout: 90_000 });
    await expect(page.locator('canvas')).toHaveCount(1);
  }
  await page.getByRole('link', { name: 'Not Yet Land, index', exact: true }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('limited mobile device keeps an honest, operable static fallback', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, options?: unknown) {
      if (/webgl/.test(kind)) return null;
      return (original as (this: HTMLCanvasElement, kind: string, options?: unknown) => RenderingContext | null).call(this, kind, options);
    } as typeof original;
  });
  await page.goto('/subsurface', { waitUntil: 'networkidle' });
  const instrument = page.getByTestId('terrain-instrument');
  await instrument.getByRole('button', { name: 'Load the 3D study', exact: true }).click();
  await expect(instrument).toHaveAttribute('data-scene-state', 'fallback');
  await expect(instrument).toContainText('WebGL2 is unavailable');
  await instrument.getByRole('button', { name: 'Activate section', exact: true }).click();
  await instrument.getByRole('slider', { name: 'Geological section reveal' }).focus();
  await page.keyboard.press('End');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '1100');
  await expect(instrument).toContainText('DIAGRAM SURFACE / ALSO SCHEMATIC');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await instrument.scrollIntoViewIfNeeded();
  await instrument.screenshot({ path: `${directory}/mobile-fallback.png` });
});

test('lost WebGL context releases the engine and preserves the instruments', async ({ page }) => {
  const instrument = await revealInstrument(page, '/subsurface');
  await page.locator('canvas').evaluate(element => {
    const canvas = element as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(instrument).toHaveAttribute('data-scene-state', 'fallback');
  await expect(page.locator('canvas')).toHaveCount(0);
  await instrument.getByRole('button', { name: 'Full section / 100%', exact: true }).click();
  await expect(instrument).toHaveAttribute('data-section', '100');
  await expect(page.locator('#clipInterior')).toHaveAttribute('width', '1100');
});
