/**
 * Community rules as data. Controlled vocabularies only — no free text, no comments, no DMs,
 * no dislikes, no appearance scores, no rankings of people.
 * Server-side equivalents are enforced in supabase/migrations (CHECK constraints + triggers).
 */

export const POST_CATEGORIES = [
  { id: 'travel', label: '여행' },
  { id: 'food', label: '음식' },
  { id: 'cafe', label: '카페' },
  { id: 'ootd', label: 'OOTD' },
  { id: 'profile', label: '프사 후보' },
  { id: 'landscape', label: '풍경' },
  { id: 'daily', label: '일상' },
  { id: 'pet', label: '반려동물' },
  { id: 'other', label: '기타' },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number]['id'];

export const STYLE_TAGS = [
  { id: 'natural', label: '자연스러운' },
  { id: 'warm', label: '따뜻한 톤' },
  { id: 'cool', label: '차가운 톤' },
  { id: 'film', label: '필름 감성' },
  { id: 'vivid', label: '선명한 색' },
  { id: 'flash', label: '플래시' },
  { id: 'night', label: '야경' },
  { id: 'minimal', label: '미니멀' },
] as const;

export type StyleTag = (typeof STYLE_TAGS)[number]['id'];

export const REPORT_REASONS = [
  { id: 'spam', label: '스팸·광고' },
  { id: 'harassment', label: '괴롭힘·혐오' },
  { id: 'sexual', label: '성적·노출 콘텐츠' },
  { id: 'impersonation', label: '사칭' },
  { id: 'copyright', label: '저작권 침해' },
  { id: 'privacy', label: '개인정보 노출' },
  { id: 'other', label: '기타' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['id'];

export const COMMUNITY_LIMITS = {
  maxStyleTags: 3,
  /** Long side of the uploaded share derivative. */
  imageMaxSide: 1440,
  imageQuality: 0.82,
  thumbMaxSide: 480,
  thumbQuality: 0.75,
  /** Client-side guard; the bucket enforces its own file_size_limit. */
  maxUploadBytes: 2 * 1024 * 1024,
  feedPageSize: 20,
} as const;

export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '';

const HANDLE_RE = /^[a-z0-9_.]{3,20}$/;
const RESERVED = ['admin', 'cutpick', 'support', 'official', 'moderator', 'root'];

export function validateHandle(handle: string): string | null {
  const h = handle.trim().toLowerCase();
  if (!HANDLE_RE.test(h)) return '영문 소문자, 숫자, _ . 만 사용해 3~20자로 입력해 주세요.';
  if (h.startsWith('.') || h.endsWith('.') || h.includes('..')) return '마침표는 처음·끝이나 연속으로 쓸 수 없어요.';
  if (RESERVED.some((r) => h.includes(r))) return '사용할 수 없는 단어가 포함돼 있어요.';
  return null;
}

export function isValidCategory(c: string): c is PostCategory {
  return POST_CATEGORIES.some((x) => x.id === c);
}

export function sanitizeStyleTags(tags: string[]): StyleTag[] {
  const allowed = new Set<string>(STYLE_TAGS.map((t) => t.id));
  return Array.from(new Set(tags.filter((t) => allowed.has(t)))).slice(0, COMMUNITY_LIMITS.maxStyleTags) as StyleTag[];
}

export function categoryLabel(id: string): string {
  return POST_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function styleLabel(id: string): string {
  return STYLE_TAGS.find((c) => c.id === id)?.label ?? id;
}
