import { ImageManipulator, SaveFormat, type ImageManipulatorContext, type ImageRef } from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';

import { AppError } from '@/domain/errors';
import type { RgbaImage } from '@/features/image-analysis/pixel-metrics';
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

/** Crops (normalized rect) and resizes, returning a JPEG suitable for export or upload. */
export async function renderCroppedJpeg(
  uri: string,
  size: Size,
  rect: { x: number; y: number; width: number; height: number },
  maxSide: number,
  quality: number,
  withBase64 = false,
): Promise<RenderedJpeg> {
  let ctx: ImageManipulatorContext | null = null;
  let ref: ImageRef | null = null;
  try {
    ctx = ImageManipulator.manipulate(uri);
    const crop = {
      originX: Math.round(rect.x * size.width),
      originY: Math.round(rect.y * size.height),
      width: Math.max(1, Math.round(rect.width * size.width)),
      height: Math.max(1, Math.round(rect.height * size.height)),
    };
    ctx.crop(crop);
    ctx.resize(fitLongestSide({ width: crop.width, height: crop.height }, maxSide));
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
