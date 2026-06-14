#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate a half-photoreal / half-anatomical-skeleton portrait from an existing
photo using Gemini "Nano Banana" image editing.

The left half of the figure stays as the real photograph; the right half is
rendered as an ultra-realistic, glowing blue anatomical skeleton/X-ray of the
same body, perfectly aligned so it reads as one continuous person. The blue
matches the portfolio accent (sky-500 #0ea5e9).

Requirements:
    pip install google-genai Pillow
    A Gemini API key in the GEMINI_API_KEY environment variable (or a .env file
    next to this script / in ~/.claude/.env).

Usage:
    setx GEMINI_API_KEY "your-key"        # Windows, then reopen the shell
    py tools/generate_skeleton_portrait.py
    py tools/generate_skeleton_portrait.py --skeleton-side left --flash
    py tools/generate_skeleton_portrait.py --source src/assets/vladiG1.png \
        --output src/assets/vladi-skeleton.png --color "#0ea5e9"
"""

import argparse
import io
import os
import sys
from pathlib import Path


def load_env():
    """Load GEMINI_API_KEY from common .env locations if not already set."""
    env_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
        Path.home() / ".claude" / ".env",
        Path.home() / ".claude" / "skills" / ".env",
    ]
    for env_path in env_paths:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


load_env()

try:
    from google import genai
    from google.genai import types
except ImportError:
    sys.exit("Error: google-genai not installed. Run: py -m pip install google-genai Pillow")

try:
    from PIL import Image
except ImportError:
    sys.exit("Error: Pillow not installed. Run: py -m pip install Pillow")


# Nano Banana image models
MODEL_FLASH = "gemini-2.5-flash-image"      # fast
MODEL_PRO = "gemini-3-pro-image-preview"    # highest quality / detail

DEFAULT_SOURCE = Path(__file__).parent.parent / "src" / "assets" / "vladi-profile1.png"
DEFAULT_OUTPUT = Path(__file__).parent.parent / "src" / "assets" / "vladi-skeleton.png"


def build_prompt(color: str, skeleton_side: str, mode: str) -> str:
    common = f"""KEEP IDENTICAL: the exact same person, the exact same pose (hands clasped in
front), the exact same body size, proportions, framing and position in the
frame. Do not move, resize, rotate, or re-pose the subject. The output figure
must line up with the input figure.

BACKGROUND: the area around the figure MUST be a fully transparent alpha channel
(empty/see-through). Do NOT paint or draw a checkerboard, grid, grey squares, or
any pattern to represent transparency. No text, no labels, no watermark."""

    if mode == "full":
        return f"""Edit this photograph of a man into an ultra-realistic, high-fidelity
anatomical X-ray of his ENTIRE body.

{common}

TRANSFORM THE WHOLE FIGURE (the full body visible in frame, both sides, 100% of
it) into a glowing skeleton / medical X-ray of the human anatomy underneath:
skull, full rib cage, spine, both shoulders, both arms and the bones of the
clasped hands, pelvis and the upper legs, with subtle translucent muscle and
connective tissue, as if a holographic sci-fi body scanner reveals the anatomy
beneath the skin and clothes. NONE of the original skin, face, shirt or trousers
remains visible — the entire visible body is the anatomical render.

STYLE: clean, luminous blue glow in the exact colour {color} (sky blue), with
brighter blue rim light on the bone edges and darker blue in the recesses.
High-tech "hi-fi" holographic look, fine anatomical detail, sharp, ultra-detailed,
4K quality. The bones and tissue follow the real body's exact contours and pose."""

    # mode == "half"
    real_side = "left" if skeleton_side == "right" else "right"
    return f"""Edit this photograph of a man into a striking split "anatomy reveal" portrait.

{common}

SPLIT THE FIGURE VERTICALLY down the centre of the body:
- The {real_side} half stays EXACTLY as the original photograph: real skin, shirt
  and watch, fully photorealistic, untouched.
- The {skeleton_side} half becomes an ultra-realistic glowing X-ray of the same
  body (skull, rib cage, spine, pelvis, arm and hand bones), with subtle
  translucent muscle and tissue. The two halves meet seamlessly down the middle
  and read as one continuous figure.

STYLE: clean luminous blue glow in the exact colour {color} (sky blue), bright
rim light on bone edges, high-tech holographic look, sharp, ultra-detailed, 4K."""


def generate(source: Path, output: Path, color: str, skeleton_side: str, use_pro: bool, size: str, mode: str, web_width: int):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit(
            "Error: GEMINI_API_KEY is not set.\n"
            "  PowerShell (this session):  $env:GEMINI_API_KEY = 'your-key'\n"
            "  Persist for future shells:  setx GEMINI_API_KEY \"your-key\"\n"
            "  Get a key at:               https://aistudio.google.com/apikey"
        )
    if not source.exists():
        sys.exit(f"Error: source image not found: {source}")

    src_img = Image.open(source)
    src_alpha = src_img.getchannel("A") if src_img.mode in ("RGBA", "LA") else None
    # Feed the model an opaque version (flatten transparency onto black) so it
    # does not try to paint a checkerboard to represent the empty pixels.
    if src_img.mode == "RGBA":
        flat = Image.new("RGB", src_img.size, (0, 0, 0))
        flat.paste(src_img, mask=src_alpha)
        model_input = flat
    else:
        model_input = src_img.convert("RGB")

    model = MODEL_PRO if use_pro else MODEL_FLASH

    print(f"Model:        {model}")
    print(f"Source:       {source}  ({src_img.size[0]}x{src_img.size[1]}, alpha={src_alpha is not None})")
    desc = "whole-body X-ray" if mode == "full" else f"{skeleton_side}-half skeleton"
    print(f"Mode:         {mode} ({desc})   |   accent {color}")
    print(f"Resolution:   {size}   |   frame preserved from source")
    print("Generating... (this can take 20-60s)\n")

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(color, skeleton_side, mode)

    relaxed_safety = [
        types.SafetySetting(category=c, threshold="BLOCK_ONLY_HIGH")
        for c in (
            "HARM_CATEGORY_HATE_SPEECH",
            "HARM_CATEGORY_DANGEROUS_CONTENT",
            "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "HARM_CATEGORY_HARASSMENT",
        )
    ]

    # Omit aspect_ratio so the edit keeps the source framing (needed for the
    # alpha mask below to line up with the original silhouette).
    response = client.models.generate_content(
        model=model,
        contents=[prompt, model_input],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            image_config=types.ImageConfig(image_size=size),
            safety_settings=relaxed_safety,
        ),
    )

    image_data = None
    note = ""
    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None) and part.inline_data.mime_type.startswith("image/"):
            image_data = part.inline_data.data
        elif getattr(part, "text", None):
            note += part.text

    if not image_data:
        print("No image was returned.")
        if note:
            print("Model said:", note.strip()[:500])
        sys.exit(1)

    output.parent.mkdir(parents=True, exist_ok=True)
    gen = Image.open(io.BytesIO(image_data)).convert("RGB")

    if src_alpha is not None:
        # Reapply the original silhouette as a clean alpha channel so the result
        # is a true transparent cutout at the source's exact dimensions.
        gen = gen.resize(src_img.size, Image.LANCZOS)
        gen.putalpha(src_alpha)

    if web_width and gen.width > web_width:
        # Downscale for the web so the browser decodes/paints a much lighter image.
        new_h = round(gen.height * web_width / gen.width)
        gen = gen.resize((web_width, new_h), Image.LANCZOS)

    gen.save(output, optimize=True)
    print(f"Saved: {output}  ({gen.size[0]}x{gen.size[1]}, mode={gen.mode})")
    if note.strip():
        print("Model note:", note.strip()[:300])


def main():
    p = argparse.ArgumentParser(description="Half-photo / half-blue-skeleton portrait via Gemini Nano Banana")
    p.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Input photo")
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output PNG")
    p.add_argument("--color", default="#0ea5e9", help="Skeleton glow colour (default sky-500)")
    p.add_argument("--mode", choices=["full", "half"], default="full",
                   help="full = whole body as X-ray; half = split real/skeleton")
    p.add_argument("--skeleton-side", choices=["left", "right"], default="right",
                   help="For --mode half: which half becomes the skeleton (viewer's perspective)")
    p.add_argument("--flash", action="store_true", help="Use the faster gemini-2.5-flash-image instead of Pro")
    p.add_argument("--size", choices=["1K", "2K", "4K"], default="2K", help="Output resolution (Pro model)")
    p.add_argument("--web-width", type=int, default=0,
                   help="Downscale final PNG to this width in px for the web (0 = keep full size)")
    args = p.parse_args()

    generate(args.source, args.output, args.color, args.skeleton_side,
             use_pro=not args.flash, size=args.size, mode=args.mode, web_width=args.web_width)


if __name__ == "__main__":
    main()
