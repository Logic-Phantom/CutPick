# Builds every app icon / splash / favicon from the single brand source image.
# Usage: python scripts/build-app-icons.py   (needs Pillow: python -m pip install Pillow)
# Source: assets/brand/icon-source.webp (rounded-square gradient artwork with a white camera on a white canvas)
# Output: assets/images/{icon,android-icon-*,splash-icon,favicon,logo}.png + assets/brand/{play-store-icon-512,kakao-icon-256}.png
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
        ImageDraw.floodfill(probe, corner, (255, 0, 255), thresh=40)
    outside = Image.eval(ImageChops.difference(probe, Image.new('RGB', src.size, (255, 0, 255))).convert('L'), lambda v: 255 if v < 8 else 0)
    inside = ImageChops.invert(outside).filter(ImageFilter.MinFilter(5))  # drop the anti-aliased white fringe
    box = inside.getbbox()
    side = max(box[2] - box[0], box[3] - box[1])
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    crop = (cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)
    art, shape = src.crop(crop), inside.crop(crop)
    art = art.resize((1024, 1024), Image.LANCZOS)
    shape = shape.resize((1024, 1024), Image.LANCZOS).point(lambda v: 255 if v > 127 else 0)

    # 2. Full-bleed square (iOS / store icon): extend the gradient into the cut corners.
    core = shape.filter(ImageFilter.MinFilter(9))
    bg_ext = fill_from_mask(art, core, 40)
    full = Image.composite(art, bg_ext, core.filter(ImageFilter.GaussianBlur(3)))
    full.save(OUT / 'icon.png')
    full.resize((512, 512), Image.LANCZOS).save(ROOT / 'assets' / 'brand' / 'play-store-icon-512.png')
    full.resize((256, 256), Image.LANCZOS).save(ROOT / 'assets' / 'brand' / 'kakao-icon-256.png')  # Kakao console limit 250KB

    # 3. Rounded icon with transparent corners (splash, favicon, in-app logo).
    soft = shape.filter(ImageFilter.GaussianBlur(1.2))
    rounded = art.copy()
    rounded.putalpha(soft)
    rounded.resize((512, 512), Image.LANCZOS).save(OUT / 'logo.png')
    rounded.save(OUT / 'splash-icon.png')
    rounded.resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png')

    # 4. Android adaptive icon: the white camera + sparkle are the foreground, the gradient is the background.
    # White-ish, low-saturation pixels are the artwork; flood-filling from the corners closes the lens hole.
    hsv = full.convert('HSV')
    h, sat, val = hsv.split()
    white = ImageChops.multiply(val.point(lambda v: 255 if v > 185 else 0), sat.point(lambda v: 255 if v < 95 else 0))
    white = white.filter(ImageFilter.MedianFilter(5))
    probe = Image.merge('RGB', (white, white, white))
    ImageDraw.floodfill(probe, (0, 0), (255, 0, 0), thresh=10)
    # Everything the corner flood fill (red) did not reach is the camera silhouette, lens included.
    silhouette = Image.eval(ImageChops.difference(probe, Image.new('RGB', probe.size, (255, 0, 0))).convert('L'), lambda v: 255 if v > 8 else 0)
    # Morphological closing smooths the edge where the body's bluish shading falls under the threshold.
    silhouette = silhouette.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.MinFilter(21)).filter(ImageFilter.MedianFilter(9))
    bg_field = fill_from_mask(full, ImageChops.invert(silhouette.filter(ImageFilter.MaxFilter(25))), 60)
    bg_field.save(OUT / 'android-icon-background.png')

    fg = full.convert('RGBA')
    fg.putalpha(silhouette.filter(ImageFilter.GaussianBlur(1.5)))
    # Fit the artwork inside the 66dp safe circle of the 108dp canvas (radius 0.61 of half-size).
    a = fg.getchannel('A').load()
    far = max(((x - 511.5) ** 2 + (y - 511.5) ** 2) ** 0.5 for y in range(0, 1024, 2) for x in range(0, 1024, 2) if a[x, y] > 40)
    scale = min(1.0, 0.61 * 512 / far)
    size = round(1024 * scale)
    layer = Image.new('RGBA', (1024, 1024))
    layer.paste(fg.resize((size, size), Image.LANCZOS), ((1024 - size) // 2, (1024 - size) // 2))
    layer.save(OUT / 'android-icon-foreground.png')

    # Themed (monochrome) icon: camera silhouette with the lens cut out, sparkle kept.
    inner = ImageChops.subtract(silhouette, white.filter(ImageFilter.MaxFilter(3)))
    ring = ImageChops.subtract(silhouette, inner)
    mono_src = Image.new('RGBA', (1024, 1024), (255, 255, 255, 0))
    mono_src.putalpha(ring.filter(ImageFilter.GaussianBlur(1.2)))
    mono = Image.new('RGBA', (1024, 1024), (255, 255, 255, 0))
    mono.paste(mono_src.resize((size, size), Image.LANCZOS), ((1024 - size) // 2, (1024 - size) // 2))
    mono.resize((432, 432), Image.LANCZOS).save(OUT / 'android-icon-monochrome.png')
    print('wrote icons to', OUT, 'foreground scale', round(scale, 3))


if __name__ == '__main__':
    main()
