import { BufferAttribute, BufferGeometry, Color, Float32BufferAttribute } from 'three';
import type { TerrainFeature, TerrainGrid, TerrainManifest } from '../data/terrain';

export const TERRAIN_WORLD_WIDTH = 10;
export const INTERPRETIVE_BLOCK_DEPTH = 2.5;

export type TerrainShape = {
  width: number;
  depth: number;
  unitsPerMeter: number;
  verticalExaggeration: number;
  elevationRange: number;
};

export function terrainShape(manifest: TerrainManifest): TerrainShape {
  const unitsPerMeter = TERRAIN_WORLD_WIDTH / manifest.widthMeters;
  return {
    width: TERRAIN_WORLD_WIDTH,
    depth: manifest.depthMeters * unitsPerMeter,
    unitsPerMeter,
    verticalExaggeration: manifest.verticalExaggeration,
    elevationRange: manifest.elevation.max - manifest.elevation.min,
  };
}

function validateSamples(grid: TerrainGrid, heights: Uint16Array) {
  if (grid.width < 2 || grid.height < 2 || heights.length !== grid.width * grid.height) {
    throw new Error('The terrain geometry requires a complete two-dimensional elevation grid.');
  }
}

export function elevationToWorld(manifest: TerrainManifest, elevation: number) {
  const shape = terrainShape(manifest);
  return (elevation - manifest.elevation.min) * shape.unitsPerMeter * shape.verticalExaggeration;
}

/** Bilinear sampling in raster coordinates: u eastward; v southward from row zero. */
export function sampleGridHeight(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array, u: number, v: number) {
  const x = Math.max(0, Math.min(1, u)) * (grid.width - 1);
  const row = Math.max(0, Math.min(1, v)) * (grid.height - 1);
  const x0 = Math.floor(x), y0 = Math.floor(row);
  const x1 = Math.min(x0 + 1, grid.width - 1), y1 = Math.min(y0 + 1, grid.height - 1);
  const mixX = x - x0, mixY = row - y0;
  const north = heights[y0 * grid.width + x0] * (1 - mixX) + heights[y0 * grid.width + x1] * mixX;
  const south = heights[y1 * grid.width + x0] * (1 - mixX) + heights[y1 * grid.width + x1] * mixX;
  return manifest.elevation.min + ((north * (1 - mixY) + south * mixY) / 65535) * (manifest.elevation.max - manifest.elevation.min);
}

export function featureWorldPosition(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array, feature: TerrainFeature): [number, number, number] {
  const u = (feature.long - manifest.bounds.west) / (manifest.bounds.east - manifest.bounds.west);
  const v = (manifest.bounds.north - feature.lat) / (manifest.bounds.north - manifest.bounds.south);
  const shape = terrainShape(manifest);
  return [(u - 0.5) * shape.width, elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, u, v)), (v - 0.5) * shape.depth];
}

export function featureWithinBounds(manifest: TerrainManifest, feature: TerrainFeature) {
  const { west, south, east, north } = manifest.bounds;
  return feature.long >= west && feature.long <= east && feature.lat >= south && feature.lat <= north;
}

/** DEM samples are the sole source of the terrain's vertex elevations. */
export function createTerrainGeometry(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array) {
  validateSamples(grid, heights);
  const shape = terrainShape(manifest);
  const count = grid.width * grid.height;
  const positions = new Float32Array(count * 3);
  const IndexArray = count > 65535 ? Uint32Array : Uint16Array;
  const indices = new IndexArray((grid.width - 1) * (grid.height - 1) * 6);
  for (let row = 0; row < grid.height; row++) {
    for (let column = 0; column < grid.width; column++) {
      const index = row * grid.width + column;
      positions[index * 3] = (column / (grid.width - 1) - 0.5) * shape.width;
      positions[index * 3 + 1] = (heights[index] / 65535) * shape.elevationRange * shape.unitsPerMeter * shape.verticalExaggeration;
      positions[index * 3 + 2] = (row / (grid.height - 1) - 0.5) * shape.depth;
    }
  }
  let cursor = 0;
  for (let row = 0; row < grid.height - 1; row++) {
    for (let column = 0; column < grid.width - 1; column++) {
      const a = row * grid.width + column, b = a + 1, c = a + grid.width, d = c + 1;
      indices[cursor++] = a; indices[cursor++] = c; indices[cursor++] = b;
      indices[cursor++] = b; indices[cursor++] = c; indices[cursor++] = d;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute('normal');
  const colors = new Float32Array(count * 3);
  const low = new Color('#1c342b'), high = new Color('#71836e'), exposed = new Color('#70786a');
  const shade = new Color();
  for (let i = 0; i < count; i++) {
    const elevation = heights[i] / 65535;
    const slope = Math.min(1, Math.max(0, (1 - normals.getY(i)) * 2.5));
    shade.copy(low).lerp(high, 0.15 + elevation * 0.65).lerp(exposed, slope * 0.72);
    shade.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  return geometry;
}

function coloredQuad(positions: number[], colors: number[], corners: number[][], color: Color) {
  for (const index of [0, 1, 2, 1, 3, 2]) {
    positions.push(...corners[index]);
    colors.push(color.r, color.g, color.b);
  }
}

/** Perimeter walls close the measured surface; their depth is explicitly interpretive. */
export function createTerrainWalls(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array) {
  const shape = terrainShape(manifest);
  const perimeter: [number, number][] = [];
  for (let x = 0; x < grid.width; x++) perimeter.push([x / (grid.width - 1), 0]);
  for (let y = 1; y < grid.height; y++) perimeter.push([1, y / (grid.height - 1)]);
  for (let x = grid.width - 2; x >= 0; x--) perimeter.push([x / (grid.width - 1), 1]);
  for (let y = grid.height - 2; y >= 0; y--) perimeter.push([0, y / (grid.height - 1)]);
  const positions: number[] = [], colors: number[] = [];
  const bands = [-INTERPRETIVE_BLOCK_DEPTH, -1.82, -1.15, -0.58, -0.15];
  const palette = ['#1c3029', '#34443a', '#4b5945', '#606b51', '#536450'].map(color => new Color(color));
  for (let edge = 0; edge < perimeter.length - 1; edge++) {
    const [u0, v0] = perimeter[edge], [u1, v1] = perimeter[edge + 1];
    const x0 = (u0 - 0.5) * shape.width, x1 = (u1 - 0.5) * shape.width;
    const z0 = (v0 - 0.5) * shape.depth, z1 = (v1 - 0.5) * shape.depth;
    const top0 = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, u0, v0));
    const top1 = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, u1, v1));
    bands.forEach((bottom, band) => {
      const roof0 = band === bands.length - 1 ? top0 : bands[band + 1];
      const roof1 = band === bands.length - 1 ? top1 : bands[band + 1];
      coloredQuad(positions, colors, [[x0, bottom, z0], [x1, bottom, z1], [x0, roof0, z0], [x1, roof1, z1]], palette[band]);
    });
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** 100 is the maximum useful central cut, rather than removal of the entire mountain. */
export function sectionPlanePosition(manifest: TerrainManifest, reveal: number) {
  const depth = terrainShape(manifest).depth;
  return depth * (0.5 - Math.max(0, Math.min(100, reveal)) / 100 * 0.56);
}

/** The cap's upper boundary is sampled from the same DEM at the moving cutting plane. */
export function createSectionCap(manifest: TerrainManifest, grid: TerrainGrid, heights: Uint16Array, reveal: number) {
  const shape = terrainShape(manifest);
  const z = sectionPlanePosition(manifest, reveal);
  const v = z / shape.depth + 0.5;
  const bands = [-INTERPRETIVE_BLOCK_DEPTH, -1.82, -1.15, -0.58, -0.15];
  const palette = ['#20372d', '#455541', '#6e7251', '#8d8b60', '#65745b'].map(color => new Color(color));
  const positions: number[] = [], colors: number[] = [];
  for (let column = 0; column < grid.width - 1; column++) {
    const u0 = column / (grid.width - 1), u1 = (column + 1) / (grid.width - 1);
    const x0 = (u0 - 0.5) * shape.width, x1 = (u1 - 0.5) * shape.width;
    const top0 = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, u0, v));
    const top1 = elevationToWorld(manifest, sampleGridHeight(manifest, grid, heights, u1, v));
    bands.forEach((bottom, band) => {
      const roof0 = band === bands.length - 1 ? top0 : bands[band + 1];
      const roof1 = band === bands.length - 1 ? top1 : bands[band + 1];
      coloredQuad(positions, colors, [[x0, bottom, z], [x1, bottom, z], [x0, roof0, z], [x1, roof1, z]], palette[band]);
    });
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
