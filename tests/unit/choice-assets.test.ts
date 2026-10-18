import * as fs from 'fs';
import * as path from 'path';
import * as jpeg from 'jpeg-js';

import { CHOICE_CARDS, choiceCardsFor, pickedChoiceCards } from '@/features/onboarding/choice-cards';
import { defaultPreference, stepById } from '@/features/onboarding/preference-schema';
import { ALLOWED_IMAGE_LICENSES } from '@/features/onboarding/style-cards';

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'assets/onboarding');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('onboarding choice cards — catalog', () => {
  it('every option of the food, person and retouch steps has exactly one photo', () => {
    for (const stepId of ['preferredFoodAngles', 'preferredPortraitAndOOTDAngles', 'retouch'] as const) {
      const options = stepById(stepId).options.map((o) => o.id).sort();
      const cards = choiceCardsFor(stepId).map((c) => c.optionId).sort();
      expect(cards).toEqual(options);
    }
    expect(choiceCardsFor('preferredPlatformPurposes')).toEqual([]);
  });

  it('card titles match the option labels stored for the answer', () => {
    for (const card of CHOICE_CARDS) {
      const option = stepById(card.stepId).options.find((o) => o.id === card.optionId)!;
      expect(card.title).toBe(option.label);
      expect(card.description.length).toBeGreaterThan(0);
    }
  });

  it('every card has a commercially usable, verifiable license record', () => {
    for (const card of CHOICE_CARDS) {
      const cr = card.credit;
      expect(ALLOWED_IMAGE_LICENSES).toContain(cr.license);
      expect(cr.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(cr.attribution).toContain(cr.license);
      if (cr.license.startsWith('CC BY')) expect(cr.attribution).toContain(cr.author);
      expect(cr.modifications.length).toBeGreaterThan(0);
    }
  });

  it('the three retouch cards are the same photo edited three ways', () => {
    const urls = new Set(choiceCardsFor('retouch').map((c) => c.credit.sourceUrl));
    expect(urls.size).toBe(1);
  });

  it('maps stored answers back to their photos', () => {
    const picked = pickedChoiceCards({ ...defaultPreference(), preferredFoodAngles: ['table'], preferredPortraitAndOOTDAngles: ['full', 'nope'], preferredFilterStrength: 'light' });
    expect(picked.map((c) => `${c.stepId}:${c.optionId}`)).toEqual(['preferredFoodAngles:table', 'preferredPortraitAndOOTDAngles:full', 'retouch:light']);
  });
});

describe('onboarding choice cards — bundled files (no network)', () => {
  it('each image is a small local 600x750 JPEG', () => {
    for (const card of CHOICE_CARDS) {
      const buf = fs.readFileSync(path.join(DIR, card.file));
      expect(buf.length).toBeLessThan(150 * 1024);
      const img = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 64 });
      expect([img.width, img.height]).toEqual([600, 750]);
    }
  });

  it('there are no orphan files in the asset folders', () => {
    const files = ['food', 'portrait', 'retouch'].flatMap((d) => fs.readdirSync(path.join(DIR, d)).filter((f) => f.endsWith('.jpg')).map((f) => `${d}/${f}`));
    expect(files.sort()).toEqual(CHOICE_CARDS.map((c) => c.file).sort());
  });

  it('images are static requires of local files', () => {
    const src = read('src/features/onboarding/choice-cards.ts');
    const requires = [...src.matchAll(/require\('([^']+)'\)/g)].map((m) => m[1]);
    expect(requires).toHaveLength(CHOICE_CARDS.length);
    for (const r of requires) expect(r).toMatch(/^@\/assets\/onboarding\/(food|portrait|retouch)\/[a-z0-9-]+\.jpg$/);
  });

  it('the attribution document lists every file, source page and license', () => {
    const doc = read('docs/IMAGE_ASSET_ATTRIBUTIONS.md');
    for (const card of CHOICE_CARDS) {
      expect(doc).toContain(card.file);
      expect(doc).toContain(card.credit.sourceUrl);
    }
  });
});
