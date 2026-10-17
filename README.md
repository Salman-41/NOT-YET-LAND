# NOT YET LAND

**The earth is not finished.** An editorial digital field archive of six volcanic landscapes, implemented from the supplied V02 design package.

## Run

Use Node 22.12+ and npm 11.21.1. `.nvmrc` and `.node-version` record the supported Node 22 toolchain.

```sh
npm ci
npm run dev
```

The development server runs at `http://localhost:5173`.

```sh
npm run typecheck
npm test
npm run build
npm run preview
npm run test:e2e
```

The production preview runs at `http://localhost:4173`. Playwright needs its matching Chromium installation (`npx playwright install chromium` on a new machine). The test configuration uses an available local Chromium if present and otherwise uses Playwright's managed browser.

## Structure

```text
app/
  components/     navigation, identity, annotations, source links, comparison, transitions
  data/           field records, typed scientific source registry, dated map frames
  expeditions/    six distinct research instruments and shared annotation primitives
  pages/          native React exhibition pages and evidence investigation
  routes/         React Router framework modules and route metadata
  scenes/         optional MapLibre instrument and Phase 2 R3F scene host
  state/          transient Zustand selection, search, navigation and renderer ownership
  styles/         V02 CSS Module, tokens and responsive/accessibility refinements
public/
  assets/         unchanged original V02 illustrations
  fonts/          self-hosted Noto Serif Display and supplied font license
  research/       optimized licensed evidence, checksums and downloadable source registry
  terrain/        measured summit heightfields and static fallback
  geography/      local Natural Earth cartography
source/expeditions/ retained scientific originals for the offline evidence pipeline
tests/            Vitest archive integrity and Playwright browser journeys
docs/             reference audit, package decisions and implementation report
artifacts/        responsive screenshots produced by browser verification
```

## Routes

`/`, `/atlas`, `/expeditions`, `/expedition/kilauea`, `/expedition/reykjanes`, `/expedition/st-helens`, `/expedition/etna`, `/expedition/tajogaite`, `/expedition/vesuvius`, `/subsurface`, `/evidence`, `/method`.

Each public URL is prerendered at build time with its own text, title and description. The dynamic expedition parameter is explicitly enumerated in `react-router.config.ts`. Real links support direct requests, browser history and client navigation.

## Static deployment

Publish **`build/client`** to a static host. Serve directory routes from their `index.html` files and preserve the generated `.data` navigation payloads. No Node server, credentials, API service or database is required in production. The included preview script demonstrates direct static URL serving and returns 404 for absent files/routes.

Use your actual deployment domain when adding an absolute canonical URL, sitemap or social sharing image URL. No production origin has been invented in this repository. Do not rewrite missing image/script requests to HTML.

## Interaction and rendering

Six expedition modules use distinct controls and compositions: Kīlauea’s dated HVO map desk; Reykjanes’s fissure/episode investigation; Mount St. Helens’s satellite comparison and qualitative collapse profile; Etna’s historical deposit classes; Tajogaite’s environmental comparison lenses; and Vesuvius’s illustrated stratigraphic excavation. The Evidence room filters 14 typed research records and exposes acquisition dates, processing, rights, limitations and permitted downloads.

The Phase 2 MapLibre atlas uses locally hosted Natural Earth cartography, with selectable geographic reference points, restrained camera travel and an accessible field list. Kīlauea retains its lazy R3F terrain study derived from a USGS 3DEP summit crop. Subsurface retains the interactive generalized 3D section. Renderer ownership limits the active WebGL context budget; the new research instruments add no WebGL contexts. Native controls, static fallbacks, ordinary scrolling and reduced-motion support remain available.

Read [expedition implementation and licensing](docs/EXPEDITION_RESEARCH.md), [atlas provenance](docs/ATLAS_DATA.md), [terrain provenance](docs/TERRAIN_DATA.md) and [spatial architecture](docs/SPATIAL_SYSTEMS.md).

## Rebuild the expedition evidence

The checked-in runtime assets need no Python at deployment. To reproduce them from retained originals, install Poppler (`pdfimages`) and use the pinned Python environment:

```sh
python3 -m venv /tmp/not-yet-land-evidence
/tmp/not-yet-land-evidence/bin/pip install -r scripts/requirements-evidence.txt
/tmp/not-yet-land-evidence/bin/python scripts/prepare-expedition-evidence.py
npm run build
```

`--download` acquires missing originals from the official URLs. The normal pipeline runs offline. It extracts dated HVO video frames and the published fissure figure, encodes WebP, separates approximate Etna raster color classes and records SHA-256 checksums. Build exports `app/data/sources.ts` to `public/research/sources.json` before prerendering. No flow boundaries or elevation samples are synthesized.

## Scientific and asset boundaries

Original V02 terrain illustrations remain conceptual. Measured elevation, mapped deposits, dated satellite observations, historical accounts and explanatory drawings carry explicit labels. The archived USGS summit DEM has mixed observation epochs and is not a 2018 terrain comparison. St. Helens’s silhouette, the plate-boundary diagram, Vesuvius’s layer thicknesses and subsurface internals are interpretive. No non-commercial scientific media is redistributed.

The supplied archive remains in `Designs/NOT_YET_LAND_V02_full_design.zip`; its artwork provenance is recorded in the [reference audit](docs/REFERENCE_AUDIT.md). The Noto font OFL is included at `public/fonts/NOTO-LICENSE.txt`. Scientific media retains its separate source-specific rights; none of those licenses imply a license for the whole repository.

The original [foundation report](docs/IMPLEMENTATION_REPORT.md) is historical. Current expedition scope and verification are in [the research report](docs/EXPEDITION_RESEARCH.md). Dependency decisions are documented in [compatibility notes](docs/DEPENDENCIES.md).
