import { build } from 'esbuild';
import { writeFile, mkdir } from 'node:fs/promises';
const result = await build({ entryPoints: ['app/data/sources.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const module = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
await mkdir('public/research', { recursive: true });
await writeFile('public/research/sources.json', `${JSON.stringify({ consulted: '2026-10-17', records: module.SCIENTIFIC_SOURCES }, null, 2)}\n`);
console.log(`Exported ${module.SCIENTIFIC_SOURCES.length} typed scientific records.`);
