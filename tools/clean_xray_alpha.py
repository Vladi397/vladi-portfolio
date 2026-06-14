#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Clean the transparent edge of a cutout PNG: remove the dark/grey fringe that
hugs the silhouette (a halo left when a figure was rendered on a dark backing),
then trim and feather the alpha for a clean see-through edge.

Usage:
    py tools/clean_xray_alpha.py --src src/assets/vladi-xray.png \
        --dst src/assets/vladi-xray-clean.png \
        --dark 65 --band 9 --erode 1 --feather 0.8
"""

import argparse
from pathlib import Path
from PIL import Image, ImageFilter, ImageChops


def clean(src: Path, dst: Path, band: int, blue_t: int, bright_hi: int, feather: float, recolor: bool):
    im = Image.open(src).convert("RGBA")
    r, g, b, alpha = im.split()
    gray = im.convert("L")

    # Edge band: the ring of pixels within `band` px of the silhouette outline.
    inner = alpha.filter(ImageFilter.MinFilter(band * 2 + 1))
    ring = ImageChops.subtract(alpha, inner).point(lambda p: 255 if p > 8 else 0)

    # A pixel is "blue X-ray" if blue clearly beats red; "bone highlight" if bright.
    blueness = ImageChops.subtract(b, r)                       # 0 where red >= blue
    is_blue = blueness.point(lambda p: 255 if p >= blue_t else 0)
    is_bright = gray.point(lambda p: 255 if p >= bright_hi else 0)
    keepable = ImageChops.lighter(is_blue, is_bright)          # blue OR bright
    junk = keepable.point(lambda p: 255 if p == 0 else 0)      # neither blue nor bright
    junk_edge = ImageChops.multiply(junk, ring)               # grey/brown junk on the outline

    if recolor:
        # Recolour junk to a luminance-matched blue (keeps the silhouette full).
        blue_rgb = Image.merge("RGB", (
            gray.point(lambda p: int(p * 0.16)),
            gray.point(lambda p: int(p * 0.58)),
            gray.point(lambda p: min(255, int(p * 1.0))),
        ))
        rgb = Image.composite(blue_rgb, Image.merge("RGB", (r, g, b)), junk_edge)
        r, g, b = rgb.split()
    else:
        # Cut the junk away → fully transparent there.
        alpha = ImageChops.subtract(alpha, junk_edge)

    if feather > 0:
        alpha = alpha.filter(ImageFilter.GaussianBlur(feather))

    out = Image.merge("RGBA", (r, g, b, alpha))
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, optimize=True)
    print(f"Saved: {dst}  ({out.size[0]}x{out.size[1]})  alpha={out.getchannel('A').getextrema()}")


def main():
    p = argparse.ArgumentParser(description="Clean the dark/grey edge fringe of a cutout PNG")
    p.add_argument("--src", type=Path, required=True)
    p.add_argument("--dst", type=Path, required=True)
    p.add_argument("--band", type=int, default=16, help="Edge band width in px to clean")
    p.add_argument("--blue", type=int, default=12, help="Keep pixels where blue-red >= this")
    p.add_argument("--bright", type=int, default=150, help="Keep pixels brighter than this (bone highlights)")
    p.add_argument("--feather", type=float, default=0.6, help="Gaussian feather radius for the edge")
    p.add_argument("--recolor", action="store_true", help="Recolour junk to blue instead of cutting it transparent")
    args = p.parse_args()
    clean(args.src, args.dst, args.band, args.blue, args.bright, args.feather, args.recolor)


if __name__ == "__main__":
    main()
