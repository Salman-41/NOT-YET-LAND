# NOT YET LAND — Complete Interactive Website Design V02

**Design status:** fully navigable *visual prototype* / interaction design, not a deployed or validated scientific application.  
**Creative target:** Awwwards 8+ ambition, not a jury score or award prediction.  
**Date:** 14 October 2026.

## Open the design

1. Open `standalone.html` in a modern browser. This is a complete, self-contained file: no development server, package manager, or network connection required.
2. Navigate using the menu or page links. Open the Atlas and select different volcanoes; inspect each expedition, drag its investigation slider; visit Below the Surface and the Evidence Room.
3. For editable sources, use `index.html`, `style.css`, `app.js` and `assets/`. They can be hosted on any static hosting provider with no build step. `bundle.py` rebuilds the standalone copy from these files.
4. Desktop and mobile screenshots live in `screens/`. `DESIGN_OVERVIEW.jpg` gives a contact sheet.

## Designed experiences

| Route | Screen or journey | Primary interaction |
| --- | --- | --- |
| `#/` | The Index / immersive editorial opening | Chapter navigation and featured entries |
| `#/atlas` | Global atlas of six volcanic landscapes | Geographic selection, individual pins, search, detail panel |
| `#/expeditions` | Six-field-record expedition index | Chapter selection |
| `#/expedition/kilauea` | Kīlauea / Living Surface | Four-stage illustrative lava channel evolution |
| `#/expedition/reykjanes` | Reykjanes / Fracture | Four-stage conceptual fissure reveal |
| `#/expedition/st-helens` | Mount St. Helens / Collapse | Four-stage missing-flank study |
| `#/expedition/etna` | Etna / Accumulation | Four-stage deposit-layer study |
| `#/expedition/tajogaite` | Tajogaite / Aftermath | Four-stage lava field and coastline sequence |
| `#/expedition/vesuvius` | Vesuvius / Buried World | Four-stage illustrative stratigraphy |
| `#/subsurface` | Below the Surface / core exhibition instrument | Interactive geological cutaway: surface-to-interior slider + reset/full commands |
| `#/evidence` | The Evidence Room | Before/after interaction mock-up and external linked source register |
| `#/method` | Methods and limitations | Scientific transparency, licensing, process |

## Design system

A restrained, editorial *field journal meets exhibition* visual language:

- Deep mineral ink `#101614`, near-black `#090f0e`, geological paper `#E9E7DF` and ember `#F37543`.
- Overscale high-contrast editorial serif set with a `Noto Serif Display` font stack and serif fallback; compact monospaced observation labels; restrained sans-serif explanatory text.
- Minimal geometric identity: open four-sided survey frame cut by an orange fault line.
- Sections alternate near-black cartographic environments and warm paper research layouts. Subtle graticules, relief hatching, lava veins and frame numbering are used with restraint.
- Motion direction: atmospheric but purposeful, with reduced-motion media query. The shipped prototype demonstrates route transitions and section/phase interactions, not fully choreographed WebGL journeys.

## Visual asset provenance and licensing

All the artworks under `assets/` were created specifically for this visual study, using original procedural illustrations. They are *not* satellite imagery, licensed digital elevation models, validated maps, eruption forecasts, real topographic sections, or sourced scientific observations. Every investigation includes an illustrative/interpretive label.

Before a production scientific website can describe its terrain as real or show an authoritative before/after comparison, add documented and appropriately licensed photographs, elevation models and event footprints. Check each source's terms and give any required attribution. Some downloadable volcanic elevation datasets have non-commercial reuse restrictions; downloadable does not automatically mean freely reusable for a portfolio promoting paid work.

Useful vetted research/source starting points:

- USGS Kīlauea 2018 multimedia release: https://www.usgs.gov/data/image-and-video-catalog-2018-summit-collapse-and-lower-east-rift-zone-eruption-kilauea-volcano
- USGS Kīlauea 2019 LiDAR DEM: https://www.usgs.gov/data/digital-elevation-model-klauea-volcano-hawaii-based-july-2019-airborne-lidar-surveys
- Smithsonian Global Volcanism Program: https://volcano.si.edu/
- USGS Landsat St. Helens before/after: https://www.usgs.gov/media/before-after/mount-st-helens-1973-1983
- Iceland Met Office terms: https://en.vedur.is/about-imo/the-web/conditions/
- INGV Etna lava field data: https://www.pi.ingv.it/banche-dati/2005-04-etna-lava-flow-data/
- Copernicus Data Space: https://dataspace.copernicus.eu/

All external research material is linked, **not included** in the ZIP.

## What 8+ would require beyond this prototype

The prototype is an art-directed website *design*. It does not yet include real terrain geometry, integrated photographs or validated DEM time-series, original GPU-accelerated camera choreography, real cross-device performance results, accessibility audits with assistive technology, field expert review, or actual public hosting. Those are production requirements for a credible competitive 8+ award submission, not completed features.

**Recommended production sequence:** (1) secure asset licenses and source registry, (2) implement one high-detail terrain scene and surface-to-cutaway signature transition, (3) connect one real before/after dataset, (4) build out the remaining expeditions, (5) refine unique motion and sound with accessible controls, (6) test on real mobile hardware and run Core Web Vitals/performance/a11y QA.

## Files

- `standalone.html` — complete, working, self-contained site to open and inspect.
- `index.html` / `style.css` / `app.js` — editable HTML/CSS/JS source; no framework required.
- `assets/` — original SVG field-art, maps and custom relief images.
- `make_assets.py` — procedural asset art generator.
- `bundle.py` — bundle into the standalone HTML.
- `DESIGN_OVERVIEW.jpg` — overview of core desktop and mobile screen layouts.
- `screens/*_ready.png` — design audit screenshots.
- `QA_AND_AWWWARDS_AUDIT.md` — scope and testing/auditing details.

## Figma

An earlier Figma file exists but is **empty** because the connected account hit Figma's Starter tool quota. No editable Figma screens are claimed. The editable source is HTML/CSS/JS and SVG.
