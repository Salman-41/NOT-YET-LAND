import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const records = JSON.parse(await readFile('app/data/reference.json', 'utf8')).VOLCANOES;
const paths = ['/', '/atlas', '/expeditions', ...records.map(v => `/expedition/${v.slug}`), '/subsurface', '/evidence', '/method'];
for (const path of paths) {
  const file = resolve('build/client', `.${path}`, 'index.html');
  const html = await readFile(file, 'utf8');
  if (!/<h1[\s>]/.test(html) || !/<title>[^<]*NOT YET LAND/.test(html) || !/<meta name="description" content="[^"]+"/.test(html)) throw new Error(`Incomplete pre-render: ${path}`);
  if (/href="#\//.test(html)) throw new Error(`Hash route in ${path}`);
}
for (const record of records) {
  const terrain = record.art === 'st-helens' ? 'st_helens' : record.art;
  await access(`build/client/assets/${terrain}_terrain.svg`);
  await access(`build/client/assets/${record.art}.webp`);
}
console.log(`Verified ${paths.length} static routes: real HTML content, titles, descriptions, URLs and terrain assets.`);
