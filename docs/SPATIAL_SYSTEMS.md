# Spatial systems — NOT YET LAND

Implemented against the existing editorial foundation on 16 October 2026. This update adds measured geographical and terrain instruments; it does not replace the V02 exhibition layouts, identity, chapter copy or conceptual artwork elsewhere in the archive.

## Three connected instruments

The geographic atlas uses MapLibre with local Natural Earth land, genuine coastlines, SRTM-derived cartographic shading, curated labels and WGS84 reference points. Its six field controls work with mouse, touch, keyboard and search without requiring map gestures. Selecting a location directs a finite GSAP camera movement and highlights a screen-space locator, not an eruption footprint. The Kīlauea record leads directly to the measured terrain study.

Kīlauea's surface uses a retained USGS 3DEP elevation crop. Its geometry is deterministically reconstructed from quantized elevation samples, with geographic horizontal scale, labeled 1.5× display exaggeration, measured-height contour shading, orbit controls, selectable sample points and two geometry budgets. It is an archive of elevation, not live volcanic monitoring. Materials and lighting are editorial treatments.

The section control changes from an above-ground survey view to a controlled sectional view. A Three.js clipping plane removes part of the measured surface and perimeter. A moving cap samples its upper boundary from that same DEM; generalized strata and a deliberately interpretive conduit/storage form make the opened section legible. Changing section position actually changes clipping and cap geometry. Returning to the surface restores the terrain. The 100% command is the maximum useful section position, not a claim that the entire mountain volume is removed.

## Measured data and rights

| Data | Use | License / provenance |
| --- | --- | --- |
| USGS 1/3 Arc Second n20w156, published 11 June 2025 | Retained Kīlauea summit DEM crop, surface geometry and hillshade | USGS 3DEP public domain. [Official product terms](https://www.usgs.gov/3d-elevation-program/about-3dep-products-services), [USGS specifications](https://pubs.usgs.gov/tm/11b9/tm11B9.pdf). Original crop, publisher XML, acquisition record and SHA-256 are retained. |
| Natural Earth 1:10m land/coastline and 1:50m shaded relief | Local geographical context in the atlas | [Public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/). Exact downloaded version strings, hashes and official source URLs are recorded, including catalogue/version discrepancies. |

The DEM source combines acquisitions from 1954–2023. Its exact summit acquisition epoch is not established by the tile-wide metadata. The publisher reports NAVD 88; applicability of that datum to this Hawaiian crop is not independently validated. Neither publication date nor retrieval date is presented as a survey date.

The crop covers approximately 8.40 × 8.30 km, with sampled elevations from 946.04 to 1367.18 metres. The original native crop is 865 × 811 samples at approximately 10 m spacing. The displayed 129²/257² grids reduce this to approximately 65/33 m spacing. The small quantization error is an encoding bound, not a statement of survey accuracy.

All subsurface layers, the conduit and the storage form are generalized teaching geometry. They are not directly measured structures or a model of the present magma system. The static section SVG is entirely schematic, including its upper surface. These distinctions are visible in the instruments and in Method/Evidence.

See [terrain provenance and reproducibility](TERRAIN_DATA.md) and [atlas source record](ATLAS_DATA.md) for complete evidence.

## Reproducible pipeline

1. Retain a native-resolution crop of the public USGS Cloud-Optimized GeoTIFF using HTTP range reads; retain the matching publisher XML and acquisition manifest.
2. Validate the crop checksum, CRS, nodata, geographic bounds and actual elevation range using Rasterio/GDAL.
3. Bilinearly sample two grids without fabricating finer resolution; quantize to little-endian unsigned 16-bit heights with a shared elevation range.
4. Generate a compressed WebP hillshade and provenance metadata. The grids are a compact heightfield representation of mesh geometry: regular X/Z coordinates and triangle topology are implicit rather than repeatedly transferred.
5. Reconstruct the indexed Three.js surface and normals deterministically from the heightfield, in metre-derived world units. Derive selectable points and the section cap by bilinear sampling of the same source.
6. Verify the offline assets byte-for-byte and test geographic orientation, face winding, scale and moving cap geometry.

```sh
python3 -m venv /tmp/not-yet-land-dem
/tmp/not-yet-land-dem/bin/pip install -r scripts/requirements-terrain.txt
/tmp/not-yet-land-dem/bin/python scripts/process-dem.py --help
/tmp/not-yet-land-dem/bin/python scripts/verify-terrain.py
```

The complete command for offline regeneration is in `TERRAIN_DATA.md`. No runtime geospatial API, remote tile provider or credentials are required.

## Rendering and lifecycle

The terrain engine is loaded only when requested or when its stage becomes visible on a sufficiently capable desktop. Narrow screens and data-saving devices start with the actual DEM hillshade and native controls. A failed/lost context returns to an explicitly labeled static study. The source grid and engine both have loading/error states.

A shared Zustand renderer registry assigns active ownership to the map or one terrain instrument. R3F demand rendering rests when idle; the stage's visibility and document visibility suspend rendering. Camera tweens are finite, killable and interrupted by direct orbit/map input. Reduced-motion users receive immediate camera changes. Pixel ratio is capped; viewport-based geometry selection has an explicit user override.

Geometry/material/texture cleanup, route teardown and context-loss handling are implemented. The measured surface, section cap and perimeter use indexed/source-derived geometry. The labels use native Three sprites, avoiding nested React DOM roots inside a clipped scene.

Runtime terrain assets are 33,282 B (low grid), 132,098 B (high grid), 19,106 B (hillshade), plus metadata. The retained source crop is 1,367,190 B and is not fetched by the website. World cartography is separate and carries its own source/size manifest.

## Verification and measured performance

Final browser observations, screenshots and execution results are recorded here after the production verification run. Instrument timing describes CPU render submission from a bounded warm-up, not GPU frame time or sustained FPS. Headless Chromium software-renderer observations do not establish physical-device performance or Core Web Vitals.

## Remaining limits

- Geographical reference points are rounded study locations, not surveyed vents or eruption boundaries.
- Natural Earth relief is generalized context and cannot show dated eruption changes.
- The summit DEM is a mixed historical source. Current terrain, a complete 2018 event comparison and an exact summit survey epoch are not claimed.
- Only Kīlauea has a measured interactive terrain surface. Other expedition art and their original overlays remain conceptual.
- The geological interior is deliberately interpretive and not depth-calibrated.
- Quantitative scientific use requires expert review and datum/epoch validation. Physical-device GPU testing, assistive-technology sessions and hosted performance measurement remain outside the headless checks.
