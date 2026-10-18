import type { ImageAttribution, ImageLicense } from '@/features/onboarding/style-cards';

/**
 * License records for the bundled sample photos (assets/samples/sample-XX.jpg) — real Wikimedia
 * Commons photos under CC0 / CC BY only (D-032), themed as a travel camera roll. Built by
 * scripts/build-sample-photos.py from the recipe in scripts/sample-photos.json; some slots are
 * deliberately degraded copies (burst shift, blur, brighter shot, blown exposure) so the
 * duplicate grouping and quality scores have something to find. Listed in the in-app
 * "이미지 출처" page and docs/IMAGE_ASSET_ATTRIBUTIONS.md.
 */

export interface SampleCredit {
  /** 1-based slot; also the import order of the sample project. */
  slot: number;
  /** File name under assets/samples/. */
  file: string;
  /** Short scene label for the credits page. */
  scene: string;
  credit: ImageAttribution;
}

const CHECKED = '2026-10-18';
const BY2 = 'https://creativecommons.org/licenses/by/2.0/';
const BY3 = 'https://creativecommons.org/licenses/by/3.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

const PORTRAIT = '4:5(720×900)로 크롭·축소';
const LANDSCAPE = '3:2(1080×720)로 크롭·축소';
const SQUARE = '1:1(800×800)로 크롭·축소';

/** Output size per slot — the analysis tests depend on these orientations. */
export const SAMPLE_SIZES: Record<number, [number, number]> = {
  1: [720, 900], 2: [720, 900], 3: [720, 900], 4: [720, 900], 5: [720, 900], 6: [720, 900], 7: [720, 900],
  8: [1080, 720], 9: [1080, 720], 10: [800, 800], 11: [720, 900], 12: [1080, 720], 13: [1080, 720],
  14: [720, 900], 15: [800, 800], 16: [720, 900], 17: [1080, 720], 18: [720, 900],
};

function commons(file: string, author: string, license: ImageLicense, licenseUrl: string, modifications: string, credit?: string): ImageAttribution {
  const name = file.replace(/_/g, ' ');
  const who = credit ?? author;
  return {
    sourceName: 'Wikimedia Commons',
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${file}`,
    author,
    license,
    licenseUrl,
    attribution: license === 'CC0 1.0' ? `"${name}" — ${who}, ${license} (퍼블릭 도메인 기증), Wikimedia Commons` : `"${name}" — ${who}, ${license}, Wikimedia Commons`,
    modifications: `Commons 썸네일을 ${modifications}, 메타데이터 없이 JPEG로 다시 저장`,
    checkedAt: CHECKED,
  };
}

const SUNSET = 'Lone_Ranch_Beach_Oregon_at_sunset.jpg';
const CAFE = 'Coffee_@_IHATOBO_-_Shimokitazawa,_2008-09-20_16.07.25_(by_Guwashi999).jpg';
const PARK = 'SK-10-17-23-Tupelotreeinhistoricarea.jpg';

const s = (slot: number, scene: string, credit: ImageAttribution): SampleCredit => ({ slot, file: `sample-${String(slot).padStart(2, '0')}.jpg`, scene, credit });

export const SAMPLE_CREDITS: SampleCredit[] = [
  s(1, '해 질 녘 바닷가', commons(SUNSET, 'Bonnie Moreland', 'CC0 1.0', CC0, PORTRAIT)),
  s(2, '해 질 녘 바닷가 (연사 컷)', commons(SUNSET, 'Bonnie Moreland', 'CC0 1.0', CC0, `${PORTRAIT}하면서 01번과 몇 픽셀 어긋나게 잘라 연사처럼 만들고`)),
  s(3, '해 질 녘 바닷가 (흔들린 컷)', commons(SUNSET, 'Bonnie Moreland', 'CC0 1.0', CC0, `${PORTRAIT}한 뒤 흐림(가우시안 블러) 처리해 흔들린 사진처럼 만들고`)),
  s(4, '카페', commons(CAFE, 'Guwashi999 from Tokyo, Japan', 'CC BY 2.0', BY2, PORTRAIT)),
  s(5, '카페 (밝게 찍힌 컷)', commons(CAFE, 'Guwashi999 from Tokyo, Japan', 'CC BY 2.0', BY2, `${PORTRAIT}하면서 조금 어긋나게 자르고 밝기를 올려`)),
  s(6, '밤 네온사인', commons('Night_lights_in_Loyola,_California.jpg', 'Romain Guy from San Francisco, USA', 'CC0 1.0', CC0, PORTRAIT)),
  s(7, '해변 (과노출 컷)', commons('Papohaku_Beach_Molokai_Hawaii_(Maui_County)_Photo_by_Pat_McNally_-_panoramio.jpg', 'Patrick_McNally', 'CC BY 3.0', BY3, `${PORTRAIT}한 뒤 노출을 크게 올려 하이라이트가 날아간 사진처럼 만들고`, 'Pat McNally (Patrick_McNally)')),
  s(8, '도시 (베를린 대성당)', commons('Berliner_Dom._(Explored)_-_Flickr_-_Oneterry_AKA_Terry_Kearney.jpg', 'Terry Kearney from Liverpool, Merseyside', 'CC0 1.0', CC0, `${LANDSCAPE}(아래쪽 도로를 덜어 내려 약 8% 확대)`)),
  s(9, '공원', commons(PARK, 'vastateparksstaff', 'CC BY 2.0', BY2, LANDSCAPE, 'vastateparksstaff (Virginia State Parks)')),
  s(10, '음식 (위에서 찍은 피자)', commons('Overhead_view_of_a_variety_of_pizza_pies._Above_closeup._(49259889958).jpg', 'Nenad Stojkovic from Srbija', 'CC BY 2.0', BY2, SQUARE)),
  s(11, '안개 낀 부두', commons("Foggy_pier_in_Fell's_Point.jpg", 'Andreas Kolleger', 'CC BY 2.0', BY2, PORTRAIT)),
  s(12, '바다', commons('View_of_the_Atlantic_Ocean_from_Wildwood_New_Jersey.jpg', 'Tomwsulcer', 'CC0 1.0', CC0, LANDSCAPE)),
  s(13, '산과 빙하', commons('Hoper_Valley_Glacier.jpg', 'Mr.KhalidJawed', 'CC0 1.0', CC0, LANDSCAPE)),
  s(14, '밤 골목', commons('Night_Lights_(218082587).jpeg', 'Nils Söderman', 'CC0 1.0', CC0, PORTRAIT)),
  s(15, '꽃', commons('Field_of_Zinnia_Magellan_Pink_Flowers_2.jpg', 'Amaury Laporte', 'CC BY 2.0', BY2, SQUARE)),
  s(16, '빗방울 너머 불빛', commons('Night_Lights_-_Flickr_-_lemuelinchrist.jpg', 'Lemuel Cantos from Cebu, Philippines', 'CC BY 2.0', BY2, `${PORTRAIT}(원본이 작아 약 6% 확대)`)),
  s(17, '공원 (연사 컷)', commons(PARK, 'vastateparksstaff', 'CC BY 2.0', BY2, `${LANDSCAPE}하면서 09번과 몇 픽셀 어긋나게 잘라 연사처럼 만들고`, 'vastateparksstaff (Virginia State Parks)')),
  s(18, '골목길', commons('1_a_small_street_in_corfou_old_town_july_2025.jpg', 'GinoOnassis', 'CC0 1.0', CC0, `${PORTRAIT}(왼쪽 가게 창문 로고가 빠지도록 약 15% 확대)`)),
];
