# NOT YET LAND V02 — reference audit

Audited source: `Designs/reference/NOT_YET_LAND_V02`, extracted from the supplied `NOT_YET_LAND_V02_full_design.zip`. Read `README_DESIGN.md`, `QA_AND_AWWWARDS_AUDIT.md`, `index.html`, `style.css` and `app.js`; visually inspected `DESIGN_OVERVIEW.jpg`, all ten route/viewport screenshots, all twelve WebP artworks and all seven SVG assets. The approved direction is an editorial field archive and interactive exhibition. Preserve its composition and language rather than interpreting it as a general science landing page.

## Status and boundaries of the reference

- It is a fully navigable visual prototype, dated 14 October 2026. Its original twelve URLs use hash routing; production must use the corresponding real paths.
- Its stated Awwwards 8+ ambition is an internal quality target. There has been no jury evaluation or award score.
- Its README describes all artwork as original procedural illustration made for this study. No survey products, satellite imagery, DEMs, scientific reconstructions or external photographs are included.
- Linked references are research starting points. Source availability, scientific claims and individual reuse terms still require production review. The package does not contain a formal third-party media license inventory.
- Existing prototype QA reports 48 route/viewport combinations, no observed page errors or overflow, and functional sliders/search/menu. It does not establish physical-device performance, screen-reader accessibility, Core Web Vitals or expert scientific validation.

## Identity and design tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#101614` | Mineral background |
| `--void` | `#090f0e` | Deepest exhibition ground |
| `--paper` | `#e9e7df` | Warm research paper / pale text |
| `--soft` | `#d1d0c5` | Secondary pale annotations |
| `--muted` | `#9da8a0` | Dark-section supporting text |
| `--muted-2` | `#65726b` | Darker supporting annotation |
| `--ink` | `#141b18` | Paper-section text |
| `--line` | `rgba(229,231,216,.24)` | Fine dark-section rules |
| `--rust` | `#f37543` | Fault lines, marks, arrows, active states |
| `--burn` | `#c85b3c` | Deeper warm accent |
| `--ease` | `cubic-bezier(.2,.72,.15,1)` | Main transition curve |

Additional intentional materials: cover `#0e1513`; cream page grounds `#edece3`/`#eceae0`; pale control panels `#e6e5da`/`#e0dfd3`; green thesis `#18231e`; footer `#070d0c`. Paper rules use translucent dark green. These are tonal surfaces, not an invitation to add unrelated colors.

The wordmark is heavy, compact two-line sans lettering, `NOT YET` above `LAND.`, with orange punctuation. Its glyph is a 29px outlined survey frame, rotated −18°, containing a smaller outlined square and cut diagonally by a 3px orange fault. At small widths the glyph is 22px and the wordmark 16px. Keep both the geometric mark and the stacked lettering.

## Typography and composition

- Serif stack: `'Noto Serif Display', Georgia, 'Times New Roman', serif`. The archive has no bundled font files or font import; the named face is therefore not guaranteed. The reference screenshots show a high-contrast editorial serif. If bundling a font, document the actual font and license; do not invent an asset license.
- Sans stack: `'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`; prose typically 15–18px at 1.6–1.8 line height.
- Mono stack: `'Courier New', Courier, monospace`; annotations usually 9–11px, uppercase, with `.08–.16em` tracking. They are visually precise surveying notes, not prominent UI headlines.
- Display serif: weight 400, very tight `−.06em` to `−.09em` tracking, usually `.87–1.06` line height. Italic second phrases carry the editorial voice. Orange terminal punctuation remains inline.
- Global desktop gutters: `4.2%` (about 60px at 1440px). Tablet/mobile gutters: `5%` (about 20px at 390px). Major section padding is approximately 80–140px vertically; header clearance 125–173px.
- Large asymmetrical compositions, sparse hairline dividers, numbered field records, graticules and contour overlays organize the archive. Avoid rounded dashboard panels, generic feature cards or decorative pill controls.
- Cover heading line offsets are part of the art direction: line two shifted about `13vw`, line three `5vw` on desktop, then reduced or removed for mobile. Chapter italic subtitles shift `12vw` on desktop and become flush on small screens.

## Navigation and persistent shell

- Absolute full-width header, 100px desktop / 77px mobile, with fine bottom rule. Left identity; centered `AN INCOMPLETE PLANET ✳ FIELD ARCHIVE 001–006`; desktop links Index, Atlas, Expeditions, Evidence; bordered `+ MENU` control.
- Center annotation hides below 1150px. Desktop links hide below 800px. Menu stays available at every size.
- Atlas, Evidence and Subsurface use dark header text over paper; other routes use pale header text over mineral backgrounds.
- Menu slides from the right over 0.65s, max width 660px / full width on phones, full dynamic viewport height, warm paper. Its six large serif links are `00 / The Index`, `01 / Field Atlas`, `02 / Expeditions`, `03 / Evidence Room`, `04 / Below the Surface`, `05 / Method & Credits`.
- Menu toggles expanded/hidden states and closes on route change or Escape. Production should also trap focus when modal, prevent background tab stops, return focus to the trigger and lock background scrolling.
- A fixed 2px orange progress line reflects page scrolling. Native scroll is retained; there is no scroll-jacking.
- Skip link appears on keyboard focus. Focus-visible outlines are 2px orange, offset 5px. Selection uses orange with dark ink.
- Four-column dark footer: identity; field archive / 2026 and “The ground beneath us has a history. Some of it is still being written.”; Atlas / Source Register / About links; `ILLUSTRATIVE EXPERIENCE / NOT FOR SAFETY DECISIONS`. Two columns on mobile.

## Route structure and content hierarchy

All twelve public routes require independent metadata and pre-rendered content. The original title is `NOT YET LAND — The earth is not finished`; original description calls this an atlas design concept.

### `/` — The Index

1. Full-height dark cover (900px in the desktop screenshot; 790px on small phones). Right-biased Kīlauea WebP + SVG contours, screened over a graticule and dark gradient. Main headline: **“The earth / is not / finished.”** The middle word is italic and the full stop orange. Intro: “Six volcanic landscapes. Six ways to read what the ground has done—and what it is still doing.” `Enter the atlas` link.
2. Vertical coordinates at the right and lower-right Kīlauea field station annotation; bottom four-part metadata strip: incomplete planet / 06 field sites / 03 ways to explore / 01 planet in motion.
3. Dark split prologue: **“Land is not / always solid / history.”** Supporting explanation that the surface records rock flow, mountain collapse, ground opening and buried cities; interpretive-graphics disclosure.
4. Paper field index, **“Six ways the / world changes.”** Large split feature with Kīlauea image and **“A river / made of / stone.”** Then three landscape tiles (Reykjanes, St. Helens, Etna), then two wider ones (Tajogaite, Vesuvius). Each is a real chapter link with number, year, name and chapter subtitle. `Explore all six expeditions`.
5. Dark-green split teaser: **“There is more / underneath.”**, terrain illustration, generalized cross-section explanation and `Cut through the earth`.
6. Dark thesis: **“Not just what / erupted. What it / left behind.”** Links to Evidence Room. Right-side Reykjanes contour texture.

### `/atlas`

Paper introduction: **“The atlas.”**, with italic atlas; supporting statement about oceans, tectonic boundaries and different ways to remake the planet. Below: substantial dark illustrated world-map stage and 310px paper search/selection rail. The rail includes six numbered serif volcano buttons. Map has six geographic selection buttons, conceptual-projection labels, graticule, and lower-right detail overlay containing selected field number/region, title, lead and expedition URL. Selected pin fills orange and scales; selected rail title turns rust and gains arrow. Footer annotation explicitly says locations are approximate.

Search matches name or region case-insensitively. It filters the list, while map pins remain selectable. Selection updates all selected states and the detail/expedition link. A production empty state should make a search with zero matches understandable.

### `/expeditions`

Dark editorial index: **“Where the / ground moves.”** One paragraph introducing six geological stories, manipulation of interpretation and published evidence. Six generous ruled rows, each with chapter number, large serif volcano name, mono subtitle/region and orange arrow. On mobile, rows retain number/name/arrow and hide the secondary subtitle.

### `/expedition/:slug`

Shared hierarchy: full-height artwork hero → paper field question / description / metadata → dark interactive study and paper control rail → paper “What the landscape keeps.” observation / evidence → green “Keep following the fault lines.” next chapter / return to Atlas.

Hero includes numbered circular field tag; region and selected record; two-line large serif chapter title with italic second line; lead; thematic subtitle; type/coordinates stamp; bottom progress/back-to-Atlas rule. Reuse the exact field copy below and all description/observation copy in `app.js`.

| Slug | Hero / chapter | Headline / question | Instrument and four stages |
| --- | --- | --- | --- |
| `kilauea` | **Kīlauea / in motion.**; THE LIVING SURFACE; Hawaiʻi / United States; 2018 | “The ground is never finished.” / “How does molten rock redraw a coastline?” | **Trace the flow**: The vent opens → Lava finds a channel → Flow reaches the coast → New land remains |
| `reykjanes` | **Reykjanes / unsealed.**; THE FRACTURE; Iceland / North Atlantic; 2023–25 | “Sometimes the mountain is a line.” / “What happens when the surface opens?” | **Expose the fracture**: A line of weakness → Surface cracking → Multiple active vents → Cooling lava fields |
| `st-helens` | **Mount St. / Helens.**; THE COLLAPSE; Washington / United States; 1980 | “The shape of what is missing.” / “Can an absence become the evidence?” | **Reveal the collapse**: Before 18 May → North-flank failure → Open crater → Dome building |
| `etna` | **Etna / layer by layer.**; THE ACCUMULATION; Sicily / Italy; HISTORIC | “One mountain. Many surfaces.” / “How does repeated eruption build terrain?” | **Separate the layers**: Older rock foundation → Successive lava flows → Scoria and ash beds → Recent summit deposits |
| `tajogaite` | **Tajogaite / afterwards.**; THE AFTERMATH; La Palma / Spain; 2021 | “What remains after the glow fades?” / “What does a new landscape cost?” | **Reveal the new surface**: The eruption begins → Flows cross the slope → Coastal entry → Cooling and recovery |
| `vesuvius` | **Vesuvius / beneath time.**; THE BURIED WORLD; Naples / Italy; 79 CE | “The ground remembers for us.” / “What can buried layers tell us?” | **Read the deposit**: Early fall deposits → Thicker tephra beds → Pyroclastic deposits → Present-day surface |

Each instrument is a native four-position range, initially step 2. It visibly updates stage number, stage label, concept caption, overlay opacity, guide rotation and inspection-target size. Geological overlay languages differ: warm flow glow; linear fissure; dashed missing-flank sector; repeated strata bands; coastal field bloom; deposit bands. Preserve the `ARTISTIC CONCEPT / NOT A MEASUREMENT` label. These are explanatory stages, not numerical models.

Original evidence callouts: Kīlauea `35.5 km²` (2018 covered area); Reykjanes `2023` (Sundhnúkur sequence start); St. Helens `~400 m` (summit height removed); Etna `Multiple` (eruption styles/deposits); Tajogaite `2021`; Vesuvius `79 CE`. Keep historic framing and do not imply current monitoring. The source list below is inherited, not a new scientific validation.

### `/subsurface`

Paper opening: `EXPERIMENT / 007 — THE INVISIBLE GEOGRAPHY`; **“Below the / surface.”**; explanation that the unphotographable interior interests us; `INTERPRETIVE DIAGRAM / NOT TO SCALE`.

Large custom inline SVG at left and 330px paper instrument at right. SVG includes generalized cone, strata, vent and glowing melt reservoir. Labels include `SURFACE / VISIBLE`, `INTERIOR / INFERRED`, `SHALLOW CONDUIT`, `MELT RESERVOIR*`, strata 01–03, and a note that magma storage geometry varies. It is not the measured interior of any featured volcano.

Native range 0–100, initial 50, changes the interior clip width, dashed cut seam, marker and both numeric labels. `SURFACE / 0%` and `INTERIOR / 100%` commands visibly set endpoints. Lower section: **“WHAT WE CAN KNOW”** and prose about seismicity, deformation, rock chemistry and incomplete inference; Evidence link.

### `/evidence`

Paper heading: **“The ground / on record.”** Intro separates beautiful images from evidence. Split comparison/essay block; two original St. Helens artworks, study A/B illustration labels, pale divider with circular ↔ handle, full-stage native range. Moving it clips the second image and moves the divider; text says these are not aligned USGS survey images and a scientific release needs dated georeferenced pairs. **“Two images. / One question.”**, actual USGS imagery link.

Below: **“Nothing without / a source.”** and eight generous ruled source rows with number, serif title, description, type/agency and external arrow. Two lower notes: **“Observation ≠ reconstruction.”** and **“Open does not mean unrestricted.”**

### `/method`

Dark editorial essay: **“A field guide / to uncertainty.”** Two-column explanation under “Why these six?”, “What is designed?”, “What comes from science?”, “What is required for production?”. Explicitly describes a curated collection, illustrative overlays, future checked survey products, licenses and scientific review. Closing identity/rights and non-emergency-information note; sources link.

## Responsive specification

The source uses breakpoints at 1150, 900 (cutaway), 800 and 480px. Required implementation QA additionally covers 320, 390, 768, 1024, 1440 and 1920px.

| Range | Required composition |
| --- | --- |
| >1150px | Full nav / center annotation; 4.2% gutters; large split art-directed compositions; four-column footer |
| 801–1150px | Center annotation hidden; cover display scales; Atlas rail 275px |
| ≤900px | Cutaway diagram over full-width controls; stacked Subsurface introduction and explanatory footer |
| ≤800px | Header 77px, 5% gutters, menu-only nav; stacked prologue, feature, chapter intro, instruments and evidence; Atlas map above selection rail; index tiles two columns; footer two columns |
| ≤480px | Cover 790px; title 56–72px with adjusted line offsets; bottom metadata two-by-two; featured image 295px; tiles one column (the original final pair has an inline two-column override worth correcting for legibility); map 460px; 20px rail type; chapter hero 800px; chapter title 16vw; inspection artwork 340px; comparison 320px; cutaway artwork 320px; evidence notes/history single column |

Native ranges provide arrow-key and touch behavior. Reduced-motion mode collapses animations/transitions and disables smooth scrolling. Production should preserve readable content and all instruments with WebGL disabled, retain focus feedback on the visually transparent comparison range and provide adequate touch hit areas around map pins.

## Assets and visual treatment

- Six primary `*.webp`: 1400 × 1000. Six `*-detail.webp`: 980 × 760. They are compact atmospheric procedural relief/noise images with distinct color casts and warm fracture traces; St. Helens is a cool crater-like circular relief.
- Six `*_terrain.svg`: 1250 × 1050, approximately 129KB each; dark gradients, dense thin irregular contour paths and site-specific incision/flow traces. These carry much of the sharp cartographic character visible in the screenshots.
- `world.svg`: 1370 × 760, about 80KB, quiet coast outlines and graticule. It is an illustrated projection, not a georeferenced scientific basemap.
- `noise.png`: 260 × 260, roughly 85KB; supplied texture (not referenced by the main stylesheet).
- No text elements are embedded in supplied SVG assets. Illustrative warnings, record annotations and other labels are HTML or the inline Subsurface SVG and must remain visible in the implementation.
- Important filename mismatch: `app.js` constructs `st-helens_terrain.svg` but the actual file is `st_helens_terrain.svg`. Correct asset mapping rather than dropping that artwork.
- Preserve the original files where useful; repeated graphics should be shared/cacheable. Do not rasterize away all the fine contour structure or treat stylized artwork as actual terrain data.

## Interaction inventory and production improvements

| Control | Existing meaningful behavior | Production foundation requirement |
| --- | --- | --- |
| Logo / nav / menu / all chapter links | Changes hash view, closes menu, resets scroll; active nav underline | Real route URLs, direct-load/refresh support, route titles, focus/scroll restoration |
| Menu button / Escape | Open/close panel; ARIA state | Visible close state, modal focus management and scroll lock |
| Atlas list buttons / geographic pins | Updates selected title, lead, region, link and pressed states | One shared selected-site state; keyboard/touch targets; accessible announcement |
| Atlas search | Case-insensitive name/region filtering | Controlled input, clear no-match state, preserve selectable map |
| Expedition progression | Four concept stages; visual guide/glow changes | Labeled range/readout; visible distinct states; no scientific-simulation claims |
| Subsurface range | Changes cutaway clip/seam/marker and percentage | Native keyboard/touch and synchronized values |
| Surface / Interior commands | Set 0% / 100% | Both commands work without WebGL |
| Evidence comparison | Changes second-image clip and divider | Keyboard/touch range with visible focus and meaningful readout |
| Source rows | Opens original publication | Valid hrefs; external relationship/security attributes |
| Page progress / hover / route appearance | Reading progress, image scale, shifted arrows, fade-rise | Purposeful motion with reduced-motion support; no scroll-jacking |

The original menu icon is not reset on every route change/Escape, its hidden panel does not make links inert, its mobile Subsurface screenshot has low-contrast header text, and it has no route-specific titles. These are prototype defects to repair while preserving the direction.

## Original source register

These are exact source links inherited from the design. They are linked references only, not evidence that their media has been included or licensed for this project.

1. [USGS — 2018 Kīlauea image/video catalogue](https://www.usgs.gov/data/image-and-video-catalog-2018-summit-collapse-and-lower-east-rift-zone-eruption-kilauea-volcano). The prototype describes 10,334 photographs / 428 videos and labels it `USGS / 2026`; those catalogue counts and publication labels require source review before an authoritative publication.
2. [USGS — Mount St. Helens before and after the 1980 eruption](https://www.usgs.gov/media/images/mount-st-helens-and-after-1980-eruption).
3. [USGS / Landsat — Mount St. Helens 1973 and 1983](https://www.usgs.gov/media/before-after/mount-st-helens-1973-1983).
4. [Smithsonian Global Volcanism Program — Volcanoes of the World](https://volcano.si.edu/). Chapter links: [St. Helens 321050](https://volcano.si.edu/volcano.cfm?vn=321050), [Etna 211060](https://volcano.si.edu/volcano.cfm?vn=211060), [Vesuvius 211020](https://volcano.si.edu/volcano.cfm?vn=211020).
5. [Icelandic Meteorological Office — conditions and reuse terms](https://en.vedur.is/about-imo/the-web/conditions/). This is a terms page, not an eruption-history source; a future authoritative Reykjanes record needs a specific scientific/monitoring publication as well.
6. [INGV — Etna lava flow research data](https://www.pi.ingv.it/banche-dati/2005-04-etna-lava-flow-data/).
7. [EU Copernicus Data Space](https://dataspace.copernicus.eu/). This portal is the inherited Tajogaite starting point, not a specific 2021 event footprint or aligned image pair.
8. [USGS — July 2019 airborne LiDAR elevation model of Kīlauea](https://www.usgs.gov/data/digital-elevation-model-klauea-volcano-hawaii-based-july-2019-airborne-lidar-surveys).

## Phase 2 boundary

The stable foundation should retain all public editorial content, original assets, transparent interpretation labels and working controls; support a single shared future WebGL stage; and keep the DOM/SVG route usable without GPU support. Phase 2 can replace selected conceptual views with checked and licensed georeferenced terrain, real aligned before/after products and richer scene transitions. It must add asset-specific attribution, scientific review, real-device profiling and formal accessibility/performance evaluation before making any stronger scientific or award-readiness claims.
