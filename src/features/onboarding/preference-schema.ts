import type { UserPreference } from '@/domain/models';

export const PREFERENCE_SCHEMA_VERSION = 1;

export interface ChoiceOption {
  id: string;
  label: string;
  hint?: string;
}

export interface OnboardingStep {
  id: keyof Pick<
    UserPreference,
    | 'preferredSubjects'
    | 'preferredFoodAngles'
    | 'preferredPortraitAndOOTDAngles'
    | 'preferredColorMood'
    | 'preferredComposition'
    | 'preferredPlatformPurposes'
  > | 'retouch';
  title: string;
  subtitle: string;
  multi: boolean;
  options: ChoiceOption[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'preferredSubjects',
    title: '주로 어떤 사진을 찍나요?',
    subtitle: '여러 개 골라도 돼요. 추천 프리셋을 정하는 데만 써요.',
    multi: true,
    options: [
      { id: 'selfie', label: '셀카·인물' },
      { id: 'ootd', label: '전신 OOTD' },
      { id: 'mirror', label: '거울샷' },
      { id: 'food', label: '음식' },
      { id: 'cafe', label: '카페' },
      { id: 'travel', label: '여행 풍경' },
      { id: 'street', label: '건축·거리' },
      { id: 'pet', label: '반려동물' },
      { id: 'product', label: '제품·소품' },
      { id: 'family', label: '가족·기념일' },
    ],
  },
  {
    id: 'preferredFoodAngles',
    title: '음식은 어떤 각도가 좋아요?',
    subtitle: '현재 버전은 각도를 자동 판별하지 않아요. 캡션·프리셋 제안에 참고해요.',
    multi: true,
    options: [
      { id: 'top', label: '탑뷰' },
      { id: 'front', label: '정면' },
      { id: '45', label: '45도' },
      { id: 'detail', label: '근접 디테일' },
      { id: 'table', label: '테이블 전체' },
    ],
  },
  {
    id: 'preferredPortraitAndOOTDAngles',
    title: '인물·OOTD 구도는요?',
    subtitle: '얼굴 위주 추천을 강제하지 않아요. 얼굴 인식 기능은 없어요.',
    multi: true,
    options: [
      { id: 'full', label: '전신' },
      { id: 'half', label: '반신' },
      { id: 'close', label: '클로즈업' },
      { id: 'low', label: '로우 앵글' },
      { id: 'mirror', label: '거울샷' },
      { id: 'snap', label: '자연스러운 스냅' },
      { id: 'environment', label: '배경을 살린 구도' },
    ],
  },
  {
    id: 'preferredColorMood',
    title: '좋아하는 색감은?',
    subtitle: '사진의 밝기·채도·색온도 통계와 비교해 순위에 반영해요.',
    multi: true,
    options: [
      { id: 'natural', label: '자연스러움' },
      { id: 'warm', label: '따뜻한 톤' },
      { id: 'cool', label: '차가운 톤' },
      { id: 'film', label: '저채도 필름' },
      { id: 'vivid', label: '선명한 색감' },
      { id: 'flash', label: '직광 플래시·레트로' },
      { id: 'night', label: '야간·네온' },
    ],
  },
  {
    id: 'preferredComposition',
    title: '선호하는 구도는?',
    subtitle: '현재 버전은 구도를 자동 판별하지 않아요. 취향 기록으로만 저장돼요.',
    multi: true,
    options: [
      { id: 'center', label: '중앙' },
      { id: 'symmetry', label: '대칭' },
      { id: 'space', label: '여백' },
      { id: 'offcenter', label: '오프센터' },
      { id: 'balance', label: '배경과 인물의 균형' },
      { id: 'detail', label: '디테일 중심' },
    ],
  },
  {
    id: 'retouch',
    title: '보정은 어느 정도가 좋아요?',
    subtitle: '현재 버전은 색 보정을 적용하지 않아요. 피부·체형 보정 기능은 넣지 않아요.',
    multi: false,
    options: [
      { id: 'none', label: '무보정' },
      { id: 'light', label: '약한 보정' },
      { id: 'preset', label: '감성 프리셋' },
    ],
  },
  {
    id: 'preferredPlatformPurposes',
    title: '어디에 올릴 사진인가요?',
    subtitle: '새 프로젝트의 기본 목적으로 써요.',
    multi: true,
    options: [
      { id: 'instagram-single', label: 'Instagram 단일' },
      { id: 'instagram-carousel', label: 'Instagram 캐러셀' },
      { id: 'instagram-story', label: 'Instagram 스토리' },
      { id: 'tiktok-photo', label: 'TikTok 사진' },
      { id: 'kakao-profile', label: '카카오톡 프로필' },
      { id: 'kakao-background', label: '카카오톡 배경' },
      { id: 'kakao-chat', label: '채팅·앨범 공유' },
      { id: 'archive', label: '개인 보관' },
    ],
  },
];

export function defaultPreference(now = new Date()): UserPreference {
  return {
    preferredSubjects: [],
    preferredFoodAngles: [],
    preferredPortraitAndOOTDAngles: [],
    preferredComposition: [],
    preferredColorMood: [],
    preferredFilterStrength: null,
    preferredRetouchingStrength: 'off',
    preferredPlatformPurposes: [],
    preferredStyles: [],
    avoidStyles: [],
    personalizationEnabled: true,
    onboardingCompleted: false,
    onboardingSkipped: false,
    preferenceUpdatedAt: now.toISOString(),
    preferenceSchemaVersion: PREFERENCE_SCHEMA_VERSION,
  };
}

/** Migrates or resets a stored preference blob. Unknown/newer versions fall back to defaults. */
export function migratePreference(raw: unknown): UserPreference {
  const base = defaultPreference();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<UserPreference>;
  if (typeof r.preferenceSchemaVersion !== 'number' || r.preferenceSchemaVersion > PREFERENCE_SCHEMA_VERSION) return base;
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    ...base,
    preferredSubjects: arr(r.preferredSubjects),
    preferredFoodAngles: arr(r.preferredFoodAngles),
    preferredPortraitAndOOTDAngles: arr(r.preferredPortraitAndOOTDAngles),
    preferredComposition: arr(r.preferredComposition),
    preferredColorMood: arr(r.preferredColorMood),
    preferredPlatformPurposes: arr(r.preferredPlatformPurposes),
    preferredStyles: arr(r.preferredStyles),
    avoidStyles: arr(r.avoidStyles),
    preferredFilterStrength: r.preferredFilterStrength ?? null,
    preferredRetouchingStrength: r.preferredRetouchingStrength ?? 'off',
    personalizationEnabled: r.personalizationEnabled !== false,
    onboardingCompleted: !!r.onboardingCompleted,
    onboardingSkipped: !!r.onboardingSkipped,
    preferenceUpdatedAt: typeof r.preferenceUpdatedAt === 'string' ? r.preferenceUpdatedAt : base.preferenceUpdatedAt,
    preferenceSchemaVersion: PREFERENCE_SCHEMA_VERSION,
  };
}

/** Color-mood targets derived from explicit choices. null = no opinion. */
export interface ColorTargets {
  luma: number | null;
  colorfulness: number | null;
  warmth: number | null;
}

const MOOD_TARGETS: Record<string, Partial<ColorTargets>> = {
  natural: { luma: 135 },
  warm: { warmth: 0.35 },
  cool: { warmth: -0.3 },
  film: { colorfulness: 0.2, luma: 120 },
  vivid: { colorfulness: 0.6 },
  flash: { luma: 150 },
  night: { luma: 70, colorfulness: 0.55 },
};

export function colorTargetsFrom(pref: UserPreference): ColorTargets {
  const acc: Record<keyof ColorTargets, number[]> = { luma: [], colorfulness: [], warmth: [] };
  for (const m of pref.preferredColorMood) {
    const t = MOOD_TARGETS[m];
    if (!t) continue;
    (Object.keys(t) as (keyof ColorTargets)[]).forEach((k) => acc[k].push(t[k] as number));
  }
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
  return { luma: avg(acc.luma), colorfulness: avg(acc.colorfulness), warmth: avg(acc.warmth) };
}
