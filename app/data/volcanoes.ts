import reference from './reference.json' with { type: 'json' };

export type Volcano = (typeof reference.VOLCANOES)[number];
export type Source = (typeof reference.SOURCES)[number];
export const VOLCANOES: Volcano[] = reference.VOLCANOES;
export const SOURCES: Source[] = reference.SOURCES;
export const asset = (art: string, detail = false) => `/assets/${art}${detail ? '-detail' : ''}.webp`;
export const terrain = (art: string) => `/assets/${art === 'st-helens' ? 'st_helens' : art}_terrain.svg`;
export const expeditionPath = (slug: string) => `/expedition/${slug}`;
export const PUBLIC_ROUTES = ['/', '/atlas', '/expeditions', ...VOLCANOES.map(v => expeditionPath(v.slug)), '/subsurface', '/evidence', '/method'];

export function searchVolcanoes(query: string) {
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036fʻ’']/g, '').toLowerCase().trim();
  const value = normalize(query);
  return VOLCANOES.filter(v => normalize(`${v.name} ${v.slug} ${v.region} ${v.subtitle}`).includes(value));
}
