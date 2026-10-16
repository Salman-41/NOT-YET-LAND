#!/usr/bin/env python3
"""Acquire a bounded USGS COG window, then reproducibly build browser DEM assets.

Default operation is offline and verifies the retained source crop's SHA-256.
Use --acquire explicitly to refresh the source from USGS. No synthetic elevation,
nodata filling, random displacement, smoothing, or vertical exaggeration is baked
into the binary grids. The viewer applies the documented exaggeration separately.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import platform
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, features
import rasterio
from rasterio.windows import Window, from_bounds
from rasterio.warp import transform_bounds

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "data/terrain-source/kilauea"
OUTPUT_DIR = ROOT / "public/terrain/kilauea"
SOURCE_URL = (
    "https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation/13/TIFF/current/"
    "n20w156/USGS_13_n20w156.tif"
)
XML_URL = SOURCE_URL.removesuffix(".tif") + ".xml"
LICENSE_URL = "https://www.usgs.gov/3d-elevation-program/about-3dep-products-services"
LICENSE_EVIDENCE = "https://pubs.usgs.gov/tm/11b9/tm11B9.pdf"
AOI = (-155.325, 19.3725, -155.245, 19.4475)  # west, south, east, north; WGS84
SOURCE_FILE = "usgs-13-n20w156-kilauea-crop.tif"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, value: dict) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def xml_text(root: ET.Element, path: str) -> str:
    node = root.find(path)
    return " ".join(" ".join(node.itertext()).split()) if node is not None else ""


def acquire(source_dir: Path) -> None:
    """Read only intersecting native-resolution COG blocks using HTTP ranges."""
    import requests

    source_dir.mkdir(parents=True, exist_ok=True)
    head = requests.head(SOURCE_URL, timeout=45)
    head.raise_for_status()
    response = requests.get(XML_URL, timeout=45)
    response.raise_for_status()
    metadata_root = ET.fromstring(response.content)
    metadata_path = source_dir / "USGS_13_n20w156.xml"
    metadata_path.write_bytes(response.content)
    with rasterio.Env(
        GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
        CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
        GDAL_HTTP_TIMEOUT="60",
        GDAL_HTTP_MAX_RETRY="2",
    ):
        with rasterio.open(SOURCE_URL) as dataset:
            target_bounds = transform_bounds("EPSG:4326", dataset.crs, *AOI)
            requested = from_bounds(*target_bounds, transform=dataset.transform)
            left, top = math.floor(requested.col_off), math.floor(requested.row_off)
            right = math.ceil(requested.col_off + requested.width)
            bottom = math.ceil(requested.row_off + requested.height)
            window = Window(left, top, right - left, bottom - top)
            values = dataset.read(1, window=window, masked=True)
            if np.ma.getmaskarray(values).any() or not np.isfinite(values.data).all():
                raise ValueError("Source crop contains nodata/non-finite values; no filling is permitted")
            transform = dataset.window_transform(window)
            crop = source_dir / SOURCE_FILE
            with rasterio.open(
                crop, "w", driver="GTiff", width=window.width, height=window.height,
                count=1, dtype="float32", crs=dataset.crs, transform=transform,
                nodata=dataset.nodata, compress="deflate", predictor=3,
                tiled=True, blockxsize=256, blockysize=256,
            ) as destination:
                destination.write(values.data.astype("float32"), 1)
                destination.update_tags(AREA_OR_POINT="Area")
            record = {
                "acquiredAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "sourceUrl": SOURCE_URL,
                "sourceMetadataUrl": XML_URL,
                "sourceTitle": xml_text(metadata_root, ".//citation/citeinfo/title"),
                "sourcePublicationDate": xml_text(metadata_root, ".//citation/citeinfo/pubdate"),
                "sourcePeriod": {
                    "begin": xml_text(metadata_root, ".//timeperd/timeinfo/rngdates/begdate"),
                    "end": xml_text(metadata_root, ".//timeperd/timeinfo/rngdates/enddate"),
                },
                "publisherVerticalDatum": xml_text(metadata_root, ".//vertdef/altsys/altdatum"),
                "publisherVerticalUnits": xml_text(metadata_root, ".//vertdef/altsys/altunits"),
                "useConstraints": xml_text(metadata_root, ".//useconst"),
                "http": {key: head.headers.get(key) for key in (
                    "ETag", "Last-Modified", "Content-Length", "Accept-Ranges"
                )},
                "requestedBounds": dict(zip(("west", "south", "east", "north"), AOI)),
                "requestedBoundsCrs": "EPSG:4326",
                "sourceCrs": dataset.crs.to_string(),
                "sourcePixelSize": list(dataset.res),
                "sourceRasterSize": {"width": dataset.width, "height": dataset.height},
                "window": {"column": left, "row": top, "width": right-left, "height": bottom-top},
                "crop": {"file": SOURCE_FILE, "bytes": crop.stat().st_size, "sha256": sha256(crop)},
                "xml": {"file": metadata_path.name, "bytes": metadata_path.stat().st_size,
                        "sha256": sha256(metadata_path)},
            }
    write_json(source_dir / "acquisition.json", record)
    print(f"Acquired native-resolution crop: {record['crop']['bytes']:,} bytes")


def geographic_lengths(west: float, south: float, east: float, north: float) -> tuple[float, float]:
    """WGS84 ellipsoid local parallel/meridian lengths, suitable for this ~8km AOI."""
    latitude = math.radians((south + north) / 2)
    eccentricity_squared = 6.6943799901413165e-3
    divisor = 1 - eccentricity_squared * math.sin(latitude) ** 2
    prime_vertical = 6378137 / math.sqrt(divisor)
    meridional = 6378137 * (1 - eccentricity_squared) / divisor ** 1.5
    return (
        math.radians(east-west) * prime_vertical * math.cos(latitude),
        math.radians(north-south) * meridional,
    )


def resample_vertices(values: np.ndarray, size: int) -> np.ndarray:
    """Bilinear point sampling including the four native corner pixel centers."""
    xs = np.linspace(0, values.shape[1]-1, size, dtype=np.float64)
    ys = np.linspace(0, values.shape[0]-1, size, dtype=np.float64)
    x0, y0 = np.floor(xs).astype(int), np.floor(ys).astype(int)
    x1, y1 = np.minimum(x0+1, values.shape[1]-1), np.minimum(y0+1, values.shape[0]-1)
    fx, fy = xs-x0, ys-y0
    upper = values[y0[:, None], x0] * (1-fx) + values[y0[:, None], x1] * fx
    lower = values[y1[:, None], x0] * (1-fx) + values[y1[:, None], x1] * fx
    return upper * (1-fy[:, None]) + lower * fy[:, None]


def build(source_dir: Path, output_dir: Path) -> dict:
    acquisition = json.loads((source_dir / "acquisition.json").read_text(encoding="utf-8"))
    if not acquisition["sourceTitle"] or not acquisition["publisherVerticalDatum"] or acquisition["publisherVerticalUnits"] != "meters":
        raise ValueError("Source title, publisher datum, and metre units must be explicitly documented")
    source_path = source_dir / acquisition["crop"]["file"]
    if sha256(source_path) != acquisition["crop"]["sha256"]:
        raise ValueError("Retained source checksum differs from acquisition.json")
    if sha256(source_dir / acquisition["xml"]["file"]) != acquisition["xml"]["sha256"]:
        raise ValueError("Retained source metadata checksum differs from acquisition.json")
    with rasterio.open(source_path) as dataset:
        if dataset.count != 1 or dataset.transform.e >= 0 or dataset.transform.b != 0 or dataset.transform.d != 0:
            raise ValueError("Expected a single-band north-up, non-rotated DEM")
        masked = dataset.read(1, masked=True)
        if np.ma.getmaskarray(masked).any() or not np.isfinite(masked.data).all():
            raise ValueError("Nodata/non-finite elevations are not silently repaired")
        values = masked.data.astype(np.float64)
        minimum, maximum = float(values.min()), float(values.max())
        if maximum <= minimum:
            raise ValueError("Expected real relief in the source DEM")
        # Bounds describe vertex positions, not the outer edges of source cells.
        west, north = dataset.xy(0, 0)
        east, south = dataset.xy(dataset.height-1, dataset.width-1)
        west, south, east, north = transform_bounds(dataset.crs, "EPSG:4326", west, south, east, north)
        width_meters, depth_meters = geographic_lengths(west, south, east, north)
        native_width, native_height = dataset.width, dataset.height
        native_crs = dataset.crs.to_string()
        native_transform = list(dataset.transform)[:6]
    output_dir.mkdir(parents=True, exist_ok=True)
    grids = {}
    for name, size in (("low", 129), ("high", 257)):
        sampled = resample_vertices(values, size)
        quantized = np.rint(np.clip((sampled-minimum)/(maximum-minimum), 0, 1)*65535).astype("<u2")
        path = output_dir / f"terrain-{name}.bin"
        path.write_bytes(quantized.tobytes(order="C"))
        reconstructed = minimum + quantized.astype(np.float64)/65535*(maximum-minimum)
        grids[name] = {
            "url": f"/terrain/kilauea/{path.name}", "width": size, "height": size,
            "bytes": path.stat().st_size, "sha256": sha256(path),
            "sampleSpacingMeters": {"x": width_meters/(size-1), "y": depth_meters/(size-1)},
            "maxQuantizationErrorMeters": float(np.max(np.abs(reconstructed-sampled))),
        }
    # Derived cartographic preview: a DEM hillshade, never satellite/aerial imagery.
    dx, dy = width_meters/(native_width-1), depth_meters/(native_height-1)
    slope_south, slope_east = np.gradient(values, dy, dx)
    light = np.array([-0.5, 0.5, math.sqrt(0.5)])  # NW / altitude 45deg
    illumination = (-slope_east*light[0] + slope_south*light[1] + light[2]) / np.sqrt(1+slope_east**2+slope_south**2)
    normalized = (values-minimum)/(maximum-minimum)
    low_color, high_color = np.array([58, 58, 50]), np.array([205, 196, 166])
    colors = low_color + normalized[..., None]*(high_color-low_color)
    colors *= (0.3+0.7*np.maximum(0, illumination))[..., None]
    image = Image.fromarray(np.rint(np.clip(colors, 0, 255)).astype("uint8"), mode="RGB")
    image.thumbnail((768, 768), Image.Resampling.BILINEAR)
    preview_path = output_dir / "preview.webp"
    image.save(preview_path, "WEBP", quality=88, method=6)
    metadata = {
        "id": "kilauea-summit-usgs-3dep", "title": "Kīlauea summit — USGS 3DEP archived elevation",
        "source": {
            "title": acquisition["sourceTitle"], "url": SOURCE_URL,
            "metadataUrl": XML_URL, "publisher": "U.S. Geological Survey",
            "license": "Public domain — USGS 3DEP", "licenseUrl": LICENSE_URL,
            "licenseEvidenceUrl": LICENSE_EVIDENCE,
            "publicationDate": acquisition["sourcePublicationDate"],
            "sourcePeriod": acquisition["sourcePeriod"],
            "epochSummary": (
                f"Mixed source acquisitions, {acquisition['sourcePeriod']['begin'][:4]}–"
                f"{acquisition['sourcePeriod']['end'][:4]}; published {acquisition['sourcePublicationDate'][:4]}. "
                "Not a live or single-date survey."
            ),
            "nativeResolutionArcSeconds": 1/3,
            "nativeResolutionMeters": {"x": dx, "y": dy},
            "sourceArtifact": {"path": str(source_path.relative_to(ROOT)), **acquisition["crop"]},
            "http": acquisition["http"],
        },
        "bounds": {"west": west, "south": south, "east": east, "north": north},
        "crs": "EPSG:4326", "sourceCrs": native_crs,
        "widthMeters": width_meters, "depthMeters": depth_meters,
        "elevation": {
            "min": minimum, "max": maximum, "unit": "m",
            "datum": acquisition["publisherVerticalDatum"],
            "datumNote": "Publisher reports NAVD 88. Regional datum applicability in Hawaiʻi has not been independently validated; do not use this model for survey or hazard decisions.",
        },
        "encoding": {"type": "uint16", "byteOrder": "little-endian", "layout": "row-major",
                     "rowZero": "north", "columnZero": "west", "normalizedRange": [0, 65535],
                     "decode": "min + (value / 65535) * (max - min)"},
        "grids": grids, "verticalExaggeration": 1.5,
        "acquiredAt": acquisition["acquiredAt"],
        "preview": {"url": "/terrain/kilauea/preview.webp", "width": image.width, "height": image.height,
                    "bytes": preview_path.stat().st_size, "sha256": sha256(preview_path),
                    "kind": "DEM-derived hillshade; not aerial imagery", "azimuthDegrees": 315, "altitudeDegrees": 45},
        "preprocessing": {
            "sourceWidth": native_width, "sourceHeight": native_height,
            "sourceTransform": native_transform,
            "sampling": "Bilinear point resampling at vertex centers; no upsampling beyond native DEM resolution",
            "quantization": "One shared crop min/max for both grids; round to nearest unsigned 16-bit integer",
            "nodata": "Rejected; no nodata filling", "elevationModification": "None; 1.5x exaggeration is viewer-only",
            "horizontalScale": "Local WGS84 ellipsoid parallel and meridian lengths at the crop midpoint",
            "software": {"python": platform.python_version(), "numpy": np.__version__,
                         "rasterio": rasterio.__version__, "gdal": rasterio.__gdal_version__,
                         "pillow": Image.__version__, "webp": features.version("webp")},
        },
    }
    write_json(output_dir / "metadata.json", metadata)
    print(json.dumps({"bounds": metadata["bounds"], "elevation": metadata["elevation"],
                      "widthMeters": width_meters, "depthMeters": depth_meters,
                      "grids": grids, "previewBytes": preview_path.stat().st_size}, indent=2))
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--acquire", action="store_true", help="Explicitly refresh the retained source via USGS HTTP ranges")
    parser.add_argument("--source-dir", type=Path, default=SOURCE_DIR)
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    args = parser.parse_args()
    if args.acquire:
        acquire(args.source_dir)
    build(args.source_dir, args.output_dir)


if __name__ == "__main__":
    main()
