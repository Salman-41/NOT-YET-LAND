#!/usr/bin/env python3
"""Build local Atlas geography from official Natural Earth ZIPs (Pillow only).

python3 scripts/prepare-atlas-geography.py --land-zip /tmp/ne_10m_land.zip \
  --coast-zip /tmp/ne_10m_coastline.zip --relief-zip /tmp/SR_50M.zip
Inputs remain unchanged. Output is display cartography, never an elevation model.
"""
import argparse
import hashlib
import io
import json
import math
import struct
from pathlib import Path
from zipfile import ZipFile

from PIL import Image, ImageDraw

DEST = Path(__file__).resolve().parents[1] / 'public' / 'geography'
FIELD_CENTRES = [(-155.287, 19.421), (-22.383, 63.883), (-122.18, 46.2), (14.999, 37.748), (-17.865, 28.615), (14.426, 40.821)]
MAX_LAT = 85.0511287798066


def xy(point, width=1440):
    longitude, latitude = point
    latitude = max(-MAX_LAT, min(MAX_LAT, latitude))
    return ((longitude + 180) / 360 * width,
            (1 - math.asinh(math.tan(math.radians(latitude))) / math.pi) / 2 * width)


def area(ring):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:])) / 2


def simplify_line(points, tolerance):
    if len(points) <= 2:
        return points
    first, last = points[0], points[-1]
    dx, dy = last[0] - first[0], last[1] - first[1]
    length = dx * dx + dy * dy
    maximum, index = 0, 0
    for i, p in enumerate(points[1:-1], 1):
        t = max(0, min(1, ((p[0] - first[0]) * dx + (p[1] - first[1]) * dy) / length)) if length else 0
        distance = (p[0] - first[0] - t * dx) ** 2 + (p[1] - first[1] - t * dy) ** 2
        if distance > maximum:
            maximum, index = distance, i
    if maximum > tolerance * tolerance:
        return simplify_line(points[:index + 1], tolerance)[:-1] + simplify_line(points[index:], tolerance)
    return [first, last]


def simplify_ring(ring):
    # Keep higher resolution in the six field regions; the public overview is
    # generalized elsewhere. Never interpolate or invent a coastline.
    small_region = max(p[0] for p in ring) - min(p[0] for p in ring) < 16 and max(p[1] for p in ring) - min(p[1] for p in ring) < 16
    near = small_region and any(any(abs(p[0] - lon) < 3 and abs(p[1] - lat) < 3 for lon, lat in FIELD_CENTRES) for p in ring[::max(1, len(ring) // 80)])
    tolerance = 0.0025 if near else 0.04
    middle = len(ring) // 2
    reduced = simplify_line(ring[:middle + 1], tolerance)[:-1] + simplify_line(ring[middle:], tolerance)
    if len(reduced) < 4:
        reduced = ring[::max(1, (len(ring) - 1) // 3)][:3] + [ring[0]]
    reduced[-1] = reduced[0]
    return [[round(x, 5), round(y, 5)] for x, y in reduced]


def shapefile_polygons(data):
    offset = 100
    while offset + 8 < len(data):
        _, words = struct.unpack_from('>ii', data, offset)
        record = data[offset + 8:offset + 8 + words * 2]
        offset += 8 + words * 2
        if struct.unpack_from('<i', record)[0] != 5:
            continue
        part_count, point_count = struct.unpack_from('<ii', record, 36)
        starts = list(struct.unpack_from(f'<{part_count}i', record, 44)) + [point_count]
        points = list(struct.iter_unpack('<dd', record[44 + 4 * part_count:44 + 4 * part_count + point_count * 16]))
        polygons = []
        for start, end in zip(starts, starts[1:]):
            ring = points[start:end]
            if len(ring) < 4:
                continue
            hole = area(ring) > 0  # ESRI polygon exterior rings are clockwise.
            ring = simplify_ring(ring)
            ring.reverse()  # RFC 7946 exterior counterclockwise / holes clockwise.
            if hole and polygons:
                polygons[-1].append(ring)
            else:
                polygons.append([ring])
        yield polygons


def shapefile_lines(data):
    offset = 100
    while offset + 8 < len(data):
        _, words = struct.unpack_from('>ii', data, offset)
        record = data[offset + 8:offset + 8 + words * 2]
        offset += 8 + words * 2
        if struct.unpack_from('<i', record)[0] != 3:
            continue
        part_count, point_count = struct.unpack_from('<ii', record, 36)
        starts = list(struct.unpack_from(f'<{part_count}i', record, 44)) + [point_count]
        points = list(struct.iter_unpack('<dd', record[44 + 4 * part_count:44 + 4 * part_count + point_count * 16]))
        for start, end in zip(starts, starts[1:]):
            line = points[start:end]
            if len(line) > 3 and line[0] == line[-1]:
                yield simplify_ring(line)
            elif len(line) >= 2:
                yield [[round(x, 5), round(y, 5)] for x, y in simplify_line(line, .04)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--land-zip', type=Path, required=True)
    parser.add_argument('--coast-zip', type=Path, required=True)
    parser.add_argument('--relief-zip', type=Path, required=True)
    args = parser.parse_args()
    DEST.mkdir(parents=True, exist_ok=True)
    with ZipFile(args.land_zip) as archive:
        polygons = list(shapefile_polygons(archive.read('ne_10m_land.shp')))
        land_version = archive.read('ne_10m_land.VERSION.txt').decode().strip()
    features = [{'type': 'Feature', 'properties': {'source': 'Natural Earth'}, 'geometry': {'type': 'MultiPolygon', 'coordinates': p}} for p in polygons]
    collection = {'type': 'FeatureCollection', 'features': features}
    (DEST / 'land-10m.geojson').write_text(json.dumps(collection, separators=(',', ':')))
    with ZipFile(args.coast_zip) as archive:
        coastlines = list(shapefile_lines(archive.read('ne_10m_coastline.shp')))
        coast_version = archive.read('ne_10m_coastline.VERSION.txt').decode().strip()
    (DEST / 'coastline-10m.geojson').write_text(json.dumps({'type': 'Feature', 'properties': {'source': 'Natural Earth'}, 'geometry': {'type': 'MultiLineString', 'coordinates': coastlines}}, separators=(',', ':')))

    # Mathematical graticule, expressed in the same WGS84 longitude/latitude CRS.
    lines = []
    for longitude in range(-180, 181, 30):
        lines.append([[longitude, latitude] for latitude in range(-80, 86, 2)])
    for latitude in range(-60, 81, 20):
        lines.append([[longitude, latitude] for longitude in range(-180, 181, 2)])
    (DEST / 'graticule.geojson').write_text(json.dumps({'type': 'Feature', 'properties': {}, 'geometry': {'type': 'MultiLineString', 'coordinates': lines}}, separators=(',', ':')))

    with ZipFile(args.relief_zip) as archive:
        relief = Image.open(io.BytesIO(archive.read('SR_50M.tif'))).convert('L')
        relief_version = archive.read('SR_50M.VERSION.txt').decode().strip()
    size = 2048
    # Source GeoTIFF: EPSG:4326, west=-180, north=90, 1/30 degree/pixel.
    # Resample to Web Mercator with explicit inverse projection per 8px strip.
    mesh = []
    for y in range(0, size, 8):
        bottom = min(size, y + 8)
        lat_top = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / size))))
        lat_bottom = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * bottom / size))))
        source_top, source_bottom = (90 - lat_top) / 180 * relief.height, (90 - lat_bottom) / 180 * relief.height
        mesh.append(((0, y, size, bottom), (0, source_top, 0, source_bottom, relief.width, source_bottom, relief.width, source_top)))
    projected = relief.transform((size, size), Image.Transform.MESH, mesh, resample=Image.Resampling.BICUBIC)
    # Palette transfer preserves the actual source shading; there are no
    # fabricated contour/elevation values in this display-only raster.
    channels = [projected.point([round(max(0, min(255, base + (value - 206) * gain))) for value in range(256)]) for base, gain in [(52, .38), (69, .43), (57, .32)]]
    mineral = Image.merge('RGB', channels)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    for batch in polygons:
        for polygon in batch:
            for index, ring in enumerate(polygon):
                draw.polygon([xy(point, size) for point in ring], fill=255 if index == 0 else 0)
    mineral.putalpha(mask)
    mineral.save(DEST / 'relief-mercator.webp', quality=86, method=6)

    # Same projection and same land geometry in the no-WebGL fallback. Crop the
    # southern map at about 61°S to give the archive's six northern field sites
    # useful space; the interactive map still contains the complete globe.
    fallback = Image.new('RGB', (size, size), '#101b17')
    fallback.paste(mineral, mask=mineral.getchannel('A'))
    fallback_draw = ImageDraw.Draw(fallback)
    for line in lines:
        fallback_draw.line([xy(point, size) for point in line], fill='#23382c', width=1)
    for line in coastlines:
        fallback_draw.line([xy(point, size) for point in line], fill='#687c65', width=1)
    fallback.crop((0, 0, size, round(size * 1050 / 1440))).save(DEST / 'world-mercator.webp', quality=88, method=6)
    (DEST / 'world-mercator.svg').unlink(missing_ok=True)

    manifest = {
        'prepared': '2026-10-16',
        'license': 'Public domain',
        'licenseUrl': 'https://www.naturalearthdata.com/about/terms-of-use/',
        'land': {'version': land_version, 'url': 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_land.zip', 'sha256': hashlib.sha256(args.land_zip.read_bytes()).hexdigest(), 'generalizationDegrees': {'global': .04, 'fieldIslands': .0025}},
        'coastline': {'version': coast_version, 'url': 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_coastline.zip', 'sha256': hashlib.sha256(args.coast_zip.read_bytes()).hexdigest()},
        'relief': {'version': relief_version, 'url': 'https://naciscdn.org/naturalearth/50m/raster/SR_50M.zip', 'sha256': hashlib.sha256(args.relief_zip.read_bytes()).hexdigest(), 'sourceCRS': 'EPSG:4326', 'displayCRS': 'EPSG:3857', 'displayBounds': [-180, -MAX_LAT, 180, MAX_LAT], 'pixels': [size, size], 'meaning': 'Shaded relief cartography derived from SRTM Plus; not elevations or an eruption layer'},
        'outputs': {name: {'bytes': (DEST / name).stat().st_size, 'sha256': hashlib.sha256((DEST / name).read_bytes()).hexdigest()} for name in ['land-10m.geojson', 'coastline-10m.geojson', 'graticule.geojson', 'relief-mercator.webp', 'world-mercator.webp']},
    }
    (DEST / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest['outputs'], indent=2))


if __name__ == '__main__':
    main()
