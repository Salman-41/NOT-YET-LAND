#!/usr/bin/env python3
"""Check the retained measured DEM, public encoding, and offline reproducibility."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import tempfile

import numpy as np
import rasterio

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/terrain/kilauea"
metadata = json.loads((OUTPUT / "metadata.json").read_text(encoding="utf-8"))
source = ROOT / metadata["source"]["sourceArtifact"]["path"]
assert hashlib.sha256(source.read_bytes()).hexdigest() == metadata["source"]["sourceArtifact"]["sha256"]
assert metadata["elevation"]["unit"] == "m" and metadata["elevation"]["datum"]
assert metadata["source"]["licenseUrl"].startswith("https://www.usgs.gov/")
assert metadata["encoding"]["rowZero"] == "north"
with rasterio.open(source) as dataset:
    raw = dataset.read(1, masked=True)
    assert not np.ma.getmaskarray(raw).any(), "Source nodata must not be concealed"
    assert np.isfinite(raw.data).all(), "Non-finite source heights"
    assert dataset.transform.e < 0, "Raster must start in the north"
    assert float(raw.min()) == metadata["elevation"]["min"]
    assert float(raw.max()) == metadata["elevation"]["max"]
    max_error = (float(raw.max()) - float(raw.min())) / (2*65535) + 1e-8
    for name, grid in metadata["grids"].items():
        payload = (OUTPUT / Path(grid["url"]).name).read_bytes()
        assert len(payload) == grid["width"] * grid["height"] * 2 == grid["bytes"]
        assert hashlib.sha256(payload).hexdigest() == grid["sha256"]
        heights = np.frombuffer(payload, dtype="<u2").reshape(grid["height"], grid["width"])
        decoded = metadata["elevation"]["min"] + heights.astype(float)/65535*(metadata["elevation"]["max"]-metadata["elevation"]["min"])
        for row, col, original in ((0, 0, raw[0, 0]), (-1, -1, raw[-1, -1])):
            assert abs(decoded[row, col]-original) <= max_error, f"{name}: incorrect orientation or encoding"
        assert grid["maxQuantizationErrorMeters"] <= max_error
with tempfile.TemporaryDirectory(prefix="nyl-dem-verify-") as temporary:
    subprocess.run([sys.executable, str(ROOT / "scripts/process-dem.py"), "--output-dir", temporary],
                   check=True, capture_output=True, text=True)
    for name in ("terrain-low.bin", "terrain-high.bin", "preview.webp", "metadata.json"):
        assert (OUTPUT / name).read_bytes() == (Path(temporary) / name).read_bytes(), f"Non-reproducible {name}"
print("Terrain checks passed: real retained source; zero nodata; checksums, north-first little-endian encoding, quantization bound; all four offline outputs byte-identical.")
