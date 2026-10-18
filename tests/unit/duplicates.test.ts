import { areNearDuplicates, groupDuplicates } from '@/features/image-analysis/duplicate-analyzer';
import { lumaSignature, signatureDistance } from '@/features/image-analysis/perceptual-hash';

import { boxBlur, checker, gradient, solid } from '../helpers/fixtures';

const cfg = { signatureThreshold: 5, maxColorDistance: 40, maxSecondsApart: 600 };

/** Builds a signature whose cells follow a pattern (for synthetic grouping tests). */
function sig(fn: (i: number) => number): string {
  return Array.from({ length: 256 }, (_, i) => Math.max(0, Math.min(255, Math.round(fn(i)))).toString(16).padStart(2, '0')).join('');
}

describe('luma signature', () => {
  it('is 512 hex chars and stable', () => {
    const s = lumaSignature(gradient(64, 48));
    expect(s).toMatch(/^[0-9a-f]{512}$/);
    expect(lumaSignature(gradient(64, 48))).toBe(s);
  });

  it('near-identical images are close; different structure is far', () => {
    // Moderate contrast like real scenes (an extreme 20↔235 checker measures ~6.6 after blur).
    const a = checker(128, 128, 32, 90, 160);
    const aBlur = boxBlur(a, 1);
    const b = gradient(128, 128);
    const near = signatureDistance(lumaSignature(a), lumaSignature(aBlur));
    const far = signatureDistance(lumaSignature(a), lumaSignature(b));
    expect(near).toBeLessThanOrEqual(5);
    expect(far).toBeGreaterThan(10);
  });

  it('is brightness invariant', () => {
    const a = sig((i) => (i % 16) * 8);
    const brighter = sig((i) => (i % 16) * 8 + 30);
    expect(signatureDistance(a, brighter)).toBeCloseTo(0, 5);
  });

  it('malformed or missing signatures are maximally distant', () => {
    expect(signatureDistance('ab', 'abcd')).toBe(255);
    expect(signatureDistance(null, sig(() => 1))).toBe(255);
  });
});

describe('duplicate grouping', () => {
  const s1 = sig((i) => (i % 16) * 10);
  const base = { hash: s1, meanRgb: [100, 100, 100] as [number, number, number], quality: 0.5 };

  it('groups near-identical photos and picks the best quality as representative', () => {
    const groups = groupDuplicates(
      [
        { id: 'a', ...base, quality: 0.4 },
        { id: 'b', ...base, hash: sig((i) => (i % 16) * 10 + (i % 3)), quality: 0.9 },
        { id: 'c', ...base, hash: sig((i) => Math.floor(i / 16) * 10) },
      ],
      cfg,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].memberIds.sort()).toEqual(['a', 'b']);
    expect(groups[0].representativeId).toBe('b');
  });

  it('does not group similar structure with very different color (e.g. different dishes)', () => {
    expect(areNearDuplicates({ id: 'a', ...base }, { id: 'b', ...base, meanRgb: [200, 60, 40] }, cfg)).toBe(false);
  });

  it('does not group photos taken far apart when both have capture time', () => {
    const a = { id: 'a', ...base, createdAt: '2026-10-01T10:00:00' };
    const b = { id: 'b', ...base, createdAt: '2026-10-01T12:00:00' };
    expect(areNearDuplicates(a, b, cfg)).toBe(false);
    expect(areNearDuplicates(a, { ...b, createdAt: '2026-10-01T10:03:00' }, cfg)).toBe(true);
  });

  it('is transitive through union-find', () => {
    const groups = groupDuplicates(
      [
        { id: 'a', ...base, hash: sig(() => 100) },
        { id: 'b', ...base, hash: sig((i) => (i < 128 ? 108 : 100)) }, // 4 from a
        { id: 'c', ...base, hash: sig((i) => (i < 128 ? 116 : 100)) }, // 4 from b, 8 from a
      ],
      cfg,
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].memberIds).toHaveLength(3);
  });

  it('skips photos without a hash', () => {
    expect(groupDuplicates([{ id: 'a', hash: null, quality: 1 }, { id: 'b', hash: null, quality: 1 }], cfg)).toEqual([]);
  });

  it('solid images of distinct colors never group', () => {
    const red = lumaSignature(solid(32, 32, [200, 0, 0]));
    const blue = lumaSignature(solid(32, 32, [0, 0, 200]));
    expect(areNearDuplicates({ id: 'r', hash: red, meanRgb: [200, 0, 0], quality: 1 }, { id: 'b', hash: blue, meanRgb: [0, 0, 200], quality: 1 }, cfg)).toBe(false);
  });
});
