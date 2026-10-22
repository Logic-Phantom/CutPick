/**
 * Social sign-in (D-050): Kakao and Google through Supabase's built-in OAuth providers, opened in
 * the system browser (expo-web-browser auth session, works in Expo Go) with the PKCE flow.
 * Naver is not wired: Supabase has no built-in Naver provider and the custom OAuth provider form
 * has no attribute mapping for Naver's nested profile response. Pure helpers live here so they
 * can be unit-tested without native modules.
 */

export type SocialProviderId = 'kakao' | 'google';

export const SOCIAL_PROVIDERS: { id: SocialProviderId; label: string }[] = [
  { id: 'kakao', label: '카카오로 계속하기' },
  { id: 'google', label: 'Google로 계속하기' },
];

/** Path the provider redirects back to (`cutpick://auth/callback`, or `exp://…/--/auth/callback` in Expo Go). */
export const AUTH_CALLBACK_PATH = 'auth/callback';

/** Which social providers are switched on in the Supabase dashboard, from GET /auth/v1/settings. */
export function enabledSocialProviders(settings: unknown): SocialProviderId[] {
  const external = (settings as { external?: Record<string, unknown> } | null)?.external ?? {};
  return SOCIAL_PROVIDERS.map((p) => p.id).filter((id) => external[id] === true);
}

export interface AuthCallback {
  code: string | null;
  /** Provider or Supabase error description, when the sign-in was refused or failed. */
  error: string | null;
}

/** Reads the PKCE `code` (or an error) from the redirect URL; values may be in the query or the fragment. */
export function parseAuthCallback(url: string): AuthCallback {
  const params = new Map<string, string>();
  const parts = url.split(/[?#]/).slice(1);
  for (const part of parts) {
    for (const pair of part.split('&')) {
      if (!pair) continue;
      const [k, ...rest] = pair.split('=');
      try {
        params.set(decodeURIComponent(k), decodeURIComponent(rest.join('=').replace(/\+/g, ' ')));
      } catch {
        // malformed escape — ignore that pair
      }
    }
  }
  const error = params.get('error_description') ?? params.get('error') ?? null;
  return { code: params.get('code') ?? null, error };
}
