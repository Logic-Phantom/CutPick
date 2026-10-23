/**
 * CutPick design tokens — "Soft coral, photo-first" (D-051).
 * Airy off-white background, white rounded cards with a faint lift, pill chips and pill CTAs in
 * one warm coral. Photos stay the most colorful thing on screen; coral marks actions, the selected
 * filter, picked photos and progress. Coral text on light surfaces uses `pointText` (≥ 4.5:1).
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
  /**
   * Coral "pick" mark: check badges on picked photos, the progress fill, the "이어서 하기" cue.
   * Graphic use only (≥ 3:1 against its surroundings) — use `pointText` for text.
   */
  point: string;
  pointText: string;
  pointSoft: string;
  /** Icon/text drawn on top of `point`. */
  onPoint: string;
}

/** Launch screen colors (always dark, matches the native splash background). */
export const launch = {
  background: '#111111',
  text: '#F4F4F2',
  muted: '#9A9A96',
  point: '#FF6A45',
} as const;

export const lightColors: ColorTokens = {
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#F1F1F4',
  textPrimary: '#1D1D22',
  textSecondary: '#5D5D66',
  textTertiary: '#8A8A93',
  textOnAccent: '#FFFFFF',
  border: '#ECECF0',
  borderStrong: '#D8D8DE',
  // Coral CTA fill (white bold label 3.7:1 — CTA labels are bold; small coral text uses pointText).
  accent: '#E8502A',
  accentPressed: '#CF4320',
  accentSoft: '#FFF1EC',
  selected: '#E8502A',
  selectedText: '#FFFFFF',
  selectedOverlay: 'rgba(255,255,255,0.12)',
  success: '#1F7A4D',
  successSoft: '#E5F3EA',
  warning: '#8A5A00',
  warningSoft: '#FBF1DC',
  error: '#C0352B',
  errorSoft: '#FCE8E6',
  heart: '#F0384F',
  scrim: 'rgba(0,0,0,0.5)',
  photoPlaceholder: '#ECECF0',
  point: '#FF5A36',
  pointText: '#C23A14',
  pointSoft: '#FFEEE8',
  onPoint: '#FFFFFF',
};

export const darkColors: ColorTokens = {
  background: '#111114',
  surface: '#1C1C20',
  surfaceElevated: '#25252A',
  surfaceSunken: '#0B0B0D',
  textPrimary: '#F4F4F6',
  textSecondary: '#ABABB3',
  textTertiary: '#82828A',
  textOnAccent: '#FFFFFF',
  border: '#2B2B31',
  borderStrong: '#3E3E45',
  accent: '#F0532D',
  accentPressed: '#D94A27',
  accentSoft: '#33201A',
  selected: '#F0532D',
  selectedText: '#FFFFFF',
  selectedOverlay: 'rgba(0,0,0,0.18)',
  success: '#5CC58F',
  successSoft: '#13291C',
  warning: '#E8B54A',
  warningSoft: '#2E240E',
  error: '#FF8A80',
  errorSoft: '#3A1715',
  heart: '#FF5C70',
  scrim: 'rgba(0,0,0,0.65)',
  photoPlaceholder: '#2A2A2F',
  point: '#FF6A45',
  pointText: '#FF9573',
  pointSoft: '#33201A',
  onPoint: '#FFFFFF',
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
  photo: 10,
  /** Large photo cards (taste cards, home cover, feed cards). */
  tile: 16,
  chip: 999,
  /** Text fields, inline messages, small boxes. Buttons themselves are pills (`chip`). */
  button: 14,
  card: 20,
  sheet: 24,
} as const;

/** Soft lifts. `raised` for hero cards and banners, `card` for white cards on the off-white background. */
export const elevation = {
  raised: { shadowColor: '#2A1A40', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  card: { shadowColor: '#2A1A40', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
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
  screenTitle: { fontSize: 26, lineHeight: 34, fontFamily: fonts.bold, letterSpacing: -0.4 },
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
