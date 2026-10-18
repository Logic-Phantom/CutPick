import { ANALYSIS_VERSION } from '@/domain/recommendation-policy';
import { colorStats, computeQualityMetrics, laplacianVariance, toLuma } from '@/features/image-analysis/pixel-metrics';

import { boxBlur, checker, gradient, solid } from '../helpers/fixtures';

const q = (img: ReturnType<typeof solid>) => computeQualityMetrics({ image: img, originalWidth: 4000, originalHeight: 3000, now: new Date('2026-10-18') });

describe('pixel metrics', () => {
  it('flat image has zero laplacian variance and zero contrast', () => {
    const img = solid(32, 32, [120, 120, 120]);
    expect(laplacianVariance(toLuma(img), 32, 32)).toBeCloseTo(0, 5);
    expect(q(img).contrastScore).toBe(0);
  });

  it('sharp checkerboard scores higher sharpness than its blurred copy', () => {
    const sharp = checker(96, 96, 4);
    const blurred = boxBlur(sharp, 3);
    expect(q(sharp).sharpnessScore).toBeGreaterThan(q(blurred).sharpnessScore);
    expect(q(sharp).sharpnessScore).toBeGreaterThan(0.6);
    expect(q(blurred).sharpnessScore).toBeLessThan(0.5);
  });

  it('smooth gradient is not considered sharp', () => {
    expect(q(gradient(96, 96)).sharpnessScore).toBeLessThan(0.1);
  });

  it('exposure penalizes very dark and blown-out images', () => {
    const mid = q(gradient(64, 64, 60, 200));
    const dark = q(solid(64, 64, [3, 3, 3]));
    const bright = q(solid(64, 64, [253, 253, 253]));
    expect(mid.exposureScore).toBeGreaterThan(0.7);
    expect(dark.exposureScore).toBeLessThan(0.1);
    expect(bright.exposureScore).toBeLessThan(0.1);
    expect(dark.shadowClipRatio).toBe(1);
    expect(bright.highlightClipRatio).toBe(1);
  });

  it('resolution score saturates at the configured megapixels', () => {
    const img = solid(8, 8, [100, 100, 100]);
    expect(computeQualityMetrics({ image: img, originalWidth: 4000, originalHeight: 3000 }).resolutionScore).toBe(1);
    expect(computeQualityMetrics({ image: img, originalWidth: 1000, originalHeight: 1000 }).resolutionScore).toBeCloseTo(0.125, 2);
  });

  it('colorfulness and warmth reflect hue', () => {
    const gray = colorStats(solid(16, 16, [128, 128, 128]));
    const warm = colorStats(solid(16, 16, [230, 150, 60]));
    const cool = colorStats(solid(16, 16, [60, 120, 220]));
    expect(gray.colorfulness).toBeCloseTo(0, 3);
    expect(warm.warmth).toBeGreaterThan(0.5);
    expect(cool.warmth).toBeLessThan(-0.5);
    expect(warm.colorfulness).toBeGreaterThan(gray.colorfulness);
  });

  it('records analysis version and timestamp', () => {
    const m = q(solid(8, 8, [10, 20, 30]));
    expect(m.analysisVersion).toBe(ANALYSIS_VERSION);
    expect(m.calculatedAt).toBe('2026-10-18T00:00:00.000Z');
    expect(m.meanRgb).toEqual([10, 20, 30]);
  });
});
