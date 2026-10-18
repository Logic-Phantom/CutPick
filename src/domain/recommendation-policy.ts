/**
 * All numeric weights/thresholds for analysis and recommendation live here.
 * These are tunable starting points, not objective aesthetic truths.
 */
/** 2: image-based taste (style cards) joins the preference match and adds scene/orientation bonuses. */
export const RECOMMENDATION_VERSION = 2;
/** Bump when analysis output changes; photos analyzed with an older version are re-queued. */
export const ANALYSIS_VERSION = 2;

export const ANALYSIS_CONFIG = {
  /** Longest side (px) of the in-memory image used for pixel statistics. */
  analysisMaxSide: 128,
  /** Longest side (px) of the stored display thumbnail. */
  thumbnailMaxSide: 480,
  thumbnailQuality: 0.8,
  /** Concurrent decode jobs. Kept low to protect memory on low-end devices. */
  concurrency: 2,
  /** Laplacian variance at which sharpness saturates to 1 (on the 128px image). */
  sharpnessSaturation: 900,
  /** Luma (0..255) thresholds for clipped pixel counting. */
  highlightClip: 250,
  shadowClip: 6,
  /** Megapixels at which resolution score saturates to 1. */
  resolutionSaturationMp: 8,
  /**
   * Luma-signature distance (0..255) at or below which two photos are "near duplicates".
   * Calibrated on assets/samples: duplicates ≤ 2.2, unrelated ≥ 10.0 (docs/ANALYSIS_ALGORITHM.md).
   */
  duplicateSignatureThreshold: 5,
  /** Mean color distance (0..441) above which near-hash photos are NOT grouped (e.g. different dishes). */
  duplicateMaxColorDistance: 40,
  /** If both photos have capture time, max seconds apart for grouping. null disables the time gate. */
  duplicateMaxSecondsApart: 600 as number | null,
} as const;

/** Recommended photo counts per import. Device benchmarks have not been run yet (see docs/DEVICE_BENCHMARKS.md). */
export const IMPORT_LIMITS = {
  recommendedMax: 100,
  hardMax: 300,
  warnAbove: 150,
} as const;

export const SCORE_WEIGHTS = {
  quality: {
    sharpness: 0.4,
    exposure: 0.3,
    contrast: 0.15,
    resolution: 0.15,
  },
  /** Total weight of the technical quality component. Presets may scale it. */
  qualityTotal: 1.0,
  /** Weight of explicit onboarding preference match (color mood etc.). */
  preferenceTotal: 0.35,
  /** Weight of locally learned adjustments. */
  learnedTotal: 0.2,
  /** Platform/purpose fit (aspect ratio and crop loss). */
  goalFitTotal: 0.35,
  /**
   * Extra penalty when a crop keeps less than `heavyCropRetention` of the photo
   * (e.g. a landscape shot forced into 9:16). Found on device: a 63%-loss crop was picked 2nd.
   */
  heavyCropRetention: 0.6,
  heavyCropPenalty: 0.45,
  /** Bonus for being the best photo of its duplicate group. */
  groupRepresentativeBonus: 0.1,
  /** Applied to non-representative members of a duplicate group. */
  duplicatePenalty: 0.6,
  /** Pinned photos always rank first; this is only used to sort among pinned. */
  pinnedBoost: 10,
} as const;

export const DIVERSITY = {
  /** Weight of similarity to already-selected photos (MMR lambda complement). */
  similarityPenalty: 0.35,
  /** Signature distance considered "very different" (no similarity penalty). */
  signatureDistanceFree: 25,
  /** Bonus for adding an orientation not yet represented. */
  orientationBonus: 0.05,
  /** Bonus for a user scene tag not yet represented. */
  sceneBonus: 0.08,
} as const;

/**
 * Image-based taste (style cards picked in onboarding). These never touch the technical quality
 * score: color tags join the existing preference match (preferenceTotal), the rest are small
 * separate bonuses that only apply when a real signal exists on the photo.
 */
export const TASTE = {
  /** Color targets per style tag, same scale as PhotoQualityMetrics (luma 0..255, colorfulness 0..1, warmth -1..1). */
  tagColorTargets: {
    warm: { warmth: 0.35 },
    bright: { luma: 165 },
    calm: { luma: 110, colorfulness: 0.25 },
    film: { luma: 120, colorfulness: 0.2 },
    'natural-light': { luma: 145, warmth: 0.15 },
    muted: { colorfulness: 0.18 },
    vivid: { colorfulness: 0.6 },
    dark: { luma: 70, colorfulness: 0.5 },
  } as Record<string, { luma?: number; colorfulness?: number; warmth?: number }>,
  /** Bonus when a user-applied scene tag on the photo matches a picked scene card. */
  sceneMatchBonus: 0.12,
  /** Bonus when the photo orientation matches a picked composition (wide → landscape, OOTD → portrait). */
  orientationBonus: 0.06,
  /** Per-tag color similarity (0..1) needed before a reason names that tag. */
  reasonMinMatch: 0.75,
} as const;

/** Learning rate for local personalization; each event moves a weight by at most this amount. */
export const PERSONALIZATION = {
  learningRate: 0.04,
  maxEvents: 200,
  /** Number of events needed before learned weights are applied at full strength. */
  warmupEvents: 8,
} as const;
