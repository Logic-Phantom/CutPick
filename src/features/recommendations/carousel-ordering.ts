import type { PhotoAsset } from '@/domain/models';

import { visualSimilarity } from './diversity-selector';

export interface OrderInput {
  photo: PhotoAsset;
  score: number;
  pinned: boolean;
}

export type OrderStrategy = 'chronological' | 'contrast';

/**
 * Orders a selection for a carousel:
 * 1. Cover = highest-scoring photo (pinned photos win ties).
 * 2. If most photos have a capture time, the rest follow capture order (story flow).
 *    Otherwise a greedy pass avoids placing visually similar photos next to each other.
 */
export function orderCarousel(items: OrderInput[]): { orderedIds: string[]; strategy: OrderStrategy } {
  if (items.length <= 1) return { orderedIds: items.map((i) => i.photo.id), strategy: 'contrast' };
  const sorted = [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.score - a.score);
  const cover = sorted[0];
  const rest = sorted.slice(1);

  const withTime = rest.filter((i) => i.photo.createdAt && Number.isFinite(Date.parse(i.photo.createdAt)));
  if (withTime.length >= Math.ceil(rest.length * 0.6)) {
    const t = (i: OrderInput) => (i.photo.createdAt ? Date.parse(i.photo.createdAt) : Number.POSITIVE_INFINITY);
    const ordered = [...rest].sort((a, b) => t(a) - t(b) || a.photo.importIndex - b.photo.importIndex);
    return { orderedIds: [cover.photo.id, ...ordered.map((i) => i.photo.id)], strategy: 'chronological' };
  }

  const out: OrderInput[] = [cover];
  const remaining = [...rest];
  while (remaining.length) {
    const prev = out[out.length - 1];
    let bestIdx = 0;
    let best = -Infinity;
    remaining.forEach((c, i) => {
      const v = c.score - 0.5 * visualSimilarity(c.photo, prev.photo) + (c.photo.orientation !== prev.photo.orientation ? 0.03 : 0);
      if (v > best) {
        best = v;
        bestIdx = i;
      }
    });
    out.push(remaining.splice(bestIdx, 1)[0]);
  }
  return { orderedIds: out.map((i) => i.photo.id), strategy: 'contrast' };
}

/** Moves an item by delta positions (accessible alternative to drag). */
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [it] = copy.splice(index, 1);
  copy.splice(target, 0, it);
  return copy;
}
