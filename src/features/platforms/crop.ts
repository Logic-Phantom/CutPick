/** Normalized centered crop and crop-fit math. Pure functions. */

export interface NormRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Largest centered rect with the target ratio (w/h) inside an image of the given size. */
export function centerCropRect(imgW: number, imgH: number, targetRatio: number | null): NormRect {
  if (!targetRatio || !imgW || !imgH) return { x: 0, y: 0, width: 1, height: 1 };
  const imgRatio = imgW / imgH;
  if (imgRatio > targetRatio) {
    const w = targetRatio / imgRatio;
    return { x: (1 - w) / 2, y: 0, width: w, height: 1 };
  }
  const h = imgRatio / targetRatio;
  return { x: 0, y: (1 - h) / 2, width: 1, height: h };
}

/** Shifts a crop along its free axis: offset -1 (start) .. 0 (center) .. 1 (end). */
export function shiftCrop(rect: NormRect, offset: number): NormRect {
  const o = Math.max(-1, Math.min(1, offset));
  if (rect.width < 1) {
    const free = 1 - rect.width;
    return { ...rect, x: (free / 2) * (1 + o) };
  }
  if (rect.height < 1) {
    const free = 1 - rect.height;
    return { ...rect, y: (free / 2) * (1 + o) };
  }
  return rect;
}

/** Fraction of the original area kept by the crop (1 = no loss). */
export function cropRetention(imgW: number, imgH: number, targetRatio: number | null): number {
  const r = centerCropRect(imgW, imgH, targetRatio);
  return r.width * r.height;
}
