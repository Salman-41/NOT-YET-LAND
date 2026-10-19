import { expect, test } from '@playwright/test';

function luminance(color: string) {
  const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
}

for (const width of [390, 1440]) {
  test(`evidence records remain readable and reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/evidence', { waitUntil: 'networkidle' });
    const records = page.getByRole('navigation', { name: 'Scientific evidence records' });
    const buttons = records.getByRole('button');
    const first = buttons.first();
    const title = first.locator('strong');
    const buttonBox = await first.boundingBox();
    const titleBox = await title.boundingBox();
    expect(titleBox!.y).toBeGreaterThanOrEqual(buttonBox!.y);
    expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(buttonBox!.y + buttonBox!.height);
    const colors = await first.evaluate(element => {
      let ancestor: Element | null = element;
      let background = 'rgba(0, 0, 0, 0)';
      while (ancestor && background === 'rgba(0, 0, 0, 0)') {
        background = getComputedStyle(ancestor).backgroundColor;
        ancestor = ancestor.parentElement;
      }
      return { foreground: getComputedStyle(element.querySelector('span')!).color, background };
    });
    const light = luminance(colors.foreground), dark = luminance(colors.background);
    expect((Math.max(light, dark) + .05) / (Math.min(light, dark) + .05)).toBeGreaterThanOrEqual(4.5);
    const last = buttons.last();
    const lastTitle = await last.locator('strong').innerText();
    await last.click();
    await expect(page.getByRole('article', { name: 'Selected scientific record' }).getByRole('heading')).toHaveText(lastTitle);
  });
}
