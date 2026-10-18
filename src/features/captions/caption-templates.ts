import type { SourceContext } from '@/domain/models';

/**
 * Template-based caption drafts (no AI, no network). Users edit before copying.
 * Hashtags come from a small controlled list — not live trend data.
 */
const CONTEXT_LINES: Record<SourceContext, string[]> = {
  travel: ['{title}, 오래 기억하고 싶은 장면들', '{title} 기록', '다시 가고 싶은 {title}'],
  food: ['오늘의 한 끼, {title}', '{title} 맛 기록', '{title} 또 먹으러 갈 예정'],
  cafe: ['{title}에서 보낸 오후', '{title} 커피 한 잔', '좋아하는 자리, {title}'],
  date: ['{title}, 함께한 하루', '{title} 우리 기록', '오늘의 {title}'],
  ootd: ['{title} 오늘의 착장', 'OOTD · {title}', '{title} 데일리룩'],
  daily: ['{title}, 평범해서 좋은 하루', '요즘의 {title}', '{title} 일상 조각'],
  profile: ['{title}', '요즘의 나', '{title} 프로필 업데이트'],
  custom: ['{title}', '{title} 기록', '{title} 모음'],
};

const HASHTAGS: Record<SourceContext, string[]> = {
  travel: ['여행', '여행기록', '포토덤프', '여행스타그램'],
  food: ['맛집', '먹스타그램', '오늘뭐먹지'],
  cafe: ['카페', '카페투어', '카페스타그램'],
  date: ['데이트', '기념일', '일상'],
  ootd: ['OOTD', '데일리룩', '오오티디'],
  daily: ['일상', '데일리', '기록'],
  profile: ['프로필', '일상'],
  custom: ['기록', '일상'],
};

export function captionVariants(title: string, context: SourceContext): string[] {
  const t = title.trim() || '오늘';
  return CONTEXT_LINES[context].map((l) => l.replace('{title}', t));
}

export function hashtagCandidates(context: SourceContext): string[] {
  return HASHTAGS[context].map((h) => `#${h}`);
}

export function buildCaption(title: string, context: SourceContext, variant = 0, withHashtags = true): string {
  const lines = captionVariants(title, context);
  const line = lines[((variant % lines.length) + lines.length) % lines.length];
  return withHashtags ? `${line}\n\n${hashtagCandidates(context).join(' ')}` : line;
}
