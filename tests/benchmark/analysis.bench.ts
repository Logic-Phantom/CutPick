/**
 * Desktop Node micro-benchmark of the pure-TypeScript analysis core
 * (JPEG decode of a 128px image + metrics + luma signature + grouping).
 * This is NOT a device benchmark: it excludes native resize/thumbnail work and runs on a desktop CPU.
 * Real device numbers must be recorded separately in docs/DEVICE_BENCHMARKS.md.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as jpeg from 'jpeg-js';

import { groupDuplicates } from '@/features/image-analysis/duplicate-analyzer';
import { lumaSignature } from '@/features/image-analysis/perceptual-hash';
import { computeQualityMetrics, type RgbaImage } from '@/features/image-analysis/pixel-metrics';
import { technicalQuality } from '@/features/recommendations/scoring';

function downscale(img: RgbaImage, maxSide: number): RgbaImage {
  const s = maxSide / Math.max(img.width, img.height);
  const w = Math.max(1, Math.round(img.width * s));
  const h = Math.max(1, Math.round(img.height * s));
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor(x / s));
      const sy = Math.min(img.height - 1, Math.floor(y / s));
      const si = (sy * img.width + sx) * 4;
      const di = (y * w + x) * 4;
      out[di] = img.data[si]; out[di + 1] = img.data[si + 1]; out[di + 2] = img.data[si + 2]; out[di + 3] = 255;
    }
  return { width: w, height: h, data: out };
}

describe('analysis core benchmark (desktop Node, not device)', () => {
  const dir = join(__dirname, '..', '..', 'assets', 'samples');
  // Pre-encode the 18 samples as 128px JPEGs, mimicking what the native manipulator hands to JS.
  const smallJpegs = readdirSync(dir)
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => {
      const full = jpeg.decode(readFileSync(join(dir, f)), { useTArray: true });
      const small = downscale({ width: full.width, height: full.height, data: full.data }, 128);
      return { bytes: jpeg.encode(small, 92).data, w: full.width, h: full.height };
    });

  for (const n of [30, 100, 300]) {
    it(`${n} photos`, () => {
      const t0 = performance.now();
      const items = [];
      for (let i = 0; i < n; i++) {
        const s = smallJpegs[i % smallJpegs.length];
        const d = jpeg.decode(s.bytes, { useTArray: true, formatAsRGBA: true });
        const img = { width: d.width, height: d.height, data: d.data };
        const m = computeQualityMetrics({ image: img, originalWidth: s.w, originalHeight: s.h });
        items.push({ id: String(i), hash: lumaSignature(img), meanRgb: m.meanRgb, quality: technicalQuality(m) });
      }
      const t1 = performance.now();
      const groups = groupDuplicates(items);
      const t2 = performance.now();
      const heapMb = process.memoryUsage().heapUsed / 1024 / 1024;
          console.log(`[bench] n=${n} decode+metrics+hash=${(t1 - t0).toFixed(1)}ms (${((t1 - t0) / n).toFixed(2)}ms/photo) grouping=${(t2 - t1).toFixed(1)}ms groups=${groups.length} heapUsed=${heapMb.toFixed(1)}MB`);
      expect(items).toHaveLength(n);
    });
  }
});
