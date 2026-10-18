/**
 * CutPick design tokens — "Photo-first, colorful brand".
 * Quiet cool-neutral surfaces that don't tint photos; the colorful brand palette (taken from the
 * app icon) lives in the wordmark, the primary CTA gradient and small accents only.
 * Rules: docs/DESIGN_SYSTEM.md. Screens must not define their own colors/spacings.
 */

/** A decorative hue with a readable foreground and a soft background tint for the current mode. */
export interface TintToken {
  fg: string;
  soft: string;
}

export type TintName = 'cyan' | 'blue' | 'violet' | 'pink' | 'mint' | 'amber';

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnAccent: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  selected: string;
  selectedText: string;
  /** Light tint laid over a selected photo card (with border + check, never alone). */
  selectedOverlay: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  heart: string;
  scrim: string;
  photoPlaceholder: string;
  /** Primary CTA / progress gradient (left → right). White text stays ≥ 4.5:1 on every stop. */
  gradient: readonly [string, string, ...string[]];
  /** Per-letter colors of the "CutPick" wordmark (C-u-t-P-i-c-k). */
  wordmark: readonly string[];
  tints: Record<TintName, TintToken>;
}

/** Brand hues from the app icon (decorative only — use `tints` for text on surfaces). */
export const brand = {
  navy: '#0B1024',
  cyan: '#4FD8FF',
  blue: '#3B5BFF',
  violet: '#8B5CF6',
  pink: '#FF5FC8',
  mint: '#3EE6A5',
  amber: '#FFC54A',
} as const;

const ctaGradient = ['#3B5BFF', '#7C3AED', '#C026D3'] as const;

export const lightColors: ColorTokens = {
  background: '#F7F6FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#EEEDF6',
  textPrimary: '#14152B',
  textSecondary: '#55576E',
  textTertiary: '#7E8096',
  textOnAccent: '#FFFFFF',
  border: '#E4E3EE',
  borderStrong: '#C8C7D8',
  accent: '#5B3FF5',
  accentPressed: '#4A30DB',
  accentSoft: '#ECE9FF',
  selected: '#5B3FF5',
  selectedText: '#FFFFFF',
  selectedOverlay: 'rgba(91,63,245,0.14)',
  success: '#1E7A4C',
  successSoft: '#E1F2E8',
  warning: '#8A5A00',
  warningSoft: '#FBF0D9',
  error: '#B3261E',
  errorSoft: '#FBE4E2',
  heart: '#E5337A',
  scrim: 'rgba(11,16,36,0.55)',
  photoPlaceholder: '#E7E6F0',
  gradient: ctaGradient,
  wordmark: ['#1E9BEA', '#3B6BFF', '#5B4BFF', '#7C3AED', '#A030E0', '#C42BC0', '#E0338F'],
  tints: {
    cyan: { fg: '#0377A8', soft: '#E0F5FF' },
    blue: { fg: '#2F4FE0', soft: '#E6EBFF' },
    violet: { fg: '#6D28D9', soft: '#F0E9FF' },
    pink: { fg: '#C2185B', soft: '#FFE6F3' },
    mint: { fg: '#047857', soft: '#DDF8EC' },
    amber: { fg: '#9A5B00', soft: '#FFF2D6' },
  },
};

export const darkColors: ColorTokens = {
  background: '#0B1024',
  surface: '#151A33',
  surfaceElevated: '#1D2342',
  surfaceSunken: '#070A18',
  textPrimary: '#F3F2FA',
  textSecondary: '#B6B8CF',
  textTertiary: '#8A8DA8',
  // Dark text on the light-violet dark-mode accent keeps contrast above 6:1 (white would be ~2.6:1).
  textOnAccent: '#0B1024',
  border: '#262C4A',
  borderStrong: '#3A4166',
  accent: '#9D8CFF',
  accentPressed: '#8A78F5',
  accentSoft: '#252052',
  selected: '#9D8CFF',
  selectedText: '#0B1024',
  selectedOverlay: 'rgba(157,140,255,0.2)',
  success: '#5CC58F',
  successSoft: '#13301F',
  warning: '#E8B54A',
  warningSoft: '#33270C',
  error: '#FF8A80',
  errorSoft: '#3A1513',
  heart: '#FF6BA8',
  scrim: 'rgba(3,5,14,0.65)',
  photoPlaceholder: '#232947',
  gradient: ctaGradient,
  wordmark: ['#4FD8FF', '#5FA8FF', '#7F86FF', '#9D74FF', '#C064FF', '#E85FE0', '#FF6FB5'],
  tints: {
    cyan: { fg: '#7DD3FC', soft: '#0E2A3D' },
    blue: { fg: '#93A8FF', soft: '#18224A' },
    violet: { fg: '#C4B5FD', soft: '#241A4A' },
    pink: { fg: '#F9A8D4', soft: '#3A1630' },
    mint: { fg: '#6EE7B7', soft: '#0D2E25' },
    amber: { fg: '#FCD34D', soft: '#33270C' },
  },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  /** Dense photo grids (thumbnails). */
  photo: 6,
  /** Large photo cards (taste cards, home cover). */
  tile: 12,
  chip: 999,
  button: 14,
  card: 18,
  sheet: 22,
} as const;

/** The only shadow in the app: a faint lift for the one hero card per screen. Lists use borders. */
export const elevation = {
  raised: { shadowColor: '#1B1450', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
} as const;

/**
 * Font families loaded at startup (src/app/_layout.tsx). Each weight is its own family so Android
 * never fakes bold on top of a bold file — set `fontFamily`, not `fontWeight`.
 * Pretendard (SIL OFL 1.1) for all UI text; Bricolage Grotesque (SIL OFL 1.1) for the wordmark only.
 */
export const fonts = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  brand: 'BricolageGrotesque-ExtraBold',
} as const;

/** Maps a numeric/keyword fontWeight to the matching Pretendard family. */
export function fontForWeight(weight: string | number | undefined): string {
  const w = weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight);
  if (w >= 700) return fonts.bold;
  if (w >= 600) return fonts.semibold;
  if (w >= 500) return fonts.medium;
  return fonts.regular;
}

export const typography = {
  screenTitle: { fontSize: 28, lineHeight: 36, fontFamily: fonts.bold, letterSpacing: -0.4 },
  /** Question / hero headline inside a screen (onboarding question, home next action). */
  title: { fontSize: 22, lineHeight: 30, fontFamily: fonts.bold, letterSpacing: -0.3 },
  sectionTitle: { fontSize: 18, lineHeight: 25, fontFamily: fonts.bold, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: fonts.semibold },
  secondary: { fontSize: 14, lineHeight: 21, fontFamily: fonts.regular },
  /** Short UI labels under photos and on chips. */
  label: { fontSize: 14, lineHeight: 20, fontFamily: fonts.semibold },
  caption: { fontSize: 12, lineHeight: 17, fontFamily: fonts.medium },
  numeric: { fontSize: 22, lineHeight: 28, fontFamily: fonts.bold, fontVariant: ['tabular-nums'] },
} as const;

/** Minimum touch target (pt). */
export const touchTarget = 44;

/** Bottom action bar height cap so CTAs never cover too much of the photo grid. */
export const bottomBarMaxHeight = 96;

/** Extra height when the bottom bar shows a one-line summary above its buttons. */
export const bottomBarSummaryHeight = 28;

/** Content column cap so cards don't grow huge on tablets / the web preview. */
export const contentMaxWidth = 640;
