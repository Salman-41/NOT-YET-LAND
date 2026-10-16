import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowLink, c, Kicker } from '../components/ui';
import { expeditionPath, searchVolcanoes, VOLCANOES } from '../data/volcanoes';
import { useArchiveStore } from '../state/archive';
import type { AtlasFocusRequest, AtlasMapProps } from '../scenes/AtlasMap';
import { ATLAS_LABELS, ATLAS_SITES, MAP_EXTENT, atlasProjection, coordinateLabel } from '../data/atlas-sites';
import spatial from '../styles/atlas-spatial.module.css';

function UnavailableMap({ onUnavailable }: AtlasMapProps) {
  useEffect(onUnavailable, [onUnavailable]);
  return null;
}

const AtlasMap = lazy<ComponentType<AtlasMapProps>>(() => import('../scenes/AtlasMap').catch(() => ({ default: UnavailableMap })));

export default function Atlas() {
  const selectedSlug = useArchiveStore(state => state.selectedSlug);
  const setSelectedSlug = useArchiveStore(state => state.setSelectedSlug);
  const query = useArchiveStore(state => state.query);
  const setQuery = useArchiveStore(state => state.setQuery);
  const renderer = useArchiveStore(state => state.renderer);
  const setRenderer = useArchiveStore(state => state.setRenderer);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [focusRequest, setFocusRequest] = useState<AtlasFocusRequest>(null);
  const [overviewToken, setOverviewToken] = useState(0);
  const mapActive = renderer === 'map';
  const matches = searchVolcanoes(query);
  const selectedIndex = Math.max(0, VOLCANOES.findIndex(site => site.slug === selectedSlug));
  const selected = VOLCANOES[selectedIndex];
  const selectedLocation = ATLAS_SITES[selected.slug];
  const choose = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setFocusRequest(current => ({ slug, sequence: (current?.sequence ?? 0) + 1 }));
  }, [setSelectedSlug]);
  const handleMapReady = useCallback(() => setMapReady(true), []);
  const handleMapUnavailable = useCallback(() => {
    setMapUnavailable(true);
    setMapReady(false);
    useArchiveStore.getState().setRenderer('none');
  }, []);

  useEffect(() => {
    setRenderer('map');
    return () => { if (useArchiveStore.getState().renderer === 'map') useArchiveStore.getState().setRenderer('none'); };
  }, [setRenderer]);

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
                  onClick={() => choose(site.slug)}
                >
                  <span className={c('atlas-site-num')} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className={c('atlas-site-name')}>{site.name}</span>
                </button>
              );
            })}
          </div>
          <div className={c('atlas-rail-foot')}>Select a field to explore its region<br />Reference points are not eruption boundaries</div>
        </aside>

        <section className={`${c('atlas-graphic')} ${spatial.stage}`} aria-label="Geographic world atlas with six selectable volcanic landscapes" aria-describedby="atlas-map-note">
          <div className={spatial.mapViewport}>
          <StaticAtlas covered={mapActive && mapReady} selectedSlug={selected.slug} onSelect={choose} />
          {mapActive && <Suspense fallback={null}><AtlasMap onUnavailable={handleMapUnavailable} onReady={handleMapReady} onSelect={choose} focusRequest={focusRequest} overviewToken={overviewToken} /></Suspense>}
          <div className={spatial.stageTop}><p>NOT YET LAND / GEOGRAPHIC INDEX<br />REFERENCE COORDINATES / WGS84</p><p className={spatial.scaleNote}>NATURAL EARTH<br />WEB MERCATOR</p></div>
          <div className={spatial.tools}>
            {mapActive && mapReady && <button type="button" className={spatial.tool} onClick={() => { setFocusRequest(null); setOverviewToken(value => value + 1); }}>World view ↗</button>}
            <button type="button" className={spatial.tool} aria-pressed={!mapActive} onClick={() => { setMapUnavailable(false); setMapReady(false); setRenderer(mapActive ? 'none' : 'map'); }}>{mapActive ? 'Use static map' : mapUnavailable ? 'Retry interactive map' : 'Explore map'} <span aria-hidden="true">{mapActive ? '−' : '+'}</span></button>
          </div>
          <div className={spatial.mapState}>● SIX FIELD RECORDS<br />{mapActive && mapReady ? 'DRAG TO PAN / + − TO ZOOM' : 'GEOGRAPHIC OVERVIEW'}<br />COASTLINE + SHADED RELIEF</div>
          </div>
          <div className={`${c('map-info')} ${spatial.recordPanel}`} id="atlas-selected-record" aria-live="polite" aria-atomic="true">
            <div className={c('mono', 'muted')}>FIELD RECORD {String(selectedIndex + 1).padStart(2, '0')} / {selected.region}</div>
            <h2>{selected.name}</h2>
            <p className={c('bodycopy')}>{selected.lead}</p>
            <p className={spatial.coordinates}>{coordinateLabel(selectedLocation.longitude, selectedLocation.latitude)}<br /><a href={selectedLocation.source} target="_blank" rel="noopener noreferrer">{selectedLocation.reference} ↗</a></p>
            <ArrowLink to={expeditionPath(selected.slug)}>Begin expedition</ArrowLink>
            {selected.slug === 'kilauea' && <Link className={spatial.terrainLink} to="/expedition/kilauea#terrain-study">Open the measured terrain study <span aria-hidden="true">↗</span></Link>}
          </div>
        </section>
      </div>

      <div className={c('atlas-after', 'mono')}>
        <span id="atlas-map-note" aria-live="polite">{mapUnavailable ? 'Interactive map unavailable. The geographic overview and all field selections remain available.' : mapActive ? 'Georeferenced cartography. Select a field to explore its region.' : 'Static geographic overview. Select a field to read its record.'}</span>
        <span>All six field sites are explored individually / 2026</span>
      </div>
      <div className={spatial.attribution}><a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Made with Natural Earth</a><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noopener noreferrer">Public-domain cartography</a><span>Shaded relief: SRTM-derived / Generalized coastline / No eruption boundaries</span></div>
    </div>
  );
}

function StaticAtlas({ covered, selectedSlug, onSelect }: { covered: boolean; selectedSlug: string; onSelect: (slug: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState<number | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) setFrameWidth(Math.min(rect.width, rect.height * MAP_EXTENT.width / MAP_EXTENT.height));
    });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={spatial.fallback} data-covered={covered} aria-hidden={covered} inert={covered}>
    <div className={spatial.fallbackFrame} style={frameWidth ? { '--map-frame-width': `${frameWidth}px` } as CSSProperties : undefined}>
      <img src="/geography/world-mercator.webp" alt="Georeferenced Natural Earth land, coastline and SRTM-derived shaded relief in Web Mercator" width="2048" height="1493" />
      {ATLAS_LABELS.map(label => { const point = atlasProjection(label.longitude, label.latitude); return <span key={label.text} className={`${label.ocean ? spatial.oceanLabel : spatial.countryLabel} ${spatial.fallbackLabel}`} style={{ left: `${point.left}%`, top: `${point.top}%` }} aria-hidden="true">{label.text}</span>; })}
      {VOLCANOES.map((site, index) => {
        const location = ATLAS_SITES[site.slug];
        const point = atlasProjection(location.longitude, location.latitude);
        return <button type="button" className={spatial.marker} style={{ left: `${point.left}%`, top: `${point.top}%` }} key={site.slug} data-slug={site.slug} data-longitude={location.longitude} data-latitude={location.latitude} aria-label={`Select ${site.name}`} aria-pressed={selectedSlug === site.slug} aria-controls="atlas-selected-record" onClick={() => onSelect(site.slug)}><span className={spatial.pinCore} aria-hidden="true" /><span className={spatial.markerLabel} aria-hidden="true">{String(index + 1).padStart(2, '0')} / {site.name}</span></button>;
      })}
    </div>
  </div>;
}
