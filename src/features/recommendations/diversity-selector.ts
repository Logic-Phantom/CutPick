import type { PhotoAsset } from '@/domain/models';
import { DIVERSITY } from '@/domain/recommendation-policy';
import { signatureDistance } from '@/features/image-analysis/perceptual-hash';

import type { ScoreBreakdown } from './scoring';

export interface ScoredPhoto {
  photo: PhotoAsset;
  score: ScoreBreakdown;
}

export interface SelectionInfo {
  photoId: string;
  pinned: boolean;
  /** Max visual similarity (0..1) to photos chosen before it. */
  similarityToPrevious: number;
  addedNewOrientation: boolean;
  addedNewScene: boolean;
  /** Picked from a duplicate group because no other candidates were left. */
  duplicateFallback: boolean;
  adjustedScore: number;
}

export function visualSimilarity(a: PhotoAsset, b: PhotoAsset): number {
  if (!a.perceptualHash || !b.perceptualHash) return 0;
  const d = signatureDistance(a.perceptualHash, b.perceptualHash);
  return Math.max(0, 1 - d / DIVERSITY.signatureDistanceFree);
}

export interface SelectOptions {
  target: number;
  pinnedIds: string[];
  excludedIds: string[];
}

/**
 * Greedy maximal-marginal-relevance selection: not simply top-N.
 * Pinned photos are always kept; excluded photos are never chosen.
 */
export function selectDiverse(candidates: ScoredPhoto[], opts: SelectOptions): SelectionInfo[] {
  const excluded = new Set(opts.excludedIds);
  const byId = new Map(candidates.map((c) => [c.photo.id, c]));
  const selected: SelectionInfo[] = [];
  const chosen: PhotoAsset[] = [];
  const orientations = new Set<string>();
  const scenes = new Set<string>();

  const take = (c: ScoredPhoto, info: Omit<SelectionInfo, 'photoId'>) => {
    selected.push({ photoId: c.photo.id, ...info });
    chosen.push(c.photo);
    orientations.add(c.photo.orientation);
    c.photo.sceneTags.forEach((t) => scenes.add(t));
  };

  for (const id of opts.pinnedIds) {
    const c = byId.get(id);
    if (!c || excluded.has(id) || selected.some((s) => s.photoId === id)) continue;
    const sim = chosen.reduce((m, p) => Math.max(m, visualSimilarity(c.photo, p)), 0);
    take(c, { pinned: true, similarityToPrevious: sim, addedNewOrientation: false, addedNewScene: false, duplicateFallback: false, adjustedScore: c.score.total });
  }

  const pool = candidates.filter((c) => !excluded.has(c.photo.id) && !selected.some((s) => s.photoId === c.photo.id));
  const primary = pool.filter((c) => !c.score.isGroupMember || c.score.isGroupRepresentative);
  const fallback = pool.filter((c) => c.score.isGroupMember && !c.score.isGroupRepresentative);

  for (const [list, isFallback] of [[primary, false], [fallback, true]] as const) {
    const remaining = [...list];
    while (selected.length < opts.target && remaining.length) {
      let bestIdx = -1;
      let best = -Infinity;
      let bestMeta = { sim: 0, newO: false, newS: false };
      for (let i = 0; i < remaining.length; i++) {
        const c = remaining[i];
        const sim = chosen.reduce((m, p) => Math.max(m, visualSimilarity(c.photo, p)), 0);
        const newO = chosen.length > 0 && !orientations.has(c.photo.orientation);
        const newS = chosen.length > 0 && c.photo.sceneTags.some((t) => !scenes.has(t));
        const adjusted = c.score.total - DIVERSITY.similarityPenalty * sim + (newO ? DIVERSITY.orientationBonus : 0) + (newS ? DIVERSITY.sceneBonus : 0);
        if (adjusted > best) {
          best = adjusted;
          bestIdx = i;
          bestMeta = { sim, newO, newS };
        }
      }
      const [c] = remaining.splice(bestIdx, 1);
      take(c, { pinned: false, similarityToPrevious: bestMeta.sim, addedNewOrientation: bestMeta.newO, addedNewScene: bestMeta.newS, duplicateFallback: isFallback, adjustedScore: best });
    }
  }
  return selected;
}
