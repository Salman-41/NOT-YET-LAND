import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const slugs = ['kilauea', 'reykjanes', 'st-helens', 'etna', 'tajogaite', 'vesuvius'] as const;
type Slug = typeof slugs[number];

async function openStudy(page: Page, slug: Slug) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }); });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`/expedition/${slug}#signature-study`, { waitUntil: 'networkidle' });
  const study = page.locator('#signature-study');
  await expect(study).toHaveAttribute('data-study', slug);
  await study.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  return { study, errors };
}

async function operate(page: Page, slug: Slug, touch = false) {
  const action = async (name: string | RegExp) => {
    const button = page.locator('#signature-study').getByRole('button', { name, exact: typeof name === 'string' });
    if (touch) await button.tap(); else await button.click();
  };
  const study = page.locator('#signature-study');
  switch (slug) {
    case 'kilauea': {
      const slider = study.getByRole('slider', { name: 'Lava map date' });
      if (!touch) { await slider.focus(); await slider.press('End'); } else await action(/7 August 2018/);
      await expect(study).toHaveAttribute('data-step', '2');
      await expect(study.getByRole('img')).toHaveAttribute('src', '/research/kilauea-map-late.webp');
      await action('Changing coast');
      await expect(study.locator('[role="status"]')).toContainText('A coastline in revision');
      await action(/Enlarge map/);
      await expect(study.locator('[data-detail]')).toHaveAttribute('data-detail', 'true');
      await action('Fit complete map');
      if (!touch) { await slider.press('Home'); await expect(study).toHaveAttribute('data-step', '0'); await action(/10 June 2018/); }
      break;
    }
    case 'reykjanes':
      await action(/The northern opening/);
      await expect(study).toHaveAttribute('data-episode', '0');
      await action(/The same system, another field/);
      await expect(study.getByRole('img')).toHaveAttribute('src', '/research/reykjanes-june.webp');
      await action('Read the plate-boundary setting');
      await expect(study.getByRole('img', { name: /Conceptual diagram/ })).toBeVisible();
      if (!touch) { const button = study.getByRole('button', { name: 'Return to satellite observation' }); await button.focus(); await button.press('Enter'); }
      else await action('Return to satellite observation');
      await expect(study.getByRole('img')).toHaveAttribute('src', '/research/reykjanes-june.webp');
      await action('Read the mapped fissures');
      await expect(study.getByRole('img')).toHaveAttribute('src', '/research/reykjanes-fissures.webp');
      await expect(study.locator('[role="status"]')).toContainText('Red / May–June');
      await action(/The northern opening/);
      await expect(study.locator('[role="status"]')).toContainText('Orange / December');
      await action('Enlarge fissure map / scroll to inspect');
      await expect(study.locator('[data-detail]')).toHaveAttribute('data-detail', 'true');
      await action('Fit complete fissure map');
      break;
    case 'st-helens': {
      const slider = study.getByRole('slider', { name: 'Compare Mount St. Helens 1973 and 1983' });
      if (!touch) { await slider.focus(); await slider.press('End'); await expect(study.locator('[data-before-clip]')).toHaveCSS('clip-path', 'inset(0px 0% 0px 0px)'); }
      else await action('Later only');
      await action('02 / Reveal the missing flank');
      await expect(study).toHaveAttribute('data-view', 'absence');
      const reveal = study.getByRole('slider', { name: 'Missing northern flank reveal' });
      if (!touch) { await reveal.focus(); await reveal.press('End'); await expect(reveal).toHaveValue('100'); }
      else { await reveal.tap({ position: { x: 30, y: 20 } }); }
      await action(/The reawakening/);
      await expect(study.locator('[role="status"]')).toContainText('magnitude 4.2');
      break;
    }
    case 'etna': {
      await action('Base only');
      await expect(study).toHaveAttribute('data-layers', '0');
      const checkbox = study.getByRole('checkbox', { name: '17th–18th century' });
      if (!touch) { await checkbox.focus(); await checkbox.press('Space'); } else await checkbox.tap();
      await expect(study).toHaveAttribute('data-layers', '1');
      await expect(study.locator('[role="status"]')).toContainText('1669');
      await action('Inspect summit / eruptive fissures');
      await expect(study.locator('[data-rift]')).toHaveAttribute('data-rift', 'true');
      await action('Return to complete map');
      break;
    }
    case 'tajogaite': {
      await action(/The Atlantic edge/);
      await expect(study).toHaveAttribute('data-lens', '1');
      await expect(study.locator('[role="status"]')).toContainText('new coastal land');
      await expect(study.locator('[data-before-clip] img')).toHaveCSS('transform', 'matrix(1.9, 0, 0, 1.9, 0, 0)');
      const slider = study.getByRole('slider', { name: 'Compare La Palma May and December 2021' });
      if (!touch) { await slider.focus(); await slider.press('Home'); await expect(slider).toHaveValue('0'); }
      else await action('Later only');
      await action('Split view');
      await expect(slider).toHaveValue('50');
      break;
    }
    case 'vesuvius': {
      await action('Cover the sequence');
      await expect(study).toHaveAttribute('data-exposed', '0');
      await expect(study.getByRole('button', { name: /Inspect EU2/ })).toBeDisabled();
      await action('Expose next unit');
      await expect(study).toHaveAttribute('data-exposed', '1');
      await action('Expose all');
      await action('Inspect EU3: The pumice darkens');
      await action('Historical account');
      await expect(study.locator('[role="status"]')).toContainText('Eyewitness accounts');
      await action('Modern reconstruction');
      await expect(study.locator('[role="status"]')).toContainText('Changes in pumice composition');
      if (!touch) { const slider = study.getByRole('slider', { name: 'Excavation units exposed' }); await slider.focus(); await slider.press('Home'); await expect(study).toHaveAttribute('data-exposed', '0'); await slider.press('End'); }
      break;
    }
  }
}

test.beforeAll(async () => { await mkdir('artifacts/expeditions', { recursive: true }); });
for (const width of [1440, 390]) {
  for (const slug of slugs) {
    test(`${slug}: real chapter interaction, keyboard, sources and screenshot / ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
      const { study, errors } = await openStudy(page, slug);
      await operate(page, slug);
      await expect(study.getByRole('link', { name: 'Inspect this evidence' })).toHaveAttribute('href', /^\/evidence\?source=/);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode().catch(() => undefined))); });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await study.locator('img').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
      await study.screenshot({ path: `artifacts/expeditions/${slug}-${width}.png`, animations: 'disabled', style: '[class*="scroll-progress"]{visibility:hidden!important}' });
      expect(errors).toEqual([]);
    });
  }
}

test.describe('touch field instruments', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const slug of slugs) test(`${slug} supports touch investigation`, async ({ page }) => { const { errors } = await openStudy(page, slug); await operate(page, slug, true); expect(errors).toEqual([]); });
});

test('evidence room filters records, compares genuine dated imagery, and follows source links', async ({ page }) => {
  await page.goto('/evidence', { waitUntil: 'networkidle' });
  const registry = await page.request.get('/research/sources.json');
  expect(registry.ok()).toBe(true);
  expect((await registry.json()).records).toHaveLength(14);
  const selected = page.getByRole('article', { name: 'Selected scientific record' });
  await expect(selected).toHaveAttribute('data-source-id', 'msh-landsat');
  await selected.getByRole('button', { name: 'Earlier only' }).click();
  await expect(selected.getByRole('slider')).toHaveValue('100');
  await page.getByRole('combobox', { name: 'Filter evidence by volcano' }).selectOption('tajogaite');
  await expect(selected).toHaveAttribute('data-source-id', 'tajogaite-landsat');
  await expect(selected).toContainText('2021-05-21 / 2021-12-15');
  await expect(selected.getByRole('link', { name: /^Original source/ })).toHaveAttribute('href', /science.nasa.gov/);
  await selected.getByRole('button', { name: 'Later only' }).click();
  await expect(selected.getByRole('slider')).toHaveValue('0');
  await selected.screenshot({ path: 'artifacts/expeditions/evidence-room.png', animations: 'disabled', style: '[class*="scroll-progress"]{visibility:hidden!important}' });
  await page.getByRole('combobox', { name: 'Filter evidence by type' }).selectOption('Stratigraphy');
  await expect(page.getByText('No records match these filters.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByRole('combobox', { name: 'Filter evidence by volcano' }).selectOption('vesuvius');
  await expect(selected).toHaveAttribute('data-source-id', 'vesuvius-strata');
  await expect(selected).toContainText('not a measured excavation log');
  await selected.getByRole('link', { name: 'Explore expedition' }).click();
  await expect(page).toHaveURL(/expedition\/vesuvius#signature-study/);
  await expect(page.locator('#signature-study')).toHaveAttribute('data-study', 'vesuvius');
});

test('an expedition evidence deep link selects its exact provenance record', async ({ page }) => {
  await page.goto('/evidence?source=etna-dante', { waitUntil: 'networkidle' });
  await expect(page.getByRole('article', { name: 'Selected scientific record' })).toHaveAttribute('data-source-id', 'etna-dante');
  await expect(page.getByRole('combobox', { name: 'Filter evidence by volcano' })).toHaveValue('etna');
  await expect(page.getByRole('article')).toContainText('CC BY 4.0');
});
