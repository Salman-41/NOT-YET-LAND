import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowLink, c, Kicker } from '../components/ui';
import { expeditionPath, searchVolcanoes, VOLCANOES } from '../data/volcanoes';
import { useArchiveStore } from '../state/archive';
import type { AtlasMapProps } from '../scenes/AtlasMap';

function UnavailableMap({ onUnavailable }: AtlasMapProps) {
  useEffect(onUnavailable, [onUnavailable]);
  return null;
}

const AtlasMap = lazy(() => import('../scenes/AtlasMap').catch(() => ({ default: UnavailableMap })));

export default function Atlas() {
  const selectedSlug = useArchiveStore(state => state.selectedSlug);
  const setSelectedSlug = useArchiveStore(state => state.setSelectedSlug);
  const query = useArchiveStore(state => state.query);
  const setQuery = useArchiveStore(state => state.setQuery);
  const renderer = useArchiveStore(state => state.renderer);
  const setRenderer = useArchiveStore(state => state.setRenderer);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const mapActive = renderer === 'map';
  const matches = searchVolcanoes(query);
  const selectedIndex = Math.max(0, VOLCANOES.findIndex(site => site.slug === selectedSlug));
  const selected = VOLCANOES[selectedIndex];
  const handleMapUnavailable = useCallback(() => {
    setMapUnavailable(true);
    useArchiveStore.getState().setRenderer('none');
  }, []);

  useEffect(() => () => {
    if (useArchiveStore.getState().renderer === 'map') useArchiveStore.getState().setRenderer('none');
  }, []);

  return (
    <div className={c('view', 'atlas')}>
      <div className={c('atlas-intro')}>
        <div>
          <Kicker>Global index / 06 selected sites</Kicker>
          <h1>The <em>atlas.</em></h1>
        </div>
        <p className={c('support')}>Across oceans and tectonic boundaries, the same planet finds remarkably different ways to remake itself.</p>
      </div>

      <div className={c('atlas-layout')}>
        <aside className={c('atlas-rail')} aria-label="Find a field site">
          <label htmlFor="atlas-search">Find a field site / 01—06</label>
          <input
            id="atlas-search"
            className={c('atlas-search')}
            type="search"
            placeholder="Search volcano or place"
            aria-label="Search field sites"
            aria-describedby="atlas-search-status"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <p id="atlas-search-status" className={c('atlas-search-status', 'mono')} role="status">
            {matches.length === 0
              ? 'No field sites found. Try a volcano or region.'
              : `${matches.length} ${matches.length === 1 ? 'field site' : 'field sites'}${query.trim() ? ' found' : ' in the archive'}`}
          </p>
          <div className={c('atlas-buttons')} aria-label="Field site selection">
            {matches.map(site => {
              const index = VOLCANOES.findIndex(record => record.slug === site.slug);
              return (
                <button
                  type="button"
                  key={site.slug}
                  className={c('atlas-site')}
                  aria-pressed={selected.slug === site.slug}
                  aria-controls="atlas-selected-record"
                  onClick={() => setSelectedSlug(site.slug)}
                >
                  <span className={c('atlas-site-num')} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className={c('atlas-site-name')}>{site.name}</span>
                </button>
              );
            })}
          </div>
          <div className={c('atlas-rail-foot')}>Select any place to inspect the record<br />The map is a conceptual projection</div>
        </aside>

        <section className={c('atlas-graphic')} aria-label="Illustrated world map with six selectable volcanic landscapes" aria-describedby="atlas-map-note">
          <div className={c('atlas-graticule')} aria-hidden="true" />
          <img className={c('atlas-world')} alt="Illustrated world map; field-site locations are approximate" src="/assets/world.svg" />
          {mapActive && <Suspense fallback={null}><AtlasMap onUnavailable={handleMapUnavailable} /></Suspense>}
          <div className={c('label-top', 'mono')}>NOT YET LAND / GEOGRAPHIC INDEX<br />LATITUDE + LONGITUDE / APPROXIMATE</div>
          <button
            type="button"
            className={c('atlas-map-toggle')}
            aria-pressed={mapActive}
            aria-describedby="atlas-map-note"
            onClick={() => { setMapUnavailable(false); setRenderer(mapActive ? 'none' : 'map'); }}
          >{mapActive ? 'Return to illustration' : 'Pan the map'} <span aria-hidden="true">{mapActive ? '×' : '↔'}</span></button>
          {!mapActive && <div className={c('map-pins')}>
            {VOLCANOES.map(site => (
              <button
                type="button"
                className={c('map-pin')}
                key={site.slug}
                style={{ left: `${site.pin[0]}%`, top: `${site.pin[1]}%` }}
                aria-label={`Select ${site.name}`}
                aria-pressed={selected.slug === site.slug}
                aria-controls="atlas-selected-record"
                title={site.name}
                onClick={() => setSelectedSlug(site.slug)}
              />
            ))}
          </div>}
          <div className={c('map-legend', 'mono')}>● FIELD SITES<br />○ APPROXIMATE GEO POSITIONS</div>
          <div className={c('map-info')} id="atlas-selected-record" aria-live="polite" aria-atomic="true">
            <div className={c('mono', 'muted')}>FIELD RECORD {String(selectedIndex + 1).padStart(2, '0')} / {selected.region}</div>
            <h2>{selected.name}</h2>
            <p className={c('bodycopy')}>{selected.lead}</p>
            <ArrowLink to={expeditionPath(selected.slug)}>Begin expedition</ArrowLink>
          </div>
        </section>
      </div>

      <div className={c('atlas-after', 'mono')}>
        <span id="atlas-map-note" aria-live="polite">{mapUnavailable ? 'Interactive map unavailable. The illustration and all field selections remain available.' : mapActive ? 'Conceptual artwork, not a georeferenced basemap. Drag to pan; pinch, + or − to zoom.' : 'Locations are approximate on an illustrated projection.'}</span>
        <span>All six field sites are explored individually / 2026</span>
      </div>
    </div>
  );
}
