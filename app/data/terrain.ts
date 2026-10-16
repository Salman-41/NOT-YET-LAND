export type TerrainGrid = { url: string; width: number; height: number; bytes: number; sha256: string };
export type TerrainManifest = {
  id: string; title: string;
  source: { title: string; url: string; license: string; licenseUrl: string; [key: string]: unknown };
  bounds: { west: number; south: number; east: number; north: number };
  widthMeters: number; depthMeters: number;
  elevation: { min: number; max: number; datum: string; unit: string };
  grids: { low: TerrainGrid; high: TerrainGrid };
  verticalExaggeration: number;
  acquiredAt?: string;
  [key: string]: unknown;
};
export type TerrainFeature = { id: string; label: string; lat: number; long: number; description: string };
export type SceneMetrics = { triangles: number; vertices: number; drawCalls: number; geometries: number; textures: number; frameMs: number; quality: string; renderer: string; [key: string]: unknown };
export const KILAUEA_FEATURES: TerrainFeature[] = [
  { id: 'halemaumau', label: 'Caldera interior', lat: 19.406, long: -155.283, description: 'A sample within the summit caldera. The elevation comes from the archived DEM; this is not a view of present-day eruptive activity.' },
  { id: 'caldera-rim', label: 'Northern rim', lat: 19.421, long: -155.287, description: 'Compare the higher northern ground with the caldera interior. These are approximate study coordinates, not surveyed field markers.' },
  { id: 'keanakakoi', label: 'Southeast traverse', lat: 19.393, long: -155.273, description: 'A study point toward the southeastern caldera margin. Select it to inspect another part of the measured surface.' },
];

export function validateManifest(value: unknown): TerrainManifest {
  const m = value as TerrainManifest;
  if (!m?.source?.url || !m.source.licenseUrl || !m.bounds || !(m.widthMeters > 0) || !(m.depthMeters > 0) || !(m.elevation?.max > m.elevation.min)) throw new Error('The terrain provenance or geographic extent is incomplete.');
  for (const grid of [m.grids?.low, m.grids?.high]) {
    if (!grid || grid.width < 2 || grid.height < 2 || grid.width * grid.height * 2 !== grid.bytes || !grid.url.startsWith('/terrain/')) throw new Error('The elevation grid is invalid.');
  }
  return m;
}

export async function fetchTerrain(quality: 'low' | 'high', signal: AbortSignal) {
  const response = await fetch('/terrain/kilauea/metadata.json', { signal });
  if (!response.ok) throw new Error('The terrain record could not be loaded.');
  const manifest = validateManifest(await response.json());
  const grid = manifest.grids[quality];
  const raster = await fetch(grid.url, { signal });
  if (!raster.ok) throw new Error('The elevation samples could not be loaded.');
  const bytes = await raster.arrayBuffer();
  if (bytes.byteLength !== grid.bytes) throw new Error('The elevation file is incomplete.');
  if (grid.sha256 && globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const actual = Array.from(new Uint8Array(digest), v => v.toString(16).padStart(2, '0')).join('');
    if (actual !== grid.sha256) throw new Error('The elevation checksum does not match the source record.');
  }
  const data = new DataView(bytes);
  const heights = new Uint16Array(grid.width * grid.height);
  for (let i = 0; i < heights.length; i++) heights[i] = data.getUint16(i * 2, true);
  return { manifest, grid, heights };
}

export function sampleElevation(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array, point: Pick<TerrainFeature, 'lat' | 'long'>) {
  const u = Math.max(0, Math.min(1, (point.long - manifest.bounds.west) / (manifest.bounds.east - manifest.bounds.west)));
  const v = Math.max(0, Math.min(1, (manifest.bounds.north - point.lat) / (manifest.bounds.north - manifest.bounds.south)));
  const x = u * (grid.width - 1), y = v * (grid.height - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, grid.width - 1), y1 = Math.min(y0 + 1, grid.height - 1);
  const a = heights[y0 * grid.width + x0] * (1 - (x - x0)) + heights[y0 * grid.width + x1] * (x - x0);
  const b = heights[y1 * grid.width + x0] * (1 - (x - x0)) + heights[y1 * grid.width + x1] * (x - x0);
  return manifest.elevation.min + ((a * (1 - (y - y0)) + b * (y - y0)) / 65535) * (manifest.elevation.max - manifest.elevation.min);
}
