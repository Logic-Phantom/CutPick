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

/** Inverse of shiftCrop: which offset (-1 | 0 | 1, rounded) a rect represents for this image. */
export function cropOffset(rect: NormRect, imgW: number, imgH: number, targetRatio: number | null): number {
  const base = centerCropRect(imgW, imgH, targetRatio);
  if (base.width < 1) return Math.round((rect.x - base.x) / Math.max(base.x, 1e-6));
  if (base.height < 1) return Math.round((rect.y - base.y) / Math.max(base.y, 1e-6));
  return 0;
}

type Size = { width: number; height: number };

/**
 * The crop to apply to the image as actually decoded. Stored picker dimensions can disagree with
 * the decoded bitmap (EXIF rotation swaps them, stale metadata, web data URIs); a rect computed for
 * the wrong shape gets clamped by the manipulator and comes out with the wrong ratio and size.
 * When the shapes differ, the crop is rebuilt for the decoded size, keeping the chosen offset.
 */
export function cropForDecoded(stored: Size, decoded: Size, targetRatio: number | null, saved?: NormRect | null): NormRect {
  const storedKnown = stored.width > 0 && stored.height > 0;
  const sameShape = storedKnown && Math.abs(stored.width / stored.height - decoded.width / decoded.height) < 0.01;
  if (sameShape) return saved ?? centerCropRect(decoded.width, decoded.height, targetRatio);
  const offset = saved && storedKnown ? cropOffset(saved, stored.width, stored.height, targetRatio) : 0;
  return shiftCrop(centerCropRect(decoded.width, decoded.height, targetRatio), offset);
}

/** Normalized rect → whole-pixel crop that always stays inside the image. */
export function cropToPixels(rect: NormRect, img: Size): { originX: number; originY: number; width: number; height: number } {
  const width = Math.max(1, Math.min(img.width, Math.round(rect.width * img.width)));
  const height = Math.max(1, Math.min(img.height, Math.round(rect.height * img.height)));
  const originX = Math.max(0, Math.min(img.width - width, Math.round(rect.x * img.width)));
  const originY = Math.max(0, Math.min(img.height - height, Math.round(rect.y * img.height)));
  return { originX, originY, width, height };
}

/** Output size after fitting the longest side to maxSide. Never upscales. */
export function fitLongestSide(src: Size, maxSide: number): Size {
  const scale = Math.min(1, maxSide / Math.max(src.width, src.height));
  return { width: Math.max(1, Math.round(src.width * scale)), height: Math.max(1, Math.round(src.height * scale)) };
}

/** Fraction of the original area kept by the crop (1 = no loss). */
export function cropRetention(imgW: number, imgH: number, targetRatio: number | null): number {
  const r = centerCropRect(imgW, imgH, targetRatio);
  return r.width * r.height;
}
