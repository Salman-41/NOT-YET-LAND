# Expedition research implementation / Phase 3

Completed 17 October 2026 in the existing Phase 2 repository. The original V02 wordmark, chapter introductions, conceptual hero art, typography, navigation, route structure, atlas and shared terrain/section architecture remain. The former identical four-step expedition module has been replaced by six separately authored investigations.

## What visitors can investigate

| Expedition | Signature interaction | Verified record | Explicitly illustrative or limited |
| --- | --- | --- | --- |
| Kīlauea / Living surface | Dated map desk, date slider/buttons, map enlargement and three evidence annotations | HVO operational lava-footprint maps dated 8 May, 10 June and 7 August 2018; original fissures, roads, scale, coastline and legend retained | Three snapshots, not a continuous eruption simulation. Extents change. Lower Puna maps are geographically separate from the retained summit DEM study. |
| Reykjanes / Fracture | Vertical episode selector; thermal/optical fields, mapped-fissure view and plate-setting diagram | December 2023, January 2024 and May 2024 episodes; NASA January/June observations; Rhodes et al. Figure 7 maps six 2023–2024 fissure episodes | January/June images have different framing and sensing methods. Dashed screen locator is not a boundary. Plate diagram is conceptual. Published figure distinguishes inferred faults. No new fissure lengths. |
| Mount St. Helens / Collapse | Genuine satellite comparison, qualitative missing-flank reveal, reported elevation change and four-event timeline | USGS paired 1973/1983 imagery, dated chronology and reported 9,677-to-8,363 ft summit reduction | Drawn silhouette is not a DEM morph. No aligned pre/post elevation models were acquired. The 1983 image includes three years of later change. |
| Etna / Accumulation | Independently toggled historical deposit classes and enlarged summit/fissure symbols | INGV DANTE published map and historical catalogue; documented 1669, 1928 and 1991 entries retained in the extract | Approximate raster color separation, not scientific vector delineation or deposit thickness. Original map is only 500 × 595 px. “Present” belongs to the publisher’s map. |
| Tajogaite / Aftermath | Dated satellite comparison with whole-landscape, Atlantic-edge and inhabited-landscape lenses | Landsat 8 OLI natural-color imagery of 21 May and 15 December 2021 | Identical crop transforms applied to both images. Clouds remain. No land-area, damage, building-count or elevation-change calculation. |
| Vesuvius / Buried world | Illustrated excavation with four selectable units, exposure slider and three evidence voices | INGV regional EU1–EU8 synthesis supports selected EU1–EU4; Pliny 6.16/6.20 supports historical testimony | Original generalized diagram, arbitrary thicknesses, imagined masonry; not a surveyed archaeological section. Testimony and modern correlation remain separate. Calendar dating is debated. |

These modules use DOM, SVG and native form controls. They add no WebGL contexts or runtime services. The existing measured Kīlauea summit terrain remains separately accessible; the existing subsurface model remains generalized and interpretive.

## Evidence room and provenance

`app/data/sources.ts` contains **14 typed research records**, including the retained summit DEM and reference-only records. Each records publisher, original URL, observation date, publication/release date, coverage, measurement, rights, required attribution, processing, evidence classification and limitations. `npm run build` exports the register as [`public/research/sources.json`](../public/research/sources.json).

`/evidence` filters by volcano and evidence type, supports source-specific deep links, compares two genuine publisher pairs, browses dated HVO maps, and exposes the original source, terms, permitted display-asset downloads and expedition links. Empty filter results have a working reset. Scientific uncertainty is visible alongside the record. No unrelated concept illustrations are used as before/after imagery.

## Data licensing report

Rights below apply to the identified scientific inputs, not to this repository as a whole. No dataset limited to non-commercial use was imported. No external credentials are needed.

| Input / records | Publisher and primary source | Reuse basis and attribution | Processing and retained limitations |
| --- | --- | --- | --- |
| HVO 2018 mapped footprints | [USGS HVO map time series](https://www.usgs.gov/media/videos/time-series-kilauea-volcanos-lower-east-rift-zone-lava-flow-maps) | Source explicitly identifies public domain. Credit USGS Hawaiian Volcano Observatory. | Three original frames decoded from the retained MP4, reduced from 3300 × 2550 to 2200 × 1700 WebP. All map labels/legend retained. Actual decoded presentation timestamps recorded. |
| 2018 individual-flow vectors, reference only | [USGS release, DOI 10.5066/P9S7UQKQ](https://doi.org/10.5066/P9S7UQKQ) | USGS public-domain release; catalogue XML retained. | ScienceBase acquisition returned HTTP 403. No vector data redistributed or fabricated. Accessible HVO raster maps provide real mapped boundaries instead. |
| Reykjanes thermal and optical observations | [NASA January observation](https://science.nasa.gov/earth/earth-observatory/new-fissures-spill-lava-in-iceland-152344/), [NASA June observation](https://science.nasa.gov/image-detail/icelanderuption-oli-20240602/) | [NASA Earth Observatory reuse policy](https://science.nasa.gov/blogs/earth-matters/2012/04/10/share-and-share-alike/) permits commercial reuse; these selected images credit Lauren Dauphin using USGS Landsat data. | January 16 is Landsat 9 TIRS-2 thermal over DEM. June 2 is infrared-enhanced optical imagery. WebP conversion; no invented outlines. |
| Svartsengi mapped fissures, Figure 7 | [Rhodes et al. 2026, Bulletin of Volcanology 88, 89](https://doi.org/10.1007/s00445-026-02006-3), [Oxford original PDF](https://ora.ox.ac.uk/objects/uuid:60bae2b3-ff81-4711-bd0b-33f107111c56/files/rft848t35r) | Article and included figures CC BY 4.0 unless otherwise credited; no exclusion appears for Figure 7. Credit Rhodes, Pyle, Mather, Pedersen and Parks; ÍslandsDEM (2025), Landmælingar Íslands; older faults/crater/lava outlines after Jenness & Clifton (2009). [Iceland open-data terms](https://www-gamli.lmi.is/landupplysingar/leyfi-fyrir-gjaldfrjals-gogn/) identify CC BY 4.0. Downloaded 17 October 2026. | Extract the original embedded Figure 7 from PDF page 9, retain all panels, legend and scale, convert WebP. No Figure 2 Bing basemap is used. Inferred faults remain inferred; gray lava outlines are older, not the recent fields. |
| Selected eruption chronology | [Icelandic Meteorological Office archive](https://en.vedur.is/about-imo/news/volcanic-unrest-grindavik-older-updates), [conditions](https://en.vedur.is/about-imo/the-web/conditions/) | Factual dates summarized in original prose. No IMO report maps, photographs or prose redistributed. | Selected historical chronology, not a complete or live hazard catalogue. |
| Mount St. Helens pair and chronology | [USGS paired imagery](https://www.usgs.gov/media/before-after/mount-st-helens-1973-1983), [Fact Sheet 036-00](https://pubs.usgs.gov/fs/2000/fs036-00/), [reawakening](https://pubs.usgs.gov/gip/msh/reawakening.html) | Pair explicitly public domain. Credit USGS Landsat Missions / EROS. Historical accounts summarized in original prose. | Preserve publisher equal-dimension framing, encode WebP; no registration, DEM subtraction or instantaneous-collapse claim. Source pair provides years, not acquisition days. |
| Etna DANTE historical map and catalogue | [INGV DANTE / DOI 10.13127/etna/dante](https://doi.org/10.13127/etna/dante), [INGV metadata](https://data.ingv.it/dataset/1112) | DANTE states CC BY 4.0. Credit Branca, Del Carlo, Behncke and Bonfanti (2025), INGV. | Full published map retained; approximate RGB/HSV class masks separately identified as our processing. Catalogue extract retains selected original rows. No vector accuracy or deposit-volume claim. |
| Tajogaite / La Palma Landsat pair | [NASA, A Changed Landscape on La Palma](https://science.nasa.gov/earth/earth-observatory/a-changed-landscape-on-la-palma-149231/) | NASA reuse policy above; credit Lauren Dauphin using USGS Landsat data. Selected images have no third-party exclusion. | Retain matched publisher framing and natural color, convert WebP; clouds remain. No OpenTopography non-commercial DSM is imported. |
| Vesuvius regional synthesis | [INGV Osservatorio Vesuviano](https://www.ov.ingv.it/index.php/storia-vesuvio/pompei) | Reference only. No institutional art, prose or proprietary stratigraphic drawing copied. Credit synthesis edited by F. Sansivero. | Original explanatory writing and original generalized drawing; selected EU1–EU4 rather than complete regional sequence. |
| Historical testimony | [Pliny 6.16](https://dcc.dickinson.edu/pliny-letters/6-16), [Pliny 6.20](https://dcc.dickinson.edu/pliny-letters/6-20) | Reference only. No modern edition, commentary or translation reproduced. | Original brief summaries distinguish retrospective testimony from modern geological correlation. |
| Retained Kīlauea summit elevation | [USGS 3DEP](https://www.usgs.gov/3d-elevation-program/about-3dep-products-services) | Public domain; credit USGS 3D Elevation Program. See [terrain audit](TERRAIN_DATA.md). | Mixed observation epochs, unresolved exact summit date and regional vertical-datum applicability. Not a 2018 before/after model. |

Existing Natural Earth atlas assets and V02 art have separate provenance in [ATLAS_DATA.md](ATLAS_DATA.md) and [REFERENCE_AUDIT.md](REFERENCE_AUDIT.md). No rights for original V02 art are invented here.

## Reproduction and measured asset budget

- Run `scripts/prepare-expedition-evidence.py` with the pinned `scripts/requirements-evidence.txt` environment and Poppler `pdfimages`. Normal operation is offline; `--download` restores missing originals.
- Retained pipeline inputs: **76,808,342 bytes**. These stay under `source/expeditions/` and are not copied into static deployment.
- Optimized runtime evidence: **15 files / 3,656,287 bytes** in total, excluding registry/manifest metadata. Images load lazily; this total is not a single-page transfer measurement.
- SHA-256 hashes, byte sizes, dimensions, frame timestamps and class-pixel counts: [`public/research/manifest.json`](../public/research/manifest.json).
- An offline rerun reproduced **17 files byte for byte**, including the manifest and generated frame catalogue.
- No new dependencies were added to the application. Existing lazy Three and MapLibre chunks still produce Vite size warnings. No new FPS, heap, Lighthouse or network-speed benchmark is claimed for this phase.

## Validation

- Typecheck: passed with React Router route generation and TypeScript strict checking.
- Production build: passed; all 12 public URLs prerendered to `build/client`. Existing lazy engine chunk-size and Router v8 migration warnings remain informational.
- Vitest: **25 tests passed**, including complete registry fields, distinct volcano coverage, source/output SHA-256 checksums and paired image dimensions.
- New browser suite: **20 tests passed** across six desktop instruments, six mobile instruments, six touch journeys and two Evidence room journeys. Native keyboard controls, visible changes, source deep links, registry download, loaded images and horizontal overflow are checked. Reduced-motion preference is exercised.
- Full regression: final results recorded after completion below. These are Chromium/headless browser observations, not physical-device certification or a claim of universal assistive-technology coverage.

Screenshots capture the signature modules after meaningful interaction at **1440 × 1000** and **390 × 844** viewport sizes. Element captures include the complete instrument; their image heights can exceed the viewport. The global fixed reading-progress bar is hidden only during these element captures.

| Instrument | Desktop | Mobile |
| --- | --- | --- |
| Kīlauea map desk | [1440 px](../artifacts/expeditions/kilauea-1440.png) | [390 px](../artifacts/expeditions/kilauea-390.png) |
| Reykjanes mapped fissures | [1440 px](../artifacts/expeditions/reykjanes-1440.png) | [390 px](../artifacts/expeditions/reykjanes-390.png) |
| Mount St. Helens missing-flank explanation | [1440 px](../artifacts/expeditions/st-helens-1440.png) | [390 px](../artifacts/expeditions/st-helens-390.png) |
| Etna historical deposits | [1440 px](../artifacts/expeditions/etna-1440.png) | [390 px](../artifacts/expeditions/etna-390.png) |
| Tajogaite Atlantic-edge comparison | [1440 px](../artifacts/expeditions/tajogaite-1440.png) | [390 px](../artifacts/expeditions/tajogaite-390.png) |
| Vesuvius excavation | [1440 px](../artifacts/expeditions/vesuvius-1440.png) | [390 px](../artifacts/expeditions/vesuvius-390.png) |

[Evidence room after filtering and comparison](../artifacts/expeditions/evidence-room.png). The broader route suite also captures all 12 public routes at 320, 390, 768, 1024, 1440 and 1920 px.

## Remaining research opportunities

Acquire the HVO vector release when its endpoint is accessible; add properly licensed aligned pre/post St. Helens DEMs before attempting measured terrain morphing; replace Etna’s approximate color separation with source geological vectors if a suitable release is obtained; add original georeferenced fissure vectors instead of the published raster figure; and add site-specific measured Vesuvius excavation logs with suitable reuse rights. These are extensions, not evidence silently implied by the present controls.
