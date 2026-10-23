import { LEGAL_DOCS } from '@/features/legal/documents';
import OSS from '@/features/legal/oss-licenses.json';
import { COMMUNITY_MIN_AGE, buildAccountDeletionDoc, buildPolicyDocs } from '@/features/legal/policy-texts';

const contact = { email: 'help@example.com', operator: '홍길동' };

describe('policy texts', () => {
  const docs = buildPolicyDocs(contact);

  it('discloses the overseas transfer, the minimum age and the privacy officer', () => {
    const privacy = docs.privacy.sections.map((s) => s.body).join('\n');
    expect(privacy).toContain('Supabase, Inc.');
    expect(privacy).toContain('일본');
    expect(privacy).toContain(`만 ${COMMUNITY_MIN_AGE}세`);
    expect(privacy).toContain('홍길동 · help@example.com');
    expect(docs.terms.sections.some((s) => s.body.includes(`만 ${COMMUNITY_MIN_AGE}세 이상`))).toBe(true);
  });

  it('warns instead of inventing a contact when the build has none', () => {
    const empty = buildPolicyDocs({ email: '', operator: '' });
    expect(empty.terms.sections.at(-1)?.body).toContain('EXPO_PUBLIC_SUPPORT_EMAIL');
    expect(empty.privacy.sections.find((s) => s.heading.includes('보호책임자'))?.body).toContain('EXPO_PUBLIC_OPERATOR_NAME');
  });

  it('explains account deletion without the app', () => {
    const body = buildAccountDeletionDoc(contact).sections.map((s) => s.body).join('\n');
    expect(body).toContain('help@example.com');
    expect(body).toContain('계정 삭제');
  });

  it('keeps headings unique (they are React keys in the legal screen)', () => {
    for (const doc of Object.values(LEGAL_DOCS)) {
      const headings = doc.sections.map((s) => s.heading);
      expect(new Set(headings).size).toBe(headings.length);
    }
  });
});

describe('open source notices', () => {
  const permissive = /^(MIT|ISC|BSD-[23]-Clause|Apache-2\.0|0BSD|OFL-1\.1)( AND (MIT|ISC|BSD-[23]-Clause|Apache-2\.0|0BSD|OFL-1\.1))*$/;

  it('lists every shipped package with a permissive license and its full text', () => {
    expect(OSS.packages.length).toBeGreaterThan(50);
    for (const p of OSS.packages) {
      expect(p.license).toMatch(permissive);
      expect(p.textId && (OSS.texts as Record<string, string>)[p.textId]).toBeTruthy();
      expect(p.copyright.length).toBeGreaterThan(0);
    }
  });

  it('includes the direct runtime dependencies', () => {
    const names = new Set(OSS.packages.map((p) => p.name));
    for (const n of ['expo', 'react', 'react-native', '@supabase/supabase-js', 'jpeg-js']) expect(names.has(n)).toBe(true);
    expect(LEGAL_DOCS.oss.sections.some((s) => s.heading.startsWith('jpeg-js '))).toBe(true);
  });
});
