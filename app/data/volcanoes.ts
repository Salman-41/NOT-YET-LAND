import reference from './reference.json' with { type: 'json' };

export type Volcano = (typeof reference.VOLCANOES)[number];
export type Source = (typeof reference.SOURCES)[number];
export const VOLCANOES: Volcano[] = reference.VOLCANOES;
export const SOURCES: Source[] = [...reference.SOURCES,
  { title: 'Kīlauea summit — archived 3DEP elevation', type: 'MEASURED ELEVATION / USED IN THIS ARCHIVE', description: 'USGS 1/3-arc-second tile n20w156, published 11 June 2025. The retained summit crop drives the 3D surface and hillshade; the tile combines source acquisitions from 1954–2023.', url: 'https://www.usgs.gov/3d-elevation-program/about-3dep-products-services', author: 'USGS / 3DEP / PUBLIC DOMAIN' },
  { title: 'Natural Earth — geography and shaded relief', type: 'LOCAL CARTOGRAPHY / USED IN THE ATLAS', description: 'Public-domain land geometry and shaded-relief cartography, hosted locally. These provide geographical context; the atlas relief is not a site-scale elevation measurement.', url: 'https://www.naturalearthdata.com/about/terms-of-use/', author: 'NATURAL EARTH / PUBLIC DOMAIN' },
];
export const asset = (art: string, detail = false) => `/assets/${art}${detail ? '-detail' : ''}.webp`;
export const terrain = (art: string) => `/assets/${art === 'st-helens' ? 'st_helens' : art}_terrain.svg`;
export const expeditionPath = (slug: string) => `/expedition/${slug}`;
export const PUBLIC_ROUTES = ['/', '/atlas', '/expeditions', ...VOLCANOES.map(v => expeditionPath(v.slug)), '/subsurface', '/evidence', '/method'];

export function searchVolcanoes(query: string) {
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036fʻ’']/g, '').toLowerCase().trim();
  const value = normalize(query);
  return VOLCANOES.filter(v => normalize(`${v.name} ${v.slug} ${v.region} ${v.subtitle}`).includes(value));
}
