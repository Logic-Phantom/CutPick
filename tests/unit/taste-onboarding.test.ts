import type { PhotoAsset, UserPreference } from '@/domain/models';
import { PREFERENCE_SCHEMA_VERSION, defaultPreference, migratePreference, needsOnboarding, resetTaste, styleCardsPatch } from '@/features/onboarding/preference-schema';
import {
  STYLE_CARDS, STYLE_SELECTION_LIMITS, cardsInCategory, sanitizeStyleCardIds, selectedCountByCategory, styleSelectionStatus, styleTagsForCards, toggleStyleCard,
} from '@/features/onboarding/style-cards';
import { STYLE_TAG_META, colorTargetsFrom, tasteBonus, tasteProfileFrom } from '@/features/preferences/taste-profile';
import { recommend, type RecommendInput } from '@/features/recommendations/engine';
import { scorePhoto, technicalQuality } from '@/features/recommendations/scoring';
import { getPreset } from '@/features/style-presets/preset-registry';

import { metrics, photo } from '../helpers/fixtures';

const ids = STYLE_CARDS.map((c) => c.id);
const byCategory = (cat: string) => STYLE_CARDS.filter((c) => c.category === cat).map((c) => c.id);

function pref(over: Partial<UserPreference> = {}): UserPreference {
  return { ...defaultPreference(), ...over };
}

function input(photos: PhotoAsset[], over: Partial<RecommendInput> = {}): RecommendInput {
  return {
    photos,
    purposeId: 'instagram-single',
    targetCount: 1,
    // retro-flash has no color targets of its own, so only the user's taste separates photos.
    presetId: 'retro-flash',
    preference: defaultPreference(),
    learned: null,
    pinnedIds: [],
    excludedIds: [],
    groupRepresentatives: {},
    ...over,
  };
}

function hash(k: number): string {
  return Array.from({ length: 256 }, (_, j) => ((((j % 16) * (k + 1) + Math.floor(j / 16) * (10 - k) * 3) % 16) * 15).toString(16).padStart(2, '0')).join('');
}

describe('style card selection', () => {
  it('selecting and unselecting one card changes the count by one', () => {
    const one = toggleStyleCard([], ids[0]);
    expect(one.selected).toEqual([ids[0]]);
    expect(styleSelectionStatus(one.selected.length).count).toBe(1);
    const none = toggleStyleCard(one.selected, ids[0]);
    expect(none.selected).toEqual([]);
    expect(none.blocked).toBeNull();
  });

  it('needs at least 3 picks to continue and caps at 8', () => {
    expect(STYLE_SELECTION_LIMITS).toEqual({ min: 3, max: 8 });
    expect(styleSelectionStatus(0).canContinue).toBe(false);
    expect(styleSelectionStatus(2).canContinue).toBe(false);
    expect(styleSelectionStatus(2).message).toMatch(/1개 더/);
    expect(styleSelectionStatus(3).canContinue).toBe(true);
    let sel: string[] = [];
    for (const id of ids.slice(0, 8)) sel = toggleStyleCard(sel, id).selected;
    expect(sel).toHaveLength(8);
    const ninth = toggleStyleCard(sel, ids[8]);
    expect(ninth.blocked).toBe('max');
    expect(ninth.selected).toBe(sel);
  });

  it('ignores unknown card ids', () => {
    expect(toggleStyleCard([], 'nope').selected).toEqual([]);
  });

  it('switching categories only filters the grid; picks from every category are kept', () => {
    const sel = [byCategory('mood')[0], byCategory('scene')[0], byCategory('light')[0]];
    for (const cat of ['mood', 'composition', 'light', 'scene', 'all'] as const) {
      const visible = cardsInCategory(cat);
      expect(visible.length).toBeGreaterThan(0);
      // Filtering has no side effects on the selection itself.
      expect(sel).toHaveLength(3);
    }
    expect(selectedCountByCategory(sel)).toEqual({ mood: 1, composition: 0, light: 1, scene: 1 });
    expect(cardsInCategory('all')).toHaveLength(STYLE_CARDS.length);
  });

  it('picked cards become taste tags in the profile (not just ids)', () => {
    const patch = styleCardsPatch([byCategory('mood')[0], byCategory('scene')[0], byCategory('scene')[0]]);
    expect(patch.styleCardIds).toHaveLength(2);
    expect(patch.styleTags.length).toBeGreaterThan(0);
    expect(patch.styleTags).toEqual(styleTagsForCards(patch.styleCardIds));
    for (const t of patch.styleTags) expect(STYLE_TAG_META[t]).toBeDefined();
  });
});

describe('preference storage', () => {
  const v1 = {
    preferredSubjects: ['cafe'],
    preferredFoodAngles: ['top'],
    preferredPortraitAndOOTDAngles: [],
    preferredComposition: ['space'],
    preferredColorMood: ['warm'],
    preferredFilterStrength: 'light',
    preferredRetouchingStrength: 'off',
    preferredPlatformPurposes: ['instagram-carousel'],
    preferredStyles: [],
    avoidStyles: [],
    personalizationEnabled: false,
    onboardingCompleted: true,
    onboardingSkipped: false,
    preferenceUpdatedAt: '2026-10-18T00:00:00.000Z',
    preferenceSchemaVersion: 1,
  };

  it('migrates a v1 profile without losing answers and without crashing on the new fields', () => {
    const m = migratePreference(v1);
    expect(m.preferenceSchemaVersion).toBe(PREFERENCE_SCHEMA_VERSION);
    expect(m.styleCardIds).toEqual([]);
    expect(m.styleTags).toEqual([]);
    expect(m.preferredColorMood).toEqual(['warm']);
    expect(m.preferredSubjects).toEqual(['cafe']);
    expect(m.personalizationEnabled).toBe(false);
    expect(m.onboardingCompleted).toBe(true);
    expect(needsOnboarding(m)).toBe(false);
  });

  it('drops unknown card ids, dedupes, and recomputes tags from cards (stored tags are never trusted)', () => {
    const m = migratePreference({ ...v1, preferenceSchemaVersion: 2, styleCardIds: [ids[0], 'retired-card', ids[0], 42, ids[1]], styleTags: ['dark', 'bogus'] });
    expect(m.styleCardIds).toEqual([ids[0], ids[1]]);
    expect(m.styleTags).toEqual(styleTagsForCards([ids[0], ids[1]]));
    expect(sanitizeStyleCardIds('x')).toEqual([]);
  });

  it('falls back to defaults for newer or malformed data, and first run needs onboarding', () => {
    expect(migratePreference({ ...v1, preferenceSchemaVersion: 99 }).onboardingCompleted).toBe(false);
    expect(migratePreference(null).styleCardIds).toEqual([]);
    expect(needsOnboarding(defaultPreference())).toBe(true);
    expect(needsOnboarding({ onboardingCompleted: false, onboardingSkipped: true })).toBe(false);
  });

  it('a saved and reloaded profile keeps the picked cards (app restart)', () => {
    const saved = { ...pref(), ...styleCardsPatch(ids.slice(0, 4)), onboardingCompleted: true };
    const reloaded = migratePreference(JSON.parse(JSON.stringify(saved)));
    expect(reloaded.styleCardIds).toEqual(ids.slice(0, 4));
    expect(reloaded.styleTags).toEqual(saved.styleTags);
  });

  it('taste reset clears cards and tags and keeps personalization off when it was off', () => {
    const before = pref({ ...styleCardsPatch(ids.slice(0, 3)), preferredColorMood: ['vivid'], personalizationEnabled: false, onboardingCompleted: true });
    const after = resetTaste(before);
    expect(after.styleCardIds).toEqual([]);
    expect(after.styleTags).toEqual([]);
    expect(after.preferredColorMood).toEqual([]);
    expect(after.personalizationEnabled).toBe(false);
    expect(after.onboardingCompleted).toBe(true);
    expect(tasteProfileFrom(after).colorTags).toEqual([]);
    expect(colorTargetsFrom(after)).toEqual({ luma: null, colorfulness: null, warmth: null });
  });
});

describe('image taste in recommendations', () => {
  const warmBright = photo({ id: 'warm', perceptualHash: hash(1), qualityMetrics: metrics({ meanLuma: 150, warmth: 0.4, colorfulness: 0.4 }) });
  const darkNeon = photo({ id: 'night', perceptualHash: hash(2), qualityMetrics: metrics({ meanLuma: 70, warmth: -0.1, colorfulness: 0.5 }) });

  it('different picked styles change which photo is recommended', () => {
    const warmPick = recommend(input([darkNeon, warmBright], { preference: pref({ styleTags: ['warm', 'natural-light'] }) }));
    const nightPick = recommend(input([warmBright, darkNeon], { preference: pref({ styleTags: ['dark'] }) }));
    expect(warmPick.orderedIds[0]).toBe('warm');
    expect(nightPick.orderedIds[0]).toBe('night');
  });

  it('taste never changes the technical quality component', () => {
    const ctx = (tags: UserPreference['styleTags']) => {
      const taste = tasteProfileFrom(pref({ styleTags: tags }));
      return { preset: getPreset('natural-daily'), colorTargets: taste.colorTargets, taste, learned: null, personalizationEnabled: true, aspectRatio: null, groupRepresentative: new Map<string, string>() };
    };
    const tagged = { ...warmBright, sceneTags: ['food' as const] };
    const a = scorePhoto(tagged, ctx([]));
    const b = scorePhoto(tagged, ctx(['warm', 'food', 'vivid']));
    expect(b.quality).toBe(a.quality);
    expect(b.quality).toBeCloseTo(technicalQuality(tagged.qualityMetrics!) * getPreset('natural-daily').adjust.qualityWeight, 6);
    expect(b.total).not.toBe(a.total);
  });

  it('scene taste only counts when the user tagged the photo; orientation taste uses real orientation', () => {
    const taste = tasteProfileFrom(pref({ styleTags: ['food', 'wide'] }));
    const untagged = photo({ orientation: 'portrait', sceneTags: [] });
    const tagged = photo({ orientation: 'landscape', width: 4000, height: 3000, sceneTags: ['food'] });
    expect(tasteBonus(untagged, taste).value).toBe(0);
    const b = tasteBonus(tagged, taste);
    expect(b.scene).toBe('food');
    expect(b.orientation).toBe(true);
    // Conflicting orientations (wide landscape + OOTD) cancel out instead of guessing.
    expect(tasteProfileFrom(pref({ styleTags: ['wide', 'fashion'] })).orientation).toBeNull();
  });

  it('reasons name a picked style only when the photo actually matches it', () => {
    const out = recommend(input([darkNeon, warmBright], { preference: pref({ styleTags: ['warm', 'natural-light'] }) }));
    const warmReasons = out.details.find((d) => d.photoId === 'warm')!.reasons.map((r) => r.text).join(' ');
    const nightReasons = out.details.find((d) => d.photoId === 'night')!.reasons.map((r) => r.text).join(' ');
    expect(warmReasons).toMatch(/따뜻한 색감|자연광/);
    expect(nightReasons).not.toMatch(/따뜻한 색감|자연광/);
  });

  it('without any taste (skipped onboarding) recommendations work and never mention taste', () => {
    const out = recommend(input([warmBright, darkNeon], { purposeId: 'instagram-carousel', targetCount: 2, presetId: 'natural-daily' }));
    expect(out.orderedIds).toHaveLength(2);
    const texts = out.details.flatMap((d) => d.reasons.map((r) => r.text)).join(' ');
    expect(texts).not.toMatch(/고른|취향/);
  });

  it('a pre-v2 profile object without style fields is treated as "no taste"', () => {
    const legacy = { ...defaultPreference() } as Partial<UserPreference>;
    delete legacy.styleTags;
    delete legacy.styleCardIds;
    const out = recommend(input([warmBright, darkNeon], { preference: legacy as UserPreference }));
    expect(out.orderedIds).toHaveLength(1);
  });

  it('pins and exclusions still win over taste', () => {
    const p = pref({ styleTags: ['warm', 'natural-light'] });
    const out = recommend(input([warmBright, darkNeon], { purposeId: 'instagram-carousel', targetCount: 2, preference: p, excludedIds: ['warm'], pinnedIds: ['night'] }));
    expect(out.orderedIds).not.toContain('warm');
    expect(out.orderedIds).toContain('night');
  });
});
