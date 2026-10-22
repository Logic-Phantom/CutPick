import type { ImageProps } from 'expo-image';

import type { ImageAttribution, ImageLicense } from './style-cards';

/**
 * Reference photos for the food-angle, person-framing and retouch questions of the onboarding —
 * one photo per answer, so people compare pictures instead of reading labels. `optionId` is the
 * value stored in UserPreference (same ids as the old text chips, so earlier answers still match).
 * Images are bundled (static require), license-checked on Wikimedia Commons (D-032) and listed in
 * the in-app "이미지 출처" page and docs/IMAGE_ASSET_ATTRIBUTIONS.md.
 * The three retouch cards are one CC0 photo edited three ways (none / light / film preset).
 * Food cards: every photo is a plated dish by one photographer, so only the camera angle differs.
 */

export type ChoiceStepId = 'preferredFoodAngles' | 'preferredPortraitAndOOTDAngles' | 'retouch';

export interface ChoiceCard {
  stepId: ChoiceStepId;
  optionId: string;
  title: string;
  description: string;
  source: ImageProps['source'];
  /** Path under assets/onboarding/. */
  file: string;
  credit: ImageAttribution;
}

const CHECKED = '2026-10-18';
const CROP = 'Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 JPEG로 다시 저장';
const BY2 = 'https://creativecommons.org/licenses/by/2.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

function commons(file: string, author: string, license: ImageLicense, licenseUrl: string, modifications = CROP, checkedAt = CHECKED): ImageAttribution {
  const name = file.replace(/_/g, ' ');
  return {
    sourceName: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
    author,
    license,
    licenseUrl,
    attribution: license === 'CC0 1.0' ? `"${name}" — ${author}, ${license} (퍼블릭 도메인 기증), Wikimedia Commons` : `"${name}" — ${author}, ${license}, Wikimedia Commons`,
    modifications,
    checkedAt,
  };
}

/** Images the project owner supplied for the app (D-047): no public source page, the owner confirmed use. */
function ownerProvided(description: string): ImageAttribution {
  return {
    sourceName: '프로젝트 소유자 제공',
    sourceUrl: '',
    author: 'CutPick 프로젝트 소유자 제공',
    license: '소유자 제공',
    licenseUrl: '',
    attribution: `${description} — CutPick 프로젝트 소유자 제공 이미지(앱 내 사용 허락)`,
    modifications: '소유자가 준 콜라주 이미지(1536×1024)에서 한 칸을 4:5로 잘라 600×750으로 확대(약 1.9배, 약한 선명화), 메타데이터 없는 JPEG(품질 88)로 저장. 색 보정·합성 없음',
    checkedAt: '2026-10-22',
  };
}

const NENAD = 'Nenad Stojkovic';
const TROLLE = 'Kristoffer Trolle';
/** Andy Li (Commons: Onthewings) — all five food cards, so the angle is the only thing that changes (D-046). */
const ANDY = 'Andy Li';
const FOOD_CHECKED = '2026-10-22';
const LATTE = 'Latte_-_Taith,_Lewes_2026-07-03.jpg';
const FOOD_CROP = 'Commons 1920px 렌더를 4:5로 크롭(질문과 관계없는 손·소스병 라벨·벽 글자는 프레임 밖)하고 600×750으로 축소, 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음';

export const CHOICE_CARDS: ChoiceCard[] = [
  // 음식 각도 — 모두 접시에 담긴 요리, 같은 작가·비슷한 카페 조명
  {
    stepId: 'preferredFoodAngles',
    optionId: 'top',
    title: '탑뷰',
    description: '바로 위에서 내려다본 구도',
    source: require('@/assets/onboarding/food/food-top.jpg'),
    file: 'food/food-top.jpg',
    credit: commons('King_prawn_curry_-_Sunoso.jpg', ANDY, 'CC0 1.0', CC0, FOOD_CROP, FOOD_CHECKED),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'front',
    title: '정면',
    description: '눈높이에서 옆으로 본 구도',
    source: require('@/assets/onboarding/food/food-front.jpg'),
    file: 'food/food-front.jpg',
    credit: commons('Cheddar_Cheese_Beef_Burger_-_Gourmet_Burger_Kitchen_2023-10-03.jpg', ANDY, 'CC0 1.0', CC0, FOOD_CROP, FOOD_CHECKED),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: '45',
    title: '45도',
    description: '비스듬히 앉아서 찍은 구도',
    source: require('@/assets/onboarding/food/food-45.jpg'),
    file: 'food/food-45.jpg',
    credit: commons('Chicken_curry_rice_-_Milk_No_Sugar.jpg', ANDY, 'CC0 1.0', CC0, FOOD_CROP, FOOD_CHECKED),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'detail',
    title: '근접 디테일',
    description: '질감이 보이게 아주 가까이',
    source: require('@/assets/onboarding/food/food-detail.jpg'),
    file: 'food/food-detail.jpg',
    credit: commons('Close_up_of_western_fried_rice.jpg', ANDY, 'CC0 1.0', CC0, FOOD_CROP, FOOD_CHECKED),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'table',
    title: '테이블 전체',
    description: '차린 음식을 한 화면에',
    source: require('@/assets/onboarding/food/food-table.jpg'),
    file: 'food/food-table.jpg',
    credit: commons("Mixed_Mushrooms_Joe's_'on_toast'_and_Le_Hash_-_Joe's_Cafe.jpg", ANDY, 'CC0 1.0', CC0, FOOD_CROP, FOOD_CHECKED),
  },
  // 인물·OOTD 구도
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'full',
    title: '전신',
    description: '머리부터 신발까지 코디 전체',
    source: require('@/assets/onboarding/portrait/portrait-full.jpg'),
    file: 'portrait/portrait-full.jpg',
    credit: commons('Girl_walking_on_Frederiksberg_Allé_on_a_summer_day._Taken_with_Kodak_Ektar_100_+_Canon_EOS_650_+_Canon_EF_135mm_f2_-_45557775225.jpg', TROLLE, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'half',
    title: '반신',
    description: '허리 위로 상의와 소품 중심',
    source: require('@/assets/onboarding/portrait/portrait-half.jpg'),
    file: 'portrait/portrait-half.jpg',
    credit: commons('Lonely_girl_with_beautiful_hair_standing_outdoors_with_cottage_background.jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'close',
    title: '클로즈업',
    description: '가까이서 분위기와 디테일',
    source: require('@/assets/onboarding/portrait/portrait-close.jpg'),
    file: 'portrait/portrait-close.jpg',
    credit: commons('The_girl_is_hiding_behind_a_hat.jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'low',
    title: '로우 앵글',
    description: '아래에서 올려 찍어 길어 보이게',
    source: require('@/assets/onboarding/portrait/portrait-low.jpg'),
    file: 'portrait/portrait-low.jpg',
    credit: ownerProvided('로우 앵글 — 하늘을 배경으로 아래에서 올려 찍은 전신(얼굴은 옷깃·모자에 가림)'),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'mirror',
    title: '거울샷',
    description: '거울에 비친 모습을 직접',
    source: require('@/assets/onboarding/portrait/portrait-mirror.jpg'),
    file: 'portrait/portrait-mirror.jpg',
    credit: ownerProvided('거울샷 — 전신 거울 앞에서 휴대폰으로 얼굴을 가린 셀카'),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'snap',
    title: '자연스러운 스냅',
    description: '걷거나 움직이는 순간',
    source: require('@/assets/onboarding/portrait/portrait-snap.jpg'),
    file: 'portrait/portrait-snap.jpg',
    credit: commons('Woman_in_a_white_dress_walking_down_the_beach._(50668697041).jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'environment',
    title: '배경을 살린 구도',
    description: '사람은 작게, 장소는 크게',
    source: require('@/assets/onboarding/portrait/portrait-environment.jpg'),
    file: 'portrait/portrait-environment.jpg',
    credit: commons('Lady_sitting_in_front_of_Parthenon_on_Acropolis,_Athens,_Greece_(17088729869).jpg', 'Kristoffer Trolle from Copenhagen, Denmark', 'CC BY 2.0', BY2),
  },
  // 보정 정도 — 같은 사진을 세 가지로
  {
    stepId: 'retouch',
    optionId: 'none',
    title: '무보정',
    description: '찍은 그대로',
    source: require('@/assets/onboarding/retouch/retouch-none.jpg'),
    file: 'retouch/retouch-none.jpg',
    credit: commons(LATTE, 'Andy Li', 'CC0 1.0', CC0),
  },
  {
    stepId: 'retouch',
    optionId: 'light',
    title: '약한 보정',
    description: '밝기·대비만 살짝',
    source: require('@/assets/onboarding/retouch/retouch-light.jpg'),
    file: 'retouch/retouch-light.jpg',
    credit: commons(LATTE, 'Andy Li', 'CC0 1.0', CC0, `${CROP} 후 약한 보정(밝기 ×1.07, 대비 ×1.10, 채도 ×1.20)`),
  },
  {
    stepId: 'retouch',
    optionId: 'preset',
    title: '감성 프리셋',
    description: '필름처럼 분위기 있게',
    source: require('@/assets/onboarding/retouch/retouch-preset.jpg'),
    file: 'retouch/retouch-preset.jpg',
    credit: commons(LATTE, 'Andy Li', 'CC0 1.0', CC0, `${CROP} 후 필름 프리셋(채도 ×0.80, 검정 들어올림·하이라이트 따뜻하게·그림자 푸르게, 그레인)`),
  },
];

export function choiceCardsFor(stepId: string): ChoiceCard[] {
  return CHOICE_CARDS.filter((c) => c.stepId === stepId);
}

/** Cards matching the answers stored in a preference, in step order (for the settings summary). */
export function pickedChoiceCards(pref: { preferredFoodAngles: string[]; preferredPortraitAndOOTDAngles: string[]; preferredFilterStrength: string | null }): ChoiceCard[] {
  const picked: Record<ChoiceStepId, string[]> = {
    preferredFoodAngles: pref.preferredFoodAngles,
    preferredPortraitAndOOTDAngles: pref.preferredPortraitAndOOTDAngles,
    retouch: pref.preferredFilterStrength ? [pref.preferredFilterStrength] : [],
  };
  return CHOICE_CARDS.filter((c) => picked[c.stepId].includes(c.optionId));
}
