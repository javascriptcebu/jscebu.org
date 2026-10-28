"""Trace the JS Cebu mark from the original PSD into SVG paths (one-off).

Usage:
  uv run --with psd-tools==1.26.0 --with numpy --with scipy --with potracer==0.0.4 --with pillow \
    python -I packages/brand/scripts/logo/trace.py packages/brand/source/js-cebu-logo.psd packages/brand/source

Writes to <outdir>: mark-flattened.png, regions/<id>.png and mark-paths.json.
The editable "Group 1" in the PSD is cropped at the canvas edge, so this only
reads the flattened copy "Group 2 > Group 1 copy 2", which is the ground truth.
"""

import colorsys
import json
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image
from psd_tools import PSDImage
from scipy import ndimage

# Gradient angles from the PSD's live Gradient Overlay effects (Photoshop degrees,
# counterclockwise from +x). The stop colors come from the flattened pixels instead,
# because spec §4.1 says the flattened pixels win.
ANGLES = {"ring": 87, "blue": 61, "green": 90, "red": 90}
STOP_OFFSETS = [0, 0.25, 0.5, 0.75, 1]


def flattened_mark(psd_path: Path) -> Image.Image:
    psd = PSDImage.open(psd_path)
    group = next(layer for layer in psd if layer.name == "Group 2")
    mark = next(layer for layer in group if layer.name == "Group 1 copy 2")
    return mark.topil().convert("RGBA")


def build_masks(rgba: np.ndarray) -> dict[str, np.ndarray]:
    rgb, alpha = rgba[..., :3].astype(int), rgba[..., 3]
    white = (alpha > 0) & (rgb.min(axis=2) >= 225)
    colored = (alpha > 128) & ~white
    labels, n = ndimage.label(colored, structure=np.ones((3, 3)))
    sizes = ndimage.sum(colored, labels, range(1, n + 1))
    biggest = [int(i) + 1 for i in np.argsort(sizes)[::-1][:4]]

    def bbox_area(label: int) -> int:
        ys, xs = np.nonzero(labels == label)
        return (ys.max() - ys.min()) * (xs.max() - xs.min())

    ring_label = max(biggest, key=bbox_area)
    masks = {"ring": labels == ring_label}
    for label in biggest:
        if label == ring_label:
            continue
        m = labels == label
        r, g, b = (rgb[m].mean(axis=0) / 255).tolist()
        hue = colorsys.rgb_to_hsv(r, g, b)[0] * 360
        region = "blue" if 180 <= hue <= 260 else "green" if 70 <= hue <= 170 else "red"
        if region in masks:
            raise SystemExit(f"Two components classified as {region} (hue {hue:.0f})")
        masks[region] = m
    missing = {"blue", "green", "red"} - masks.keys()
    if missing:
        raise SystemExit(f"Missing regions: {missing}")

    masks["outer"] = ndimage.binary_fill_holes(masks["ring"])
    masks["inner"] = masks["outer"] & ~masks["ring"]
    if masks["inner"].sum() == 0:
        raise SystemExit("The ring has no hole; cannot derive inner/outer")
    return {k: ndimage.binary_opening(v, structure=np.ones((3, 3))) for k, v in masks.items()}


def fmt(v: float) -> str:
    return f"{v:.2f}".rstrip("0").rstrip(".")


def trace(mask: np.ndarray) -> str:
    # potracer treats low values as ink (like black on a white page), so invert.
    bitmap = potrace.Bitmap(~mask)
    curves = bitmap.trace(turdsize=2, alphamax=1.0, opticurve=True, opttolerance=0.2)
    parts = []
    for curve in curves:
        p = curve.start_point
        parts.append(f"M{fmt(p.x)} {fmt(p.y)}")
        for seg in curve.segments:
            if seg.is_corner:
                parts.append(f"L{fmt(seg.c.x)} {fmt(seg.c.y)}L{fmt(seg.end_point.x)} {fmt(seg.end_point.y)}")
            else:
                parts.append(
                    f"C{fmt(seg.c1.x)} {fmt(seg.c1.y)} {fmt(seg.c2.x)} {fmt(seg.c2.y)} "
                    f"{fmt(seg.end_point.x)} {fmt(seg.end_point.y)}"
                )
        parts.append("Z")
    return "".join(parts)


def gradient(rgba: np.ndarray, mask: np.ndarray, angle: float) -> dict:
    """A linearGradient in objectBoundingBox units whose isolines are perpendicular
    to `angle` in user space, with stop colors sampled from the flattened pixels."""
    rad = np.deg2rad(angle)
    dx, dy = np.cos(rad), -np.sin(rad)  # image y points down
    core = ndimage.binary_erosion(mask, structure=np.ones((3, 3)), iterations=3)
    ys, xs = np.nonzero(core)
    t = xs * dx + ys * dy
    p3, p97 = np.percentile(t, [3, 97])

    stops = []
    for offset in STOP_OFFSETS:
        band = np.abs(t - (p3 + offset * (p97 - p3))) <= 3
        color = np.median(rgba[ys[band], xs[band], :3], axis=0).round().astype(int)
        stops.append({"offset": offset, "color": "#{:02X}{:02X}{:02X}".format(*color)})

    # Bounding box of the full region, which is what objectBoundingBox refers to.
    mys, mxs = np.nonzero(mask)
    bx, by = mxs.min(), mys.min()
    bw, bh = mxs.max() + 1 - bx, mys.max() + 1 - by
    # In bbox units the gradient vector must be (bw*dx, bh*dy) scaled so that
    # g = (t - p3) / (p97 - p3) holds for every user-space point.
    norm = (bw * dx) ** 2 + (bh * dy) ** 2
    lam = (p3 - (bx * dx + by * dy)) / norm
    s = (p97 - p3) / norm
    x1, y1 = lam * bw * dx, lam * bh * dy
    return {
        "x1": round(float(x1), 4),
        "y1": round(float(y1), 4),
        "x2": round(float(x1 + s * bw * dx), 4),
        "y2": round(float(y1 + s * bh * dy), 4),
        "stops": stops,
    }


def main(psd_path: str, outdir: str) -> None:
    out = Path(outdir)
    (out / "regions").mkdir(parents=True, exist_ok=True)
    mark = flattened_mark(Path(psd_path))
    mark.save(out / "mark-flattened.png")
    rgba = np.asarray(mark)
    h, w = rgba.shape[:2]

    masks = build_masks(rgba)
    for region, m in masks.items():
        Image.fromarray((m * 255).astype(np.uint8), "L").save(out / "regions" / f"{region}.png")

    order = ["ring", "inner", "blue", "green", "red", "outer"]
    result = {
        "viewBox": [0, 0, w, h],
        "paths": {region: trace(masks[region]) for region in order},
        "gradients": {region: gradient(rgba, masks[region], a) for region, a in ANGLES.items()},
    }
    (out / "mark-paths.json").write_text(json.dumps(result, indent=2) + "\n")
    for region in order:
        print(f"{region}: {int(masks[region].sum())} px, {len(result['paths'][region])} chars of path")
    for region, g in result["gradients"].items():
        print(f"{region} gradient: " + " → ".join(s["color"] for s in g["stops"]))


if __name__ == "__main__":
    main(*sys.argv[1:3])
