import type { PhotoAsset } from '@/domain/models';
import { defaultPreference } from '@/features/onboarding/preference-schema';
import { colorTargetsFrom, shotDomainOf, shotTasteFrom } from '@/features/preferences/taste-profile';
import { recommend, type RecommendInput } from '@/features/recommendations/engine';
import { scorePhoto, type ScoreContext } from '@/features/recommendations/scoring';
import { DEFAULT_PRESET_ID, MOOD_PRESET_ID, getPreset, suggestPresetForContext } from '@/features/style-presets/preset-registry';

import { metrics, photo } from '../helpers/fixtures';

const NO_COLOR = { luma: null, colorfulness: null, warmth: null };

function ctx(over: Partial<ScoreContext> = {}): ScoreContext {
  return { preset: getPreset('natural-daily'), colorTargets: NO_COLOR, learned: null, personalizationEnabled: true, aspectRatio: 9 / 16, groupRepresentative: new Map(), ...over };
}

// A landscape photo forced into 9:16 loses most of the frame; a portrait one barely loses anything.
const wide = (over: Partial<PhotoAsset> = {}) => photo({ id: 'wide', width: 1600, height: 900, orientation: 'landscape', qualityMetrics: metrics(), ...over });
const tall = (over: Partial<PhotoAsset> = {}) => photo({ id: 'tall', width: 900, height: 1600, orientation: 'portrait', qualityMetrics: metrics(), ...over });

describe('shot taste profile', () => {
  it('derives framing and orientation from picked angles', () => {
    const t = shotTasteFrom({ preferredFoodAngles: ['table'], preferredPortraitAndOOTDAngles: ['full', 'mirror'] });
    expect(t.food).toMatchObject({ framing: 1, orientation: 'landscape', framingLabel: '테이블 전체' });
    expect(t.person).toMatchObject({ framing: 1, orientation: 'portrait', framingLabel: '전신' });
  });

  it('conflicting picks cancel out instead of guessing', () => {
    const t = shotTasteFrom({ preferredPortraitAndOOTDAngles: ['full', 'close', 'environment'] });
    expect(t.person).toMatchObject({ framing: 0, orientation: null });
  });

  it('no picks and unknown ids mean no shot taste', () => {
    expect(shotTasteFrom(defaultPreference())).toEqual({ food: null, person: null, retouch: null });
    expect(shotTasteFrom({ preferredFoodAngles: ['bogus'] }).food).toBeNull();
  });

  it('applies to photos by user scene tag first, then by project kind', () => {
    expect(shotDomainOf({ sceneTags: ['food'] }, 'ootd')).toBe('food');
    expect(shotDomainOf({ sceneTags: ['person'] }, null)).toBe('person');
    expect(shotDomainOf({ sceneTags: [] }, 'cafe')).toBe('food');
    expect(shotDomainOf({ sceneTags: [] }, 'profile')).toBe('person');
    // An explicit non-matching tag beats the project kind; travel projects get no shot taste.
    expect(shotDomainOf({ sceneTags: ['landscape'] }, 'food')).toBeNull();
    expect(shotDomainOf({ sceneTags: [] }, 'travel')).toBeNull();
  });
});

describe('shot taste in scoring', () => {
  it('full-body taste makes heavy crop loss cost more on person photos only', () => {
    const shot = shotTasteFrom({ preferredPortraitAndOOTDAngles: ['full'] });
    const neutral = scorePhoto(wide(), ctx({ context: 'ootd' }));
    const keepWhole = scorePhoto(wide(), ctx({ shot, context: 'ootd' }));
    expect(keepWhole.goalFit).toBeLessThan(neutral.goalFit);
    expect(keepWhole.shotFraming).toBe(1);
    // Same photo in a travel project: no effect.
    const travel = scorePhoto(wide(), ctx({ shot, context: 'travel' }));
    expect(travel.goalFit).toBeCloseTo(neutral.goalFit, 6);
    expect(travel.shotDomain).toBeNull();
  });

  it('close-up taste makes crop loss cost less', () => {
    const shot = shotTasteFrom({ preferredPortraitAndOOTDAngles: ['close'] });
    const neutral = scorePhoto(wide(), ctx({ context: 'ootd' }));
    const tight = scorePhoto(wide(), ctx({ shot, context: 'ootd' }));
    expect(tight.goalFit).toBeGreaterThan(neutral.goalFit);
  });

  it('framing taste does nothing when the crop loses (almost) nothing', () => {
    const shot = shotTasteFrom({ preferredPortraitAndOOTDAngles: ['full'] });
    const a = scorePhoto(tall(), ctx({ context: 'ootd' }));
    const b = scorePhoto(tall(), ctx({ shot, context: 'ootd' }));
    expect(b.shotFraming).toBe(0);
    expect(b.goalFit).toBeCloseTo(a.goalFit, 6);
  });

  it('orientation taste adds a small bonus and never touches quality', () => {
    const shot = shotTasteFrom({ preferredFoodAngles: ['front'] });
    const a = scorePhoto(tall({ sceneTags: ['food'] }), ctx({ aspectRatio: null }));
    const b = scorePhoto(tall({ sceneTags: ['food'] }), ctx({ aspectRatio: null, shot }));
    expect(b.shotOrientation).toBe(true);
    expect(b.total).toBeGreaterThan(a.total);
    expect(b.quality).toBeCloseTo(a.quality, 6);
  });

  it('무보정 raises the weight of technical quality; 약한 보정 adds a brightness target', () => {
    const p = tall();
    const none = scorePhoto(p, ctx({ shot: shotTasteFrom({ preferredFilterStrength: 'none' }) }));
    const base = scorePhoto(p, ctx());
    expect(none.quality).toBeGreaterThan(base.quality);
    expect(colorTargetsFrom({ preferredColorMood: [], preferredFilterStrength: 'light' }).luma).toBe(145);
    expect(colorTargetsFrom({ preferredColorMood: [], preferredFilterStrength: 'preset' }).luma).toBeNull();
  });
});

describe('shot taste end to end', () => {
  function input(photos: PhotoAsset[], over: Partial<RecommendInput> = {}): RecommendInput {
    return { photos, purposeId: 'instagram-story', targetCount: 2, presetId: 'natural-daily', preference: defaultPreference(), learned: null, pinnedIds: [], excludedIds: [], groupRepresentatives: {}, ...over };
  }

  it('names the shot taste in the reasons when it changed the ranking', () => {
    const preference = { ...defaultPreference(), preferredPortraitAndOOTDAngles: ['full'] };
    const out = recommend(input([tall(), wide()], { preference, context: 'ootd' }));
    expect(out.orderedIds[0]).toBe('tall');
    const wideReasons = out.details.find((d) => d.photoId === 'wide')?.reasons.map((r) => r.code) ?? [];
    expect(wideReasons).toContain('shot-framing');
    const tallReasons = out.details.find((d) => d.photoId === 'tall')?.reasons.map((r) => r.code) ?? [];
    expect(tallReasons).toContain('shot-orientation');
  });
});

describe('retouch pick steers the default preset', () => {
  it('무보정 → natural, 감성 프리셋 → mood preset where the context is otherwise natural', () => {
    expect(suggestPresetForContext('cafe', 'none')).toBe(DEFAULT_PRESET_ID);
    expect(suggestPresetForContext('daily', 'preset')).toBe(MOOD_PRESET_ID);
    // A context with its own preset keeps it.
    expect(suggestPresetForContext('cafe', 'preset')).toBe(suggestPresetForContext('cafe'));
    expect(suggestPresetForContext('daily', null)).toBe(suggestPresetForContext('daily'));
  });
});
