import { expect, test, type Page } from '@playwright/test';
import { ATLAS_SITES } from '../app/data/atlas-sites';

function browserErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

async function geographicCoordinates(page: Page, selector: string) {
  await expect(page.locator(selector)).toHaveCount(6);
  for (const [slug, point] of Object.entries(ATLAS_SITES)) {
    const marker = page.locator(`${selector}[data-slug="${slug}"]`);
    await expect(marker).toHaveAttribute('data-longitude', String(point.longitude));
    await expect(marker).toHaveAttribute('data-latitude', String(point.latitude));
  }
}

test('the geographic Atlas starts automatically, pans, zooms, selects real coordinates, and releases its canvas', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = browserErrors(page);
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/atlas', { waitUntil: 'networkidle' });

  // Automatic startup needs no activation button. A runner without WebGL2
  // verifies the geographic fallback rather than claiming a GPU pass.
  await expect.poll(async () => {
    if (await page.locator('[data-map-ready="true"]').count()) return 'ready';
    if ((await page.locator('#atlas-map-note').textContent())?.includes('unavailable')) return 'fallback';
    return 'loading';
  }, { timeout: 25_000 }).not.toBe('loading');

  const origin = new URL(page.url()).origin;
  const externalRequests = () => requests.filter(url => !url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:'));
  await expect(page.getByRole('link', { name: 'Made with Natural Earth', exact: true })).toHaveAttribute('href', 'https://www.naturalearthdata.com/');
  await expect(page.getByRole('link', { name: 'Public-domain cartography', exact: true })).toHaveAttribute('href', 'https://www.naturalearthdata.com/about/terms-of-use/');

  if (await page.locator('[data-map-ready="true"]').count() === 0) {
    test.info().annotations.push({ type: 'WebGL2 availability', description: 'This runner could not initialize WebGL2. Automatic geographic fallback and coordinate-based selection passed; GPU pan/zoom were not exercised.' });
    await expect(page.locator('#atlas-map-note')).toContainText('Interactive map unavailable');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /^Georeferenced Natural Earth land/ })).toBeVisible();
    await geographicCoordinates(page, 'button[data-slug]');
    await page.getByRole('button', { name: 'Select Reykjanes', exact: true }).click();
    await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
    await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/reykjanes');
    expect(externalRequests()).toEqual([]);
    expect(errors).toEqual([]);
    return;
  }

  await expect(page.locator('.maplibregl-canvas')).toHaveCount(1);
  await expect(page.locator('#atlas-map-note')).toContainText('Georeferenced cartography');
  await geographicCoordinates(page, '.maplibregl-marker[data-slug]');
  for (const asset of ['land-10m.geojson', 'coastline-10m.geojson', 'graticule.geojson', 'relief-mercator.webp']) {
    // Modern browsers fetch the retained .gz files and decompress locally;
    // older browsers use the uncompressed geographic fallback.
    expect(requests.some(url => new URL(url).pathname.replace(/\.gz$/, '') === `/geography/${asset}`)).toBe(true);
  }

  const kilauea = page.locator('.maplibregl-marker[data-slug="kilauea"]');
  const worldPosition = await kilauea.getAttribute('style');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect.poll(() => kilauea.getAttribute('style')).not.toBe(worldPosition);

  // Reduced motion makes camera changes deterministic; the drag still uses
  // MapLibre's real geographic pointer handler.
  const beforePan = await kilauea.getAttribute('style');
  const area = await page.locator('.maplibregl-canvas').boundingBox();
  expect(area).not.toBeNull();
  const start = { x: area!.x + area!.width * 0.25, y: area!.y + area!.height * 0.5 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 90, start.y + 25, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => kilauea.getAttribute('style')).not.toBe(beforePan);

  const overview = page.getByRole('button', { name: 'World view ↗', exact: true });
  await overview.click();
  await expect.poll(() => kilauea.getAttribute('style')).toBe(worldPosition);
  const beforeRefocus = await kilauea.getAttribute('style');
  // The initially selected site must still focus when selected again.
  await kilauea.click();
  await expect(kilauea).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => kilauea.getAttribute('style')).not.toBe(beforeRefocus);
  await expect(page.getByRole('link', { name: /Open the measured terrain study/ })).toHaveAttribute('href', '/expedition/kilauea#terrain-study');

  await page.locator('[aria-label="Field site selection"]').getByRole('button', { name: 'Etna', exact: true }).click();
  await expect(page.locator('.maplibregl-marker[data-slug="etna"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#atlas-selected-record')).toContainText('37.748° N / 14.999° E');
  await overview.click();
  await expect.poll(() => kilauea.getAttribute('style')).toBe(worldPosition);
  await page.locator('.maplibregl-marker[data-slug="reykjanes"]').click();
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
  await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/reykjanes');

  await page.getByRole('button', { name: 'Use static map', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('img', { name: /^Georeferenced Natural Earth land/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select Reykjanes', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Reykjanes');
  await expect(page.getByRole('button', { name: 'Explore map', exact: true })).toBeVisible();
  expect(externalRequests()).toEqual([]);
  expect(errors).toEqual([]);
});

test('the Atlas automatically restores a real geographic overview when WebGL is disabled', async ({ page }) => {
  const errors = browserErrors(page);
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(contextId)) return null;
      return (original as (this: HTMLCanvasElement, id: string, options?: unknown) => RenderingContext | null).call(this, contextId, options);
    } as typeof original;
  });
  await page.goto('/atlas', { waitUntil: 'networkidle' });
  await expect(page.locator('#atlas-map-note')).toContainText('Interactive map unavailable', { timeout: 25_000 });
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('img', { name: /^Georeferenced Natural Earth land/ })).toBeVisible();
  await geographicCoordinates(page, 'button[data-slug]');
  await page.getByRole('searchbox', { name: 'Search field sites' }).fill('etna');
  await expect(page.locator('#atlas-search-status')).toContainText('1 field site found');
  await page.locator('[aria-label="Field site selection"]').getByRole('button', { name: 'Etna', exact: true }).click();
  await expect(page.locator('#atlas-selected-record h2')).toHaveText('Etna');
  await expect(page.locator('#atlas-selected-record')).toContainText('37.748° N / 14.999° E');
  await expect(page.getByRole('link', { name: 'Begin expedition' })).toHaveAttribute('href', '/expedition/etna');
  await expect(page.getByRole('button', { name: 'Retry interactive map', exact: true })).toBeVisible();
  const origin = new URL(page.url()).origin;
  expect(requests.filter(url => !url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:'))).toEqual([]);
  expect(errors).toEqual([]);
});
