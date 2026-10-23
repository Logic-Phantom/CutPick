import * as fs from 'fs';
import * as path from 'path';
import * as jpeg from 'jpeg-js';

import { POST_CATEGORIES } from '@/features/community/moderation-policy';
import { scanJpegMetadata } from '@/features/export-share/jpeg-metadata';
import { LEGAL_DOCS } from '@/features/legal/documents';
import { ALLOWED_IMAGE_LICENSES } from '@/features/onboarding/style-cards';
import { SHOWCASE_FILTERS, SHOWCASE_PHOTOS, dailyPicks, showcaseFor } from '@/features/showcase/showcase-photos';

const DIR = path.resolve(__dirname, '../../assets/showcase');

describe('showcase best-shot samples', () => {
  it('has 20 photos with unique ids, files and titles', () => {
    expect(SHOWCASE_PHOTOS).toHaveLength(20);
    expect(new Set(SHOWCASE_PHOTOS.map((p) => p.id)).size).toBe(20);
    expect(new Set(SHOWCASE_PHOTOS.map((p) => p.title)).size).toBe(20);
    expect(fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg')).sort()).toEqual(SHOWCASE_PHOTOS.map((p) => p.file).sort());
  });

  it('every bundled JPEG matches its recorded size and carries no EXIF/GPS', () => {
    for (const p of SHOWCASE_PHOTOS) {
      const buf = fs.readFileSync(path.join(DIR, p.file));
      const img = jpeg.decode(buf, { useTArray: true });
      expect([img.width, img.height]).toEqual(p.size);
      expect(scanJpegMetadata(new Uint8Array(buf)).hasExif).toBe(false);
      expect(buf.length).toBeLessThan(120 * 1024);
    }
  });

  it('uses only known community categories and every filter has photos', () => {
    const ids = POST_CATEGORIES.map((c) => c.id) as string[];
    for (const p of SHOWCASE_PHOTOS) expect(ids).toContain(p.category);
    for (const f of SHOWCASE_FILTERS) expect(showcaseFor(f.id).length).toBeGreaterThan(0);
    expect(showcaseFor(null)).toHaveLength(20);
  });

  it('is credited as owner-provided and listed on the image credits page', () => {
    for (const p of SHOWCASE_PHOTOS) {
      expect(ALLOWED_IMAGE_LICENSES).toContain(p.credit.license);
      expect(p.credit.license).toBe('소유자 제공');
    }
    const headings = LEGAL_DOCS['image-credits'].sections.map((s) => s.heading);
    expect(headings).toContain('베스트샷 샘플 (홈·커뮤니티)');
  });

  it('rotates the daily pick by day and always returns the full set', () => {
    const a = dailyPicks(new Date(2026, 9, 23));
    const b = dailyPicks(new Date(2026, 9, 24));
    expect(a).toHaveLength(5);
    expect(a[0].id).not.toBe(b[0].id);
    expect(new Set(a.map((p) => p.id))).toEqual(new Set(b.map((p) => p.id)));
  });
});
