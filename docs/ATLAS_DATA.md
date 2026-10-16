# Geographic Atlas — source and rendering record

The Atlas now uses local, georeferenced geography. The Phase 1 procedural world illustration is no longer its basemap. This is a geographic context map, not an eruption footprint, a hazard product or an elevation measurement instrument.

## Source data and rights

Natural Earth explicitly places its raster and vector maps in the public domain and permits modification and commercial/electronic reuse. No API key or runtime data service is involved. The original [terms of use](https://www.naturalearthdata.com/about/terms-of-use/) were checked on 16 October 2026. The page visibly credits **Made with Natural Earth** and links both the project and its public-domain terms.

| Input | Official source | What it supplies |
| --- | --- | --- |
| 1:10m land | [Natural Earth land](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/) / [official ZIP](https://naciscdn.org/naturalearth/10m/physical/ne_10m_land.zip) | WGS84 land polygons, including the small islands needed by this archive |
| 1:10m coastline | [Natural Earth coastline](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-coastline/) / [official ZIP](https://naciscdn.org/naturalearth/10m/physical/ne_10m_coastline.zip) | Coastline linework, avoiding artificial internal seams from the segmented land polygons |
| 1:50m shaded relief | [Natural Earth shaded relief](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-shaded-relief/) / [official ZIP](https://naciscdn.org/naturalearth/50m/raster/SR_50M.zip) | Grayscale cartographic shading derived from downsampled SRTM Plus, as described by its publisher |

The downloaded files' internal version strings are retained verbatim in `public/geography/manifest.json`: land `5.1.1`, coastline `5.0.0-pre9`, relief `2.0.0`. Natural Earth's web pages display different catalogue version labels for coastline/relief (4.1.0 / 3.2.0). We record that discrepancy rather than inventing a consistent version number or describing the files as current survey observations. SHA-256 hashes identify the exact downloads and derived assets.

Natural Earth is generalized reference cartography. Its publisher documents coastline accuracy limitations. Its coarse shaded relief predates these selected eruption records and cannot show the 2018 or 2021 eruption changes. It remains a geographic context layer only. No political boundary or emergency-information claims are made.

## Reference points

All locations are longitude/latitude in WGS84. These points locate a field record; they are not measured event footprints. Three decimal places describe the stored reference, not a claim of metre-level positional accuracy.

| Record | Latitude | Longitude | Point definition and primary reference |
| --- | ---: | ---: | --- |
| Kīlauea | 19.421 | −155.287 | [Smithsonian GVP summit/reference location, volcano 332010](https://volcano.si.edu/volcano.cfm?vn=332010) |
| Reykjanes | 63.883 | −22.383 | [GVP Sundhnúkar crater-row subfeature](https://volcano.si.edu/volcano.cfm?vn=371020&vtab=Weekly), 63°53′N / 22°23′W, rounded to three decimals. This locates the archive's fissure study, rather than using GVP's broader Reykjanes system reference at 63.817 / −22.717. |
| Mount St. Helens | 46.200 | −122.180 | [GVP volcano 321050](https://volcano.si.edu/volcano.cfm?vn=321050); the source provides two decimal places |
| Etna | 37.748 | 14.999 | [GVP volcano 211060](https://volcano.si.edu/volcano.cfm?vn=211060) |
| Tajogaite | 28.615 | −17.865 | Centre of the 28.61–28.62 / −17.87–−17.86 geographic survey bounding box published in the [OpenTopography cone DSM metadata](https://doi.org/10.5069/G97W69FW), also exposed by the [US government data catalogue](https://catalog.data.gov/dataset/tajogaite-cone-la-palma-spain-sfm-dsm-march-2022-6b30f). This is explicitly a survey-area centre, not a surveyed vent coordinate. No DSM files from that dataset are included in the Atlas. |
| Vesuvius | 40.821 | 14.426 | [GVP volcano 211020](https://volcano.si.edu/volcano.cfm?vn=211020) |

The locations and citations live in `app/data/atlas-sites.ts`. This separate geographic record preserves the approved original chapter copy. Selected coordinates link directly to the reference source. Country/ocean labels are curated editorial place labels at representative coordinates; they are not an imported territorial dataset.

## Reproducible preparation

`scripts/prepare-atlas-geography.py` uses Python's standard library and Pillow. Its inputs are the three unmodified official ZIPs above:

```bash
python3 scripts/prepare-atlas-geography.py \
  --land-zip /path/to/ne_10m_land.zip \
  --coast-zip /path/to/ne_10m_coastline.zip \
  --relief-zip /path/to/SR_50M.zip
```

The pipeline reads WGS84 ESRI geometry, converts polygon winding to RFC 7946, applies Douglas–Peucker generalization (0.04 degrees globally; 0.0025 degrees for small field-region islands), and rounds output coordinates to five decimals. Coastline and land remain separate layers. Land polygons are never treated as political boundaries.

The relief GeoTIFF supplies 10,800 × 5,400 grayscale pixels at 1/30 degree, with an upper-left boundary of −180 / 90. The script explicitly inverse-projects Web Mercator to geographic latitude before resampling. It creates a 2048 × 2048 display raster spanning −180–180° longitude and ±85.05112878° latitude. A restrained mineral palette transfers the original shading; an alpha mask keeps ocean transparent. The output encodes **shading, not height**. No invented contour values, synthetic DEM or generated geological measurement is presented.

The static 2048 × 1493 WebP is composited from exactly the same projected land, true coastline, relief and mathematically generated graticule. It crops the southern part of the full Mercator display for the archive's northern field sites. Its native aspect ratio is preserved, and static HTML marker positions use the same Mercator formula. It is not the old stretched conceptual world SVG.

| Runtime asset | Purpose | Approximate uncompressed transfer size |
| --- | --- | ---: |
| `land-10m.geojson` | Filled land polygons | 1.55 MB |
| `coastline-10m.geojson` | Genuine coastline strokes | 1.30 MB |
| `graticule.geojson` | Calculated longitude/latitude grid | 23 KB |
| `relief-mercator.webp` | Display-only SRTM-derived shading | 157 KB |
| `world-mercator.webp` | SSR / no-WebGL static geographic view | 222 KB |

Static hosting should serve GeoJSON with standard Brotli/gzip content compression. The basemap uses no external tile provider, API credential, remote glyph file or runtime third-party request.

## Interaction and lifecycle

- The georeferenced MapLibre view loads automatically after client hydration. The initial view is a world overview. Public HTML and the actual geographic fallback remain useful before it loads and without WebGL2.
- All six list controls and map markers update the same Zustand `selectedSlug`. A local focus request counter makes clicking an already-selected field meaningful, including the initial Kīlauea record.
- Selected fields receive a visual locator halo. This is a screen-space selection mark, not a geological extent. Hover/focus reveals the site label. All controls retain native keyboard and touch behavior.
- Country/ocean labels are DOM cartographic annotations, so no remote font glyph service is needed. Native map controls, arrow keys and pinch gestures provide pan/zoom; wheel capture is disabled to preserve ordinary page scrolling.
- GSAP moves the map camera only in response to selection or **World view**. Reduced-motion users receive immediate `jumpTo` changes. User input stops native camera transitions; route cleanup kills the GSAP tween, removes the map and releases its WebGL context.
- Offscreen/document-hidden observers stop camera work. The map has no perpetual animation or repaint loop. Device pixel ratio is capped at 1.5.
- **Use static map** releases the GPU context and restores the geographic fallback. **Explore map** creates a fresh renderer. A failed WebGL2 or local-data initialization returns to the real fallback and retains search/selection/navigation.
- The `renderer` registry continues to give MapLibre and the terrain study exclusive GPU ownership. The Kīlauea panel links to `/expedition/kilauea#terrain-study`, retaining the selected-field context.

The Atlas is a complete geographical navigation layer. It deliberately leaves detailed, dated volcanic terrain and measured eruption changes to their separately attributed expedition instruments.
