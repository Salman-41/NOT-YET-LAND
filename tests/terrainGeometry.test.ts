import { describe, expect, it } from 'vitest';
import type { TerrainGrid, TerrainManifest } from '../app/data/terrain';
import { createSectionCap, createTerrainGeometry, elevationToWorld, featureWithinBounds, featureWorldPosition, sampleGridHeight, sectionPlanePosition } from '../app/scenes/terrainGeometry';

// An explicit arithmetic fixture, never an exhibit asset or substitute for the DEM.
const grid: TerrainGrid = { width: 2, height: 2, url: '/test-fixture.bin', bytes: 8, sha256: '' };
const manifest: TerrainManifest = {
  id: 'unit-fixture', title: 'Arithmetic fixture',
  source: { title: 'Unit fixture', url: 'https://example.invalid', license: 'Test fixture', licenseUrl: 'https://example.invalid' },
  bounds: { west: 0, east: 1, north: 1, south: 0 },
  widthMeters: 1000, depthMeters: 2000,
  elevation: { min: 100, max: 200, unit: 'm', datum: 'Unit fixture' },
  grids: { low: grid, high: grid }, verticalExaggeration: 1.5,
};
const heights = new Uint16Array([0, 65535, 32768, 49152]);

describe('measured terrain geometry', () => {
  it('maps north to negative Z, east to positive X, and metres to the declared vertical scale', () => {
    const geometry = createTerrainGeometry(manifest, grid, heights);
    const positions = geometry.getAttribute('position');
    expect(positions.count).toBe(4);
    expect(geometry.index?.count).toBe(6);
    expect([positions.getX(0), positions.getY(0), positions.getZ(0)]).toEqual([-5, 0, -10]);
    expect([positions.getX(1), positions.getY(1), positions.getZ(1)]).toEqual([5, 1.5, -10]);
    expect(positions.getZ(2)).toBe(10);
    geometry.dispose();
  });

  it('winds the surface upward and rejects incomplete raster samples', () => {
    const geometry = createTerrainGeometry(manifest, grid, new Uint16Array(4).fill(32768));
    const normals = geometry.getAttribute('normal');
    for (let index = 0; index < normals.count; index++) expect(normals.getY(index)).toBeCloseTo(1);
    geometry.dispose();
    expect(() => createTerrainGeometry(manifest, grid, new Uint16Array(3))).toThrow(/complete two-dimensional elevation grid/);
  });

  it('bilinearly samples all four neighbours and places study coordinates on that surface', () => {
    const elevation = 100 + ((0 + 65535 + 32768 + 49152) / 4 / 65535) * 100;
    expect(sampleGridHeight(manifest, grid, heights, 0.5, 0.5)).toBeCloseTo(elevation, 8);
    const point = { id: 'test', label: 'Test', description: 'Fixture', lat: 0.5, long: 0.5 };
    const [x, y, z] = featureWorldPosition(manifest, grid, heights, point);
    expect(x).toBe(0); expect(z).toBe(0);
    expect(y).toBeCloseTo(elevationToWorld(manifest, elevation), 8);
    expect(featureWithinBounds(manifest, point)).toBe(true);
    expect(featureWithinBounds(manifest, { ...point, lat: 2 })).toBe(false);
  });

  it('keeps a nonempty landscape at maximum reveal and derives the cut edge from the DEM', () => {
    expect(sectionPlanePosition(manifest, 0)).toBe(10);
    expect(sectionPlanePosition(manifest, 100)).toBeCloseTo(-1.2);
    const cut = sectionPlanePosition(manifest, 50);
    const section = createSectionCap(manifest, grid, heights, 50);
    const positions = section.getAttribute('position');
    let roofAtWest = -Infinity;
    for (let index = 0; index < positions.count; index++) {
      expect(positions.getZ(index)).toBeCloseTo(cut, 5);
      if (positions.getX(index) === -5) roofAtWest = Math.max(roofAtWest, positions.getY(index));
    }
    const expectedRoof = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, 0, cut / 20 + 0.5));
    expect(roofAtWest).toBeCloseTo(expectedRoof, 5);
    section.dispose();
  });
});
