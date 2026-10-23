import { OPERATOR_NAME, SUPPORT_EMAIL } from '@/features/community/moderation-policy';
import { CHOICE_CARDS } from '@/features/onboarding/choice-cards';
import { STYLE_CARDS, type ImageAttribution } from '@/features/onboarding/style-cards';
import { SAMPLE_CREDITS } from '@/features/photo-import/sample-credits';
import { SHOWCASE_PHOTOS } from '@/features/showcase/showcase-photos';

import OSS from './oss-licenses.json';
import { buildPolicyDocs, type LegalDoc } from './policy-texts';

/**
 * In-app legal texts. Policy texts live in policy-texts.ts (shared with the published web pages);
 * the support contact comes from EXPO_PUBLIC_SUPPORT_EMAIL, the operator from EXPO_PUBLIC_OPERATOR_NAME.
 */
export type { LegalDoc };

function creditBody(c: ImageAttribution): string {
  return [c.attribution, `라이선스: ${c.license}${c.licenseUrl ? ` (${c.licenseUrl})` : ''}`, c.sourceUrl ? `원본: ${c.sourceUrl}` : `출처: ${c.sourceName}`, `변경: ${c.modifications}`].join('\n');
}

const texts: Record<string, string> = OSS.texts;
const textNumber = new Map(Object.keys(texts).map((id, i) => [id, i + 1]));

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  ...buildPolicyDocs({ email: SUPPORT_EMAIL, operator: OPERATOR_NAME }),
  oss: {
    title: '오픈소스 라이선스',
    updatedAt: '2026-10-23',
    sections: [
      { heading: '안내', body: `CutPick 앱에 포함된 오픈소스 소프트웨어 ${OSS.packages.length}개와 글꼴의 저작권 표시와 라이선스예요. 각 항목의 "원문 N"은 아래 라이선스 원문 번호예요.` },
      { heading: 'Pretendard (글꼴)', body: 'Copyright (c) 2021, Kil Hyung-jin, with Reserved Font Name Pretendard.\n라이선스: SIL Open Font License 1.1 (https://openfontlicense.org)' },
      ...OSS.packages.map((p) => ({
        heading: `${p.name} ${p.version}`,
        body: [...p.copyright, `라이선스: ${p.license}${p.textId ? ` · 원문 ${textNumber.get(p.textId)}` : ''}`].join('\n'),
      })),
      ...Object.entries(texts).map(([id, body]) => ({ heading: `라이선스 원문 ${textNumber.get(id)}`, body })),
    ],
  },
  'image-credits': {
    title: '이미지 출처',
    updatedAt: '2026-10-23',
    sections: [
      {
        heading: '취향 설정 예시 사진',
        body: '취향 설정 화면의 예시 사진은 Wikimedia Commons에서 상업적 이용과 재배포가 허용된 라이선스(CC0·퍼블릭 도메인·CC BY)의 사진만 골라 앱에 함께 넣었어요. 모두 작게 줄이고 4:5로 잘랐어요. 사진 속 장소·사물·작가는 CutPick을 보증하지 않아요.',
      },
      ...STYLE_CARDS.map((card) => ({ heading: card.title, body: creditBody(card.credit) })),
      {
        heading: '음식 각도·인물 구도·보정 예시 사진',
        body: '같은 기준(CC0·퍼블릭 도메인·CC BY)으로 고른 사진이에요. 인물 사진은 얼굴이 드러나지 않는 장면만 골랐어요. 보정 예시 3장은 한 장의 CC0 사진을 직접 세 가지로 보정한 것이에요.',
      },
      ...CHOICE_CARDS.map((card) => ({ heading: `${card.stepId === 'retouch' ? '보정' : card.stepId === 'preferredFoodAngles' ? '음식' : '인물'} · ${card.title}`, body: creditBody(card.credit) })),
      {
        heading: '샘플 체험 사진',
        body: '"샘플 사진으로 체험하기"의 18장도 Wikimedia Commons에서 같은 기준(CC0·퍼블릭 도메인·CC BY)으로 고른 사진이에요. 분석 기능을 보여 주려고 일부는 원본을 조금 어긋나게 자르거나, 흐리게 하거나, 밝기·노출을 올려 가공했어요.',
      },
      ...SAMPLE_CREDITS.map((sample) => ({ heading: `샘플 ${String(sample.slot).padStart(2, '0')} · ${sample.scene}`, body: creditBody(sample.credit) })),
      {
        heading: '베스트샷 샘플 (홈·커뮤니티)',
        body: `홈과 커뮤니티에 "샘플"로 표시되는 사진 ${SHOWCASE_PHOTOS.length}장은 CutPick 프로젝트 소유자가 앱에 쓰도록 제공한 이미지예요. 실제 사용자의 게시물이 아니며 작성자·하트 수가 없어요.`,
      },
      { heading: '베스트샷 샘플 출처', body: creditBody(SHOWCASE_PHOTOS[0].credit) },
    ],
  },
};
