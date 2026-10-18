import * as fs from 'fs';
import * as path from 'path';
import * as jpeg from 'jpeg-js';

import { ALLOWED_IMAGE_LICENSES, STYLE_CARDS } from '@/features/onboarding/style-cards';
import { STYLE_TAG_META } from '@/features/preferences/taste-profile';

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'assets/onboarding/styles');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('onboarding style cards — catalog', () => {
  it('has at least 12 cards with unique ids and files, spread over every category', () => {
    expect(STYLE_CARDS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(STYLE_CARDS.map((c) => c.id)).size).toBe(STYLE_CARDS.length);
    expect(new Set(STYLE_CARDS.map((c) => c.file)).size).toBe(STYLE_CARDS.length);
    for (const cat of ['mood', 'composition', 'light', 'scene']) {
      expect(STYLE_CARDS.filter((c) => c.category === cat).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('every card maps to known taste tags and has a short label', () => {
    for (const card of STYLE_CARDS) {
      expect(card.tags.length).toBeGreaterThan(0);
      for (const t of card.tags) expect(STYLE_TAG_META[t]).toBeDefined();
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.title.length).toBeLessThanOrEqual(12);
      expect(card.description.length).toBeGreaterThan(0);
    }
  });

  it('every card has a verifiable, commercially usable license record', () => {
    for (const card of STYLE_CARDS) {
      const cr = card.credit;
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
});

describe('onboarding style cards — bundled files (no network)', () => {
  it('each image is a small local 600x750 JPEG', () => {
    for (const card of STYLE_CARDS) {
      const file = path.join(DIR, card.file);
      expect(fs.existsSync(file)).toBe(true);
      const buf = fs.readFileSync(file);
      expect(buf.length).toBeLessThan(150 * 1024);
      const img = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 64 });
      expect([img.width, img.height]).toEqual([600, 750]);
    }
  });

  it('there are no orphan files in the asset folder', () => {
    const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.jpg'));
    expect(files.sort()).toEqual(STYLE_CARDS.map((c) => c.file).sort());
  });

  it('images are static requires of local files, never URLs', () => {
    for (const card of STYLE_CARDS) {
      expect(typeof card.source === 'string' && /^https?:/.test(card.source)).toBe(false);
      expect(JSON.stringify(card.source ?? '')).not.toMatch(/https?:\/\//);
    }
    const src = read('src/features/onboarding/style-cards.ts');
    const requires = [...src.matchAll(/require\('([^']+)'\)/g)].map((m) => m[1]);
    expect(requires).toHaveLength(STYLE_CARDS.length);
    for (const r of requires) expect(r).toMatch(/^@\/assets\/onboarding\/styles\/[a-z0-9-]+\.jpg$/);
    for (const rel of ['src/features/onboarding/style-cards.ts', 'src/features/onboarding/components/OnboardingWizard.tsx', 'src/features/preferences/taste-profile.ts']) {
      expect(read(rel)).not.toMatch(/fetch\(|XMLHttpRequest|uri:\s*['"`]http/);
    }
  });

  it('the attribution document lists every file, source page and license', () => {
    const doc = read('docs/IMAGE_ASSET_ATTRIBUTIONS.md');
    for (const card of STYLE_CARDS) {
      expect(doc).toContain(card.file);
      expect(doc).toContain(card.credit.sourceUrl);
      expect(doc).toContain(card.credit.license);
    }
  });
});
