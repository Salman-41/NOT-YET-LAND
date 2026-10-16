import { useEffect, useRef, useState } from 'react';
import { Map, Marker, NavigationControl, setWorkerUrl, type PaddingOptions } from 'maplibre-gl';
import { gsap } from 'gsap';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '../styles/atlas-spatial.module.css';
import { ATLAS_LABELS, ATLAS_SITES } from '../data/atlas-sites';
import { VOLCANOES } from '../data/volcanoes';
import { useArchiveStore } from '../state/archive';

export type AtlasFocusRequest = { slug: string; sequence: number } | null;
export type AtlasMapProps = { onUnavailable: () => void; onReady: () => void; onSelect: (slug: string) => void; focusRequest: AtlasFocusRequest; overviewToken: number };
const focusZoom: Record<string, number> = { kilauea: 5.4, reykjanes: 4.6, 'st-helens': 5, etna: 5.3, tajogaite: 6, vesuvius: 5.5 };
function overview(width: number, height: number) {
  return { longitude: -20, latitude: 25, zoom: Math.max(-1.4, Math.min(.7, Math.log2(Math.min(width / 540, height / 450)))) };
}

/** Local georeferenced cartography. There is no tile API, glyph service,
 * credential, decorative elevation field or continuous animation loop. */
export default function AtlasMap({ onUnavailable, onReady, onSelect, focusRequest, overviewToken }: AtlasMapProps) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const motion = useRef<gsap.core.Tween | null>(null);
  const visible = useRef(true);
  const buttons = useRef<{ slug: string; element: HTMLButtonElement }[]>([]);
  const [ready, setReady] = useState(false);
  const selectedSlug = useArchiveStore(state => state.selectedSlug);

  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    let map: Map | undefined;
    let disposed = false;
    let failed = false;
    const markers: Marker[] = [];
    const unavailable = () => {
      if (disposed || failed) return;
      failed = true;
      motion.current?.kill();
      onUnavailable();
    };
    const pause = () => { motion.current?.kill(); map?.stop(); };
    const interrupt = () => { motion.current?.kill(); };
    const visibilityChanged = () => {
      if (document.hidden) pause();
      else if (visible.current) { map?.resize(); map?.triggerRepaint(); }
    };
    const intersection = new IntersectionObserver(entries => {
      visible.current = entries[0]?.isIntersecting ?? true;
      if (!visible.current) pause();
      else if (!document.hidden) { map?.resize(); map?.triggerRepaint(); }
    }, { rootMargin: '120px' });
    intersection.observe(container);
    document.addEventListener('visibilitychange', visibilityChanged);
    container.addEventListener('pointerdown', interrupt, true);
    container.addEventListener('keydown', interrupt, true);

    try {
      setWorkerUrl(workerUrl);
      const initial = overview(container.clientWidth, container.clientHeight);
      map = new Map({
        container,
        style: {
          version: 8, projection: { type: 'mercator' },
          sources: {
            land: { type: 'geojson', data: '/geography/land-10m.geojson', tolerance: .6 },
            coastline: { type: 'geojson', data: '/geography/coastline-10m.geojson', tolerance: .6 },
            graticule: { type: 'geojson', data: '/geography/graticule.geojson' },
            relief: { type: 'image', url: '/geography/relief-mercator.webp', coordinates: [[-180, 85.05112878], [180, 85.05112878], [180, -85.05112878], [-180, -85.05112878]] },
          },
          layers: [
            { id: 'mineral-sea', type: 'background', paint: { 'background-color': '#101b17' } },
            { id: 'land-mass', type: 'fill', source: 'land', paint: { 'fill-color': '#304333', 'fill-opacity': .94 } },
            { id: 'srtm-derived-relief', type: 'raster', source: 'relief', paint: { 'raster-opacity': .92, 'raster-fade-duration': 0, 'raster-resampling': 'linear' } },
            { id: 'geographic-grid', type: 'line', source: 'graticule', paint: { 'line-color': '#aabc9f', 'line-opacity': .12, 'line-width': .7 } },
            { id: 'actual-coastline', type: 'line', source: 'coastline', paint: { 'line-color': '#b3bda3', 'line-opacity': .52, 'line-width': ['interpolate', ['linear'], ['zoom'], 0, .6, 6, 1.2] } },
          ],
        },
        center: [initial.longitude, initial.latitude], zoom: initial.zoom,
        minZoom: -1.5, maxZoom: 7, attributionControl: false, renderWorldCopies: false,
        scrollZoom: false, dragRotate: false, touchPitch: false, pitchWithRotate: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        canvasContextAttributes: { antialias: false, powerPreference: 'low-power' },
      });
      mapRef.current = map;
      // The constructor throws on null WebGL2; asynchronous failures use the
      // error event. Both paths restore the real geographic fallback.
      map.on('error', unavailable);
      map.on('webglcontextlost', unavailable);
      map.touchZoomRotate.disableRotation();
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.getCanvas().setAttribute('aria-label', 'Geographic field atlas. Arrow keys pan; plus and minus zoom. Select a volcano from a map marker or the field list.');
      map.once('load', () => {
        if (disposed || !map) return;
        buttons.current = VOLCANOES.map((site, index) => {
          const location = ATLAS_SITES[site.slug];
          const element = document.createElement('button');
          element.type = 'button'; element.className = styles.marker;
          element.setAttribute('aria-label', `Select ${site.name}`);
          element.setAttribute('aria-controls', 'atlas-selected-record');
          element.setAttribute('aria-pressed', String(useArchiveStore.getState().selectedSlug === site.slug));
          element.dataset.slug = site.slug;
          element.dataset.longitude = String(location.longitude);
          element.dataset.latitude = String(location.latitude);
          const dot = document.createElement('span'); dot.className = styles.pinCore; dot.setAttribute('aria-hidden', 'true');
          const label = document.createElement('span'); label.className = styles.markerLabel;
          label.textContent = `${String(index + 1).padStart(2, '0')} / ${site.name}`; label.setAttribute('aria-hidden', 'true');
          element.append(dot, label);
          element.addEventListener('click', () => onSelect(site.slug));
          markers.push(new Marker({ element, anchor: 'center' }).setLngLat([location.longitude, location.latitude]).addTo(map!));
          return { slug: site.slug, element };
        });
        ATLAS_LABELS.forEach(label => {
          const element = document.createElement('span');
          element.className = label.ocean ? styles.oceanLabel : styles.countryLabel;
          element.textContent = label.text; element.setAttribute('aria-hidden', 'true');
          markers.push(new Marker({ element, anchor: 'center' }).setLngLat([label.longitude, label.latitude]).addTo(map!));
        });
        setReady(true); onReady();
      });
    } catch { unavailable(); }

    return () => {
      disposed = true; motion.current?.kill(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged);
      container.removeEventListener('pointerdown', interrupt, true);
      container.removeEventListener('keydown', interrupt, true);
      markers.forEach(marker => marker.remove()); buttons.current = [];
      map?.remove(); mapRef.current = null; container.replaceChildren();
    };
  }, [onReady, onUnavailable, onSelect]);

  useEffect(() => {
    buttons.current.forEach(({ slug, element }) => element.setAttribute('aria-pressed', String(slug === selectedSlug)));
  }, [selectedSlug, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focusRequest) return;
    const location = ATLAS_SITES[focusRequest.slug];
    if (!location) return;
    const width = map.getContainer().clientWidth;
    const padding = width < 600 ? { top: 95, right: 35, bottom: 230, left: 35 } : { top: 110, right: 350, bottom: 100, left: 80 };
    moveCamera(map, location.longitude, location.latitude, focusZoom[focusRequest.slug] - (width < 600 ? .5 : 0), padding, motion, visible.current);
  }, [focusRequest, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || overviewToken === 0 || focusRequest) return;
    const target = overview(map.getContainer().clientWidth, map.getContainer().clientHeight);
    moveCamera(map, target.longitude, target.latitude, target.zoom, { top: 0, right: 0, bottom: 0, left: 0 }, motion, visible.current);
  }, [overviewToken, ready, focusRequest]);

  return <div className={styles.mapHost} data-map-ready={ready} aria-label="Natural Earth geographic map"><div ref={host} className={styles.mapSurface} /></div>;
}

function moveCamera(map: Map, longitude: number, latitude: number, zoom: number, padding: PaddingOptions, motion: { current: gsap.core.Tween | null }, visible: boolean) {
  motion.current?.kill(); map.stop();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !visible || document.hidden) {
    map.jumpTo({ center: [longitude, latitude], zoom, padding }); return;
  }
  const centre = map.getCenter();
  const currentPadding = map.getPadding();
  const camera = { longitude: centre.lng, latitude: centre.lat, zoom: map.getZoom(), top: currentPadding.top ?? 0, right: currentPadding.right ?? 0, bottom: currentPadding.bottom ?? 0, left: currentPadding.left ?? 0 };
  motion.current = gsap.to(camera, {
    longitude, latitude, zoom, ...padding, duration: 1.15, ease: 'power2.inOut',
    onUpdate: () => map.jumpTo({ center: [camera.longitude, camera.latitude], zoom: camera.zoom, padding: { top: camera.top, right: camera.right, bottom: camera.bottom, left: camera.left } }),
    onComplete: () => { motion.current = null; },
  });
}
