import type { ImageProps } from 'expo-image';

import type { PostCategory } from '@/features/community/moderation-policy';
import type { ImageAttribution } from '@/features/onboarding/style-cards';

/**
 * Editorial "베스트샷 샘플" shown in the home and community feeds (D-051). They are bundled photos
 * the project owner supplied — not community posts: no author handle, no heart count, always
 * labeled "샘플". Real posts come only from the community backend.
 */
export interface ShowcasePhoto {
  /** Stable id (`showcase-01`…). */
  id: string;
  /** File name under assets/showcase/. */
  file: string;
  source: ImageProps['source'];
  category: PostCategory;
  title: string;
  /** Why this is a good shot — framed as a shooting tip, not a score. */
  tip: string;
  /** Output size of the bundled JPEG (2× the collage cell). */
  size: [number, number];
  credit: ImageAttribution;
}

const OWNER_CREDIT: ImageAttribution = {
  sourceName: '프로젝트 소유자 제공',
  sourceUrl: '',
  author: 'CutPick 프로젝트 소유자 제공(OpenAI ChatGPT로 생성한 AI 이미지)',
  license: '소유자 제공',
  licenseUrl: '',
  attribution: '베스트샷 샘플 — CutPick 프로젝트 소유자가 ChatGPT로 생성해 제공한 AI 이미지(실제 인물·장소 사진 아님)',
  modifications: '소유자가 ChatGPT로 생성한 5×4 콜라주 이미지(1536×1024)에서 칸마다 둥근 모서리 7px 안쪽을 잘라 2배로 확대(약한 선명화), 메타데이터 없는 JPEG(품질 86)로 저장. 색 보정·합성 없음',
  checkedAt: '2026-10-23',
};

const ROW_HEIGHTS: [number, number, number, number] = [484, 416, 426, 436];

function shot(n: number, source: ImageProps['source'], category: PostCategory, title: string, tip: string): ShowcasePhoto {
  const id = `showcase-${String(n).padStart(2, '0')}`;
  return { id, file: `${id}.jpg`, source, category, title, tip, size: [n % 5 === 2 || n % 5 === 0 ? 542 : 544, ROW_HEIGHTS[Math.floor((n - 1) / 5)]], credit: OWNER_CREDIT };
}

export const SHOWCASE_PHOTOS: ShowcasePhoto[] = [
  shot(1, require('@/assets/showcase/showcase-01.jpg'), 'cafe', '햇살이 스며든 카페 한켠', '창가 자연광이 라떼 아트를 비스듬히 비춰 질감이 살아나요.'),
  shot(2, require('@/assets/showcase/showcase-02.jpg'), 'travel', '바다가 보이는 산책길', '해안선이 대각선으로 흘러 시선이 멀리까지 이어져요.'),
  shot(3, require('@/assets/showcase/showcase-03.jpg'), 'ootd', '오늘의 데일리룩', '휴대폰으로 얼굴을 가리고 상의·하의 대비를 한 컷에 담았어요.'),
  shot(4, require('@/assets/showcase/showcase-04.jpg'), 'food', '간단하지만 완벽했던 점심', '45도 각도라 면의 볼륨과 테이블 분위기를 함께 보여 줘요.'),
  shot(5, require('@/assets/showcase/showcase-05.jpg'), 'travel', '노을 지는 강변 도시', '해 진 직후 하늘과 물에 비친 불빛의 색이 맞아떨어져요.'),
  shot(6, require('@/assets/showcase/showcase-06.jpg'), 'landscape', '하늘을 향한 빌딩', '아래에서 올려 찍어 건물 선이 한 점으로 모여요.'),
  shot(7, require('@/assets/showcase/showcase-07.jpg'), 'travel', '바다 앞 여름 소품', '소품을 앞에 두고 물빛을 배경으로 써 여행 느낌을 줘요.'),
  shot(8, require('@/assets/showcase/showcase-08.jpg'), 'cafe', '창가 자리 딸기 케이크', '역광으로 들어온 햇살이 음료와 케이크에 그림자를 만들어요.'),
  shot(9, require('@/assets/showcase/showcase-09.jpg'), 'ootd', '편안한 데님 코디', '단색 벽 앞에서 찍어 옷의 색과 실루엣만 남겼어요.'),
  shot(10, require('@/assets/showcase/showcase-10.jpg'), 'daily', '작은 꽃이 주는 큰 행복', '파란 하늘을 배경으로 낮게 찍어 꽃이 또렷하게 떠올라요.'),
  shot(11, require('@/assets/showcase/showcase-11.jpg'), 'landscape', '보랏빛 도시 야경', '매직 아워의 보라·주황 하늘이 야경 불빛과 어우러져요.'),
  shot(12, require('@/assets/showcase/showcase-12.jpg'), 'ootd', '거울 속의 오후', '창가 빛이 니트 질감을 부드럽게 드러내요.'),
  shot(13, require('@/assets/showcase/showcase-13.jpg'), 'food', '포케 한 그릇과 말차 라떼', '그릇과 음료를 함께 넣어 색 대비가 선명해요.'),
  shot(14, require('@/assets/showcase/showcase-14.jpg'), 'travel', '파도 소리 들리는 해변', '수평선을 위쪽 1/3에 두어 모래와 파도가 넓게 보여요.'),
  shot(15, require('@/assets/showcase/showcase-15.jpg'), 'daily', '느긋한 일요일 아침', '커튼으로 걸러진 빛이 하얀 침구를 포근하게 감싸요.'),
  shot(16, require('@/assets/showcase/showcase-16.jpg'), 'travel', '꽃길 따라 걷는 골목', '길이 화면 안쪽으로 뻗어 깊이감이 생겨요.'),
  shot(17, require('@/assets/showcase/showcase-17.jpg'), 'cafe', '달콤한 오후', '강한 햇살 그림자가 디저트를 입체적으로 보여 줘요.'),
  shot(18, require('@/assets/showcase/showcase-18.jpg'), 'travel', '하루의 끝, 노을 앞에서', '뒷모습 실루엣과 노을 그러데이션만 남겨 담백해요.'),
  shot(19, require('@/assets/showcase/showcase-19.jpg'), 'ootd', '깨끗한 화이트 스니커즈', '발끝 시점으로 내려다봐 신발이 주인공이 돼요.'),
  shot(20, require('@/assets/showcase/showcase-20.jpg'), 'daily', '초여름 수국', '꽃에 초점을 맞추고 배경을 흐려 풍성함이 살아나요.'),
];

/** Home/community category pills, in display order. */
export const SHOWCASE_FILTERS: { id: PostCategory; label: string }[] = [
  { id: 'travel', label: '여행' },
  { id: 'cafe', label: '카페' },
  { id: 'food', label: '음식' },
  { id: 'ootd', label: 'OOTD' },
  { id: 'daily', label: '일상' },
  { id: 'landscape', label: '풍경' },
];

/** Shots used for the "오늘의 픽" banner (wide, bright scenes that read well behind text). */
const DAILY_PICK_IDS = ['showcase-02', 'showcase-14', 'showcase-05', 'showcase-16', 'showcase-11'];

/** Rotates the "오늘의 픽" banner by calendar day (local time). */
export function dailyPicks(date = new Date()): ShowcasePhoto[] {
  const day = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000);
  const start = ((day % DAILY_PICK_IDS.length) + DAILY_PICK_IDS.length) % DAILY_PICK_IDS.length;
  return DAILY_PICK_IDS.map((_, i) => DAILY_PICK_IDS[(start + i) % DAILY_PICK_IDS.length]).map((id) => SHOWCASE_PHOTOS.find((p) => p.id === id)!);
}

export function showcaseById(id: string): ShowcasePhoto | undefined {
  return SHOWCASE_PHOTOS.find((p) => p.id === id);
}

export function showcaseFor(category: PostCategory | null): ShowcasePhoto[] {
  return category ? SHOWCASE_PHOTOS.filter((p) => p.category === category) : SHOWCASE_PHOTOS;
}
