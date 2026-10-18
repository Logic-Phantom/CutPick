# 컷픽 (Cutpick)

여행·카페·음식·OOTD·일상 사진 중 **사용자가 직접 고른 사진만 기기 안에서 분석**해 Instagram 캐러셀/단일 게시물/스토리, TikTok 사진 게시물, 카카오톡 프로필·배경·채팅 공유용 후보를 추천하는 iOS/Android 앱(React Native + Expo). 선택한 베스트샷은 댓글 없이 **하트로만 공감**하는 컷픽 커뮤니티에 공개할 수 있다.

> 현재 상태: 코드·단위/통합 테스트·웹 미리보기 QA 완료. **iOS/Android 실기기 검증과 Supabase 실연동은 아직 하지 않았다** (아래 작업 내역 참고).

## 무엇을 하고, 무엇을 하지 않는가
| 한다 | 하지 않는다 |
|---|---|
| OS 선택기로 고른 사진만 처리, 원본 수정·삭제 없음 | 사진 보관함 자동 스캔, 원본 서버 업로드 |
| 흐림·노출·대비·해상도·색 통계, 비슷한 사진 묶기 | 얼굴·표정·눈 감김·미적 점수 판단(미지원으로 표시) |
| 플랫폼·목표 장수·감성 프리셋별 추천 + 근거 있는 이유 | 바이럴 보장, 실시간 트렌드 표시 |
| 고정·제외·순서·그룹 대표 교체·되돌리기 | 자동 결정 강제 |
| 순번 파일명으로 사진 앱 저장, 한 장씩 OS 공유, 캡션 복사 | 외부 SNS 자동 게시·비공식 API |
| 하트·신고·차단 커뮤니티 (선택) | 댓글·DM·싫어요·외모 평가·랭킹 |

## 요구 사항
- Node.js 20+ (개발 시 24.20.0 LTS 사용)
- 실행: Expo Go 앱(iOS/Android) — 이 앱은 Expo Go 포함 모듈만 사용하므로 개발 빌드가 필요 없다.
- iOS 빌드: macOS+Xcode 또는 EAS Build. Android 빌드: Android Studio 또는 EAS Build.

## 설치·실행
```bash
npm install
```
```bash
npx expo start
```
Expo Go로 QR 코드를 스캔한다. 웹 미리보기(UI 확인용, 출시 대상 아님):
```bash
npm run web
```

## 커뮤니티(선택) 설정
1. Supabase Free 프로젝트 생성 → `supabase/migrations/20261018000000_community_init.sql` 적용(`supabase db push` 또는 SQL 편집기).
2. `.env.example`을 `.env.local`로 복사해 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_SUPPORT_EMAIL` 입력. **service_role 키는 절대 넣지 않는다.**
3. 값이 비어 있으면 커뮤니티는 "서버 미설정" 화면을 보여 주고 나머지 기능은 그대로 동작한다.
4. 운영 절차와 출시 체크리스트: `docs/UGC_SAFETY.md`. 운영자 없이 공개 출시하지 않는다.

## 테스트·검사
```bash
npm test
```
```bash
npm run typecheck
```
```bash
npm run lint
```
```bash
npm run bench
```

## 구조
`src/app`(화면) · `src/design-system`(토큰·컴포넌트) · `src/domain`(모델·정책 상수) · `src/features/*`(사진 가져오기, 분석, 추천, 플랫폼, 프리셋, 온보딩, 개인화, 캡션, 내보내기, 프로젝트, 커뮤니티) · `src/infrastructure`(SQLite, 파일, 이미지 파이프라인) · `supabase/` · `tests/` · `docs/`. 자세한 내용은 `docs/ARCHITECTURE.md`.

## 문서
| 문서 | 내용 |
|---|---|
| docs/DECISIONS.md | 기술·제품 결정 기록 |
| docs/ARCHITECTURE.md, DATA_MODEL.md | 구조, 로컬/서버 스키마 |
| docs/ANALYSIS_ALGORITHM.md | 지표·그룹·점수·선택·설명 알고리즘 |
| docs/DEVICE_BENCHMARKS.md, BENCHMARKS.md | 성능 측정(실기기 미실행), UX 벤치마킹 |
| docs/PLATFORM_RULES.md | 플랫폼 규격과 출처·확인일 |
| docs/TREND_RESEARCH.md | 프리셋 검수 절차 |
| docs/PRIVACY.md, UGC_SAFETY.md | 데이터 흐름, 커뮤니티 안전 |
| docs/MODEL_AND_LIBRARY_LICENSES.md, THIRD_PARTY_NOTICES.md | 라이선스 |
| docs/COSTS_AND_DISTRIBUTION.md | 무료 한도, 스토어 비용, 빌드 |
| docs/DESIGN_SYSTEM.md, UX_FLOWS.md, DESIGN_QA.md | 디자인 토큰, 흐름, QA 결과(스크린샷: docs/screenshots) |
| docs/TESTING.md, ROADMAP.md | 테스트 범위·결과, 다음 단계 |

## 작업 내역 (Work Log)

### 2026-10-18 — 최초 구현 (Phase 0~4 코드, 웹 미리보기 QA)
**환경 조사**: 작업 폴더에는 `.claude/settings.local.json`만 있었고 Node.js가 없었다 → 사용자 승인 후 `winget install OpenJS.NodeJS.LTS`(Node 24.20.0, npm 11.19.0). Git 있음. Android SDK·macOS 없음. Expo 최신 안정 SDK 58(expo 58.0.14, RN 0.88.0, React 19.3)을 `npx create-expo-app@latest --template default`로 만든 뒤 프로젝트 폴더로 옮김(템플릿 `.claude/settings.json`의 플러그인 활성화는 가져오지 않음, 템플릿 예제 화면·README는 교체). 패키지는 `npx expo install`로 SDK 호환 버전 설치.

**구현**
- 디자인 시스템(`src/design-system`): 색(라이트/다크)·간격·radius·타이포 토큰, Button 4종·IconButton·FilterChip·PhotoThumbnail/SelectionBadge·ProgressPanel·Empty/Error/InlineMessage·BottomSheet·BottomBar·AppSwitch. 모든 화면에서 사용.
- 온보딩 7단계 + 개인정보 요약(건너뛰기, 단계별 저장, 설정에서 수정·초기화), 스키마 버전·마이그레이션.
- 프로젝트: 생성(OS 다중 선택, 최대 300장, 영상·미지원 형식 제외, 촬영시각만 선택적으로 읽음), 이름 변경, 삭제(파생 파일 포함, 원본 유지), 사진 상세·수동 장면 태그·프로젝트에서 빼기, 합성 샘플 모드.
- 분석: expo-image-manipulator → 128px JPEG → jpeg-js RGBA → 선명도·노출·대비·해상도·색 통계 + 16×16 휘도 서명, 동시성 2 큐, 진행·취소·재개·실패 재시도, 분석 버전 변경 시 자동 재분석, 앱 측정 사진당 처리시간 표시.
- 추천: 품질+취향+로컬 학습+크롭 적합+중복 보정 점수, MMR식 다양성 선택, 캐러셀 순서(시간순/유사 회피/수동 유지), 단일 목적 후보 3장, 근거 기반 이유, 고정·제외·순서·그룹 대표·되돌리기·초기화, 목적별 저장.
- 내보내기: 비율 크롭(앞/가운데/뒤), ASCII 순번 파일명, 사진 앱 저장(SDK58 `Asset.create`, 쓰기 전용 권한), 파일별 OS 공유, 캡션 템플릿·복사.
- 커뮤니티: `CommunityRepository` + Supabase 구현(이메일 OTP, 프로필 핸들, 피드·카테고리·페이지네이션, 하트(낙관적 갱신·멱등), 게시 동의 4항목·공유용 재인코딩 사본 업로드, 내 게시물 삭제(스토리지→DB), 신고 7사유, 차단/해제, 계정 삭제), 미설정 시 가짜 피드 없이 안내. SQL 마이그레이션: 6개 테이블 RLS, 작성자 moderation 변경 차단·하루 게시 제한·스토리지 한도·신고 자동 숨김 트리거, `get_feed`(양방향 차단)·`get_my_blocks`·`delete_my_account` RPC, 스토리지 버킷 정책.
- 정책 화면(처리방침·약관·가이드라인 초안), 설정(취향, 개인화 끄기, 학습 기록 삭제, 데이터 삭제, 분석 범위).

**핵심 결정**: Expo Go 모듈만으로 픽셀 분석(D-003), ML 모델 미탑재(D-004), dHash → 휘도 서명 교체(D-008, 샘플에서 dHash는 중복 쌍 해밍 18–31로 분리 실패), 프리셋은 순위만 조정·전부 가설(D-011), 새 게시물 운영자 승인 기본(D-018). 전체: docs/DECISIONS.md.

**주요 파일**: `src/app/**`(19개 화면), `src/features/**`, `src/design-system/**`, `src/domain/**`, `src/infrastructure/**`, `supabase/migrations/20261018000000_community_init.sql`, `supabase/tests/rls_test.sql`, `scripts/generate-sample-photos.mjs`, `assets/samples/*.jpg`, `tests/**`, `docs/**`, `app.json`, `metro.config.js`, `eslint.config.js`, `jest.bench.config.js`, `.env.example`.

**실행한 명령과 결과**
- `npx jest` → 5 suites / **59 tests 통과**.
- `npx tsc --noEmit` → 오류 0. `npx eslint .`·`npx expo lint` → 오류·경고 0 (수정 후. 첫 `expo lint` 자동 설정은 네트워크 ECONNRESET으로 실패해 `npm i -D eslint@9 eslint-config-expo@~58`로 수동 설치).
- `npm run bench`(데스크톱 Node, 기기 아님): 30/100/300장 디코드+지표+서명 150/365/1052ms(사진당 3.5–5.0ms), 그룹화 7/57/438ms. 서명 캐시 도입 전 300장 그룹화 10,977ms → 개선.
- 웹 미리보기(`npx expo start --web`, 브라우저 패널): 온보딩→샘플 18장 프로젝트→실제 분석(앱 측정 사진당 254ms/357ms, 데스크톱 브라우저)→추천 편집(순서 이동, 그룹 대표 교체)→내보내기 파일 6장 생성→캡션 복사, 커뮤니티 미설정 화면, 설정, 다크 모드, 320px 폭 확인. 발견 문제 10건 수정(docs/DESIGN_QA.md). 스크린샷 11장 docs/screenshots.

**처리한 사진**: 직접 생성한 합성 샘플 18장만 사용(실제 사용자 사진·인물 사진 없음). 실사진 30/100/300장 측정 **미실행**.

**검증 범위**: iOS·Android 실기기/시뮬레이터 **미검증**(이 PC에 Android SDK·macOS 없음) — 따라서 다중 선택, 권한, EXIF 회전, 사본의 GPS 제거, 사진 앱 저장, 공유 시트, 큰 글자, 스크린리더는 완료로 표시하지 않음. Supabase 실연동·RLS SQL 테스트 **미실행**.

**데이터 처리**: 로컬 기능은 네트워크를 쓰지 않음(정적 확인, 프록시 실측 미실행). 네트워크는 커뮤니티(Supabase)만, env 미설정 시 비활성. GPS 등 EXIF는 저장하지 않으며 촬영시각은 사용자가 켠 경우만.

**라이선스·비용**: 런타임 의존성 MIT, jpeg-js BSD-3-Clause(고지 THIRD_PARTY_NOTICES.md), 모델·폰트 없음, 샘플 이미지 자체 제작. 앱 아이콘·스플래시는 Expo 템플릿 임시 이미지 → 출시 전 교체. Apple US$99/년, Google Play US$25 1회, Supabase Free(DB 500MB·Storage 1GB·Egress 5GB, 1주 비활성 시 일시중지, Free는 과금 없음), EAS Free 빌드 Android 15·iOS 15 — 모두 2026-10-18 공식 출처 확인(docs/COSTS_AND_DISTRIBUTION.md). 전체 의존성 라이선스 자동 감사·상표 조사 미실행.

**플랫폼 규격·프리셋 출처**: Instagram 캐러셀 20장·비율 1.91:1~3:4(공식 색인), TikTok 사진 35장(공식 색인), 카카오톡 채팅 120장(2차 출처) 등 — 2026-10-18 확인, docs/PLATFORM_RULES.md. 감성 프리셋 7종은 출처 없는 가설(`experimental/hypothesis`).

**디자인**: 토큰·컴포넌트를 전 화면에 적용(docs/DESIGN_SYSTEM.md, UX_FLOWS.md, DESIGN_QA.md 존재·구현과 일치 확인). 웹에서 다크 모드 버튼 대비, 탭 겹침, 추천 화면 정보 과밀 등 수정. 남은 문제: 웹 가로 사진 4:5 내보내기 해상도 이상(비율은 정확), 강한 그레인 사진의 선명도 과대평가, 표시용 태그의 스크린리더 역할.

**미해결 위험·다음 단계**: 실기기 검증, Supabase 실검증, 지원 이메일·법률 검토·자체 아이콘·연령 정책(UGC 출시 전 필수), 중복 임계값 실사진 재보정. 상세: docs/ROADMAP.md.
