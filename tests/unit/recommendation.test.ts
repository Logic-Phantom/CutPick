import type { PhotoAsset } from '@/domain/models';
import { defaultPreference } from '@/features/onboarding/preference-schema';
import { applyEvent, emptyLearnedWeights } from '@/features/preferences/personalization';
import { moveItem, orderCarousel } from '@/features/recommendations/carousel-ordering';
import { selectDiverse } from '@/features/recommendations/diversity-selector';
import { recommend, type RecommendInput } from '@/features/recommendations/engine';
import { scorePhoto, technicalQuality } from '@/features/recommendations/scoring';
import { getPreset } from '@/features/style-presets/preset-registry';

import { metrics, photo } from '../helpers/fixtures';

function input(photos: PhotoAsset[], over: Partial<RecommendInput> = {}): RecommendInput {
  return {
    photos,
    purposeId: 'instagram-carousel',
    targetCount: 4,
    presetId: 'natural-daily',
    preference: defaultPreference(),
    learned: null,
    pinnedIds: [],
    excludedIds: [],
    groupRepresentatives: {},
    ...over,
  };
}

/** Luma signatures with clearly different structure (pairwise distance well above 25). */
function distinctHash(i: number): string {
  const k = i % 10;
  return Array.from({ length: 256 }, (_, j) => {
    const x = j % 16;
    const y = Math.floor(j / 16);
    const v = ((x * (k + 1) + y * (10 - k) * 3) % 16) * 15;
    return v.toString(16).padStart(2, '0');
  }).join('');
}

function set(n: number, q = (i: number) => 0.5 + i * 0.03): PhotoAsset[] {
  return Array.from({ length: n }, (_, i) => photo({ id: `x${i}`, importIndex: i, perceptualHash: distinctHash(i), qualityMetrics: metrics({ sharpnessScore: q(i), exposureScore: q(i) }) }));
}

describe('scoring', () => {
  it('technical quality is independent of taste', () => {
    const m = metrics({ sharpnessScore: 1, exposureScore: 1, contrastScore: 1, resolutionScore: 1 });
    expect(technicalQuality(m)).toBeCloseTo(1, 5);
  });

  it('retro-flash preset tolerates clipped exposure more than natural', () => {
    const p = photo({ qualityMetrics: metrics({ exposureScore: 0.1, sharpnessScore: 0.8 }) });
    const ctx = (presetId: string) => ({ preset: getPreset(presetId), colorTargets: { luma: null, colorfulness: null, warmth: null }, learned: null, personalizationEnabled: true, aspectRatio: 0.8, groupRepresentative: new Map() });
    const natural = scorePhoto(p, ctx('natural-daily'));
    const flash = scorePhoto(p, ctx('retro-flash'));
    const qNatural = natural.quality / getPreset('natural-daily').adjust.qualityWeight;
    const qFlash = flash.quality / getPreset('retro-flash').adjust.qualityWeight;
    expect(qFlash).toBeGreaterThan(qNatural);
  });

  it('non-representative duplicates are penalized; representative gets a bonus', () => {
    const a = photo({ id: 'a' });
    const b = photo({ id: 'b' });
    const ctx = { preset: getPreset('natural-daily'), colorTargets: { luma: null, colorfulness: null, warmth: null }, learned: null, personalizationEnabled: true, aspectRatio: null, groupRepresentative: new Map([['a', 'a'], ['b', 'a']]) };
    expect(scorePhoto(a, ctx).duplicate).toBeGreaterThan(0);
    expect(scorePhoto(b, ctx).duplicate).toBeLessThan(0);
  });

  it('crop fit rewards photos matching the target ratio', () => {
    const portrait = photo({ width: 3000, height: 3750 });
    const landscape = photo({ width: 4000, height: 2250, orientation: 'landscape' });
    const ctx = { preset: getPreset('natural-daily'), colorTargets: { luma: null, colorfulness: null, warmth: null }, learned: null, personalizationEnabled: true, aspectRatio: 4 / 5, groupRepresentative: new Map() };
    expect(scorePhoto(portrait, ctx).goalFit).toBeGreaterThan(scorePhoto(landscape, ctx).goalFit);
  });
});

describe('recommendation engine', () => {
  it('returns exactly the target count when enough photos exist', () => {
    for (const target of [2, 4, 8]) {
      const out = recommend(input(set(12), { targetCount: target }));
      expect(out.orderedIds).toHaveLength(target);
      expect(new Set(out.orderedIds).size).toBe(target);
    }
  });

  it('clamps the target to the purpose limits', () => {
    expect(recommend(input(set(30), { targetCount: 999 })).target).toBe(20);
    expect(recommend(input(set(30), { targetCount: 0 })).target).toBe(2);
  });

  it('never selects excluded photos and always keeps pinned ones', () => {
    const photos = set(10);
    const best = 'x9';
    const worst = 'x0';
    const out = recommend(input(photos, { excludedIds: [best], pinnedIds: [worst] }));
    expect(out.orderedIds).not.toContain(best);
    expect(out.orderedIds).toContain(worst);
  });

  it('is not simply top-N: avoids a second near-duplicate when alternatives exist', () => {
    const photos = set(6);
    // Make x5 and x4 near duplicates in the same group (both high quality).
    photos[4] = { ...photos[4], perceptualHash: photos[5].perceptualHash, duplicateGroupId: 'g1' };
    photos[5] = { ...photos[5], duplicateGroupId: 'g1' };
    const out = recommend(input(photos, { targetCount: 3 }));
    const both = out.orderedIds.includes('x4') && out.orderedIds.includes('x5');
    expect(both).toBe(false);
  });

  it('user can override a duplicate group representative', () => {
    const photos = set(4);
    photos[2] = { ...photos[2], duplicateGroupId: 'g' };
    photos[3] = { ...photos[3], duplicateGroupId: 'g' };
    const auto = recommend(input(photos, { targetCount: 2 }));
    expect(auto.groupRepresentative.get('x2')).toBe('x3');
    const over = recommend(input(photos, { targetCount: 2, groupRepresentatives: { g: 'x2' } }));
    expect(over.groupRepresentative.get('x3')).toBe('x2');
    expect(over.orderedIds).toContain('x2');
  });

  it('keeps a user-edited order across recomputation', () => {
    const photos = set(8);
    const first = recommend(input(photos));
    const custom = [...first.orderedIds].reverse();
    const again = recommend(input(photos, { previousOrder: custom }));
    expect(again.orderedIds).toEqual(custom);
    expect(again.strategy).toBe('manual');
  });

  it('single-photo purposes return one choice plus alternatives', () => {
    const out = recommend(input(set(10), { purposeId: 'kakao-profile', targetCount: 1 }));
    expect(out.orderedIds).toHaveLength(1);
    expect(out.alternatives).toHaveLength(3);
    expect(out.alternatives[0]).toBe(out.orderedIds[0]);
  });

  it('different taste profiles change the ranking without touching technical quality', () => {
    const photos = [
      photo({ id: 'warm', perceptualHash: distinctHash(1), qualityMetrics: metrics({ warmth: 0.6, meanLuma: 150, colorfulness: 0.5 }) }),
      photo({ id: 'cool', perceptualHash: distinctHash(2), qualityMetrics: metrics({ warmth: -0.5, meanLuma: 120, colorfulness: 0.3 }) }),
    ];
    const warmPref = { ...defaultPreference(), preferredColorMood: ['warm'] };
    const coolPref = { ...defaultPreference(), preferredColorMood: ['cool'] };
    const w = recommend(input(photos, { purposeId: 'instagram-single', targetCount: 1, preference: warmPref }));
    const c = recommend(input(photos, { purposeId: 'instagram-single', targetCount: 1, preference: coolPref }));
    expect(w.orderedIds[0]).toBe('warm');
    expect(c.orderedIds[0]).toBe('cool');
    expect(technicalQuality(photos[0].qualityMetrics!)).toBeCloseTo(technicalQuality(photos[1].qualityMetrics!), 6);
  });

  it('learned weights shift ranking only when personalization is enabled', () => {
    const photos = [
      photo({ id: 'bright', perceptualHash: distinctHash(1), qualityMetrics: metrics({ meanLuma: 200 }) }),
      photo({ id: 'dark', perceptualHash: distinctHash(2), qualityMetrics: metrics({ meanLuma: 60 }) }),
    ];
    let lw = emptyLearnedWeights();
    for (let i = 0; i < 12; i++) lw = applyEvent(lw, { id: `e${i}`, type: 'keep', features: { meanLuma: 40, colorfulness: 0.4, warmth: 0, contrast: 0.6, orientation: 'portrait' }, createdAt: '2026-10-18' });
    // retro-flash has no color targets, so only the learned signal differs between the two photos.
    const base = { purposeId: 'instagram-single', targetCount: 1, presetId: 'retro-flash', learned: lw };
    const on = recommend(input(photos, base));
    const off = recommend(input(photos, { ...base, preference: { ...defaultPreference(), personalizationEnabled: false } }));
    expect(on.orderedIds[0]).toBe('dark');
    // Without personalization both score the same; the stable tie-break keeps import order.
    expect(off.orderedIds[0]).toBe('bright');
  });

  it('explanations never claim face/eye/expression analysis', () => {
    const out = recommend(input(set(10)));
    const texts = out.details.flatMap((d) => d.reasons.map((r) => r.text)).join(' ');
    expect(texts).not.toMatch(/얼굴|눈 감|표정|미모|외모/);
    expect(out.details.every((d) => d.reasons.length > 0)).toBe(true);
  });

  it('unanalyzed photos rank below analyzed ones', () => {
    const photos = set(5);
    photos.push(photo({ id: 'raw', analysisStatus: 'pending', qualityMetrics: null, perceptualHash: null }));
    const out = recommend(input(photos, { targetCount: 3 }));
    expect(out.orderedIds).not.toContain('raw');
  });
});

describe('diversity & ordering helpers', () => {
  it('selectDiverse honours target and pins', () => {
    const photos = set(6);
    const scored = photos.map((p) => ({ photo: p, score: { quality: 0, preference: 0, learned: 0, goalFit: 0, duplicate: 0, total: p.qualityMetrics!.sharpnessScore, cropRetention: 1, isGroupMember: false, isGroupRepresentative: false, preferenceMatch: null } }));
    const sel = selectDiverse(scored, { target: 3, pinnedIds: ['x0'], excludedIds: ['x5'] });
    expect(sel.map((s) => s.photoId)).toContain('x0');
    expect(sel.map((s) => s.photoId)).not.toContain('x5');
    expect(sel).toHaveLength(3);
  });

  it('orders chronologically after the cover when capture times exist', () => {
    const items = [
      { photo: photo({ id: 'a', createdAt: '2026-10-01T10:05:00' }), score: 0.5, pinned: false },
      { photo: photo({ id: 'b', createdAt: '2026-10-01T10:01:00' }), score: 0.9, pinned: false },
      { photo: photo({ id: 'c', createdAt: '2026-10-01T10:03:00' }), score: 0.4, pinned: false },
    ];
    const r = orderCarousel(items);
    expect(r.orderedIds).toEqual(['b', 'c', 'a']);
    expect(r.strategy).toBe('chronological');
  });

  it('moveItem moves within bounds and ignores invalid moves', () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 2, -2)).toEqual([3, 1, 2]);
    const same = [1, 2, 3];
    expect(moveItem(same, 0, -1)).toBe(same);
  });
});
