/**
 * Cutpick design tokens — "Photo-first Editorial Utility".
 * Warm-neutral surfaces that don't tint photos, one accent color, high-contrast text.
 * Rules: docs/DESIGN_SYSTEM.md. Screens must not define their own colors/spacings.
 */

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
}

export const lightColors: ColorTokens = {
  background: '#F7F5F1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#EFECE6',
  textPrimary: '#1B1A18',
  textSecondary: '#5C5852',
  textTertiary: '#8A857D',
  textOnAccent: '#FFFFFF',
  border: '#E3DED6',
  borderStrong: '#C9C2B7',
  accent: '#2F5BD3',
  accentPressed: '#2449B0',
  accentSoft: '#E5ECFB',
  selected: '#2F5BD3',
  selectedText: '#FFFFFF',
  selectedOverlay: 'rgba(47,91,211,0.14)',
  success: '#1E7A4C',
  successSoft: '#E1F2E8',
  warning: '#8A5A00',
  warningSoft: '#FBF0D9',
  error: '#B3261E',
  errorSoft: '#FBE4E2',
  heart: '#D6336C',
  scrim: 'rgba(15,14,12,0.55)',
  photoPlaceholder: '#E6E2DB',
};

export const darkColors: ColorTokens = {
  background: '#121212',
  surface: '#1C1C1C',
  surfaceElevated: '#262626',
  surfaceSunken: '#0B0B0B',
  textPrimary: '#F2F0EC',
  textSecondary: '#B9B4AC',
  textTertiary: '#8C877F',
  // Dark text on the light-blue dark-mode accent keeps contrast above 7:1 (white was ~2.3:1).
  textOnAccent: '#0B1330',
  border: '#2E2E2E',
  borderStrong: '#454545',
  accent: '#7FA2FF',
  accentPressed: '#6A8EF0',
  accentSoft: '#1E2A4A',
  selected: '#7FA2FF',
  selectedText: '#0B1330',
  selectedOverlay: 'rgba(127,162,255,0.18)',
  success: '#5CC58F',
  successSoft: '#13301F',
  warning: '#E8B54A',
  warningSoft: '#33270C',
  error: '#FF8A80',
  errorSoft: '#3A1513',
  heart: '#FF6B9A',
  scrim: 'rgba(0,0,0,0.6)',
  photoPlaceholder: '#2A2A2A',
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
  button: 12,
  card: 16,
  sheet: 20,
} as const;

/** The only shadow in the app: a faint lift for the one hero card per screen. Lists use borders. */
export const elevation = {
  raised: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
} as const;

export const typography = {
  screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  /** Question / hero headline inside a screen (onboarding question, home next action). */
  title: { fontSize: 22, lineHeight: 29, fontWeight: '700' },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' },
  secondary: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  /** Short UI labels under photos and on chips. */
  label: { fontSize: 14, lineHeight: 19, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  numeric: { fontSize: 22, lineHeight: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
} as const;

/** Minimum touch target (pt). */
export const touchTarget = 44;

/** Bottom action bar height cap so CTAs never cover too much of the photo grid. */
export const bottomBarMaxHeight = 96;

/** Extra height when the bottom bar shows a one-line summary above its buttons. */
export const bottomBarSummaryHeight = 28;

/** Content column cap so cards don't grow huge on tablets / the web preview. */
export const contentMaxWidth = 640;
