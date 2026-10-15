import { useEffect, useRef } from 'react';
import { Map, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { c } from '../components/ui';
import { VOLCANOES } from '../data/volcanoes';
import { useArchiveStore } from '../state/archive';

export type AtlasMapProps = { onUnavailable: () => void };

// This adapter deliberately uses the supplied conceptual artwork, not a tile
// service or a georeferenced dataset. It owns the only active map GL context.
export default function AtlasMap({ onUnavailable }: AtlasMapProps) {
  const host = useRef<HTMLDivElement>(null);
  const markerButtons = useRef<{ slug: string; element: HTMLButtonElement }[]>([]);
  const selectedSlug = useArchiveStore(state => state.selectedSlug);

  useEffect(() => {
    if (!host.current) return;
    let map: Map | undefined;
    let disposed = false;
    let failed = false;
    const markers: Marker[] = [];
    const container = host.current;
    const unavailable = () => {
      if (disposed || failed) return;
      failed = true;
      onUnavailable();
    };

    const initialize = async () => {
      try {
        // Rasterize the local SVG with the browser, because image-source
        // decoders do not consistently accept SVG across browsers.
        const illustration = new Image();
        illustration.src = '/assets/world.svg';
        await illustration.decode();
        if (disposed) return;
        const artwork = document.createElement('canvas');
        artwork.width = illustration.naturalWidth || 1370;
        artwork.height = illustration.naturalHeight || 760;
        const paint = artwork.getContext('2d');
        if (!paint) throw new Error('Illustration renderer unavailable');
        paint.drawImage(illustration, 0, 0, artwork.width, artwork.height);

        // The constructor may throw on devices with disabled/unavailable GL.
        // No probe canvas is created, so there is no spare GPU context.
        setWorkerUrl(workerUrl);
        map = new Map({
          container,
          style: {
            version: 8,
            sources: {},
            layers: [{ id: 'mineral-ground', type: 'background', paint: { 'background-color': '#101b16' } }],
          },
          center: [0, 15],
          zoom: 0.25,
          minZoom: -1,
          maxZoom: 5,
          attributionControl: false,
          renderWorldCopies: false,
          scrollZoom: false,
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
          canvasContextAttributes: { antialias: false, powerPreference: 'low-power' },
        });
        map.on('error', unavailable);
        map.on('webglcontextlost', unavailable);
        map.touchZoomRotate.disableRotation();
        map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
        map.getCanvas().setAttribute('aria-label', 'Pan the conceptual world map with arrow keys; use plus and minus to zoom. Select a field site from a marker or the field list.');

        map.once('load', () => {
          if (disposed || !map) return;
          try {
            map.addSource('original-world-illustration', {
              type: 'canvas',
              canvas: artwork,
              animate: false,
              coordinates: [[-180, 85], [180, 85], [180, -85], [-180, -85]],
            });
            map.addLayer({
              id: 'illustrated-world',
              type: 'raster',
              source: 'original-world-illustration',
              paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 0 },
            });

            markerButtons.current = VOLCANOES.map(site => {
              const element = document.createElement('button');
              element.type = 'button';
              element.className = c('map-pin', 'atlas-live-pin');
              element.setAttribute('aria-label', `Select ${site.name}`);
              element.setAttribute('aria-controls', 'atlas-selected-record');
              element.setAttribute('aria-pressed', String(useArchiveStore.getState().selectedSlug === site.slug));
              element.title = site.name;
              element.addEventListener('click', () => useArchiveStore.getState().setSelectedSlug(site.slug));
              const marker = new Marker({ element, anchor: 'center' }).setLngLat([site.long, site.lat]).addTo(map!);
              markers.push(marker);
              return { slug: site.slug, element };
            });
            map.resize();
          } catch {
            unavailable();
          }
        });
      } catch {
        unavailable();
      }
    };

    void initialize();
    return () => {
      disposed = true;
      markers.forEach(marker => marker.remove());
      markerButtons.current = [];
      map?.remove();
      // Also clear a partially initialized canvas after a failed constructor.
      container.replaceChildren();
    };
  }, [onUnavailable]);

  useEffect(() => {
    markerButtons.current.forEach(({ slug, element }) => element.setAttribute('aria-pressed', String(slug === selectedSlug)));
  }, [selectedSlug]);

  return <div className={c('atlas-map-host')} aria-label="Interactive conceptual world illustration"><div ref={host} style={{ width: '100%', height: '100%' }} /></div>;
}
