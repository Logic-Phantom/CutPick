/**
 * Style presets are MVP hypotheses, not verified trends. They only adjust how candidates are
 * ranked — Cutpick does not apply color filters to exported photos in this version.
 * Review procedure: docs/TREND_RESEARCH.md
 */

export type PresetStatus = 'curated' | 'experimental' | 'retired';

export interface PresetSource {
  url: string;
  title: string;
  checkedAt: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  relatedContexts: string[];
  /** Ranking adjustments. All optional and bounded. */
  adjust: {
    /** Multiplier on the technical quality component (0.5..1.5). <1 = tolerate imperfect shots. */
    qualityWeight: number;
    /** Preferred mean luma 0..255 (null = neutral). */
    targetLuma: number | null;
    /** Preferred colorfulness 0..1 (null = neutral). */
    targetColorfulness: number | null;
    /** Preferred warmth -1..1 (null = neutral). */
    targetWarmth: number | null;
    /** Multiplier on the exposure sub-score (dark/flash looks tolerate clipping). */
    exposureWeight: number;
  };
  /** Color/retouch parameters are NOT applied in this version. */
  appliesColorFilter: false;
  scope: { countries: string[]; platforms: string[] };
  status: PresetStatus;
  lastReviewedAt: string;
  sources: PresetSource[];
  confidence: 'hypothesis' | 'low' | 'medium' | 'high';
  notes: string;
}

const REVIEWED = '2026-10-18';
const HYPOTHESIS_NOTE = '공개 출처로 검증하지 않은 MVP 가설 프리셋. 추천 순위 조정에만 사용.';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'natural-daily',
    name: '자연스러운 일상',
    description: '과하지 않은 밝기와 색. 기술적으로 안정적인 컷을 우선해요.',
    relatedContexts: ['daily', 'date', 'custom'],
    adjust: { qualityWeight: 1, targetLuma: 135, targetColorfulness: null, targetWarmth: null, exposureWeight: 1 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'tiktok', 'kakaotalk'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'travel-photodump',
    name: '여행 기록·포토덤프',
    description: '장면 다양성을 크게 보고, 약간 흔들린 순간 컷도 허용해요.',
    relatedContexts: ['travel'],
    adjust: { qualityWeight: 0.8, targetLuma: null, targetColorfulness: 0.45, targetWarmth: null, exposureWeight: 0.8 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'tiktok'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'cafe-food',
    name: '카페·음식 기록',
    description: '밝고 따뜻하며 선명한 디테일 컷을 우선해요.',
    relatedContexts: ['food', 'cafe'],
    adjust: { qualityWeight: 1.15, targetLuma: 150, targetColorfulness: 0.5, targetWarmth: 0.3, exposureWeight: 1.1 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'kakaotalk'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'retro-flash',
    name: '레트로 디카·직광 플래시',
    description: '강한 대비와 하이라이트 날림을 감점하지 않아요.',
    relatedContexts: ['date', 'ootd', 'daily'],
    adjust: { qualityWeight: 0.7, targetLuma: null, targetColorfulness: null, targetWarmth: null, exposureWeight: 0.4 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'tiktok'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'calm-film',
    name: '차분한 필름·낮은 채도',
    description: '채도가 낮고 차분한 톤을 선호해요. 어두운 컷도 탈락시키지 않아요.',
    relatedContexts: ['travel', 'daily', 'cafe'],
    adjust: { qualityWeight: 0.8, targetLuma: 115, targetColorfulness: 0.2, targetWarmth: 0.1, exposureWeight: 0.6 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'night-neon',
    name: '야간·네온',
    description: '어둡지만 색이 살아 있는 밤 사진을 우선해요.',
    relatedContexts: ['travel', 'date'],
    adjust: { qualityWeight: 0.8, targetLuma: 70, targetColorfulness: 0.6, targetWarmth: null, exposureWeight: 0.3 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'tiktok'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
  {
    id: 'warm-family',
    name: '따뜻한 가족·기념일',
    description: '따뜻한 색감과 안정적인 노출의 기념 컷을 우선해요.',
    relatedContexts: ['daily', 'custom'],
    adjust: { qualityWeight: 1.1, targetLuma: 140, targetColorfulness: null, targetWarmth: 0.35, exposureWeight: 1 },
    appliesColorFilter: false,
    scope: { countries: ['KR'], platforms: ['instagram', 'kakaotalk'] },
    status: 'experimental',
    lastReviewedAt: REVIEWED,
    sources: [],
    confidence: 'hypothesis',
    notes: HYPOTHESIS_NOTE,
  },
];
