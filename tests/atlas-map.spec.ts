import { expect, test, type Page } from '@playwright/test';

function browserErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

test('optional Atlas map pans, zooms, selects records, and releases its canvas', async ({ page }) => {
  const errors = browserErrors(page);
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/atlas', { waitUntil: 'networkidle' });
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pan the map' }).click();

  // A runner without a WebGL2 device must still exercise and pass the usable
  // fallback. Report that limitation instead of claiming GPU behavior passed.
  await expect.poll(async () => {
    if (await page.locator('.maplibregl-marker').count() === 6) return 'ready';
    if ((await page.locator('#atlas-map-note').textContent())?.includes('unavailable')) return 'fallback';
    return 'loading';
  }, { timeout: 20_000 }).not.toBe('loading');

  if (await page.locator('.maplibregl-marker').count() !== 6) {
    test.info().annotations.push({ type: 'WebGL2 availability', description: 'This runner could not initialize WebGL2; graceful static fallback was verified. Pan/zoom require a GPU-capable runner.' });
    await expect(page.locator('#atlas-map-note')).toContainText('Interactive map unavailable');
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('button', { name: 'Select Reykjanes', exact: true }).click();
    await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
    expect(errors).toEqual([]);
    return;
  }

  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1);
  await expect(page.locator('#atlas-map-note')).toContainText('not a georeferenced basemap');
  await page.locator('[aria-label="Field site selection"]').getByRole('button', { name: 'Etna', exact: true }).click();
  await expect(page.locator('.maplibregl-marker[aria-label="Select Etna"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.maplibregl-marker[aria-label="Select Reykjanes"]').click();
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
  await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/reykjanes');

  const marker = page.locator('.maplibregl-marker[aria-label="Select Kīlauea"]');
  const beforeZoom = await marker.getAttribute('style');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(() => marker.getAttribute('style')).not.toBe(beforeZoom);
  // Reduced motion keeps camera transitions deterministic while preserving the
  // map's actual pointer and keyboard handlers.
  const beforePan = await marker.getAttribute('style');
  const area = await page.locator('.maplibregl-canvas').boundingBox();
  expect(area).not.toBeNull();
  const start = { x: area!.x + area!.width * 0.25, y: area!.y + area!.height * 0.5 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 90, start.y + 25, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => marker.getAttribute('style')).not.toBe(beforePan);

  await page.getByRole('button', { name: 'Return to illustration' }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Select Reykjanes', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
  const origin = new URL(page.url()).origin;
  expect(requests.filter(url => !url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:'))).toEqual([]);
  expect(errors).toEqual([]);
});

test('optional Atlas map restores the complete illustration when WebGL is disabled', async ({ page }) => {
  const errors = browserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextId)) return null;
      return (original as (this: HTMLCanvasElement, id: string, options?: unknown) => RenderingContext | null).call(this, contextId, options);
    } as typeof original;
  });
  await page.goto('/atlas', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Pan the map' }).click();
  await expect(page.locator('#atlas-map-note')).toContainText('Interactive map unavailable', { timeout: 20_000 });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('img', { name: /Illustrated world map/ })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search field sites' }).fill('etna');
  await page.locator('[aria-label="Field site selection"]').getByRole('button', { name: 'Etna', exact: true }).click();
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Etna');
  await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/etna');
  expect(errors).toEqual([]);
});
