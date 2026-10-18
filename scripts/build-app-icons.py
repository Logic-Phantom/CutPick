# Builds every app icon / splash / favicon from the single brand source image.
# Usage: python scripts/build-app-icons.py   (needs Pillow: python -m pip install Pillow)
# Source: assets/brand/icon-source.webp (rounded-square artwork on a white canvas)
# Output: assets/images/{icon,android-icon-*,splash-icon,favicon,logo}.png
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'brand' / 'icon-source.webp'
OUT = ROOT / 'assets' / 'images'


def _normalized_blur(img: Image.Image, mask: Image.Image, radius: int) -> tuple[Image.Image, Image.Image]:
    premul = Image.composite(img, Image.new('RGB', img.size, 0), mask)
    blurred = premul.filter(ImageFilter.GaussianBlur(radius))
    weight = mask.filter(ImageFilter.GaussianBlur(radius))
    px, w = blurred.load(), weight.load()
    out = Image.new('RGB', img.size)
    o = out.load()
    for y in range(img.height):
        for x in range(img.width):
            k = max(w[x, y], 1) / 255
            r, g, b = px[x, y]
            o[x, y] = (min(255, round(r / k)), min(255, round(g / k)), min(255, round(b / k)))
    return out, weight


def fill_from_mask(img: Image.Image, mask: Image.Image, radius: int) -> Image.Image:
    """Normalized blur at growing radii: extends the colors inside `mask` smoothly into the area outside it."""
    # Work small for the wide passes (they're smooth anyway), then refine near the mask at full size.
    small = (max(1, img.width // 8), max(1, img.height // 8))
    coarse, _ = _normalized_blur(img.resize(small, Image.BOX), mask.resize(small, Image.BOX), 48)
    out = coarse.resize(img.size, Image.BICUBIC)
    for r in (radius * 3, radius):
        fill, weight = _normalized_blur(img, mask, r)
        out = Image.composite(fill, out, weight.point(lambda v: min(255, v * 4)))
    return out


def main() -> None:
    src = Image.open(SRC).convert('RGB')

    # 1. Shape mask: flood-fill the white canvas from the corners; everything else is the icon.
    probe = src.copy()
    for corner in [(0, 0), (src.width - 1, 0), (0, src.height - 1), (src.width - 1, src.height - 1)]:
        ImageDraw.floodfill(probe, corner, (255, 0, 255), thresh=70)
    outside = Image.eval(ImageChops.difference(probe, Image.new('RGB', src.size, (255, 0, 255))).convert('L'), lambda v: 255 if v < 8 else 0)
    inside = ImageChops.invert(outside).filter(ImageFilter.MinFilter(5))  # drop the anti-aliased white fringe
    box = inside.getbbox()
    side = max(box[2] - box[0], box[3] - box[1])
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    crop = (cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)
    art, shape = src.crop(crop), inside.crop(crop)

    # 2. Full-bleed square (iOS / store icon): extend the navy background into the cut corners.
    # The source has a faint light rim along its rounded edge; pull the boundary inwards past it.
    core = shape.filter(ImageFilter.MinFilter(25))
    bg_ext = fill_from_mask(art, core, 40)
    full = Image.composite(art, bg_ext, core.filter(ImageFilter.GaussianBlur(4)))
    full.resize((1024, 1024), Image.LANCZOS).save(OUT / 'icon.png')

    # 3. Rounded icon with transparent corners (splash, favicon, in-app logo).
    soft = shape.filter(ImageFilter.GaussianBlur(1.2))
    rounded = art.copy()
    rounded.putalpha(soft)
    rounded.resize((512, 512), Image.LANCZOS).save(OUT / 'logo.png')
    rounded.resize((400, 400), Image.LANCZOS).save(OUT / 'splash-icon.png')
    rounded.resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png')

    # 4. Android adaptive icon: navy background layer + artwork-only foreground layer.
    lum = full.convert('L')
    dark = Image.eval(lum, lambda v: 255 if v < 40 else 0)
    bg_field = fill_from_mask(full, dark, 90)
    bg_field.resize((1024, 1024), Image.LANCZOS).save(OUT / 'android-icon-background.png')

    fp, bp, cp = full.load(), bg_field.load(), shape.filter(ImageFilter.MinFilter(41)).load()
    fg = Image.new('RGBA', full.size)
    gp = fg.load()
    for y in range(full.height):
        for x in range(full.width):
            if cp[x, y] < 128:
                continue
            p, b = fp[x, y], bp[x, y]
            diff = max(abs(p[i] - b[i]) for i in range(3))
            a = min(1.0, max(0.0, (diff - 6) / 46))
            if a <= 0:
                continue
            col = tuple(max(0, min(255, round(b[i] + (p[i] - b[i]) / a))) for i in range(3))
            gp[x, y] = (*col, round(a * 255))
    # Keep every bracket corner inside the 66dp safe circle of the 108dp canvas.
    scale = 0.66
    size = round(1024 * scale)
    layer = Image.new('RGBA', (1024, 1024))
    layer.paste(fg.resize((size, size), Image.LANCZOS), ((1024 - size) // 2, (1024 - size) // 2))
    layer.save(OUT / 'android-icon-foreground.png')

    mono = Image.new('RGBA', layer.size, (255, 255, 255, 0))
    mono.putalpha(layer.getchannel('A').point(lambda v: 255 if v > 150 else (0 if v < 60 else round((v - 60) * 2.8))))
    mono.resize((432, 432), Image.LANCZOS).save(OUT / 'android-icon-monochrome.png')
    print('wrote icons to', OUT)


if __name__ == '__main__':
    main()
