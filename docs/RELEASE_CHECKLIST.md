# 출시 체크리스트

작성 2026-10-23. **[코드]** = 저장소에 반영됨, **[소유자]** = 계정·결제·법적 판단이 필요해 소유자가 직접 해야 함. 끝나면 `- [x]`로 바꾼다.

## A. 코드에 반영된 것 (2026-10-23)
- [x] [코드] `eas.json` — `preview`(내부 배포 APK) / `production`(스토어 AAB, 빌드 번호 원격 자동 증가 `appVersionSource: remote`). 각 프로필은 같은 이름의 EAS 환경 변수를 씀.
- [x] [코드] 앱 내 **오픈소스 라이선스** 화면(설정 → 정보 및 고객 지원). 실제 앱 번들에 들어가는 패키지 84개 + Pretendard. 생성·감사: `scripts/generate-oss-licenses.mjs`(GPL 등 허용 목록 밖 라이선스면 실패). 2026-10-23 감사 결과: MIT 78 · ISC 2 · BSD-3 1 · 0BSD 1 · MIT AND Apache-2.0 1 · MIT AND OFL-1.1 1, 문제 없음.
- [x] [코드] **개인정보 처리방침 개정**: 소셜 로그인 항목(카카오·Google), 국외 이전(Supabase 일본 도쿄, Gmail SMTP 미국), 보유·파기, 만 14세 미만, 이용자 권리, 안전성 조치, 보호책임자, 권익 침해 구제. 이용약관에 이용 연령·계정 삭제·책임 조항.
- [x] [코드] **연령 정책**: 커뮤니티 로그인 전 "만 14세 이상 + 약관·처리방침(국외 이전 포함) 동의" 체크 없이는 로그인 버튼이 꺼짐. 로컬 기능은 계정 없이 그대로.
- [x] [코드] 스토어용 **공개 웹페이지 생성기** `scripts/build-legal-site.mjs` → `docs/legal/`(처리방침·약관·가이드라인·계정 삭제 안내). 앱과 같은 문구(`src/features/legal/policy-texts.ts`)를 씀.
- [x] [코드] Android targetSdk 36 확인(RN 0.88 버전 카탈로그 `targetSdk = "36"`, compileSdk 37) → 2026-08-31 Play 요건 충족.
- [x] [코드] (2026-10-24, D-054) Play 사진·동영상 권한 정책 대응: `READ_MEDIA_IMAGES`·`READ_MEDIA_VISUAL_USER_SELECTED`·`SYSTEM_ALERT_WINDOW` 등을 `app.json` `blockedPermissions`로 제거(`expo config --type introspect`로 확인). **새 빌드에서 사진 앱 저장 실기기 확인 필요.**

## B. 소유자가 할 일 — 출시 순서대로

### 1. 정보 채우기 (10분)
- [x] `.env.local`에 `EXPO_PUBLIC_OPERATOR_NAME` 추가 (2026-10-23, 보호책임자 = 소유자 실명).
- [x] (2026-10-23) 처리방침 웹페이지 만들기: `node --no-warnings scripts/build-legal-site.mjs` → `docs/legal/` 생성 → 커밋·푸시.
- [x] (2026-10-23 소유자, 공개 URL 200 확인) GitHub 저장소 → Settings → Pages → Source "Deploy from a branch", Branch `main` / `/docs` → 저장. 몇 분 뒤 `https://logic-phantom.github.io/CutPick/legal/privacy.html`이 열리는지 확인. 이 주소가 스토어의 **개인정보처리방침 URL**, `…/legal/account-deletion.html`이 Play의 **계정 삭제 URL**.
- [ ] 메일 발송을 Gmail에서 Resend 등으로 바꾸면 `policy-texts.ts`의 `MAIL_SENDER`를 고치고 페이지 재생성.

### 2. 소셜 로그인 출시 상태로 (30분)
- [x] (2026-10-23, 게시 상태 "프로덕션 단계" 확인. 로고 없음·기본 범위만이라 인증 심사 불필요) **Google Cloud** `cutpick` 프로젝트 → Google 인증 플랫폼 → 대상 → 게시 상태 **"앱 게시"(프로덕션)**. 지금은 "테스트 중"이라 테스트 사용자만 로그인 가능 → 심사자·일반 사용자 로그인 실패. 브랜딩에 앱 홈페이지·처리방침 URL(1번 주소) 입력.
- [ ] **카카오** 앱 1617973: ~~앱 아이콘 등록~~(2026-10-23, 256px) → ~~비즈 앱 전환~~(2026-10-23 소유자, 개인 개발자) → ~~동의항목 카카오계정(이메일) = 선택 동의~~(2026-10-23, 목적: 커뮤니티 계정 식별·문의/계정 삭제 시 본인 확인) → ~~개인정보 국외이전 정보 등록~~(2026-10-23: 일본 / Supabase, Inc. / https://supabase.com/privacy) → 폰에서 카카오 로그인 재시도(KOE205 해결 확인).
- [ ] 구글 로그인 앱 복귀 → 핸들 만들기까지 폰에서 확인.

### 3. 커뮤니티 실서버 검증 (공개 출시 전 필수)
- [x] (2026-10-23) Supabase SQL Editor에서 `supabase/tests/rls_test.sql` 실행 → **실제 버그 발견**: 신고받은 게시물·계정은 삭제가 실패(`reports_check` 제약). 수정 마이그레이션 `20261023000000_reports_survive_deletion.sql`을 테스트와 같은 트랜잭션에서 돌려 **13개 검사 전부 통과**(전부 롤백, 운영 DB 변경 없음 확인).
- [x] (2026-10-23) **운영 DB에 `20261023000000_reports_survive_deletion.sql` 적용** — `reports_check` 없음·새 신고 등록 정책 확인, 적용된 스키마로 RLS 테스트 재실행 **13개 전부 통과**(롤백).
- [ ] 두 계정으로 게시 → 하트 → 신고 3건 자동 숨김 → 차단 → 게시물 삭제(Storage 파일까지) → 계정 삭제.
- [ ] 매일 신고·신규 게시물을 확인할 사람 정하기(`docs/UGC_SAFETY.md` 운영 절차). 없으면 커뮤니티 없이 출시하거나 `require_review=true`(승인제).
- [ ] Supabase Free는 **1주 비활성 시 일시 중지** — 출시 후 사용자가 적으면 커뮤니티가 멈출 수 있음. Pro(월 US$25) 전환 여부 결정.

### 4. EAS 빌드 (Expo 계정 필요)
- [x] (2026-10-23) EAS 로그인(계정 `lcm2`, PowerShell에서는 `npx.cmd`) → `eas init`으로 프로젝트 `@lcm2/cutpick` 생성·연결(`app.json` `extra.eas.projectId`·`owner`). EAS 환경 변수 4개 preview·production 등록 완료.

EAS 서버는 git 무시 파일인 `.env.local`을 받지 못하므로 환경 변수를 따로 등록한다(값은 모두 앱에 공개되는 값 — **secret/service_role 키는 절대 넣지 않는다**). `--environment`를 두 번 주면 preview·production에 한꺼번에 들어간다:
```bash
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_URL --value https://mgycpqjzdulzbufupqdu.supabase.co --environment production --environment preview --visibility plaintext
```
같은 방식으로 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_OPERATOR_NAME`. 확인: `npx eas-cli@latest env:list --environment production`.

- [ ] 내부 테스트 APK(**D-054 권한 변경 후 다시 빌드**): `npx eas-cli@latest build -p android --profile preview` → 폰에 설치(예전 디버그 키 APK는 먼저 삭제) → **사진 앱 저장**, 공유 시트, 커뮤니티 로그인 확인.
- [ ] 스토어용: `npx eas-cli@latest build -p android --profile production` (업로드 키는 EAS가 생성·보관하도록 선택).

### 5. Google Play (US$25 1회)
- [ ] Play Console 개발자 계정(개인: 신원 확인. **2023-11 이후 만든 개인 계정은 프로덕션 전에 테스터 12명 이상 × 14일 연속 비공개 테스트 필수**).
- [ ] 앱 만들기(기본 언어 한국어, 무료) → 스토어 등록정보(`docs/STORE_LISTING.md` 초안), 스크린샷(폰 2장 이상), 512px 아이콘, 1024×500 그래픽 이미지.
- [ ] 앱 콘텐츠: 개인정보처리방침 URL, **데이터 보안** 양식(`docs/STORE_LISTING.md`의 답변), **계정 삭제 URL**, 앱 액세스(로그인은 선택 기능 — 심사자는 Google 로그인 사용 안내), 콘텐츠 등급 설문(사용자 간 공유·사용자 생성 콘텐츠 "예"), 타겟 연령(만 14세 미만 제외 권장), 광고 없음.
- [ ] 비공개 테스트 트랙에 AAB 업로드 → 테스터 12명 14일 → 프로덕션 신청.

### 6. iOS App Store (US$99/년) — 소셜 로그인 결정 필요
- [ ] Apple Developer Program 가입.
- [ ] **결정**: App Store 가이드라인 4.8 — 카카오·Google 같은 제3자 로그인을 쓰면 이메일 비공개가 가능한 동등한 로그인(사실상 **Sign in with Apple**)도 제공해야 함. 지금 이메일 코드 로그인은 이메일을 숨길 수 없어 이 조건을 채우지 못할 가능성이 큼. 선택지: ① Sign in with Apple 추가(Supabase Apple 공급자 + Apple 키 필요) ② iOS에서는 카카오·Google 버튼을 숨기고 이메일 로그인만.
- [ ] `npx eas-cli@latest build -p ios --profile production` → `npx eas-cli@latest submit -p ios` → App Store Connect: 개인정보 처리방침 URL, **앱 개인정보 보호(영양 성분표)**, 연령 등급(UGC 있음), 심사 메모(로그인 선택·신고/차단 위치·운영자 연락처).
- [ ] iOS 실기기 검증(사진 선택 "선택한 사진만", 저장, 공유) — 이 PC에는 macOS가 없어 TestFlight로 확인.

### 7. 법적 확인
- [ ] 처리방침·약관을 전문가(또는 개인정보보호위원회 "개인정보 처리방침 작성지침")로 검토. 현재 문구는 초안.
- [x] (2026-10-23 1차) KIPRIS 국내 상표 "CUTPICK+컷픽" 검색 → 2건, 모두 다른 상품류(05류 "프리컷픽스젠틀", 03류 "웨이크메이크 오일 컷 픽서"), 9류·42류 동일·유사 표장 없음. 법적 판단(유사성 심사)은 아니며, 상표 출원 여부는 소유자 결정.
- [x] (2026-10-24) 베스트샷 샘플 20장 출처: 소유자가 ChatGPT로 생성한 AI 이미지 → `docs/IMAGE_ASSET_ATTRIBUTIONS.md`·앱 이미지 출처·샘플 상세에 기재. 생성 대화(프롬프트·날짜)는 소유자가 보관.
- [x] (2026-10-24) 온보딩 인물 카드 2장(거울샷·로우 앵글, D-047) 출처: 소유자가 ChatGPT로 생성한 AI 이미지로 기재.
- [ ] 사업자 등록 여부: 무료·광고 없는 개인 앱은 보통 불필요하지만, 유료화 시 필요.
