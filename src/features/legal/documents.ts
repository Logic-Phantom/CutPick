import { SUPPORT_EMAIL } from '@/features/community/moderation-policy';

/**
 * In-app policy texts (MVP drafts). They must be reviewed by a qualified person before any
 * public release — see docs/UGC_SAFETY.md. The support contact comes from EXPO_PUBLIC_SUPPORT_EMAIL.
 */
export interface LegalDoc {
  title: string;
  updatedAt: string;
  sections: { heading: string; body: string }[];
}

const CONTACT = SUPPORT_EMAIL ? `문의: ${SUPPORT_EMAIL}` : '문의 연락처가 이 빌드에 설정되지 않았어요(EXPO_PUBLIC_SUPPORT_EMAIL). 공개 출시 전 반드시 설정해야 해요.';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  privacy: {
    title: '개인정보 처리방침 (초안)',
    updatedAt: '2026-10-18',
    sections: [
      { heading: '기기 안에서만 처리되는 정보', body: '사용자가 직접 고른 사진의 파일 위치, 축소 썸네일, 기술적 분석값(선명도·노출·대비·색 통계·유사도 해시), 프로젝트, 취향 설정과 유지·제외 기록은 이 기기의 앱 저장소에만 저장돼요. 서버로 전송하지 않아요.' },
      { heading: '촬영 정보', body: '새 프로젝트에서 "촬영 시간 사용"을 켠 경우에만 사진의 촬영 시간을 읽어요. 위치(GPS) 정보는 저장하지 않아요.' },
      { heading: '커뮤니티를 이용할 때 서버에 저장되는 정보', body: '로그인 이메일(인증용, 비공개), 공개 핸들, 사용자가 공개를 확정한 사진의 공유용 사본(메타데이터 제거·축소)과 미리보기, 카테고리·스타일 태그, 하트, 신고, 차단 기록이에요. 공개 게시물은 다른 사용자가 볼 수 있어요.' },
      { heading: '삭제', body: '설정 > 데이터 관리에서 로컬 데이터를 언제든 지울 수 있어요. 커뮤니티 게시물은 내 게시물에서, 계정은 커뮤니티 계정 화면에서 삭제할 수 있어요.' },
      { heading: '처리 위탁', body: '커뮤니티 백엔드는 Supabase(데이터베이스·인증·스토리지)를 사용해요. 운영 지역과 국외 이전 고지는 출시 전 확정해야 해요.' },
      { heading: '문의', body: CONTACT },
    ],
  },
  terms: {
    title: '이용약관 (초안)',
    updatedAt: '2026-10-18',
    sections: [
      { heading: '서비스', body: '컷픽은 사용자가 고른 사진을 기기에서 분석해 게시용 후보를 추천하고, 선택적으로 사진을 커뮤니티에 공개해 하트로 공감받는 서비스예요. 추천은 참고 정보이며 결과를 보장하지 않아요.' },
      { heading: '사용자 콘텐츠', body: '게시한 사진의 권리는 사용자에게 있어요. 사용자는 사진을 올릴 권리와 사진 속 인물의 동의를 확보해야 해요. 컷픽은 서비스 제공(표시·저장·축소본 생성)에 필요한 범위에서만 이용해요.' },
      { heading: '금지 행위', body: '노출·성적 콘텐츠, 혐오·괴롭힘, 타인 개인정보 노출, 사칭, 저작권 침해, 스팸을 금지해요. 위반 게시물은 숨김·삭제되고 반복 위반 계정은 게시가 제한될 수 있어요.' },
      { heading: '문의', body: CONTACT },
    ],
  },
  guidelines: {
    title: '커뮤니티 가이드라인',
    updatedAt: '2026-10-18',
    sections: [
      { heading: '하트는 공감이에요', body: '하트는 사진과 스타일에 대한 공감 표시예요. 사람의 외모를 평가하거나 순위를 매기는 기능은 없어요. 댓글·DM·싫어요도 없어요.' },
      { heading: '올리지 말아 주세요', body: '노출·성적 콘텐츠, 미성년자를 위험하게 하는 콘텐츠, 혐오·괴롭힘, 다른 사람의 얼굴·개인정보를 동의 없이 담은 사진, 다른 사람의 저작물.' },
      { heading: '신고와 차단', body: '게시물 상세에서 신고하거나 계정을 차단할 수 있어요. 여러 명이 신고한 게시물은 검토 전까지 자동으로 숨겨져요. 저작권 침해 신고도 같은 메뉴에서 접수돼요.' },
      { heading: '검토', body: '현재 새 게시물은 운영자 검토 후 공개돼요(설정값). 자동 이미지 검열 기능은 없어요.' },
      { heading: '문의', body: CONTACT },
    ],
  },
};
