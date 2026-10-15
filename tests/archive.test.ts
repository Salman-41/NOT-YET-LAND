import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ROUTES, SOURCES, VOLCANOES, asset, expeditionPath, searchVolcanoes, terrain } from '../app/data/volcanoes';

describe('the curated field archive', () => {
  it('provides every requested public route exactly once, using real URLs', () => {
    expect(new Set(PUBLIC_ROUTES).size).toBe(12);
    expect(PUBLIC_ROUTES).toEqual(expect.arrayContaining([
      '/', '/atlas', '/expeditions', '/subsurface', '/evidence', '/method',
      ...['kilauea', 'reykjanes', 'st-helens', 'etna', 'tajogaite', 'vesuvius'].map(expeditionPath),
    ]));
    expect(PUBLIC_ROUTES.every(route => route.startsWith('/') && !route.includes('#'))).toBe(true);
  });

  it('keeps six distinct, navigable studies with complete four-stage instruments', () => {
    expect(VOLCANOES).toHaveLength(6);
    expect(new Set(VOLCANOES.map(record => record.slug)).size).toBe(6);
    expect(new Set(VOLCANOES.map(record => record.module)).size).toBe(6);
    for (const record of VOLCANOES) {
      expect(PUBLIC_ROUTES).toContain(expeditionPath(record.slug));
      expect(record.display).toHaveLength(2);
      expect(record.moduleSteps).toHaveLength(4);
      expect(new Set(record.moduleSteps).size).toBe(4);
      expect(record.moduleSteps.every(label => label.trim().length > 5)).toBe(true);
      expect(record.moduleText).toMatch(/concept|illustrat|stylis|simplif/i);
      expect(record.description.trim().length).toBeGreaterThan(80);
      expect(record.source.trim()).not.toBe('');
      expect(new URL(record.sourceUrl).protocol).toBe('https:');
      expect(Number.isFinite(record.lat) && record.lat >= -90 && record.lat <= 90).toBe(true);
      expect(Number.isFinite(record.long) && record.long >= -180 && record.long <= 180).toBe(true);
      expect(record.pin.every(coordinate => Number.isFinite(coordinate) && coordinate >= 0 && coordinate <= 100)).toBe(true);
    }
  });

  it('ships the original terrain art and detail studies without altering their labels', () => {
    for (const record of VOLCANOES) {
      for (const file of [asset(record.art), asset(record.art, true), terrain(record.art)]) {
        expect(existsSync(resolve('public', file.slice(1))), `${record.name}: missing ${file}`).toBe(true);
        expect(readFileSync(resolve('public', file.slice(1))).equals(readFileSync(resolve('Designs/reference/NOT_YET_LAND_V02/assets', basename(file))))).toBe(true);
      }
      const svg = readFileSync(resolve('public', terrain(record.art).slice(1)), 'utf8');
      expect(svg).toContain('<svg');
      expect(svg).toContain('<path');
    }
    expect(terrain('st-helens')).toBe('/assets/st_helens_terrain.svg');
    expect(existsSync(resolve('public/assets/world.svg'))).toBe(true);
  });

  it('provides a unique, external source register with usable attribution', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(SOURCES.map(source => source.url)).size).toBe(SOURCES.length);
    for (const source of SOURCES) {
      expect(new URL(source.url).protocol).toBe('https:');
      expect(source.title.trim().length).toBeGreaterThan(5);
      expect(source.author.trim().length).toBeGreaterThan(2);
      expect(source.description.trim().length).toBeGreaterThan(20);
    }
  });
});

describe('field-site discovery', () => {
  it.each(['kilauea', 'Kīlauea', '  KĪLAUEA  ', 'hawaii', 'Hawaiʻi'])(
    'finds Kīlauea using an accent or place variant: %s',
    query => expect(searchVolcanoes(query).map(record => record.slug)).toEqual(['kilauea']),
  );

  it('searches regions as well as names and provides an explicit empty result', () => {
    expect(searchVolcanoes('ICELAND').map(record => record.slug)).toEqual(['reykjanes']);
    expect(searchVolcanoes('naples').map(record => record.slug)).toEqual(['vesuvius']);
    expect(searchVolcanoes('a volcano outside this archive')).toEqual([]);
    expect(searchVolcanoes('   ')).toHaveLength(6);
  });
});
