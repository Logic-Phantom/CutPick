import * as fs from 'fs';
import * as path from 'path';
import * as jpeg from 'jpeg-js';

import { scanJpegMetadata } from '@/features/export-share/jpeg-metadata';
import { LEGAL_DOCS } from '@/features/legal/documents';
import { ALLOWED_IMAGE_LICENSES, STYLE_CARDS } from '@/features/onboarding/style-cards';
import { SAMPLE_CREDITS, SAMPLE_SIZES } from '@/features/photo-import/sample-credits';

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'assets/samples');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

interface Recipe {
  sources: Record<string, { title: string }>;
  slots: { n: number; source: string; size: [number, number] }[];
}
const recipe: Recipe = JSON.parse(read('scripts/sample-photos.json'));

const PORTRAIT = [1, 2, 3, 4, 5, 6, 7, 11, 14, 16, 18];
const LANDSCAPE = [8, 9, 12, 13, 17];
const SQUARE = [10, 15];

describe('sample photos — license records', () => {
  it('has one credit per sample slot 01–18, in order', () => {
    expect(SAMPLE_CREDITS.map((s) => s.file)).toEqual(Array.from({ length: 18 }, (_, i) => `sample-${String(i + 1).padStart(2, '0')}.jpg`));
  });

  it('every sample has a verifiable, commercially usable license record', () => {
    for (const s of SAMPLE_CREDITS) {
      const cr = s.credit;
      expect(ALLOWED_IMAGE_LICENSES).toContain(cr.license);
      expect(cr.sourceName).toBe('Wikimedia Commons');
      expect(cr.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(cr.author.trim().length).toBeGreaterThan(0);
      expect(cr.attribution).toContain(cr.license);
      if (cr.license.startsWith('CC BY')) {
        expect(cr.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/licenses\/by\//);
        expect(cr.attribution).toContain(cr.author);
      }
      expect(Number.isFinite(Date.parse(cr.checkedAt))).toBe(true);
      expect(cr.modifications.length).toBeGreaterThan(0);
    }
  });

  it('does not reuse any onboarding style-card photo', () => {
    const used = new Set(STYLE_CARDS.map((c) => c.credit.sourceUrl));
    for (const s of SAMPLE_CREDITS) expect(used.has(s.credit.sourceUrl)).toBe(false);
  });

  it('the build recipe uses exactly the credited source per slot', () => {
    expect(recipe.slots.map((s) => s.n)).toEqual(SAMPLE_CREDITS.map((s) => s.slot));
    for (const slot of recipe.slots) {
      const credit = SAMPLE_CREDITS.find((s) => s.slot === slot.n)!;
      const title = recipe.sources[slot.source].title.replace(/^File:/, '').replace(/ /g, '_');
      expect(credit.credit.sourceUrl).toBe(`https://commons.wikimedia.org/wiki/File:${title}`);
      expect(slot.size).toEqual(SAMPLE_SIZES[slot.n]);
    }
  });

  it('the attribution document and the in-app credits page list every sample', () => {
    const doc = read('docs/IMAGE_ASSET_ATTRIBUTIONS.md');
    const page = JSON.stringify(LEGAL_DOCS['image-credits']);
    for (const s of SAMPLE_CREDITS) {
      expect(doc).toContain(s.file);
      expect(doc).toContain(s.credit.sourceUrl);
      expect(page).toContain(s.credit.sourceUrl);
      expect(page).toContain(s.credit.license);
    }
  });
});

describe('sample photos — bundled files', () => {
  it('orientation slots keep the sizes the analysis tests rely on', () => {
    for (const n of PORTRAIT) expect(SAMPLE_SIZES[n]).toEqual([720, 900]);
    for (const n of LANDSCAPE) expect(SAMPLE_SIZES[n]).toEqual([1080, 720]);
    for (const n of SQUARE) expect(SAMPLE_SIZES[n]).toEqual([800, 800]);
  });

  it('each file is a small, metadata-free JPEG of its slot size', () => {
    for (const s of SAMPLE_CREDITS) {
      const buf = fs.readFileSync(path.join(DIR, s.file));
      expect(buf.length).toBeLessThan(250 * 1024);
      expect(scanJpegMetadata(new Uint8Array(buf))).toEqual({ isJpeg: true, hasExif: false, hasGps: false });
      const img = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 64 });
      expect([img.width, img.height]).toEqual(SAMPLE_SIZES[s.slot]);
    }
  });

  it('there are no orphan files in the sample folder', () => {
    const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg'));
    expect(files.sort()).toEqual(SAMPLE_CREDITS.map((s) => s.file).sort());
  });
});
