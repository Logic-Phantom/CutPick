"""Builds the bundled sample photos (assets/samples/sample-XX.jpg) from real, commercially
usable Wikimedia Commons photos.

Usage:
  python scripts/build-sample-photos.py <raw_dir> [--download]
  npm run generate:samples -- <raw_dir> --download      (same thing)

  --download  fetch the ~1280px Commons thumbnail of every source listed in
              scripts/sample-photos.json into <raw_dir> (skips files already there) and
              re-check each file's license via the Commons API before building.

<raw_dir> holds one JPEG per source key (<key>.jpg). Raw downloads are never committed.
The recipe (source per slot, crop, deliberate defects) lives in scripts/sample-photos.json;
credits shown in the app live in src/features/photo-import/sample-credits.ts.
Output JPEGs are re-encoded without EXIF/ICC/any metadata. Requires Pillow.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPE = os.path.join(ROOT, 'scripts', 'sample-photos.json')
OUT = os.path.join(ROOT, 'assets', 'samples')
UA = 'CutpickAssetResearch/1.0 (bundled sample photo build; https://commons.wikimedia.org)'
ALLOWED = {'CC0', 'CC0 1.0', 'Public domain', 'CC BY 2.0', 'CC BY 2.5', 'CC BY 3.0', 'CC BY 4.0'}


def fetch(url):
    """GET with the required User-Agent; backs off on HTTP 429 (Commons rate limit)."""
    for attempt in range(5):
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4:
                raise
            time.sleep(10 * (attempt + 1))


def fetch_json(params):
    return json.loads(fetch('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({**params, 'format': 'json'})))


def download(recipe, raw_dir):
    os.makedirs(raw_dir, exist_ok=True)
    for key, src in recipe['sources'].items():
        time.sleep(1.0)
        d = fetch_json({'action': 'query', 'titles': src['title'], 'prop': 'imageinfo', 'iiprop': 'extmetadata|url', 'iiurlwidth': 1280})
        page = next(iter(d['query']['pages'].values()))
        ii = page['imageinfo'][0]
        md = ii['extmetadata']
        lic = md.get('LicenseShortName', {}).get('value', '')
        restr = md.get('Restrictions', {}).get('value', '')
        if lic not in ALLOWED or restr:
            sys.exit(f'{key}: license "{lic}" restrictions "{restr}" not allowed')
        print(f'{key}: {src["title"]} — {lic}')
        dest = os.path.join(raw_dir, key + '.jpg')
        if os.path.exists(dest):
            continue
        with open(dest, 'wb') as f:
            f.write(fetch(ii['thumburl']))
        time.sleep(1.5)


def crop_to(img, size, cx=0.5, cy=0.5, zoom=1.0):
    """Largest box of the target aspect ratio, shrunk by `zoom`, centered at (cx, cy) and clamped."""
    tw, th = size
    w, h = img.size
    ar = tw / th
    bw, bh = (w, w / ar) if w / h < ar else (h * ar, h)
    bw, bh = bw / zoom, bh / zoom
    x0 = min(max(cx * w - bw / 2, 0), w - bw)
    y0 = min(max(cy * h - bh / 2, 0), h - bh)
    return img.resize((tw, th), Image.LANCZOS, box=(x0, y0, x0 + bw, y0 + bh))


def apply(img, op):
    if 'blur' in op:  # out-of-focus / shaken copy
        return img.filter(ImageFilter.GaussianBlur(op['blur']))
    if 'lift' in op:  # same scene, a touch brighter (auto-exposure difference between two shots)
        return img.point(lambda v: min(255, v + op['lift']))
    if 'overexpose' in op:  # blown highlights: gain + lift, clipped at 255
        gain, lift = op['overexpose']
        return img.point(lambda v: min(255, int(v * gain + lift)))
    if 'contrast' in op:
        return ImageEnhance.Contrast(img).enhance(op['contrast'])
    if 'color' in op:
        return ImageEnhance.Color(img).enhance(op['color'])
    raise ValueError(f'unknown op {op}')


def build(recipe, raw_dir):
    os.makedirs(OUT, exist_ok=True)
    cache = {}
    for slot in recipe['slots']:
        key = slot['source']
        if key not in cache:
            src = Image.open(os.path.join(raw_dir, key + '.jpg'))
            cache[key] = src.convert('RGB')
        img = crop_to(cache[key], tuple(slot['size']), **slot.get('crop', {}))
        for op in slot.get('ops', []):
            img = apply(img, op)
        dest = os.path.join(OUT, f'sample-{slot["n"]:02d}.jpg')
        # A fresh RGB image carries no EXIF/ICC/XMP; Pillow writes only the JFIF header.
        clean = Image.new('RGB', img.size)
        clean.paste(img)
        clean.save(dest, 'JPEG', quality=slot.get('quality', recipe.get('quality', 85)), optimize=True)
        print(f'sample-{slot["n"]:02d}.jpg  {img.size[0]}x{img.size[1]}  {os.path.getsize(dest) // 1024} KB  <- {key}')


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        sys.exit(__doc__)
    with open(RECIPE, encoding='utf-8') as f:
        recipe = json.load(f)
    if '--download' in sys.argv:
        download(recipe, args[0])
    build(recipe, args[0])


if __name__ == '__main__':
    main()
