/**
 * Core domain models for Cutpick.
 * Fields marked optional are only filled when a real signal exists — never with guessed values.
 */

export type AnalysisStatus = 'pending' | 'processing' | 'done' | 'failed' | 'unavailable';

export type SourceContext = 'travel' | 'food' | 'date' | 'cafe' | 'ootd' | 'daily' | 'profile' | 'custom';

export type PlatformId = 'instagram' | 'tiktok' | 'kakaotalk';

/** Scene tags are only set by the user (manual tagging). No automatic scene classifier ships in the MVP. */
export type SceneTag = 'person' | 'food' | 'landscape' | 'building' | 'detail' | 'pet' | 'product' | 'other';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface PhotoQualityMetrics {
  /** Normalized 0..1 variance-of-Laplacian on the downscaled analysis image. */
  sharpnessScore: number;
  /** 0..1, 1 = mean luminance near mid-tone with few clipped pixels. */
  exposureScore: number;
  /** 0..1, normalized luminance standard deviation. */
  contrastScore: number;
  /** 0..1, based on the original pixel count. */
  resolutionScore: number;
  /** Raw stats kept so explanations and style presets can reason about them. */
  meanLuma: number;
  highlightClipRatio: number;
  shadowClipRatio: number;
  /** Hasler–Süsstrunk colorfulness, normalized 0..1. */
  colorfulness: number;
  /** -1 (cool/blue) .. 1 (warm/red), from mean R-B difference. */
  warmth: number;
  /** Mean RGB of the analysis image, used to keep different-colored scenes out of one duplicate group. */
  meanRgb: [number, number, number];
  analysisVersion: number;
  calculatedAt: string;
}

export interface PhotoAsset {
  id: string;
  projectId: string;
  localUri: string;
  /** Media library id when the OS provided one. */
  assetId?: string | null;
  width: number;
  height: number;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  /** Only when the OS/EXIF actually provided it. */
  createdAt?: string | null;
  orientation: Orientation;
  thumbnailUri?: string | null;
  /** 16x16 luma signature (hex) used as the perceptual fingerprint. */
  perceptualHash?: string | null;
  qualityMetrics?: PhotoQualityMetrics | null;
  sceneTags: SceneTag[];
  duplicateGroupId?: string | null;
  analysisStatus: AnalysisStatus;
  analysisError?: string | null;
  /** Position in the user's original selection. */
  importIndex: number;
}

export interface CutpickProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sourceContext: SourceContext;
  selectedPlatforms: PlatformId[];
  targetPhotoCount: number;
  stylePresetId: string;
  /** True for projects built from the bundled synthetic sample images. */
  isSample: boolean;
  photoCount?: number;
  coverUri?: string | null;
}

export interface CropPreference {
  photoId: string;
  aspect: string;
  /** Normalized 0..1 crop rect inside the original image. */
  rect: { x: number; y: number; width: number; height: number };
}

export interface RecommendationReason {
  code: string;
  text: string;
  /** 'positive' adds to the score, 'info' is neutral context, 'caution' lowers it. */
  tone: 'positive' | 'info' | 'caution';
}

export interface RecommendedPhoto {
  photoId: string;
  score: number;
  reasons: RecommendationReason[];
  pinned: boolean;
}

export interface RecommendationSet {
  id: string;
  projectId: string;
  platform: PlatformId;
  purposeId: string;
  aspectId: string;
  selectedPhotoIds: string[];
  /** Final order (auto or manual) used by export. */
  orderedPhotoIds: string[];
  /** Order explicitly edited by the user; empty when the order is automatic. */
  manualOrder?: string[];
  pinnedPhotoIds: string[];
  excludedPhotoIds: string[];
  /** Representative override per duplicate group: groupId -> photoId. */
  groupRepresentatives: Record<string, string>;
  cropPreferences: CropPreference[];
  captionDraft: string;
  stylePresetId: string;
  targetCount: number;
  recommendationVersion: number;
  createdAt: string;
  updatedAt: string;
  details: RecommendedPhoto[];
}

export interface UserPreference {
  preferredSubjects: string[];
  preferredFoodAngles: string[];
  preferredPortraitAndOOTDAngles: string[];
  preferredComposition: string[];
  preferredColorMood: string[];
  preferredFilterStrength: 'none' | 'light' | 'preset' | null;
  preferredRetouchingStrength: 'off' | 'very-light' | null;
  preferredPlatformPurposes: string[];
  preferredStyles: string[];
  avoidStyles: string[];
  personalizationEnabled: boolean;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
  preferenceUpdatedAt: string;
  preferenceSchemaVersion: number;
}

/** Explicit user actions used for local personalization (capped, deletable). */
export type PreferenceEventType = 'keep' | 'exclude' | 'pin' | 'reorder' | 'preset-like';

export interface PreferenceEvent {
  id: string;
  type: PreferenceEventType;
  /** Feature snapshot of the photo involved (no image data). */
  features: { meanLuma: number; colorfulness: number; warmth: number; contrast: number; orientation: Orientation } | null;
  presetId?: string | null;
  createdAt: string;
}

/** Learned local adjustments, each bounded to [-1, 1]. */
export interface LearnedWeights {
  brightness: number;
  colorfulness: number;
  warmth: number;
  contrast: number;
  portraitOrientation: number;
  eventCount: number;
  updatedAt: string;
}
