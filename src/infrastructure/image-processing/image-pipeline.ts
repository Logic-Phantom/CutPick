import { ImageManipulator, SaveFormat, type ImageManipulatorContext, type ImageRef } from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';

import { AppError } from '@/domain/errors';
import type { RgbaImage } from '@/features/image-analysis/pixel-metrics';
import { cropToPixels, fitLongestSide as outputSize, type NormRect } from '@/features/platforms/crop';
import { base64ToBytes } from '@/utils/base64';

/**
 * Pixel access strategy (see docs/DECISIONS.md D-003):
 * expo-image-manipulator decodes the source natively (incl. HEIC + EXIF orientation),
 * downsizes it and re-encodes a tiny JPEG; jpeg-js (pure JS) decodes that JPEG to RGBA.
 * The full-resolution original is never held in JS memory.
 */

type Size = { width: number; height: number };

function fitLongestSide(src: Size, maxSide: number): { width?: number; height?: number } {
  if (!src.width || !src.height) return { width: maxSide };
  if (Math.max(src.width, src.height) <= maxSide) return { width: src.width };
  return src.width >= src.height ? { width: maxSide } : { height: maxSide };
}

function release(obj: unknown): void {
  try {
    (obj as { release?: () => void })?.release?.();
  } catch {
    // shared object already released
  }
}

export interface RenderedJpeg {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

/** Downscales an image to a JPEG. Output has no EXIF block from the source (re-encoded bitmap). */
export async function renderJpeg(
  uri: string,
  size: Size,
  maxSide: number,
  quality: number,
  withBase64 = false,
): Promise<RenderedJpeg> {
  let ctx: ImageManipulatorContext | null = null;
  let ref: ImageRef | null = null;
  try {
    ctx = ImageManipulator.manipulate(uri);
    ctx.resize(fitLongestSide(size, maxSide));
    ref = await ctx.renderAsync();
    const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: quality, base64: withBase64 });
    return { uri: out.uri, width: out.width, height: out.height, base64: out.base64 };
  } catch (e) {
    throw new AppError('decode-failed', undefined, e);
  } finally {
    release(ref);
    release(ctx);
  }
}

/**
 * Crops and resizes, returning a JPEG suitable for export or upload. The crop is computed from the
 * size of the bitmap as decoded (`rectFor`), not from stored picker dimensions, so EXIF-rotated or
 * mis-sized sources still come out at the requested ratio without clamping (see cropForDecoded).
 */
export async function renderCroppedJpeg(
  uri: string,
  rectFor: (decoded: Size) => NormRect,
  maxSide: number,
  quality: number,
  withBase64 = false,
): Promise<RenderedJpeg> {
  let srcCtx: ImageManipulatorContext | null = null;
  let src: ImageRef | null = null;
  let ctx: ImageManipulatorContext | null = null;
  let ref: ImageRef | null = null;
  try {
    srcCtx = ImageManipulator.manipulate(uri);
    src = await srcCtx.renderAsync();
    const decoded = { width: src.width, height: src.height };
    const crop = cropToPixels(rectFor(decoded), decoded);
    const target = outputSize(crop, maxSide);
    ctx = ImageManipulator.manipulate(src);
    ctx.crop(crop);
    if (target.width !== crop.width) ctx.resize({ width: target.width });
    ref = await ctx.renderAsync();
    const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: quality, base64: withBase64 });
    return { uri: out.uri, width: out.width, height: out.height, base64: out.base64 };
  } catch (e) {
    throw new AppError('decode-failed', undefined, e);
  } finally {
    release(ref);
    release(ctx);
    release(src);
    release(srcCtx);
  }
}

export function decodeJpegBase64(b64: string): RgbaImage {
  const bytes = base64ToBytes(b64);
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 64 });
  return { width: decoded.width, height: decoded.height, data: decoded.data };
}

/** Produces the small RGBA image used for pixel statistics. */
export async function decodeForAnalysis(uri: string, size: Size, maxSide: number): Promise<RgbaImage> {
  const small = await renderJpeg(uri, size, maxSide, 0.92, true);
  if (!small.base64) throw new AppError('decode-failed');
  try {
    return decodeJpegBase64(small.base64);
  } catch (e) {
    throw new AppError('decode-failed', undefined, e);
  }
}
