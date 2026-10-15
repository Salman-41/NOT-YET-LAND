# NOT YET LAND — production foundation

Implementation date: 15 October 2026.

## Delivered

- Complete React 19 / TypeScript site in React Router v7 framework mode and Vite, with real URLs for all 12 requested public routes.
- Explicit build-time prerendering for the homepage, atlas, expedition index, all six expedition records, subsurface, evidence and method. The published site needs only static files.
- V02 identity, original chapter headlines and field copy, asymmetric editorial compositions, dark mineral/paper sections, orange fault lines, original SVG/WebP illustrations and their embedded labels.
- Locally served regular and italic Noto Serif Display. The exact supplied font copyright/license text is included with the files; no font CDN is required.
- Shared navigation, wordmark, footer, annotations, source references, comparison instrument and chapter transitions. The reference stylesheet is a custom CSS Module with CSS variable tokens.
- Zustand selection/search/navigation state. Four-stage instruments for each of the six expeditions. The subsurface slider alters the SVG clipping boundary, seam and marker; commands expose 0% or 100%. Evidence comparison updates the image clipping/divider and percentage readout.
- Atlas name/region search handles accents, reports counts and empty results, and synchronizes list/pins/detail/expedition links. Optional MapLibre pan/zoom uses the original local conceptual map artwork without a remote tile service or credentials.
- Phase 2 scene boundary for one lazy R3F/Drei terrain viewport, demand rendering and capped pixel ratio. Renderer ownership prevents a simultaneously active atlas and terrain viewport. No fabricated terrain mesh is presented as measured data.
- Ordinary scrolling, reduced-motion CSS and GSAP cleanup, semantic headings/landmarks, native keyboard/touch controls, visible focus states, modal menu focus trap/Escape/return, route announcements, page titles, descriptions and informative artwork alt text.

## Verification

The final executed results and screenshot paths are recorded below after the production checks. The automated browser matrix covers 320, 390, 768, 1024, 1440 and 1920px across every public route, plus search, navigation, expedition phases, reveal commands, evidence comparison and reduced-motion/no-WebGL behavior. The tests check the HTTP response for prerendered content, not only the hydrated DOM.

All original art files are copied byte-for-byte. `asset-manifest.json` records SHA-256 hashes taken directly from the supplied ZIP, and unit checks compare deployed source assets with those hashes.

## Intentional Phase 2 boundary

The supplied terrain images, contour artwork, cutaway and two-image comparison remain **conceptual illustrations**. They are not live monitoring, scientific elevation products, a measured subsurface section or an aligned historical image pair. Historical event labels are retained as selected field records; they do not claim to describe current volcanic activity.

Phase 2 should obtain documented usage rights for genuine DEMs, dated georeferenced imagery and event footprints; connect evidence to citations for each state; and have the scientific descriptions reviewed by a volcanologist. It can then replace conceptual overlays with validated terrain and a detailed surface-to-cutaway transition using the prepared scene boundary. Audio and advanced camera choreography are not included in this phase.

Physical mobile GPU testing, screen-reader sessions, broader browser coverage and measured hosted Core Web Vitals remain release validation tasks. The Awwwards 8+ ambition is an internal creative target, not an awarded score or a claimed audit result.

## Deployment and provenance

Deploy `build/client` with directory `index.html` resolution and the generated navigation payloads. The preview script serves static files directly and sends 404 for unknown requests. No backend, API keys, user accounts or external services are required. A real deployment origin is needed before adding absolute canonical/social URLs or a sitemap.

See `REFERENCE_AUDIT.md` for the complete audit, `DEPENDENCIES.md` for exact stable package/engine choices and primary references, and `public/fonts/NOTO-LICENSE.txt` for the font notice. External scientific media are linked, not imported or relicensed.
