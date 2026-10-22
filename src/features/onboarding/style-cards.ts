import type { ImageProps } from 'expo-image';

import type { StyleTag } from '@/domain/models';
import type { StyleDimension } from '@/features/preferences/taste-profile';

/**
 * Reference photos for the visual taste step — the single source for each card's image,
 * label, taste tags and license record. Images are bundled (static require), so the step works
 * offline and never fetches anything. Attribution list: docs/IMAGE_ASSET_ATTRIBUTIONS.md and the
 * in-app "이미지 출처" page (built from this file).
 */

export type StyleCategoryId = StyleDimension;

export const STYLE_CATEGORIES: { id: StyleCategoryId | 'all'; label: string; hint?: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'mood', label: '분위기', hint: '밝기·채도·색온도 통계와 비교해 순위에 반영해요.' },
  { id: 'composition', label: '구도', hint: '구도는 자동으로 판별하지 않아요. 넓은 풍경은 가로 사진, 클로즈업은 직접 붙인 디테일 태그로만 반영해요.' },
  { id: 'light', label: '색감·빛', hint: '밝기·채도·색온도 통계와 비교해 순위에 반영해요.' },
  { id: 'scene', label: '장면', hint: '장면은 자동으로 분류하지 않아요. 사진에 직접 붙인 장면 태그와 맞을 때만 반영해요.' },
];

/**
 * Licenses accepted for bundled reference photos (commercial use + redistribution allowed, no share-alike).
 * '소유자 제공' = images the project owner supplied and confirmed usable in the app (D-047); they have no
 * public source page, so their record names the owner's confirmation instead.
 */
export const ALLOWED_IMAGE_LICENSES = ['CC0 1.0', 'Public domain', 'CC BY 2.0', 'CC BY 2.5', 'CC BY 3.0', 'CC BY 4.0', '소유자 제공'] as const;
export type ImageLicense = (typeof ALLOWED_IMAGE_LICENSES)[number];

export interface ImageAttribution {
  sourceName: 'Wikimedia Commons' | '프로젝트 소유자 제공';
  /** File page the license was read from; empty for owner-provided images. */
  sourceUrl: string;
  author: string;
  license: ImageLicense;
  licenseUrl: string;
  /** Credit line shown in the app's image credits page. */
  attribution: string;
  modifications: string;
  checkedAt: string;
}

export interface StyleCard {
  /** Stable id stored in UserPreference.styleCardIds — never reuse an id for a different photo. */
  id: string;
  category: StyleCategoryId;
  title: string;
  description: string;
  /** Taste tags this card adds to the profile (see STYLE_TAG_META for their effect). */
  tags: StyleTag[];
  /** Bundled image (static require — Metro can't bundle dynamic paths). */
  source: ImageProps['source'];
  /** File name under assets/onboarding/styles/. */
  file: string;
  credit: ImageAttribution;
}

const CHECKED = '2026-10-18';
const MODIFIED = 'Commons 썸네일을 4:5(600×750)로 크롭·축소하고 JPEG로 다시 저장';
const BY2 = 'https://creativecommons.org/licenses/by/2.0/';
const BY4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

function commons(file: string, author: string, license: ImageLicense, licenseUrl: string, credit?: string): ImageAttribution {
  const name = file.replace(/_/g, ' ');
  const who = credit ?? author;
  return {
    sourceName: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
    author,
    license,
    licenseUrl,
    attribution: license === 'CC0 1.0' ? `"${name}" — ${who}, ${license} (퍼블릭 도메인 기증), Wikimedia Commons` : `"${name}" — ${who}, ${license}, Wikimedia Commons`,
    modifications: MODIFIED,
    checkedAt: CHECKED,
  };
}

export const STYLE_CARDS: StyleCard[] = [
  // 분위기
  {
    id: 'mood-warm-cozy',
    category: 'mood',
    title: '따뜻하고 포근한',
    description: '촛불·노란 조명이 감도는 실내',
    tags: ['warm'],
    source: require('@/assets/onboarding/styles/mood-warm-cozy.jpg'),
    file: 'mood-warm-cozy.jpg',
    credit: commons('19._Coffee_Shop_(12644020424).jpg', 'spurekar', 'CC BY 2.0', BY2),
  },
  {
    id: 'mood-bright-airy',
    category: 'mood',
    title: '밝고 산뜻한',
    description: '햇살 가득한 하얀 벽과 맑은 색',
    tags: ['bright'],
    source: require('@/assets/onboarding/styles/mood-bright-airy.jpg'),
    file: 'mood-bright-airy.jpg',
    credit: commons('Blue_Door_-_White_Wall_(3179426312).jpg', 'Klearchos Kapoutsis from Santorini, Greece', 'CC BY 2.0', BY2),
  },
  {
    id: 'mood-calm-moody',
    category: 'mood',
    title: '차분한 무드',
    description: '안개 낀 날처럼 가라앉은 색',
    tags: ['calm'],
    source: require('@/assets/onboarding/styles/mood-calm-moody.jpg'),
    file: 'mood-calm-moody.jpg',
    credit: commons('The_floating_dock_at_Rose_Canyon_Lake_on_a_rainy_and_foggy_January_1_2026.jpg', 'Matthew.kowal', 'CC BY 4.0', BY4),
  },
  {
    id: 'mood-film-vintage',
    category: 'mood',
    title: '필름·빈티지',
    description: '색이 바랜 옛 필름 사진 느낌',
    tags: ['film'],
    source: require('@/assets/onboarding/styles/mood-film-vintage.jpg'),
    file: 'mood-film-vintage.jpg',
    credit: commons('1971_MEMPHIS,_TENNESSEE_(4309898979).jpg', 'lindsaybridge from Sydney, Australia', 'CC BY 2.0', BY2),
  },
  // 구도
  {
    id: 'comp-centered',
    category: 'composition',
    title: '피사체 중심 구도',
    description: '주인공을 화면 가운데에',
    tags: ['centered'],
    source: require('@/assets/onboarding/styles/comp-centered.jpg'),
    file: 'comp-centered.jpg',
    credit: commons('Lighthouse_Chania_evening.jpg', 'Jebulon', 'CC0 1.0', CC0),
  },
  {
    id: 'comp-negative-space',
    category: 'composition',
    title: '여백 있는 구도',
    description: '작은 피사체와 넓은 빈 공간',
    tags: ['negative-space'],
    source: require('@/assets/onboarding/styles/comp-negative-space.jpg'),
    file: 'comp-negative-space.jpg',
    // The author asks for this exact credit line on the file page.
    credit: commons('Koh_Mak_(island),_Thailand,_Solitary_tree_in_lagoon.jpg', 'Vyacheslav Argenberg', 'CC BY 4.0', BY4, '© Vyacheslav Argenberg'),
  },
  {
    id: 'comp-wide-landscape',
    category: 'composition',
    title: '넓은 풍경',
    description: '주변을 시원하게 담은 풍경',
    tags: ['wide'],
    source: require('@/assets/onboarding/styles/comp-wide-landscape.jpg'),
    file: 'comp-wide-landscape.jpg',
    credit: commons('Highlands_re-edit_2_(Explored)_-_Flickr_-_Joe_Hayhurst.jpg', 'Joe Hayhurst from Preston, England', 'CC BY 2.0', BY2),
  },
  {
    id: 'comp-detail-closeup',
    category: 'composition',
    title: '디테일 클로즈업',
    description: '질감이 보이게 아주 가까이',
    tags: ['closeup'],
    source: require('@/assets/onboarding/styles/comp-detail-closeup.jpg'),
    file: 'comp-detail-closeup.jpg',
    credit: commons('Strawberry_up_close.jpg', 'Havardtl', 'CC BY 4.0', BY4),
  },
  // 색감·빛
  {
    id: 'light-warm-natural',
    category: 'light',
    title: '따뜻한 자연광',
    description: '해 질 녘 비스듬한 햇빛',
    tags: ['natural-light', 'warm'],
    source: require('@/assets/onboarding/styles/light-warm-natural.jpg'),
    file: 'light-warm-natural.jpg',
    credit: commons('Evening_Light_(228585707).jpeg', 'Brian Hunter', 'CC0 1.0', CC0),
  },
  {
    id: 'light-soft-muted',
    category: 'light',
    title: '부드러운 저채도',
    description: '흐린 하늘 아래 파스텔 톤',
    tags: ['muted'],
    source: require('@/assets/onboarding/styles/light-soft-muted.jpg'),
    file: 'light-soft-muted.jpg',
    credit: commons('Pastel_Houses_Tenby_2_(34818643203).jpg', 'Tony Hisgett from Birmingham, UK', 'CC BY 2.0', BY2),
  },
  {
    id: 'light-vivid-contrast',
    category: 'light',
    title: '선명한 색감',
    description: '채도와 대비가 강한 컬러',
    tags: ['vivid'],
    source: require('@/assets/onboarding/styles/light-vivid-contrast.jpg'),
    file: 'light-vivid-contrast.jpg',
    credit: commons('Colorful_umbrellas_over_the_Szinva_Bridge_01.jpg', 'Szalax', 'CC0 1.0', CC0),
  },
  {
    id: 'light-dark-night',
    category: 'light',
    title: '어두운 무드 조명',
    description: '밤거리의 네온과 조명',
    tags: ['dark'],
    source: require('@/assets/onboarding/styles/light-dark-night.jpg'),
    file: 'light-dark-night.jpg',
    credit: commons('Hong_Kong_night_street_2.jpg', 'Wilfredor', 'CC0 1.0', CC0),
  },
  // 장면
  {
    id: 'scene-travel',
    category: 'scene',
    title: '여행·장소',
    description: '골목·거리·여행지 풍경',
    tags: ['travel'],
    source: require('@/assets/onboarding/styles/scene-travel.jpg'),
    file: 'scene-travel.jpg',
    credit: commons('Lucignano_-_old_town_-_stairs_(18772862825).jpg', 's9-4pr', 'CC BY 2.0', BY2),
  },
  {
    id: 'scene-cafe-food',
    category: 'scene',
    title: '카페·음식',
    description: '테이블 위 디저트와 커피',
    tags: ['food'],
    source: require('@/assets/onboarding/styles/scene-cafe-food.jpg'),
    file: 'scene-cafe-food.jpg',
    credit: commons('A_slice_of_coffee_and_walnut_cake_-_Audit_Room_Café,_Petworth_House.jpg', 'Andy Li', 'CC0 1.0', CC0),
  },
  {
    id: 'scene-ootd',
    category: 'scene',
    title: 'OOTD·패션',
    description: '옷과 코디가 주인공',
    tags: ['fashion'],
    source: require('@/assets/onboarding/styles/scene-ootd.jpg'),
    file: 'scene-ootd.jpg',
    credit: commons('Clothes_rack.jpg', 'UNIFORM Studio', 'CC BY 2.0', BY2),
  },
  {
    id: 'scene-lifestyle-objects',
    category: 'scene',
    title: '일상 소품',
    description: '책·안경 같은 소품 정물',
    tags: ['objects'],
    source: require('@/assets/onboarding/styles/scene-lifestyle-objects.jpg'),
    file: 'scene-lifestyle-objects.jpg',
    credit: commons('Old_glasses_on_old_book_from_above.jpg', 'Nenad Stojkovic', 'CC BY 2.0', BY2),
  },
];

export const STYLE_SELECTION_LIMITS = { min: 3, max: 8 } as const;

const CARD_BY_ID = new Map(STYLE_CARDS.map((c) => [c.id, c]));

export function getStyleCard(id: string): StyleCard | undefined {
  return CARD_BY_ID.get(id);
}

export function cardsInCategory(category: StyleCategoryId | 'all'): StyleCard[] {
  return category === 'all' ? STYLE_CARDS : STYLE_CARDS.filter((c) => c.category === category);
}

/** Keeps known, unique card ids in their original order, capped at the selection maximum. */
export function sanitizeStyleCardIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v === 'string' && CARD_BY_ID.has(v) && !out.includes(v)) out.push(v);
    if (out.length >= STYLE_SELECTION_LIMITS.max) break;
  }
  return out;
}

/** Unique taste tags of the picked cards, in pick order. */
export function styleTagsForCards(ids: string[]): StyleTag[] {
  const tags: StyleTag[] = [];
  for (const id of ids) for (const t of CARD_BY_ID.get(id)?.tags ?? []) if (!tags.includes(t)) tags.push(t);
  return tags;
}

export interface ToggleResult {
  selected: string[];
  /** Set when the tap was ignored because the maximum is reached. */
  blocked: 'max' | null;
}

export function toggleStyleCard(selected: string[], id: string): ToggleResult {
  if (selected.includes(id)) return { selected: selected.filter((x) => x !== id), blocked: null };
  if (!CARD_BY_ID.has(id)) return { selected, blocked: null };
  if (selected.length >= STYLE_SELECTION_LIMITS.max) return { selected, blocked: 'max' };
  return { selected: [...selected, id], blocked: null };
}

export interface SelectionStatus {
  count: number;
  canContinue: boolean;
  /** Short helper text next to the count. */
  message: string;
}

export function styleSelectionStatus(count: number): SelectionStatus {
  const { min, max } = STYLE_SELECTION_LIMITS;
  if (count < min) return { count, canContinue: false, message: count === 0 ? `마음에 드는 사진을 ${min}개 이상 골라 주세요` : `${min - count}개 더 고르면 계속할 수 있어요` };
  if (count >= max) return { count, canContinue: true, message: `최대 ${max}개까지 골랐어요` };
  return { count, canContinue: true, message: `${max - count}개 더 고를 수 있어요` };
}

export function selectedCountByCategory(selected: string[]): Record<StyleCategoryId, number> {
  const out: Record<StyleCategoryId, number> = { mood: 0, composition: 0, light: 0, scene: 0 };
  for (const id of selected) {
    const card = CARD_BY_ID.get(id);
    if (card) out[card.category]++;
  }
  return out;
}
