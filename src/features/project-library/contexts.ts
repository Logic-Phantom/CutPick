import type { SourceContext } from '@/domain/models';

export const CONTEXT_LABELS: Record<SourceContext, string> = {
  travel: '여행',
  food: '음식',
  cafe: '카페',
  date: '데이트',
  ootd: 'OOTD',
  daily: '일상',
  profile: '프사 후보',
  custom: '기타',
};

export const CONTEXT_OPTIONS = (Object.keys(CONTEXT_LABELS) as SourceContext[]).map((id) => ({ id, label: CONTEXT_LABELS[id] }));

/** Default purpose for a context, used when the user hasn't picked one yet. */
export function defaultPurposeFor(context: SourceContext, preferred: string[]): string {
  const known = ['instagram-carousel', 'instagram-single', 'instagram-story', 'tiktok-photo', 'kakao-profile', 'kakao-background', 'kakao-chat'];
  const pref = preferred.find((p) => known.includes(p));
  if (pref) return pref;
  if (context === 'profile') return 'kakao-profile';
  return 'instagram-carousel';
}
