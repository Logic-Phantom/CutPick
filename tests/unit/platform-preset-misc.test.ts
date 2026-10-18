import { normalizeAssets, orientationOf, parseExifDate } from '@/features/photo-import/asset-normalizer';
import { buildCaption, hashtagCandidates } from '@/features/captions/caption-templates';
import { isValidCategory, sanitizeStyleTags, validateHandle } from '@/features/community/moderation-policy';
import { exportFileName } from '@/features/export-share/file-naming';
import { CancelToken, runQueue } from '@/features/image-analysis/analysis-queue';
import { colorTargetsFrom, defaultPreference, migratePreference, PREFERENCE_SCHEMA_VERSION } from '@/features/onboarding/preference-schema';
import { centerCropRect, cropRetention, shiftCrop } from '@/features/platforms/crop';
import { clampCount, getAspect, getPurpose, PLATFORM_PURPOSES } from '@/features/platforms/platform-profiles';
import { describeLearned, emptyLearnedWeights, recomputeWeights } from '@/features/preferences/personalization';
import { getPreset, isPresetStale, validatePresets } from '@/features/style-presets/preset-registry';
import { STYLE_PRESETS } from '@/features/style-presets/presets';
import { base64ToBytes, bytesToBase64 } from '@/utils/base64';

describe('platform profiles & crop', () => {
  it('every purpose has a valid default aspect and sane counts', () => {
    for (const p of PLATFORM_PURPOSES) {
      expect(p.aspects.some((a) => a.id === p.defaultAspectId)).toBe(true);
      expect(p.minCount).toBeLessThanOrEqual(p.defaultCount);
      expect(p.defaultCount).toBeLessThanOrEqual(p.maxCount);
      if (p.platformMaxCount) expect(p.maxCount).toBeLessThanOrEqual(p.platformMaxCount);
    }
  });

  it('clamps counts and resolves aspects', () => {
    const p = getPurpose('tiktok-photo');
    expect(clampCount(p, 100)).toBe(35);
    expect(getAspect(p, 'nope').id).toBe('9:16');
  });

  it('center crop keeps the target ratio', () => {
    const r = centerCropRect(4000, 3000, 4 / 5);
    expect((r.width * 4000) / (r.height * 3000)).toBeCloseTo(0.8, 5);
    expect(r.x).toBeCloseTo((1 - r.width) / 2, 6);
    expect(centerCropRect(1000, 1000, null)).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(cropRetention(1080, 1350, 4 / 5)).toBeCloseTo(1, 5);
  });

  it('shiftCrop moves along the free axis only', () => {
    const r = centerCropRect(4000, 3000, 1);
    expect(shiftCrop(r, -1).x).toBeCloseTo(0, 6);
    expect(shiftCrop(r, 1).x + r.width).toBeCloseTo(1, 6);
    expect(shiftCrop(r, 1).y).toBe(0);
  });
});

describe('style presets', () => {
  it('bundled presets pass validation', () => {
    expect(validatePresets()).toEqual([]);
  });

  it('flags curated presets without sources and unsourced non-hypothesis presets', () => {
    const bad = { ...STYLE_PRESETS[0], status: 'curated' as const, confidence: 'high' as const, sources: [] };
    const issues = validatePresets([bad]).map((i) => i.issue);
    expect(issues).toContain('curated preset requires sources');
    expect(issues).toContain('unsourced preset must be marked hypothesis');
  });

  it('staleness and fallback', () => {
    expect(isPresetStale(STYLE_PRESETS[0], new Date('2026-10-20'))).toBe(false);
    expect(isPresetStale(STYLE_PRESETS[0], new Date('2027-06-01'))).toBe(true);
    expect(getPreset('does-not-exist').id).toBe('natural-daily');
    expect(STYLE_PRESETS.every((p) => p.appliesColorFilter === false)).toBe(true);
  });
});

describe('preferences', () => {
  it('migrates unknown blobs to defaults and keeps valid fields', () => {
    expect(migratePreference(null).preferenceSchemaVersion).toBe(PREFERENCE_SCHEMA_VERSION);
    expect(migratePreference({ preferenceSchemaVersion: 99, preferredColorMood: ['warm'] }).preferredColorMood).toEqual([]);
    const m = migratePreference({ ...defaultPreference(), preferredColorMood: ['warm', 3], onboardingCompleted: true });
    expect(m.preferredColorMood).toEqual(['warm']);
    expect(m.onboardingCompleted).toBe(true);
  });

  it('color targets average the chosen moods', () => {
    const t = colorTargetsFrom({ ...defaultPreference(), preferredColorMood: ['warm', 'cool'] });
    expect(t.warmth).toBeCloseTo(0.025, 3);
    expect(colorTargetsFrom(defaultPreference())).toEqual({ luma: null, colorfulness: null, warmth: null });
  });

  it('learned weights stay bounded and are explainable', () => {
    const evs = Array.from({ length: 500 }, (_, i) => ({ id: `${i}`, type: 'keep' as const, features: { meanLuma: 255, colorfulness: 1, warmth: 1, contrast: 1, orientation: 'portrait' as const }, createdAt: '2026-10-18' }));
    const w = recomputeWeights(evs);
    expect(w.brightness).toBeLessThanOrEqual(1);
    expect(w.eventCount).toBe(500);
    expect(describeLearned(w).join(' ')).toContain('밝은');
    expect(describeLearned(emptyLearnedWeights())[0]).toContain('아직');
  });
});

describe('photo import normalization', () => {
  it('drops videos/unsupported types, enforces the cap, keeps only capture time from EXIF', () => {
    const res = normalizeAssets(
      [
        { uri: 'a', width: 4000, height: 3000, mimeType: 'image/jpeg', exif: { DateTimeOriginal: '2026:10:01 10:00:00', GPSLatitude: 37.5 } },
        { uri: 'b', width: 100, height: 100, type: 'video' },
        { uri: 'c', width: 100, height: 100, mimeType: 'image/gif' },
        { uri: 'd', width: 3000, height: 4000, mimeType: 'image/heic' },
        { uri: 'e', width: 3000, height: 4000, mimeType: 'image/png' },
      ],
      { hardMax: 2, useCaptureTime: true },
    );
    expect(res.accepted.map((a) => a.localUri)).toEqual(['a', 'd']);
    expect(res.accepted[0].createdAt).toBe('2026-10-01T10:00:00');
    expect(JSON.stringify(res.accepted)).not.toContain('GPS');
    expect(res.rejected).toEqual([
      { reason: 'video', count: 1 },
      { reason: 'unsupported-type', count: 1 },
      { reason: 'too-many', count: 1 },
    ]);
  });

  it('ignores capture time unless allowed', () => {
    const res = normalizeAssets([{ uri: 'a', width: 1, height: 1, exif: { DateTimeOriginal: '2026:10:01 10:00:00' } }], { hardMax: 10, useCaptureTime: false });
    expect(res.accepted[0].createdAt).toBeNull();
  });

  it('orientation and exif date parsing', () => {
    expect(orientationOf(4000, 3000)).toBe('landscape');
    expect(orientationOf(3000, 4000)).toBe('portrait');
    expect(orientationOf(1000, 1010)).toBe('square');
    expect(parseExifDate('garbage')).toBeNull();
  });
});

describe('analysis queue', () => {
  it('processes all items with bounded concurrency and isolates failures', async () => {
    let active = 0;
    let peak = 0;
    const res = await runQueue({
      items: Array.from({ length: 20 }, (_, i) => i),
      concurrency: 3,
      worker: async (i) => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 2));
        active--;
        if (i % 5 === 0) throw new Error('boom');
        return i;
      },
    });
    expect(res.processed).toBe(20);
    expect(res.failed).toBe(4);
    expect(peak).toBeLessThanOrEqual(3);
  });

  it('stops when cancelled', async () => {
    const token = new CancelToken();
    let seen = 0;
    const res = await runQueue(
      {
        items: Array.from({ length: 50 }, (_, i) => i),
        concurrency: 2,
        worker: async () => {
          seen++;
          if (seen === 5) token.cancel();
          await new Promise((r) => setTimeout(r, 1));
        },
      },
      token,
    );
    expect(res.cancelled).toBe(true);
    expect(res.processed).toBeLessThan(50);
  });
});

describe('community policy', () => {
  it('validates handles', () => {
    expect(validateHandle('my.cuts')).toBeNull();
    expect(validateHandle('ab')).not.toBeNull();
    expect(validateHandle('Has Space')).not.toBeNull();
    expect(validateHandle('cutpick_official')).not.toBeNull();
    expect(validateHandle('a..b')).not.toBeNull();
  });

  it('only allows controlled vocabularies', () => {
    expect(isValidCategory('food')).toBe(true);
    expect(isValidCategory('hot-or-not')).toBe(false);
    expect(sanitizeStyleTags(['warm', 'warm', 'bogus', 'film', 'night', 'vivid'])).toEqual(['warm', 'film', 'night']);
  });
});

describe('captions, naming, base64', () => {
  it('builds editable caption drafts from templates', () => {
    expect(buildCaption('부산 여행', 'travel')).toContain('부산 여행');
    expect(buildCaption('', 'food', 1, false)).not.toContain('#');
    expect(hashtagCandidates('cafe').every((h) => h.startsWith('#'))).toBe(true);
  });

  it('export file names are ASCII and zero-padded for ordering', () => {
    const d = new Date(2026, 9, 18);
    expect(exportFileName(d, 'instagram-carousel', 0, 12)).toBe('cutpick-20261018-instagram-carousel-01.jpg');
    expect(exportFileName(d, 'tiktok-photo', 34, 120)).toBe('cutpick-20261018-tiktok-photo-035.jpg');
    expect(exportFileName(d, '한글', 0, 1)).toMatch(/^[\x20-\x7e]+$/);
  });

  it('base64 round-trips and accepts data URIs', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253]);
    const b64 = bytesToBase64(bytes);
    expect(Array.from(base64ToBytes(b64))).toEqual(Array.from(bytes));
    expect(Array.from(base64ToBytes(`data:image/jpeg;base64,${b64}`))).toEqual(Array.from(bytes));
  });
});
