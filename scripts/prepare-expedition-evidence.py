#!/usr/bin/env python3
"""Rebuild locally hosted evidence media from retained official sources.

Run in the pinned requirements-evidence.txt environment. --download obtains
missing originals; the normal path is fully offline. Never infer flow polygons.
"""
import argparse
import colorsys
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
import av
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'source/expeditions'
OUT = ROOT / 'public/research'
URLS = {
    'kilauea-map-timelapse.mp4': 'https://usgs-ocapsv2-public-input-media.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/atoms/video/Map_Timelapse.mp4',
    'st-helens-before.png': 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/images/1973.png',
    'st-helens-after.png': 'https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/media/images/1983.png',
    'tajogaite-before.jpg': 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/149000/149231/lapalma_oli_2021141.jpg',
    'tajogaite-after.jpg': 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/149000/149231/lapalma_oli_2021349.jpg',
    'reykjanes-january.jpg': 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/152000/152344/icelanderuption_tirs2_20240116.jpg',
    'reykjanes-june.jpg': 'https://science.nasa.gov/wp-content/uploads/2023/06/icelanderuption-oli-20240602.jpg',
    'etna-map.jpg': 'https://www.ct.ingv.it/images/Cartografia_Etna/6_-_mappa_eruzioni_storiche.jpg',
    'etna-dante.xlsx': 'https://www.ct.ingv.it/images/Cartografia_Etna/DB_of_Etnas_historical_eruptions_1d.xlsx',
    'reykjanes-fissures.pdf': 'https://ora.ox.ac.uk/objects/uuid:60bae2b3-ff81-4711-bd0b-33f107111c56/files/rft848t35r',
}
FRAMES = [
    ('early', 15, '8 May 2018', 'An early operational map: lava remains close to the mapped fissures in Leilani Estates.'),
    ('middle', 45, '10 June 2018', 'The published sheet shows flow expansion toward Kapoho and active ocean entry. Compare the former coastline with the lava margin.'),
    ('late', 79, '7 August 2018', 'The late-eruption sheet preserves the enlarged field, mapped fissures, and the former coastline. It remains an operational snapshot.'),
]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def encode(image, name, width=2200):
    image = image.copy()
    if image.width > width:
        image.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
    image.save(OUT / name, 'WEBP', quality=92, method=6, exact=True)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true')
    args = parser.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    for name, url in URLS.items():
        path = RAW / name
        if not path.exists():
            if not args.download:
                raise SystemExit(f'Missing {path}. Restore the retained original or run --download.')
            import requests
            response = requests.get(url, timeout=180)
            response.raise_for_status()
            path.write_bytes(response.content)
    for name in URLS:
        if name.endswith(('.png', '.jpg')):
            encode(Image.open(RAW / name).convert('RGB'), Path(name).stem + '.webp')
    # Extract the original embedded Fig. 7, not the Bing-based Fig. 2.
    # Poppler is an explicit offline pipeline prerequisite.
    with tempfile.TemporaryDirectory() as directory:
        prefix = Path(directory) / 'figure'
        subprocess.run(['pdfimages', '-f', '9', '-l', '9', '-j', str(RAW / 'reykjanes-fissures.pdf'), str(prefix)], check=True)
        figures = list(Path(directory).glob('figure-*.jpg'))
        if len(figures) != 1 or Image.open(figures[0]).size != (2214, 1544):
            raise ValueError('Unexpected Fig. 7 in the retained scientific paper')
        encode(Image.open(figures[0]), 'reykjanes-fissures.webp')
    frame_records = []
    with av.open(RAW / 'kilauea-map-timelapse.mp4') as video:
        for suffix, second, date, note in FRAMES:
            video.seek(int(second * av.time_base))
            frame = next(video.decode(video=0))
            name = f'kilauea-map-{suffix}.webp'
            encode(frame.to_image(), name)
            frame_records.append({'date': date, 'asset': f'/research/{name}', 'note': note,
                                  'requestedSecond': second, 'decodedSecond': float(frame.time)})
    # Color separation of the *published raster*, not new geospatial geometry.
    # Exclude map legend and logo; all source labels stay in the underlying map.
    original = Image.open(RAW / 'etna-map.jpg').convert('RGB')
    layers = {key: Image.new('RGBA', original.size) for key in ['medieval', 'early-modern', 'modern']}
    counts = {key: 0 for key in layers}
    for y in range(original.height):
        for x in range(original.width):
            if (y > 440 and x < 125) or (x > 456 and y < 70):
                continue
            r, g, b = original.getpixel((x, y))
            h, sat, val = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            key = None
            if .075 < h < .19 and sat > .22 and val > .45:
                key = 'medieval'
            elif (h < .065 or h > .94) and sat > .17 and r > g * 1.12 and r > b * 1.05:
                key = 'modern' if r - g > 66 else 'early-modern'
            if key:
                layers[key].putpixel((x, y), (r, g, b, 255))
                counts[key] += 1
    for key, layer in layers.items():
        if counts[key] < 500:
            raise ValueError(f'Empty or invalid color class: {key}')
        encode(layer, f'etna-{key}.webp')
    # Retain the exact catalogue rows used for the factual case-study annotations.
    from openpyxl import load_workbook
    workbook = load_workbook(RAW / 'etna-dante.xlsx', read_only=True, data_only=True)
    rows = [list(row) for row in workbook['From 1600 to 2024'].iter_rows(values_only=True)
            if str(row[0]) in {'1669', '1928', '1991'}]
    if len(rows) != 3:
        raise ValueError('Expected three documented historical catalogue rows')
    (OUT / 'etna-catalogue-extract.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'app/data/flow-frames.json').write_text(json.dumps(frame_records, ensure_ascii=False, indent=2) + '\n')
    manifest = {
        'retrieved': '2026-10-17', 'software': {'Pillow': '12.0.0', 'PyAV': '16.0.1', 'openpyxl': '3.1.5'},
        'sourceRegistry': 'app/data/sources.ts', 'frames': frame_records,
        'colorIsolation': {'method': 'RGB/HSV thresholding; approximate raster class separation, not vector digitization', 'pixels': counts},
        'originals': [{'path': f'source/expeditions/{name}', 'url': url, 'bytes': (RAW / name).stat().st_size, 'sha256': digest(RAW / name)} for name, url in URLS.items()],
        'outputs': [{'url': f'/research/{p.name}', 'bytes': p.stat().st_size, 'sha256': digest(p),
                     **({'width': Image.open(p).width, 'height': Image.open(p).height} if p.suffix == '.webp' else {})}
                    for p in sorted(OUT.iterdir()) if p.suffix in {'.webp', '.json'} and p.name not in {'manifest.json', 'sources.json'}],
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'originalBytes': sum(p['bytes'] for p in manifest['originals']),
                      'displayBytes': sum(p['bytes'] for p in manifest['outputs']), 'outputs': len(manifest['outputs']), 'classPixels': counts}))

if __name__ == '__main__':
    main()
