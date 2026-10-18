import type { PhotoQualityMetrics } from '@/domain/models';
import { ANALYSIS_CONFIG, ANALYSIS_VERSION } from '@/domain/recommendation-policy';

/** Decoded RGBA pixel buffer (4 bytes per pixel). */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

export function toLuma(img: RgbaImage): Float32Array {
  const { width, height, data } = img;
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    // Rec. 601 luma
    out[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return out;
}

/** Variance of the 4-neighbour Laplacian — a standard blur/shake indicator. */
export function laplacianVariance(luma: Float32Array, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const v = luma[i - width] + luma[i + width] + luma[i - 1] + luma[i + 1] - 4 * luma[i];
      sum += v;
      sumSq += v * v;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export interface QualityInput {
  image: RgbaImage;
  originalWidth: number;
  originalHeight: number;
  now?: Date;
}

/**
 * Computes technical quality signals. These describe the pixels (blur, exposure, contrast),
 * they are not an aesthetic judgement — dark or grainy photos can be intentional.
 */
export function computeQualityMetrics({ image, originalWidth, originalHeight, now }: QualityInput): PhotoQualityMetrics {
  const luma = toLuma(image);
  const n = luma.length;
  const cfg = ANALYSIS_CONFIG;

  let sum = 0;
  let sumSq = 0;
  let highlights = 0;
  let shadows = 0;
  for (let i = 0; i < n; i++) {
    const v = luma[i];
    sum += v;
    sumSq += v * v;
    if (v >= cfg.highlightClip) highlights++;
    else if (v <= cfg.shadowClip) shadows++;
  }
  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
  const highlightClipRatio = highlights / n;
  const shadowClipRatio = shadows / n;

  // Exposure: distance of mean from mid-tone plus clipping penalty.
  const midDistance = Math.abs(mean - 128) / 128; // 0..1
  const exposureScore = clamp01(1 - 0.7 * midDistance - 1.5 * (highlightClipRatio + shadowClipRatio));

  // Contrast: luma std of ~64 is treated as healthy; saturates there.
  const contrastScore = clamp01(std / 64);

  const lapVar = laplacianVariance(luma, image.width, image.height);
  const sharpnessScore = clamp01(Math.sqrt(lapVar / cfg.sharpnessSaturation));

  const mp = (originalWidth * originalHeight) / 1_000_000;
  const resolutionScore = clamp01(mp / cfg.resolutionSaturationMp);

  const { colorfulness, warmth, meanRgb } = colorStats(image);

  return {
    sharpnessScore: round(sharpnessScore),
    exposureScore: round(exposureScore),
    contrastScore: round(contrastScore),
    resolutionScore: round(resolutionScore),
    meanLuma: round(mean),
    highlightClipRatio: round(highlightClipRatio),
    shadowClipRatio: round(shadowClipRatio),
    colorfulness: round(colorfulness),
    warmth: round(warmth),
    meanRgb: [Math.round(meanRgb[0]), Math.round(meanRgb[1]), Math.round(meanRgb[2])],
    analysisVersion: ANALYSIS_VERSION,
    calculatedAt: (now ?? new Date()).toISOString(),
  };
}

/** Hasler & Süsstrunk (2003) colorfulness, normalized so ~100 maps to 1. Also mean warmth. */
export function colorStats(img: RgbaImage): { colorfulness: number; warmth: number; meanRgb: [number, number, number] } {
  const { data } = img;
  const n = img.width * img.height;
  let rgS = 0, rgSq = 0, ybS = 0, ybSq = 0, rS = 0, gS = 0, bS = 0;
  for (let p = 0; p < n * 4; p += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const rg = r - g;
    const yb = 0.5 * (r + g) - b;
    rgS += rg; rgSq += rg * rg; ybS += yb; ybSq += yb * yb;
    rS += r; gS += g; bS += b;
  }
  const rgMean = rgS / n, ybMean = ybS / n;
  const rgStd = Math.sqrt(Math.max(0, rgSq / n - rgMean * rgMean));
  const ybStd = Math.sqrt(Math.max(0, ybSq / n - ybMean * ybMean));
  const raw = Math.sqrt(rgStd ** 2 + ybStd ** 2) + 0.3 * Math.sqrt(rgMean ** 2 + ybMean ** 2);
  const meanRgb: [number, number, number] = [rS / n, gS / n, bS / n];
  const warmth = Math.max(-1, Math.min(1, (meanRgb[0] - meanRgb[2]) / 80));
  return { colorfulness: clamp01(raw / 100), warmth, meanRgb };
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}
