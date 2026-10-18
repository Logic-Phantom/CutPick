import type { LearnedWeights, PhotoAsset, RecommendedPhoto, UserPreference } from '@/domain/models';
import { colorTargetsFrom } from '@/features/onboarding/preference-schema';
import { clampCount, getAspect, getPurpose, type AspectOption, type PlatformPurpose } from '@/features/platforms/platform-profiles';
import { getPreset } from '@/features/style-presets/preset-registry';
import type { StylePreset } from '@/features/style-presets/presets';

import { orderCarousel, type OrderStrategy } from './carousel-ordering';
import { selectDiverse, type ScoredPhoto } from './diversity-selector';
import { explain } from './explanations';
import { scorePhoto, technicalQuality } from './scoring';

export interface RecommendInput {
  photos: PhotoAsset[];
  purposeId: string;
  aspectId?: string | null;
  targetCount: number;
  presetId: string;
  preference: UserPreference;
  learned: LearnedWeights | null;
  pinnedIds: string[];
  excludedIds: string[];
  /** User overrides: groupId -> representative photoId. */
  groupRepresentatives: Record<string, string>;
  /** Keep a user-edited order for photos that remain selected. */
  previousOrder?: string[];
}

export interface RecommendOutput {
  purpose: PlatformPurpose;
  aspect: AspectOption;
  preset: StylePreset;
  target: number;
  orderedIds: string[];
  /** For single-photo purposes: ranked alternatives (including the chosen one). */
  alternatives: string[];
  details: RecommendedPhoto[];
  /** Score for every non-excluded photo (for the "all photos" view). */
  allScores: Map<string, number>;
  strategy: OrderStrategy | 'manual';
  analyzedCount: number;
  /** photoId -> representative photoId for photos in duplicate groups. */
  groupRepresentative: Map<string, string>;
}

export function buildGroupRepresentatives(photos: PhotoAsset[], overrides: Record<string, string>, quality: (p: PhotoAsset) => number): Map<string, string> {
  const groups = new Map<string, PhotoAsset[]>();
  for (const p of photos) {
    if (!p.duplicateGroupId) continue;
    const list = groups.get(p.duplicateGroupId) ?? [];
    list.push(p);
    groups.set(p.duplicateGroupId, list);
  }
  const map = new Map<string, string>();
  for (const [gid, members] of groups) {
    if (members.length < 2) continue;
    const override = overrides[gid];
    const rep = members.find((m) => m.id === override) ?? members.reduce((b, m) => (quality(m) > quality(b) ? m : b));
    for (const m of members) map.set(m.id, rep.id);
  }
  return map;
}

export function recommend(input: RecommendInput): RecommendOutput {
  const purpose = getPurpose(input.purposeId);
  const aspect = getAspect(purpose, input.aspectId);
  const preset = getPreset(input.presetId);
  const target = clampCount(purpose, input.targetCount);
  const colorTargets = colorTargetsFrom(input.preference);
  const excluded = new Set(input.excludedIds);

  const qualityOf = (p: PhotoAsset) => (p.qualityMetrics ? technicalQuality(p.qualityMetrics) : 0);
  const groupRepresentative = buildGroupRepresentatives(input.photos, input.groupRepresentatives, qualityOf);

  const ctx = {
    preset,
    colorTargets,
    learned: input.learned,
    personalizationEnabled: input.preference.personalizationEnabled,
    aspectRatio: aspect.ratio,
    groupRepresentative,
  };
  const scored: ScoredPhoto[] = input.photos.map((photo) => ({ photo, score: scorePhoto(photo, ctx) }));
  const allScores = new Map(scored.filter((s) => !excluded.has(s.photo.id)).map((s) => [s.photo.id, s.score.total]));

  const singleAlternatives = purpose.alternativesForSingle;
  const pickCount = target === 1 && singleAlternatives > 1 ? singleAlternatives : target;
  const selection = selectDiverse(scored, { target: pickCount, pinnedIds: input.pinnedIds, excludedIds: input.excludedIds });

  const byId = new Map(scored.map((s) => [s.photo.id, s]));
  let orderedIds: string[];
  let strategy: RecommendOutput['strategy'];
  let alternatives: string[] = [];

  if (target === 1) {
    // Single-photo purposes: best first, the rest are alternatives to compare.
    const ranked = [...selection].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.adjustedScore - a.adjustedScore).map((s) => s.photoId);
    orderedIds = ranked.slice(0, 1);
    alternatives = ranked;
    strategy = 'contrast';
  } else {
    const selectedIds = new Set(selection.map((s) => s.photoId));
    const prev = (input.previousOrder ?? []).filter((id) => selectedIds.has(id));
    if (prev.length === selectedIds.size && prev.length > 0) {
      orderedIds = prev;
      strategy = 'manual';
    } else {
      const res = orderCarousel(selection.map((s) => ({ photo: byId.get(s.photoId)!.photo, score: byId.get(s.photoId)!.score.total, pinned: s.pinned })));
      // Keep previously ordered photos in place, append newly added ones in suggested order.
      orderedIds = prev.length ? [...prev, ...res.orderedIds.filter((id) => !prev.includes(id))] : res.orderedIds;
      strategy = prev.length ? 'manual' : res.strategy;
    }
  }

  const selInfo = new Map(selection.map((s) => [s.photoId, s]));
  const detailIds = target === 1 ? alternatives : orderedIds;
  const details: RecommendedPhoto[] = detailIds.map((id, idx) => {
    const s = byId.get(id)!;
    const info = selInfo.get(id) ?? null;
    return {
      photoId: id,
      score: Math.round(s.score.total * 1000) / 1000,
      pinned: !!info?.pinned,
      reasons: explain(s.photo, s.score, info, aspect, preset, idx === 0),
    };
  });

  return {
    purpose,
    aspect,
    preset,
    target,
    orderedIds,
    alternatives,
    details,
    allScores,
    strategy,
    analyzedCount: input.photos.filter((p) => p.analysisStatus === 'done').length,
    groupRepresentative,
  };
}
