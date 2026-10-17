import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { SCIENTIFIC_SOURCES } from '../app/data/sources';
import frames from '../app/data/flow-frames.json';

describe('scientific evidence integrity', () => {
  it('covers six expeditions with complete typed provenance and distinct records', () => {
    expect(new Set(SCIENTIFIC_SOURCES.map(s => s.volcano)).size).toBe(6);
    expect(new Set(SCIENTIFIC_SOURCES.map(s => s.id)).size).toBe(SCIENTIFIC_SOURCES.length);
    for (const source of SCIENTIFIC_SOURCES) {
      for (const key of ['name', 'publisher', 'url', 'observationDate', 'publicationDate', 'coverage', 'measurement', 'license', 'licenseUrl', 'attribution', 'limitation'] as const) expect(source[key].trim().length, `${source.id}.${key}`).toBeGreaterThan(0);
      expect(new URL(source.url).protocol).toBe('https:');
      expect(source.processing.length).toBeGreaterThan(0);
      for (const asset of source.assets ?? []) expect(existsSync(`public${asset}`)).toBe(true);
    }
  });
  it('preserves publisher-selected historical dates rather than inventing time steps', () => {
    expect(frames.map(f => f.date)).toEqual(['8 May 2018', '10 June 2018', '7 August 2018']);
    expect(frames.map(f => f.requestedSecond)).toEqual([15, 45, 79]);
  });
  it('verifies all original and processed asset checksums', () => {
    const manifest = JSON.parse(readFileSync('public/research/manifest.json', 'utf8'));
    for (const item of [...manifest.originals, ...manifest.outputs]) {
      const path = item.path ?? `public${item.url}`;
      const bytes = readFileSync(path);
      expect(bytes.length, path).toBe(item.bytes);
      expect(createHash('sha256').update(bytes).digest('hex'), path).toBe(item.sha256);
    }
  });
  it('keeps image pairs at identical dimensions without reframing', () => {
    const manifest = JSON.parse(readFileSync('public/research/manifest.json', 'utf8'));
    for (const prefix of ['st-helens', 'tajogaite']) {
      const pair = manifest.outputs.filter((item: { url: string }) => item.url.includes(`${prefix}-`));
      expect(pair).toHaveLength(2);
      expect(pair[0].width).toBe(pair[1].width);
      expect(pair[0].height).toBe(pair[1].height);
    }
  });
});
