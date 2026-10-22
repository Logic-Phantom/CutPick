import { centerCropRect, cropForDecoded, cropOffset, cropToPixels, fitLongestSide, shiftCrop } from '@/features/platforms/crop';

/** Pixel size the export pipeline produces for a source of `decoded` size (crop → fit, no upscale). */
function exportSize(stored: { width: number; height: number }, decoded: { width: number; height: number }, ratio: number | null, maxSide: number, saved?: ReturnType<typeof centerCropRect>) {
  const crop = cropToPixels(cropForDecoded(stored, decoded, ratio, saved), decoded);
  return { crop, out: fitLongestSide(crop, maxSide) };
}

describe('export crop sizing (README UX task 0-3: landscape 4:5 export)', () => {
  it('a 1080x720 landscape exports to 576x720 at 4:5 — not upscaled', () => {
    const { crop, out } = exportSize({ width: 1080, height: 720 }, { width: 1080, height: 720 }, 4 / 5, 1440);
    expect(crop).toEqual({ originX: 252, originY: 0, width: 576, height: 720 });
    expect(out).toEqual({ width: 576, height: 720 });
  });

  it('9:16 story from the same landscape is 405x720 (matches the Android device result)', () => {
    expect(exportSize({ width: 1080, height: 720 }, { width: 1080, height: 720 }, 9 / 16, 1920).out).toEqual({ width: 405, height: 720 });
  });

  it('large photos are downscaled to the platform max side and keep the ratio', () => {
    const { out } = exportSize({ width: 4000, height: 3000 }, { width: 4000, height: 3000 }, 4 / 5, 1440);
    expect(out).toEqual({ width: 1152, height: 1440 });
  });

  it('EXIF-rotated source (stored dims swapped vs decoded) still yields the requested ratio, no clamping', () => {
    // Picker reported 4032x3024 (sensor), the decoder applied rotation → 3024x4032.
    const { crop, out } = exportSize({ width: 4032, height: 3024 }, { width: 3024, height: 4032 }, 4 / 5, 1440);
    expect(crop.originX + crop.width).toBeLessThanOrEqual(3024);
    expect(crop.originY + crop.height).toBeLessThanOrEqual(4032);
    expect(out.width / out.height).toBeCloseTo(4 / 5, 2);
    expect(out).toEqual({ width: 1152, height: 1440 });
  });

  it('the old behaviour with mismatched dims would have been clamped to the wrong ratio', () => {
    const naive = cropToPixels(centerCropRect(4032, 3024, 4 / 5), { width: 3024, height: 4032 });
    expect(naive.width / naive.height).not.toBeCloseTo(4 / 5, 2);
  });

  it('a chosen offset (앞/뒤) survives the rebuild for the decoded shape', () => {
    const stored = { width: 1200, height: 800 };
    const saved = shiftCrop(centerCropRect(stored.width, stored.height, 4 / 5), -1);
    expect(cropOffset(saved, stored.width, stored.height, 4 / 5)).toBe(-1);
    const rect = cropForDecoded(stored, { width: 800, height: 1200 }, 4 / 5, saved);
    // Decoded is portrait now, so the free axis is vertical and the offset moves to the top.
    expect(rect.y).toBe(0);
    expect(rect.x).toBe(0);
  });

  it('same-shape decode (e.g. web data URI at the stored size) keeps the saved rect exactly', () => {
    const saved = shiftCrop(centerCropRect(1080, 720, 4 / 5), 1);
    expect(cropForDecoded({ width: 1080, height: 720 }, { width: 1080, height: 720 }, 4 / 5, saved)).toBe(saved);
    // Downscaled decode of the same shape (web canvas limit) also keeps it.
    expect(cropForDecoded({ width: 1080, height: 720 }, { width: 540, height: 360 }, 4 / 5, saved)).toBe(saved);
  });

  it('unknown stored size (0x0) falls back to a centered crop of the decoded image', () => {
    expect(cropForDecoded({ width: 0, height: 0 }, { width: 1000, height: 1000 }, 4 / 5)).toEqual(centerCropRect(1000, 1000, 4 / 5));
  });

  it('pixel crops never leave the image even with rounding at the edge', () => {
    const c = cropToPixels({ x: 0.5001, y: 0, width: 0.5, height: 1 }, { width: 1001, height: 333 });
    expect(c.originX + c.width).toBeLessThanOrEqual(1001);
    expect(c.width).toBeGreaterThan(0);
  });

  it('original ratio (no target) keeps the full frame', () => {
    expect(exportSize({ width: 1080, height: 720 }, { width: 1080, height: 720 }, null, 1440).out).toEqual({ width: 1080, height: 720 });
  });
});
