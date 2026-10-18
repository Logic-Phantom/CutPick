import type { PhotoAsset, PhotoQualityMetrics } from '@/domain/models';

export type CapabilityStatus = 'supported' | 'unsupported' | 'manual';

/** What the active provider can actually compute. The UI shows this list verbatim. */
export interface AnalysisCapabilities {
  providerId: string;
  sharpness: CapabilityStatus;
  exposure: CapabilityStatus;
  contrast: CapabilityStatus;
  resolution: CapabilityStatus;
  color: CapabilityStatus;
  duplicates: CapabilityStatus;
  /** No classifier ships; users can tag scenes manually. */
  sceneClassification: CapabilityStatus;
  faceDetection: CapabilityStatus;
  eyesClosed: CapabilityStatus;
  expression: CapabilityStatus;
  aesthetics: CapabilityStatus;
}

export interface AnalysisInput {
  jobId: string;
  projectId: string;
  photos: PhotoAsset[];
}

export type AnalysisStage = 'checking' | 'thumbnail' | 'quality' | 'grouping' | 'done';

export interface AnalysisProgress {
  jobId: string;
  stage: AnalysisStage;
  processed: number;
  failed: number;
  total: number;
}

export interface PhotoAnalysisResult {
  photoId: string;
  status: 'done' | 'failed';
  thumbnailUri?: string;
  perceptualHash?: string;
  metrics?: PhotoQualityMetrics;
  errorCode?: string;
}

export interface PhotoAnalysisProvider {
  getCapabilities(): Promise<AnalysisCapabilities>;
  analyzeOne(photo: PhotoAsset): Promise<PhotoAnalysisResult>;
}
