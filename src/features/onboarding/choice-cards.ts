import type { ImageProps } from 'expo-image';

import type { ImageAttribution, ImageLicense } from './style-cards';

/**
 * Reference photos for the food-angle, person-framing and retouch questions of the onboarding —
 * one photo per answer, so people compare pictures instead of reading labels. `optionId` is the
 * value stored in UserPreference (same ids as the old text chips, so earlier answers still match).
 * Images are bundled (static require), license-checked on Wikimedia Commons (D-032) and listed in
 * the in-app "이미지 출처" page and docs/IMAGE_ASSET_ATTRIBUTIONS.md.
 * The three retouch cards are one CC0 photo edited three ways (none / light / film preset).
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

function commons(file: string, author: string, license: ImageLicense, licenseUrl: string, modifications = CROP): ImageAttribution {
  const name = file.replace(/_/g, ' ');
  return {
    sourceName: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
    author,
    license,
    licenseUrl,
    attribution: license === 'CC0 1.0' ? `"${name}" — ${author}, ${license} (퍼블릭 도메인 기증), Wikimedia Commons` : `"${name}" — ${author}, ${license}, Wikimedia Commons`,
    modifications,
    checkedAt: CHECKED,
  };
}

const NENAD = 'Nenad Stojkovic';
const TROLLE = 'Kristoffer Trolle';
const LATTE = 'Latte_-_Taith,_Lewes_2026-07-03.jpg';

export const CHOICE_CARDS: ChoiceCard[] = [
  // 음식 각도
  {
    stepId: 'preferredFoodAngles',
    optionId: 'top',
    title: '탑뷰',
    description: '바로 위에서 내려다본 구도',
    source: require('@/assets/onboarding/food/food-top.jpg'),
    file: 'food/food-top.jpg',
    credit: commons('Two_black_coffees_and_sugar_from_above._(51535520012).jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'front',
    title: '정면',
    description: '눈높이에서 옆으로 본 구도',
    source: require('@/assets/onboarding/food/food-front.jpg'),
    file: 'food/food-front.jpg',
    credit: commons('Cup_of_whipped_cream_with_sprinkles_with_an_orange_juice_glass_and_three_croissants_behind_it_displayed_on_a_table_(49430317643).jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: '45',
    title: '45도',
    description: '비스듬히 앉아서 찍은 구도',
    source: require('@/assets/onboarding/food/food-45.jpg'),
    file: 'food/food-45.jpg',
    credit: commons('Top_view_dessert_of_ice_cream,_chocolate_cake_and_strawberry_juice_on_wooden_table_in_restaurant_(48962119157).jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'detail',
    title: '근접 디테일',
    description: '질감이 보이게 아주 가까이',
    source: require('@/assets/onboarding/food/food-detail.jpg'),
    file: 'food/food-detail.jpg',
    credit: commons('Closeup_of_glamour_Valentine_cake_with_heart_decoration._(49479515006).jpg', NENAD, 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredFoodAngles',
    optionId: 'table',
    title: '테이블 전체',
    description: '차린 음식을 한 화면에',
    source: require('@/assets/onboarding/food/food-table.jpg'),
    file: 'food/food-table.jpg',
    credit: commons('Multiple_plates_of_pizza_served_on_wooden_plates_on_display_(49443005697).jpg', NENAD, 'CC BY 2.0', BY2),
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
    credit: commons('Deserttour_24_(25790248628).jpg', 'Greger Ravik', 'CC BY 2.0', BY2),
  },
  {
    stepId: 'preferredPortraitAndOOTDAngles',
    optionId: 'mirror',
    title: '거울샷',
    description: '거울에 비친 모습을 직접',
    source: require('@/assets/onboarding/portrait/portrait-mirror.jpg'),
    file: 'portrait/portrait-mirror.jpg',
    credit: commons('November_-_Flickr_-_MonikaMurren.jpg', 'MonikaMurren from Beacon, NY, United States', 'CC BY 2.0', BY2),
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
