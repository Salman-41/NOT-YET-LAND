# NOT YET LAND

**The earth is not finished.** An editorial digital field archive of six volcanic landscapes, implemented from the supplied V02 design package.

## Run

Use Node 22.12+ and npm 10.9.4. `.nvmrc` and `.node-version` record the supported Node 22 toolchain.

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
  data/           six typed field records and the original source register
  pages/          native React exhibition pages and instruments
  routes/         React Router framework modules and route metadata
  scenes/         optional MapLibre instrument and Phase 2 R3F scene host
  state/          transient Zustand selection, search, navigation and renderer ownership
  styles/         V02 CSS Module, tokens and responsive/accessibility refinements
public/
  assets/         unchanged original V02 illustrations
  fonts/          self-hosted Noto Serif Display and supplied font license
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

All core instruments use DOM/SVG and native controls. The atlas starts with the original illustrated projection and six selectable pins. **Pan the map** loads a MapLibre renderer for an optional movable version of that same conceptual artwork. It uses local assets and no external map service. If rendering fails, the illustration and field list remain usable.

`SceneManager` is a Phase 2 boundary for one active R3F terrain viewport. Its lazy Canvas uses demand rendering, capped pixel ratio and Drei orbit controls. `renderer` ownership in Zustand prevents an active map and terrain scene from sharing the budget. No speculative terrain mesh or DEM is shipped as science. GSAP/ScrollTrigger handle restrained route motion and reading progress using ordinary scrolling; motion preferences are respected.

## Scientific and asset boundaries

The original art is conceptual. It is **not** satellite imagery, measured topography, live volcanic activity, a dated georeferenced comparison or a hazard model. Historical text and source links are retained from V02, with explanatory limits visible in each instrument. External agency links do not imply an asset license; no external scientific imagery or dataset has been imported.

The supplied archive remains in `Designs/NOT_YET_LAND_V02_full_design.zip`. Its original artwork provenance statement is recorded in the [reference audit](docs/REFERENCE_AUDIT.md). The Noto font copyright and OFL text are included at `public/fonts/NOTO-LICENSE.txt`; that license applies to the font files, not the supplied artwork or this repository as a whole.

Read [implementation status](docs/IMPLEMENTATION_REPORT.md) and [dependency compatibility](docs/DEPENDENCIES.md) for verification evidence and the Phase 2 boundary.
