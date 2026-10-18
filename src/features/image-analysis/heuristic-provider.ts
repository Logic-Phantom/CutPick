import { AppError } from '@/domain/errors';
import type { PhotoAsset } from '@/domain/models';
import { ANALYSIS_CONFIG } from '@/domain/recommendation-policy';
import { persistThumbnail, isFileReachable } from '@/infrastructure/file-storage/app-files';
import { decodeForAnalysis, renderJpeg } from '@/infrastructure/image-processing/image-pipeline';

import type { AnalysisCapabilities, PhotoAnalysisProvider, PhotoAnalysisResult } from './contracts';
import { lumaSignature } from './perceptual-hash';
import { computeQualityMetrics } from './pixel-metrics';

export const HEURISTIC_CAPABILITIES: AnalysisCapabilities = {
  providerId: 'heuristic-v1',
  sharpness: 'supported',
  exposure: 'supported',
  contrast: 'supported',
  resolution: 'supported',
  color: 'supported',
  duplicates: 'supported',
  sceneClassification: 'manual',
  faceDetection: 'unsupported',
  eyesClosed: 'unsupported',
  expression: 'unsupported',
  aesthetics: 'unsupported',
};

/** Model-free, on-device provider. No network access. */
export class HeuristicAnalysisProvider implements PhotoAnalysisProvider {
  async getCapabilities(): Promise<AnalysisCapabilities> {
    return HEURISTIC_CAPABILITIES;
  }

  async analyzeOne(photo: PhotoAsset): Promise<PhotoAnalysisResult> {
    if (!isFileReachable(photo.localUri)) throw new AppError('file-access-lost');
    const size = { width: photo.width, height: photo.height };

    // 1) Display thumbnail from the original (single native decode of the full image).
    const thumb = await renderJpeg(photo.localUri, size, ANALYSIS_CONFIG.thumbnailMaxSide, ANALYSIS_CONFIG.thumbnailQuality, process.env.EXPO_OS === 'web');
    const thumbnailUri = await persistThumbnail(thumb.uri, photo.projectId, photo.id, thumb.base64);

    // 2) Tiny analysis image derived from the thumbnail, decoded to RGBA in JS.
    const img = await decodeForAnalysis(thumbnailUri, { width: thumb.width, height: thumb.height }, ANALYSIS_CONFIG.analysisMaxSide);
    const originalWidth = photo.width || thumb.width;
    const originalHeight = photo.height || thumb.height;
    const metrics = computeQualityMetrics({ image: img, originalWidth, originalHeight });
    const perceptualHash = lumaSignature(img);

    return { photoId: photo.id, status: 'done', thumbnailUri, perceptualHash, metrics };
  }
}
