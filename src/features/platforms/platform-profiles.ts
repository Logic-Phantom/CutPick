import type { PlatformId } from '@/domain/models';

/**
 * Platform output rules as data. Values that change over time carry a verification status and source.
 * See docs/PLATFORM_RULES.md for sources and check dates. Unverified values are used only as
 * soft UI suggestions, never as hard validation.
 */

export interface AspectOption {
  id: string;
  label: string;
  /** width / height. null = keep original ratio (no crop). */
  ratio: number | null;
}

/** 'official-indexed' = official URL whose text was read via a search index (JS-rendered page). */
export type Verification = 'verified-official' | 'official-indexed' | 'secondary-source' | 'unverified';

export interface PlatformPurpose {
  id: string;
  platform: PlatformId;
  label: string;
  description: string;
  aspects: AspectOption[];
  defaultAspectId: string;
  minCount: number;
  maxCount: number;
  defaultCount: number;
  /** Max count as published by the platform, if known. */
  platformMaxCount: number | null;
  platformMaxVerification: Verification;
  /** Long side of exported JPEG. */
  exportMaxSide: number;
  /** Show N alternative single candidates (e.g. profile picture). */
  alternativesForSingle: number;
  shareGuide: string;
}

export const ASPECTS = {
  portrait45: { id: '4:5', label: '세로 4:5', ratio: 4 / 5 },
  portrait34: { id: '3:4', label: '세로 3:4', ratio: 3 / 4 },
  square: { id: '1:1', label: '정사각 1:1', ratio: 1 },
  landscape191: { id: '1.91:1', label: '가로 1.91:1', ratio: 1.91 },
  vertical916: { id: '9:16', label: '세로 9:16', ratio: 9 / 16 },
  original: { id: 'original', label: '원본 비율', ratio: null },
} satisfies Record<string, AspectOption>;

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  kakaotalk: '카카오톡',
};

const MULTI_SHARE_NOTE =
  '여러 장을 한 번에 공유하는 동작은 앱마다 달라요. 번호가 붙은 사진을 사진 앱에 저장한 뒤 목적 앱에서 순서대로 고르는 방법이 가장 확실해요.';

export const PLATFORM_PURPOSES: PlatformPurpose[] = [
  {
    id: 'instagram-carousel',
    platform: 'instagram',
    label: '캐러셀 게시물',
    description: '여러 장을 넘겨보는 게시물. 첫 장이 대표 사진이 돼요.',
    aspects: [ASPECTS.portrait45, ASPECTS.square, ASPECTS.portrait34, ASPECTS.original],
    defaultAspectId: '4:5',
    minCount: 2,
    maxCount: 20,
    defaultCount: 6,
    platformMaxCount: 20,
    platformMaxVerification: 'official-indexed',
    exportMaxSide: 1440,
    alternativesForSingle: 0,
    shareGuide: MULTI_SHARE_NOTE,
  },
  {
    id: 'instagram-single',
    platform: 'instagram',
    label: '단일 사진 게시물',
    description: '한 장으로 승부하는 게시물. 대표 후보 3장을 비교해요.',
    aspects: [ASPECTS.portrait45, ASPECTS.square, ASPECTS.portrait34, ASPECTS.landscape191],
    defaultAspectId: '4:5',
    minCount: 1,
    maxCount: 1,
    defaultCount: 1,
    platformMaxCount: 1,
    platformMaxVerification: 'verified-official',
    exportMaxSide: 1440,
    alternativesForSingle: 3,
    shareGuide: '저장하거나 공유 메뉴에서 Instagram을 선택하세요.',
  },
  {
    id: 'instagram-story',
    platform: 'instagram',
    label: '스토리용 내보내기',
    description: '세로 전체 화면 9:16으로 잘라 내보내요.',
    aspects: [ASPECTS.vertical916],
    defaultAspectId: '9:16',
    minCount: 1,
    maxCount: 10,
    defaultCount: 3,
    platformMaxCount: null,
    platformMaxVerification: 'unverified',
    exportMaxSide: 1920,
    alternativesForSingle: 0,
    shareGuide: MULTI_SHARE_NOTE,
  },
  {
    id: 'tiktok-photo',
    platform: 'tiktok',
    label: '사진 게시물',
    description: '세로 9:16 사진 묶음. 넘겨보는 흐름을 고려해 순서를 정해요.',
    aspects: [ASPECTS.vertical916, ASPECTS.portrait34, ASPECTS.original],
    defaultAspectId: '9:16',
    minCount: 2,
    maxCount: 35,
    defaultCount: 8,
    platformMaxCount: 35,
    platformMaxVerification: 'official-indexed',
    exportMaxSide: 1920,
    alternativesForSingle: 0,
    shareGuide: MULTI_SHARE_NOTE,
  },
  {
    id: 'kakao-profile',
    platform: 'kakaotalk',
    label: '프로필 사진',
    description: '작은 원형/정사각 영역에서도 알아보기 쉬운 후보 3장.',
    aspects: [ASPECTS.square],
    defaultAspectId: '1:1',
    minCount: 1,
    maxCount: 1,
    defaultCount: 1,
    platformMaxCount: 1,
    platformMaxVerification: 'verified-official',
    exportMaxSide: 1080,
    alternativesForSingle: 3,
    shareGuide: '사진 앱에 저장한 뒤 카카오톡 프로필 편집에서 선택하세요.',
  },
  {
    id: 'kakao-background',
    platform: 'kakaotalk',
    label: '프로필 배경',
    description: '세로 화면을 채우는 배경 후보 3장.',
    aspects: [ASPECTS.vertical916],
    defaultAspectId: '9:16',
    minCount: 1,
    maxCount: 1,
    defaultCount: 1,
    platformMaxCount: 1,
    platformMaxVerification: 'verified-official',
    exportMaxSide: 1920,
    alternativesForSingle: 3,
    shareGuide: '사진 앱에 저장한 뒤 카카오톡 프로필 배경 편집에서 선택하세요.',
  },
  {
    id: 'kakao-chat',
    platform: 'kakaotalk',
    label: '채팅·앨범 공유',
    description: '친구에게 보낼 묶음. 자르지 않고 원본 비율을 유지해요.',
    aspects: [ASPECTS.original],
    defaultAspectId: 'original',
    minCount: 2,
    maxCount: 30,
    defaultCount: 10,
    platformMaxCount: 120,
    platformMaxVerification: 'secondary-source',
    exportMaxSide: 2048,
    alternativesForSingle: 0,
    shareGuide: MULTI_SHARE_NOTE,
  },
];

export function getPurpose(id: string): PlatformPurpose {
  return PLATFORM_PURPOSES.find((p) => p.id === id) ?? PLATFORM_PURPOSES[0];
}

export function purposesFor(platform: PlatformId): PlatformPurpose[] {
  return PLATFORM_PURPOSES.filter((p) => p.platform === platform);
}

export function getAspect(purpose: PlatformPurpose, aspectId?: string | null): AspectOption {
  return purpose.aspects.find((a) => a.id === aspectId) ?? purpose.aspects.find((a) => a.id === purpose.defaultAspectId) ?? purpose.aspects[0];
}

export function clampCount(purpose: PlatformPurpose, n: number): number {
  return Math.max(purpose.minCount, Math.min(purpose.maxCount, Math.round(n)));
}
