import { enabledSocialProviders, expoGoCallbackUrl, parseAuthCallback, SOCIAL_PROVIDERS } from '@/features/community/social-auth';

describe('social sign-in helpers (D-050)', () => {
  it('shows only providers enabled in the Supabase auth settings, in display order', () => {
    expect(enabledSocialProviders({ external: { email: true, google: true, kakao: true, github: true } })).toEqual(['kakao', 'google']);
    expect(enabledSocialProviders({ external: { email: true, google: false, kakao: true } })).toEqual(['kakao']);
    expect(enabledSocialProviders({ external: { email: true } })).toEqual([]);
  });

  it('treats missing or malformed settings as "no social providers" (email sign-in still works)', () => {
    expect(enabledSocialProviders(null)).toEqual([]);
    expect(enabledSocialProviders({})).toEqual([]);
    expect(enabledSocialProviders('oops')).toEqual([]);
  });

  it('reads the PKCE code from the redirect query (custom scheme and Expo Go URLs)', () => {
    expect(parseAuthCallback('cutpick://auth/callback?code=abc-123')).toEqual({ code: 'abc-123', error: null });
    expect(parseAuthCallback('exp://192.168.0.5:8081/--/auth/callback?code=xyz')).toEqual({ code: 'xyz', error: null });
    expect(parseAuthCallback('?code=from-route')).toEqual({ code: 'from-route', error: null });
  });

  it('surfaces provider errors (e.g. the user declined consent) instead of a code', () => {
    const r = parseAuthCallback('cutpick://auth/callback?error=access_denied&error_description=User+denied+access');
    expect(r.code).toBeNull();
    expect(r.error).toBe('User denied access');
    expect(parseAuthCallback('cutpick://auth/callback#error=server_error').error).toBe('server_error');
  });

  it('returns nothing for a URL without code or error', () => {
    expect(parseAuthCallback('cutpick://auth/callback')).toEqual({ code: null, error: null });
  });

  it('builds the Expo Go redirect from the dev server host (not the app scheme)', () => {
    expect(expoGoCallbackUrl('127.0.0.1:8081')).toBe('exp://127.0.0.1:8081/--/auth/callback');
    expect(expoGoCallbackUrl('10.92.115.23:8081')).toBe('exp://10.92.115.23:8081/--/auth/callback');
    expect(expoGoCallbackUrl('exp://10.0.0.2:8081/?foo=bar')).toBe('exp://10.0.0.2:8081/--/auth/callback');
  });

  it('labels are Korean call-to-actions, Kakao first', () => {
    expect(SOCIAL_PROVIDERS.map((p) => p.id)).toEqual(['kakao', 'google']);
    for (const p of SOCIAL_PROVIDERS) expect(p.label).toMatch(/로 계속하기$/);
  });
});
