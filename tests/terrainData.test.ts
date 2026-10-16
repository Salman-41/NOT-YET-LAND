import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = join(root, 'public/terrain/kilauea');
const metadata = JSON.parse(readFileSync(join(assets, 'metadata.json'), 'utf8'));
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const approvedSourceSha = '8d3b4a52e71f449eb41e0d061a32143bdccfe4a8beb2bbd9c10d3308c94a5b85';

describe('retained USGS Kīlauea measured terrain', () => {
  it('retains the approved measured source crop with its original metadata', () => {
    const source = metadata.source.sourceArtifact;
    const bytes = readFileSync(join(root, source.path));
    expect(bytes.byteLength).toBe(1_367_190);
    expect(digest(bytes)).toBe(approvedSourceSha);
    expect(source.sha256).toBe(approvedSourceSha);
    const acquisition = JSON.parse(readFileSync(join(root, 'data/terrain-source/kilauea/acquisition.json'), 'utf8'));
    const xml = readFileSync(join(root, 'data/terrain-source/kilauea', acquisition.xml.file));
    expect(digest(xml)).toBe(acquisition.xml.sha256);
    expect(xml.toString()).toContain('USGS 1/3 Arc Second n20w156 20250611');
    expect(acquisition.crop.sha256).toBe(approvedSourceSha);
  });

  it('exposes official public-domain provenance and distinguishes publication from source epochs', () => {
    expect(metadata.source.url).toBe('https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/current/n20w156/USGS_13_n20w156.tif');
    expect(metadata.source.license).toMatch(/public domain/i);
    expect(metadata.source.licenseUrl).toBe('https://www.usgs.gov/3d-elevation-program/about-3dep-products-services');
    expect(metadata.source.publicationDate).toBe('20250611');
    expect(metadata.source.sourcePeriod).toEqual({ begin: '19540101', end: '20230709' });
    expect(metadata.source.epochSummary).toMatch(/not a live|not.*single-date/i);
    expect(metadata.elevation.datum).toBe('North American Vertical Datum of 1988');
    expect(metadata.elevation.datumNote).toMatch(/not been independently validated/);
  });

  it('preserves the actual summit footprint, relief, and physically coarser display sampling', () => {
    expect(metadata.bounds.west).toBeCloseTo(-155.325, 3);
    expect(metadata.bounds.east).toBeCloseTo(-155.245, 3);
    expect(metadata.bounds.south).toBeCloseTo(19.3725, 3);
    expect(metadata.bounds.north).toBeCloseTo(19.4475, 3);
    expect(metadata.widthMeters).toBeGreaterThan(8_300);
    expect(metadata.widthMeters).toBeLessThan(8_500);
    expect(metadata.depthMeters).toBeGreaterThan(8_200);
    expect(metadata.depthMeters).toBeLessThan(8_400);
    expect(metadata.elevation.min).toBeCloseTo(946.040588, 4);
    expect(metadata.elevation.max).toBeCloseTo(1367.180298, 4);
    expect(metadata.elevation.unit).toBe('m');
    expect(metadata.sourceCrs).toBe('EPSG:4269');
    expect(metadata.source.nativeResolutionMeters.x).toBeGreaterThan(9);
    expect(metadata.source.nativeResolutionMeters.y).toBeLessThan(11);
    expect(metadata.grids.high.sampleSpacingMeters.x).toBeGreaterThan(metadata.source.nativeResolutionMeters.x);
    expect(metadata.grids.low.sampleSpacingMeters.x).toBeGreaterThan(metadata.grids.high.sampleSpacingMeters.x);
  });

  for (const quality of ['low', 'high'] as const) {
    it(`${quality} grid matches its declared bytes/hash and encodes nonconstant real-metre heights north-first`, () => {
      const grid = metadata.grids[quality];
      const bytes = readFileSync(join(assets, `terrain-${quality}.bin`));
      expect(grid.width).toBe(quality === 'low' ? 129 : 257);
      expect(grid.height).toBe(grid.width);
      expect(bytes.byteLength).toBe(grid.width * grid.height * 2);
      expect(grid.bytes).toBe(bytes.byteLength);
      expect(digest(bytes)).toBe(grid.sha256);
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const samples = Array.from({ length: grid.width * grid.height }, (_, i) => view.getUint16(i * 2, true));
      expect(new Set(samples).size).toBeGreaterThan(2_000);
      const decode = (value: number) => metadata.elevation.min + value / 65535 * (metadata.elevation.max - metadata.elevation.min);
      // Source pixel corners independently checked against the retained float32 GeoTIFF.
      expect(decode(samples[0])).toBeCloseTo(1364.1664194, 5);
      expect(decode(samples[samples.length - 1])).toBeCloseTo(1018.0652144, 5);
      expect(metadata.encoding.byteOrder).toBe('little-endian');
      expect(metadata.encoding.rowZero).toBe('north');
      expect(metadata.encoding.columnZero).toBe('west');
      expect(grid.maxQuantizationErrorMeters).toBeLessThanOrEqual((metadata.elevation.max - metadata.elevation.min) / (2 * 65535) + 1e-8);
    });
  }

  it('serves a verified DEM-derived preview independently of WebGL', () => {
    const bytes = readFileSync(join(assets, 'preview.webp'));
    expect(bytes.byteLength).toBe(metadata.preview.bytes);
    expect(digest(bytes)).toBe(metadata.preview.sha256);
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
    expect(metadata.preview.kind).toMatch(/DEM-derived.*not aerial/);
    expect(metadata.preview.url).toBe('/terrain/kilauea/preview.webp');
  });
});
