/**
 * Privacy policy, terms and community guidelines as plain data. No imports on purpose: the same texts
 * render in the app (documents.ts) and are published as web pages for the store listings
 * (scripts/build-legal-site.mjs, run by Node's type stripping). Drafts — have them reviewed before
 * a public release (docs/RELEASE_CHECKLIST.md).
 */
export interface LegalDoc {
  title: string;
  updatedAt: string;
  sections: { heading: string; body: string }[];
}

export interface PolicyContact {
  /** EXPO_PUBLIC_SUPPORT_EMAIL */
  email: string;
  /** EXPO_PUBLIC_OPERATOR_NAME — person or business responsible for personal data. */
  operator: string;
}

/** Minimum age for a community account (Korean PIPA: under 14 needs guardian consent, which we do not collect). */
export const COMMUNITY_MIN_AGE = 14;

/** Where the community backend runs. Change together with the Supabase project region. */
export const SERVER_LOCATION = { country: '일본', region: '도쿄(AWS ap-northeast-1)' } as const;

/** Who sends the sign-in code e-mails (Supabase custom SMTP). Change when the SMTP provider changes. */
export const MAIL_SENDER = { company: 'Google LLC (Gmail SMTP)', country: '미국' } as const;

export const POLICY_UPDATED_AT = '2026-10-23';

export function buildPolicyDocs({ email, operator }: PolicyContact): Record<'privacy' | 'terms' | 'guidelines', LegalDoc> {
  const contact = email ? `문의: ${email}` : '문의 연락처가 이 빌드에 설정되지 않았어요(EXPO_PUBLIC_SUPPORT_EMAIL). 공개 출시 전 반드시 설정해야 해요.';
  const officer = `${operator || '운영자(이름 미설정 — EXPO_PUBLIC_OPERATOR_NAME)'} · ${email || '연락처 미설정'}`;
  return {
    privacy: {
      title: '개인정보 처리방침',
      updatedAt: POLICY_UPDATED_AT,
      sections: [
        { heading: '요약', body: 'CutPick의 사진 분석·추천·내보내기는 모두 기기 안에서 이뤄지고 서버로 보내지 않아요. 커뮤니티에 로그인하거나 사진을 직접 공개할 때만 아래 정보가 서버에 저장돼요. 커뮤니티를 쓰지 않으면 어떤 개인정보도 서버로 전송되지 않아요.' },
        { heading: '1. 기기 안에서만 처리되는 정보', body: '사용자가 직접 고른 사진의 파일 위치, 축소 썸네일, 기술적 분석값(선명도·노출·대비·색 통계·유사도 서명), 프로젝트, 취향 설정, 유지·제외 기록은 이 기기의 앱 저장소에만 저장돼요. 새 프로젝트에서 "촬영 시간 사용"을 켠 경우에만 촬영 시간을 읽고, 위치(GPS) 정보는 읽거나 저장하지 않아요.' },
        { heading: '2. 커뮤니티 이용 시 처리하는 개인정보', body: '· 이메일 로그인: 이메일 주소\n· 카카오 로그인: 카카오 회원 식별자, 닉네임, 프로필 사진(선택), 카카오계정 이메일(선택)\n· Google 로그인: Google 계정 식별자, 이메일 주소, 이름·프로필 사진 주소\n· 공통: 공개 핸들, 사용자가 공개를 확정한 사진의 공유용 사본(메타데이터 제거·축소본)과 미리보기, 카테고리·스타일 태그, 하트, 신고, 차단 기록\n· 자동 생성: 로그인 보안을 위한 접속 기록(IP 주소, 접속 시각)\n소셜 로그인으로 받은 이름·프로필 사진은 인증 서버에만 저장되고 앱에 공개되지 않아요. 게시물에는 @핸들만 표시돼요.' },
        { heading: '3. 이용 목적', body: '회원 식별과 로그인, 사진 게시·하트·신고·차단 기능 제공, 운영 정책 위반 대응과 분쟁 처리, 서비스 보안 유지.' },
        { heading: '4. 보유 및 파기', body: '계정을 삭제하면 게시물·공유 이미지·하트·차단 기록·프로필·로그인 계정을 지체 없이 삭제해요. 내가 낸 신고는 운영 기록으로 남기되 작성자 정보는 지워요. 접속 기록은 서버 제공자의 로그 보관 기간이 지나면 자동 삭제돼요. 기기 안의 데이터는 설정 > 데이터 관리에서 언제든 지울 수 있고, 앱을 삭제해도 지워져요.' },
        { heading: '5. 처리 위탁 및 국외 이전', body: `커뮤니티를 이용할 때만 아래와 같이 개인정보가 국외로 이전돼요.\n· 이전받는 자: Supabase, Inc. (데이터베이스·인증·이미지 저장) — https://supabase.com/privacy\n· 이전 국가·장소: ${SERVER_LOCATION.country} ${SERVER_LOCATION.region} 서버\n· 이전 일시·방법: 로그인·게시·하트·신고 등 커뮤니티 기능을 쓸 때마다 암호화된 네트워크로 전송\n· 이전 항목: 2번의 커뮤니티 항목\n· 보유 기간: 계정 삭제 시까지\n· 인증 메일 발송: ${MAIL_SENDER.company}, ${MAIL_SENDER.country} — 이메일 로그인 시 이메일 주소와 인증 코드\n거부 방법: 커뮤니티에 로그인하지 않으면 이전되지 않으며, 사진 분석·추천·내보내기는 그대로 쓸 수 있어요.` },
        { heading: '6. 만 14세 미만 아동', body: `커뮤니티 계정은 만 ${COMMUNITY_MIN_AGE}세 이상만 만들 수 있어요. 만 ${COMMUNITY_MIN_AGE}세 미만은 로그인할 수 없고, 계정이 필요 없는 기기 안 기능만 쓸 수 있어요. 만 ${COMMUNITY_MIN_AGE}세 미만의 계정을 알게 되면 삭제해요.` },
        { heading: '7. 이용자의 권리', body: '언제든 개인정보 열람·정정·삭제·처리 정지를 요구할 수 있어요. 앱에서 핸들 수정(커뮤니티 계정), 게시물 삭제(내 게시물), 계정 삭제(커뮤니티 계정 > 계정 삭제)를 바로 할 수 있고, 그 밖의 요청은 아래 연락처로 보내 주세요.' },
        { heading: '8. 안전성 확보 조치', body: '모든 서버 통신은 HTTPS로 암호화해요. 데이터베이스는 행 단위 접근 제어로 본인 데이터만 수정할 수 있게 했어요. 비밀번호를 쓰지 않는 로그인 방식이라 비밀번호를 저장하지 않아요. 공개되는 사진은 원본이 아니라 촬영 위치 등 메타데이터를 제거하고 다시 만든 사본이에요.' },
        { heading: '9. 개인정보 보호책임자', body: officer },
        { heading: '10. 권익 침해 구제', body: '개인정보 침해 상담·신고: 개인정보침해신고센터(국번 없이 118, privacy.kisa.or.kr), 개인정보분쟁조정위원회(1833-6972, www.kopico.go.kr)' },
        { heading: '11. 변경', body: '내용이 바뀌면 앱과 이 페이지에 시행일과 함께 알려요.' },
      ],
    },
    terms: {
      title: '이용약관',
      updatedAt: POLICY_UPDATED_AT,
      sections: [
        { heading: '서비스', body: 'CutPick은 사용자가 고른 사진을 기기에서 분석해 게시용 후보를 추천하고, 선택적으로 사진을 커뮤니티에 공개해 하트로 공감받는 서비스예요. 추천은 참고 정보이며 결과를 보장하지 않아요.' },
        { heading: '이용 연령', body: `사진 분석·추천은 누구나 계정 없이 쓸 수 있어요. 커뮤니티 계정은 만 ${COMMUNITY_MIN_AGE}세 이상만 만들 수 있어요.` },
        { heading: '사용자 콘텐츠', body: '게시한 사진의 권리는 사용자에게 있어요. 사용자는 사진을 올릴 권리와 사진 속 인물의 동의를 확보해야 해요. CutPick은 서비스 제공(표시·저장·축소본 생성)에 필요한 범위에서만 이용해요.' },
        { heading: '금지 행위', body: '노출·성적 콘텐츠, 혐오·괴롭힘, 타인 개인정보 노출, 사칭, 저작권 침해, 스팸을 금지해요. 위반 게시물은 숨김·삭제되고 반복 위반 계정은 게시가 제한되거나 삭제될 수 있어요.' },
        { heading: '계정 삭제', body: '커뮤니티 계정 화면에서 언제든 계정과 게시물을 삭제할 수 있어요.' },
        { heading: '서비스 변경과 책임', body: '무료로 제공되는 서비스로, 커뮤니티 기능은 운영 사정에 따라 바뀌거나 중단될 수 있어요. 기기 안의 사진 원본은 앱이 수정하거나 삭제하지 않아요. 관련 법령이 허용하는 범위에서 고의·중과실이 없는 손해에 대해 책임을 지지 않아요.' },
        { heading: '문의', body: contact },
      ],
    },
    guidelines: {
      title: '커뮤니티 가이드라인',
      updatedAt: '2026-10-22',
      sections: [
        { heading: '하트는 공감이에요', body: '하트는 사진과 스타일에 대한 공감 표시예요. 사람의 외모를 평가하거나 순위를 매기는 기능은 없어요. 댓글·DM·싫어요도 없어요.' },
        { heading: '올리지 말아 주세요', body: '노출·성적 콘텐츠, 미성년자를 위험하게 하는 콘텐츠, 혐오·괴롭힘, 다른 사람의 얼굴·개인정보를 동의 없이 담은 사진, 다른 사람의 저작물.' },
        { heading: '신고와 차단', body: '게시물 상세에서 신고하거나 계정을 차단할 수 있어요. 여러 명이 신고한 게시물은 검토 전까지 자동으로 숨겨져요. 저작권 침해 신고도 같은 메뉴에서 접수돼요.' },
        { heading: '공개와 관리', body: '새 게시물은 올리는 즉시 공개돼요. 자동 이미지 검열 기능은 없고, 신고·차단과 운영자 확인으로 사후에 관리해요. 가이드라인을 어긴 게시물은 예고 없이 숨겨지거나 삭제될 수 있어요.' },
        { heading: '문의', body: contact },
      ],
    },
  };
}

/** Google Play "delete account" URL page: how to delete without reinstalling the app. */
export function buildAccountDeletionDoc({ email }: PolicyContact): LegalDoc {
  return {
    title: 'CutPick 계정 및 데이터 삭제',
    updatedAt: POLICY_UPDATED_AT,
    sections: [
      { heading: '앱에서 삭제하기', body: 'CutPick 앱 → 내 정보 → 톱니(설정) → 커뮤니티 계정 → 계정 삭제 → 영구 삭제. 바로 처리돼요.' },
      { heading: '앱 없이 요청하기', body: `${email || '(지원 이메일 미설정)'}로 커뮤니티 핸들과 로그인에 쓴 이메일(또는 카카오·Google 로그인 여부)을 적어 "계정 삭제 요청"을 보내 주세요. 본인 확인 후 7일 안에 삭제하고 결과를 회신해요.` },
      { heading: '삭제되는 데이터', body: '로그인 계정, 프로필(핸들), 게시물과 서버에 올린 공유 이미지·미리보기, 하트, 차단 기록.' },
      { heading: '남는 데이터', body: '내가 낸 신고는 다른 사용자 보호를 위해 운영 기록으로 남지만 작성자 정보는 지워요. 로그인 보안용 접속 기록은 서버 제공자의 로그 보관 기간이 지나면 자동 삭제돼요. 기기 안의 프로젝트·사진은 서버에 없으므로 앱의 설정 > 데이터 관리 또는 앱 삭제로 지울 수 있어요.' },
    ],
  };
}
