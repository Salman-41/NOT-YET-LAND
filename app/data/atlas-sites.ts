/** Geographic reference points, not eruption footprints or hazard boundaries.
 * Sources and rounding are recorded in docs/ATLAS_DATA.md.
 */
export const ATLAS_SITES: Record<string, { longitude: number; latitude: number; region: string; reference: string; source: string }> = {
  kilauea: { longitude: -155.287, latitude: 19.421, region: 'HAWAIʻI', reference: 'Kīlauea summit reference', source: 'https://volcano.si.edu/volcano.cfm?vn=332010' },
  reykjanes: { longitude: -22.383, latitude: 63.883, region: 'ICELAND', reference: 'Sundhnúkar crater row', source: 'https://volcano.si.edu/volcano.cfm?vn=371020&vtab=Weekly' },
  'st-helens': { longitude: -122.18, latitude: 46.2, region: 'WASHINGTON', reference: 'Mount St. Helens reference', source: 'https://volcano.si.edu/volcano.cfm?vn=321050' },
  etna: { longitude: 14.999, latitude: 37.748, region: 'SICILY', reference: 'Etna summit reference', source: 'https://volcano.si.edu/volcano.cfm?vn=211060' },
  tajogaite: { longitude: -17.865, latitude: 28.615, region: 'LA PALMA', reference: 'Tajogaite cone survey centre', source: 'https://doi.org/10.5069/G97W69FW' },
  vesuvius: { longitude: 14.426, latitude: 40.821, region: 'CAMPANIA', reference: 'Vesuvius summit reference', source: 'https://volcano.si.edu/volcano.cfm?vn=211020' },
};

export const ATLAS_LABELS = [
  { text: 'NORTH PACIFIC', longitude: -144, latitude: 34, ocean: true },
  { text: 'NORTH ATLANTIC', longitude: -42, latitude: 37, ocean: true },
  { text: 'INDIAN OCEAN', longitude: 76, latitude: -16, ocean: true },
  { text: 'UNITED STATES', longitude: -102, latitude: 39, ocean: false },
  { text: 'ICELAND', longitude: -18, latitude: 65.5, ocean: false },
  { text: 'ITALY', longitude: 12.2, latitude: 44.5, ocean: false },
  { text: 'SPAIN', longitude: -3.8, latitude: 40.4, ocean: false },
  { text: 'AUSTRALIA', longitude: 134, latitude: -24, ocean: false },
];

export const MAP_EXTENT = { width: 2048, height: 1493 };
export function atlasProjection(longitude: number, latitude: number) {
  const safeLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  return {
    left: (longitude + 180) / 360 * 100,
    top: (1 - Math.asinh(Math.tan(safeLatitude * Math.PI / 180)) / Math.PI) / 2 * MAP_EXTENT.width / MAP_EXTENT.height * 100,
  };
}

export function coordinateLabel(longitude: number, latitude: number) {
  return `${Math.abs(latitude).toFixed(3)}° ${latitude < 0 ? 'S' : 'N'} / ${Math.abs(longitude).toFixed(3)}° ${longitude < 0 ? 'W' : 'E'}`;
}
