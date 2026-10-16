# Kīlauea measured terrain

The interactive Kīlauea terrain uses real USGS 3DEP bare-earth elevation samples. It is a deliberately reduced, archived visualization of an approximately **8.40 × 8.30 km** summit area. The V02 conceptual illustrations remain illustrative assets; they are not inputs to this DEM pipeline.

## Source, rights, and time

- **Product:** USGS 1/3 Arc Second n20w156 **20250611**.
- **Original COG:** [USGS GeoTIFF](https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/current/n20w156/USGS_13_n20w156.tif), 343,288,327 bytes. The pipeline reads intersecting COG blocks using HTTP range requests; it does not retain the full tile.
- **Original metadata:** [USGS FGDC XML](https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/current/n20w156/USGS_13_n20w156.xml), retained verbatim with the crop.
- **Rights:** USGS 3DEP public domain. The [official products page](https://www.usgs.gov/3d-elevation-program/about-3dep-products-services) states that products are free and have no use restrictions; the [USGS seamless DEM specifications](https://pubs.usgs.gov/tm/11b9/tm11B9.pdf) explicitly identifies all 3DEP products as public domain. Credit: **U.S. Geological Survey, 3D Elevation Program**. The original metadata's use constraints and disclaimer are retained.
- **Source epoch:** the product metadata spans **1 January 1954–9 July 2023**. Publication in June 2025 is not a survey date. The acquisition date in our manifest records downloading this crop, not measuring the volcano. The exact observation date at an individual summit pixel is unresolved. Do not describe the mesh as current terrain or a single 2023 survey.
- **Datum:** the retained XML reports NAD83 / GRS80 horizontally and **North American Vertical Datum of 1988**, in meters, vertically. The regional applicability of that vertical-datum declaration in Hawaiʻi has not been independently validated. This exhibition is not a survey or hazard model.

A freshness discrepancy was found during source research: the 3DEP ImageServer catalog's tile 4369 described a 2023 product, while its `current` S3 URL and actual XML described the 2025 product. The pipeline therefore reads the actual COG directly and records its HTTP ETag/Last-Modified plus the retained crop's SHA-256. The older service record is research evidence only, not the controlling source.

## Files and encoding

The retained source bundle is [`data/terrain-source/kilauea/`](../data/terrain-source/kilauea/): a **1,367,190-byte** native-resolution GeoTIFF crop, the original XML, and `acquisition.json`. The crop is **865 × 811** float32 cells in EPSG:4269. Its min/max are **946.040588–1367.180298 m**. All **701,515** cells are finite; none are nodata.

Public assets live in [`public/terrain/kilauea/`](../public/terrain/kilauea/):

| Asset | Sampling / size | Raw bytes |
| --- | --- | ---: |
| `terrain-low.bin` | 129 × 129; approximately 65.64 × 64.86 m spacing | 33,282 |
| `terrain-high.bin` | 257 × 257; approximately 32.82 × 32.43 m spacing | 132,098 |
| `preview.webp` | 768 × 720 DEM-derived hillshade | 19,106 |
| `metadata.json` | Extent, source, rights, epoch, datum, sizes, SHA-256 values, preprocessing | about 4.4 KB |

Both grids are row-major **unsigned 16-bit little-endian** values. Row zero is north; column zero is west. Decode a sample as:

```text
elevationMeters = min + (sample / 65535) × (max − min)
```

Both levels share the crop's min/max. Bounds describe the source pixel **centers**, so endpoint vertices align with their declared positions:

```text
west  -155.3249583817634     east  -155.24495836190286
south   19.372541747061856   north   19.447541767957436
```

The native 1/3-arc-second sample spacing is approximately 9.7 m east-west and 10.2 m north-south here. The browser grids are coarser bilinear point samples; additional display vertices do not imply finer measured resolution. Width/depth use local WGS84 ellipsoid parallel/meridian lengths. NAD83-to-WGS84 display bounds use PROJ; these study coordinates are not surveyed field markers.

No synthetic elevation, nodata filling, smoothing, or vertical scaling is baked into the grid. The viewer's **1.5× vertical exaggeration** is a display choice. Quantization contributes at most **0.003213 m** error relative to each resampled value; this is encoding error, **not** the source's vertical accuracy. Source measurement error and resampling loss are larger and are not inferred from that number.

The preview is shaded from DEM gradients with light at azimuth 315° / altitude 45° and a mineral color ramp. It is cartography, not satellite/aerial photography. Low/high mesh topology corresponds to 32,768 / 131,072 surface triangles before any optional skirt or annotations.

## Reproduce and validate offline

Python 3.13 was used for the recorded run. Create an isolated environment; the terrain tools do not add npm dependencies:

```bash
python3 -m venv /tmp/nyl-terrain
/tmp/nyl-terrain/bin/pip install -r scripts/requirements-terrain.txt
/tmp/nyl-terrain/bin/python scripts/process-dem.py
/tmp/nyl-terrain/bin/python scripts/verify-terrain.py
```

Default processing is offline. It verifies the retained crop and XML checksums before producing assets. The verification checks completeness, encoding, north/south orientation, the quantization bound, public checksums, and byte-identical regeneration of both grids, the preview, and metadata. The recorded run passed all checks. Pinned Python packages and GDAL/WebP versions are recorded with the metadata; changing encoder/runtime versions can change output bytes.

Refreshing the source is a deliberate separate operation:

```bash
/tmp/nyl-terrain/bin/python scripts/process-dem.py --acquire
```

That command accesses the mutable USGS `current` object, writes a new acquisition record, and regenerates assets. Review source metadata, dates, extent, checksums, and visual changes before accepting a refresh. The public page needs no API key or runtime data service; it loads these local assets.
