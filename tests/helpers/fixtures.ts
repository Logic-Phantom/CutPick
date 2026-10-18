import type { PhotoAsset, PhotoQualityMetrics } from '@/domain/models';
import type { RgbaImage } from '@/features/image-analysis/pixel-metrics';

export function solid(w: number, h: number, rgb: [number, number, number]): RgbaImage {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return { width: w, height: h, data };
}

/** Checkerboard with given cell size — lots of edges (sharp). */
export function checker(w: number, h: number, cell: number, a = 20, b = 235): RgbaImage {
  const img = solid(w, h, [0, 0, 0]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = (Math.floor(x / cell) + Math.floor(y / cell)) % 2 ? a : b;
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
  return img;
}

/** Horizontal gradient — smooth (blurry-looking). */
export function gradient(w: number, h: number, from = 30, to = 220): RgbaImage {
  const img = solid(w, h, [0, 0, 0]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = Math.round(from + ((to - from) * x) / (w - 1));
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    }
  return img;
}

export function boxBlur(src: RgbaImage, r: number): RgbaImage {
  const out = solid(src.width, src.height, [0, 0, 0]);
  for (let y = 0; y < src.height; y++)
    for (let x = 0; x < src.width; x++) {
      const s = [0, 0, 0];
      let n = 0;
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const xx = Math.min(src.width - 1, Math.max(0, x + dx));
          const yy = Math.min(src.height - 1, Math.max(0, y + dy));
          const i = (yy * src.width + xx) * 4;
          s[0] += src.data[i]; s[1] += src.data[i + 1]; s[2] += src.data[i + 2];
          n++;
        }
      const o = (y * src.width + x) * 4;
      out.data[o] = s[0] / n; out.data[o + 1] = s[1] / n; out.data[o + 2] = s[2] / n;
    }
  return out;
}

export function metrics(over: Partial<PhotoQualityMetrics> = {}): PhotoQualityMetrics {
  return {
    sharpnessScore: 0.7,
    exposureScore: 0.8,
    contrastScore: 0.6,
    resolutionScore: 1,
    meanLuma: 128,
    highlightClipRatio: 0,
    shadowClipRatio: 0,
    colorfulness: 0.4,
    warmth: 0,
    meanRgb: [128, 128, 128],
    analysisVersion: 1,
    calculatedAt: '2026-10-18T00:00:00.000Z',
    ...over,
  };
}

let counter = 0;
export function photo(over: Partial<PhotoAsset> = {}): PhotoAsset {
  counter++;
  return {
    id: `p${counter}`,
    projectId: 'proj',
    localUri: `file:///p${counter}.jpg`,
    width: 3000,
    height: 4000,
    orientation: 'portrait',
    sceneTags: [],
    analysisStatus: 'done',
    importIndex: counter,
    perceptualHash: null,
    qualityMetrics: metrics(),
    duplicateGroupId: null,
    ...over,
  };
}
