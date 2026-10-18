import type { LearnedWeights, PhotoAsset, PhotoQualityMetrics, SceneTag } from '@/domain/models';
import { PERSONALIZATION, SCORE_WEIGHTS } from '@/domain/recommendation-policy';
import { cropRetention } from '@/features/platforms/crop';
import { colorMatch, tasteBonus, type ColorTargets, type TasteProfile } from '@/features/preferences/taste-profile';
import type { StylePreset } from '@/features/style-presets/presets';

export interface ScoreContext {
  preset: StylePreset;
  colorTargets: ColorTargets;
  /** Image-based taste (scene/orientation). Omitted = no taste beyond colorTargets. */
  taste?: TasteProfile | null;
  learned: LearnedWeights | null;
  personalizationEnabled: boolean;
  /** Target aspect ratio (w/h) or null for "keep original". */
  aspectRatio: number | null;
  /** photoId -> representative photoId of its duplicate group. */
  groupRepresentative: Map<string, string>;
}

export interface ScoreBreakdown {
  quality: number;
  preference: number;
  /** Scene/orientation bonus from image-based taste (separate from quality and color match). */
  taste?: number;
  learned: number;
  goalFit: number;
  duplicate: number;
  total: number;
  /** Raw sub-signals reused by explanations. */
  cropRetention: number;
  isGroupRepresentative: boolean;
  isGroupMember: boolean;
  preferenceMatch: number | null;
  tasteScene?: SceneTag | null;
  tasteOrientation?: boolean;
}

/** Pure technical quality (0..1), unaffected by taste. */
export function technicalQuality(m: Pick<PhotoQualityMetrics, 'sharpnessScore' | 'exposureScore' | 'contrastScore' | 'resolutionScore'>, exposureWeight = 1): number {
  const w = SCORE_WEIGHTS.quality;
  const ew = w.exposure * exposureWeight;
  const sum = w.sharpness + ew + w.contrast + w.resolution;
  return (w.sharpness * m.sharpnessScore + ew * m.exposureScore + w.contrast * m.contrastScore + w.resolution * m.resolutionScore) / sum;
}

/** Blend preset targets with the user's explicit color mood (user choice wins when both exist). */
export function effectiveTargets(preset: StylePreset, user: ColorTargets): ColorTargets {
  const pick = (u: number | null, p: number | null) => (u != null && p != null ? 0.6 * u + 0.4 * p : u ?? p);
  return {
    luma: pick(user.luma, preset.adjust.targetLuma),
    colorfulness: pick(user.colorfulness, preset.adjust.targetColorfulness),
    warmth: pick(user.warmth, preset.adjust.targetWarmth),
  };
}

/** 0..1 similarity to targets, or null when there are no targets. */
export function preferenceMatch(m: PhotoQualityMetrics, t: ColorTargets): number | null {
  return colorMatch(m, t);
}

/** Feature vector used by local personalization, each roughly in -1..1. */
export function personalFeatures(
  m: Pick<PhotoQualityMetrics, 'meanLuma' | 'colorfulness' | 'warmth' | 'contrastScore'>,
  orientation: PhotoAsset['orientation'],
) {
  return {
    brightness: (m.meanLuma - 128) / 128,
    colorfulness: m.colorfulness * 2 - 1,
    warmth: m.warmth,
    contrast: m.contrastScore * 2 - 1,
    portraitOrientation: orientation === 'portrait' ? 1 : orientation === 'landscape' ? -1 : 0,
  };
}

export function learnedAdjustment(m: PhotoQualityMetrics, orientation: PhotoAsset['orientation'], lw: LearnedWeights | null): number {
  if (!lw || lw.eventCount === 0) return 0;
  const f = personalFeatures(m, orientation);
  const dot = f.brightness * lw.brightness + f.colorfulness * lw.colorfulness + f.warmth * lw.warmth + f.contrast * lw.contrast + f.portraitOrientation * lw.portraitOrientation;
  const warm = Math.min(1, lw.eventCount / PERSONALIZATION.warmupEvents);
  // dot is in roughly -5..5; squash to -1..1
  return Math.tanh(dot / 2) * warm;
}

export function scorePhoto(photo: PhotoAsset, ctx: ScoreContext): ScoreBreakdown {
  const m = photo.qualityMetrics;
  const rep = ctx.groupRepresentative.get(photo.id);
  const isGroupMember = rep != null;
  const isGroupRepresentative = rep === photo.id;
  const retention = cropRetention(photo.width, photo.height, ctx.aspectRatio);
  const heavyLoss = Math.max(0, SCORE_WEIGHTS.heavyCropRetention - retention) / SCORE_WEIGHTS.heavyCropRetention;
  const goalFit = SCORE_WEIGHTS.goalFitTotal * retention - SCORE_WEIGHTS.heavyCropPenalty * heavyLoss;
  const duplicate = isGroupMember ? (isGroupRepresentative ? SCORE_WEIGHTS.groupRepresentativeBonus : -SCORE_WEIGHTS.duplicatePenalty) : 0;

  if (!m) {
    // Unanalyzed photos can still be chosen manually but rank below analyzed ones.
    const total = goalFit + duplicate;
    return { quality: 0, preference: 0, taste: 0, learned: 0, goalFit, duplicate, total, cropRetention: retention, isGroupRepresentative, isGroupMember, preferenceMatch: null, tasteScene: null, tasteOrientation: false };
  }

  // Taste never feeds into `quality`: it is computed from the technical metrics alone.
  const quality = SCORE_WEIGHTS.qualityTotal * ctx.preset.adjust.qualityWeight * technicalQuality(m, ctx.preset.adjust.exposureWeight);
  const match = preferenceMatch(m, effectiveTargets(ctx.preset, ctx.colorTargets));
  const preference = match == null ? 0 : SCORE_WEIGHTS.preferenceTotal * (match - 0.5) * 2;
  const bonus = ctx.taste ? tasteBonus(photo, ctx.taste) : { value: 0, scene: null, orientation: false };
  const learned = ctx.personalizationEnabled ? SCORE_WEIGHTS.learnedTotal * learnedAdjustment(m, photo.orientation, ctx.learned) : 0;
  const total = quality + preference + bonus.value + learned + goalFit + duplicate;
  return {
    quality,
    preference,
    taste: bonus.value,
    learned,
    goalFit,
    duplicate,
    total,
    cropRetention: retention,
    isGroupRepresentative,
    isGroupMember,
    preferenceMatch: match,
    tasteScene: bonus.scene,
    tasteOrientation: bonus.orientation,
  };
}
