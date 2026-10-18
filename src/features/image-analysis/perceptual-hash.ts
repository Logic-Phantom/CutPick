import { toLuma, type RgbaImage } from './pixel-metrics';

/**
 * Perceptual fingerprint used for near-duplicate grouping and diversity.
 *
 * D-008 (docs/DECISIONS.md): a 64-bit dHash was tried first, but on the sample set true
 * duplicates measured Hamming 18–31 (noise flips bits in flat regions such as sky or tables),
 * which overlaps unrelated photos. A 16x16 area-averaged luma signature separated them cleanly
 * (duplicates ≤ 2.2, unrelated ≥ 10.0), so it replaced dHash.
 */

export const SIGNATURE_SIZE = 16;

/** Area-averaged downscale of a luma plane. */
export function resizeLuma(luma: Float32Array, w: number, h: number, tw: number, th: number): Float32Array {
  const out = new Float32Array(tw * th);
  for (let ty = 0; ty < th; ty++) {
    const y0 = Math.floor((ty * h) / th);
    const y1 = Math.max(y0 + 1, Math.floor(((ty + 1) * h) / th));
    for (let tx = 0; tx < tw; tx++) {
      const x0 = Math.floor((tx * w) / tw);
      const x1 = Math.max(x0 + 1, Math.floor(((tx + 1) * w) / tw));
      let s = 0;
      let c = 0;
      for (let y = y0; y < y1 && y < h; y++) {
        for (let x = x0; x < x1 && x < w; x++) {
          s += luma[y * w + x];
          c++;
        }
      }
      out[ty * tw + tx] = c ? s / c : 0;
    }
  }
  return out;
}

/** 16x16 area-averaged luma signature as hex (512 chars). */
export function lumaSignature(img: RgbaImage): string {
  const small = resizeLuma(toLuma(img), img.width, img.height, SIGNATURE_SIZE, SIGNATURE_SIZE);
  let hex = '';
  for (let i = 0; i < small.length; i++) hex += Math.max(0, Math.min(255, Math.round(small[i]))).toString(16).padStart(2, '0');
  return hex;
}

const CACHE_LIMIT = 2000;
const centeredCache = new Map<string, Float32Array | null>();

/** Decodes a signature and subtracts its mean. Cached, since grouping compares O(n²) pairs. */
function centered(s: string): Float32Array | null {
  const hit = centeredCache.get(s);
  if (hit !== undefined) return hit;
  const n = SIGNATURE_SIZE * SIGNATURE_SIZE;
  let out: Float32Array | null = null;
  if (s.length === n * 2) {
    out = new Float32Array(n);
    let mean = 0;
    for (let i = 0; i < n; i++) {
      out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
      mean += out[i];
    }
    mean /= n;
    for (let i = 0; i < n; i++) out[i] -= mean;
  }
  if (centeredCache.size >= CACHE_LIMIT) centeredCache.delete(centeredCache.keys().next().value as string);
  centeredCache.set(s, out);
  return out;
}

/**
 * Brightness-invariant structural distance (0..255): mean absolute difference after removing
 * each signature's mean. Small for burst shots / slight shifts / blur, large for different scenes.
 * Missing or malformed signatures return the maximum distance.
 */
export function signatureDistance(a: string | null | undefined, b: string | null | undefined): number {
  if (!a || !b) return 255;
  return vectorDistance(centered(a), centered(b));
}

/** Mean-centered vector for a signature (null if missing/malformed). */
export function signatureVector(s: string | null | undefined): Float32Array | null {
  return s ? centered(s) : null;
}

/** Mean absolute difference. With maxDistance set, stops early once it is exceeded. */
export function vectorDistance(va: Float32Array | null, vb: Float32Array | null, maxDistance = Infinity): number {
  if (!va || !vb || va.length !== vb.length) return 255;
  const budget = maxDistance * va.length;
  let d = 0;
  for (let i = 0; i < va.length; i++) {
    d += Math.abs(va[i] - vb[i]);
    if (d > budget) return d / va.length;
  }
  return d / va.length;
}
