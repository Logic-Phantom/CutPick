import type { Orientation, PhotoAsset, PhotoQualityMetrics, SceneTag, StyleTag, UserPreference } from '@/domain/models';
import { TASTE } from '@/domain/recommendation-policy';

/**
 * What each image-based taste tag actually changes in ranking. Tags without an effect are kept
 * as a record of the user's taste only — explanations never claim they were used.
 */
export type StyleDimension = 'mood' | 'composition' | 'light' | 'scene';

export interface StyleTagMeta {
  label: string;
  dimension: StyleDimension;
  /** Has entries in TASTE.tagColorTargets. */
  color: boolean;
  /** User scene tags on a photo that count as a match. */
  scenes?: SceneTag[];
  orientation?: Exclude<Orientation, 'square'>;
}

export const STYLE_TAG_META: Record<StyleTag, StyleTagMeta> = {
  warm: { label: '따뜻한 색감', dimension: 'mood', color: true },
  bright: { label: '밝고 산뜻한 톤', dimension: 'mood', color: true },
  calm: { label: '차분한 무드', dimension: 'mood', color: true },
  film: { label: '필름 감성', dimension: 'mood', color: true },
  'natural-light': { label: '자연광', dimension: 'light', color: true },
  muted: { label: '낮은 채도', dimension: 'light', color: true },
  vivid: { label: '선명한 색감', dimension: 'light', color: true },
  dark: { label: '어두운 무드 조명', dimension: 'light', color: true },
  centered: { label: '중앙 구도', dimension: 'composition', color: false },
  'negative-space': { label: '여백 있는 구도', dimension: 'composition', color: false },
  wide: { label: '넓은 풍경', dimension: 'composition', color: false, scenes: ['landscape'], orientation: 'landscape' },
  closeup: { label: '디테일 클로즈업', dimension: 'composition', color: false, scenes: ['detail'] },
  travel: { label: '여행·장소', dimension: 'scene', color: false, scenes: ['landscape', 'building'] },
  food: { label: '카페·음식', dimension: 'scene', color: false, scenes: ['food'] },
  fashion: { label: 'OOTD·패션', dimension: 'scene', color: false, scenes: ['person'], orientation: 'portrait' },
  objects: { label: '일상 소품', dimension: 'scene', color: false, scenes: ['product', 'detail'] },
};

export function isStyleTag(v: unknown): v is StyleTag {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(STYLE_TAG_META, v);
}

/** Color-mood targets derived from explicit choices. null = no opinion. */
export interface ColorTargets {
  luma: number | null;
  colorfulness: number | null;
  warmth: number | null;
}

export const NO_COLOR_TARGETS: ColorTargets = { luma: null, colorfulness: null, warmth: null };

/** Targets for the text color-mood chips (pre-v2 onboarding, still offered as secondary chips). */
const MOOD_TARGETS: Record<string, Partial<ColorTargets>> = {
  natural: { luma: 135 },
  warm: { warmth: 0.35 },
  cool: { warmth: -0.3 },
  film: { colorfulness: 0.2, luma: 120 },
  vivid: { colorfulness: 0.6 },
  flash: { luma: 150 },
  night: { luma: 70, colorfulness: 0.55 },
};

function averageTargets(list: Partial<ColorTargets>[]): ColorTargets {
  const acc: Record<keyof ColorTargets, number[]> = { luma: [], colorfulness: [], warmth: [] };
  for (const t of list) {
    (Object.keys(t) as (keyof ColorTargets)[]).forEach((k) => {
      const v = t[k];
      if (typeof v === 'number') acc[k].push(v);
    });
  }
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
  return { luma: avg(acc.luma), colorfulness: avg(acc.colorfulness), warmth: avg(acc.warmth) };
}

export function tagColorTargets(tag: StyleTag): Partial<ColorTargets> {
  return TASTE.tagColorTargets[tag] ?? {};
}

/** Averages color targets from the text color-mood chips and the color-bearing style tags. */
export function colorTargetsFrom(pref: Pick<UserPreference, 'preferredColorMood'> & Partial<Pick<UserPreference, 'styleTags'>>): ColorTargets {
  const parts: Partial<ColorTargets>[] = [];
  for (const m of pref.preferredColorMood) if (MOOD_TARGETS[m]) parts.push(MOOD_TARGETS[m]);
  for (const t of pref.styleTags ?? []) if (STYLE_TAG_META[t]?.color) parts.push(tagColorTargets(t));
  return averageTargets(parts);
}

export interface TasteProfile {
  /** User-only color targets (no preset blended in). */
  colorTargets: ColorTargets;
  /** Color-bearing style tags, used to name the matching taste in reasons. */
  colorTags: StyleTag[];
  /** Scene tags that count as a taste match when the user tagged a photo with them. */
  scenes: SceneTag[];
  /** Preferred orientation, or null when none / conflicting (e.g. wide landscape + OOTD). */
  orientation: Exclude<Orientation, 'square'> | null;
  /** Tag that produced each scene/orientation preference, for reasons. */
  sceneSource: Partial<Record<SceneTag, StyleTag>>;
  orientationSource: StyleTag | null;
}

export const EMPTY_TASTE: TasteProfile = { colorTargets: NO_COLOR_TARGETS, colorTags: [], scenes: [], orientation: null, sceneSource: {}, orientationSource: null };

export function tasteProfileFrom(pref: Pick<UserPreference, 'preferredColorMood'> & Partial<Pick<UserPreference, 'styleTags'>>): TasteProfile {
  const tags = (pref.styleTags ?? []).filter(isStyleTag);
  const sceneSource: Partial<Record<SceneTag, StyleTag>> = {};
  const orientations = new Map<Exclude<Orientation, 'square'>, StyleTag>();
  for (const t of tags) {
    const meta = STYLE_TAG_META[t];
    for (const s of meta.scenes ?? []) if (!sceneSource[s]) sceneSource[s] = t;
    if (meta.orientation && !orientations.has(meta.orientation)) orientations.set(meta.orientation, t);
  }
  const single = orientations.size === 1 ? [...orientations.entries()][0] : null;
  return {
    colorTargets: colorTargetsFrom(pref),
    colorTags: tags.filter((t) => STYLE_TAG_META[t].color),
    scenes: Object.keys(sceneSource) as SceneTag[],
    orientation: single ? single[0] : null,
    sceneSource,
    orientationSource: single ? single[1] : null,
  };
}

export interface TasteBonus {
  value: number;
  scene: SceneTag | null;
  orientation: boolean;
}

/** Small ranking bonus from non-color taste. Scene matches need a user-applied scene tag (no auto classifier). */
export function tasteBonus(photo: Pick<PhotoAsset, 'sceneTags' | 'orientation'>, taste: TasteProfile): TasteBonus {
  const scene = taste.scenes.find((s) => photo.sceneTags.includes(s)) ?? null;
  const orientation = taste.orientation != null && photo.orientation === taste.orientation;
  return { value: (scene ? TASTE.sceneMatchBonus : 0) + (orientation ? TASTE.orientationBonus : 0), scene, orientation };
}

function similarity(value: number, target: number, range: number): number {
  return Math.max(0, 1 - Math.abs(value - target) / range);
}

/** 0..1 similarity to targets, or null when there are no targets. */
export function colorMatch(m: Pick<PhotoQualityMetrics, 'meanLuma' | 'colorfulness' | 'warmth'>, t: ColorTargets): number | null {
  const parts: number[] = [];
  if (t.luma != null) parts.push(similarity(m.meanLuma, t.luma, 128));
  if (t.colorfulness != null) parts.push(similarity(m.colorfulness, t.colorfulness, 0.6));
  if (t.warmth != null) parts.push(similarity(m.warmth, t.warmth, 1.2));
  if (!parts.length) return null;
  return parts.reduce((s, v) => s + v, 0) / parts.length;
}

/** Color style tags this photo individually matches — only these are named in a reason. */
export function matchedColorTags(m: Pick<PhotoQualityMetrics, 'meanLuma' | 'colorfulness' | 'warmth'>, taste: TasteProfile): StyleTag[] {
  return taste.colorTags.filter((t) => (colorMatch(m, { ...NO_COLOR_TARGETS, ...tagColorTargets(t) }) ?? 0) >= TASTE.reasonMinMatch);
}
