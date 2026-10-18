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

## 마스터 프롬프트 기준 진행 현황 (2026-10-18)

기준 문서: `Cutpick_ClaudeCode_SuperPrompt.md` (사용자 제공 마스터 프롬프트). ✅ 완료(코드+테스트) · 🟡 코드 완료·실검증 미완 · ❌ 미착수/불가

### 단계별 (프롬프트 22장 Phase 0~6)
| Phase | 상태 | 내용 |
|---|---|---|
| 0 환경/실현 가능성 조사 | ✅ | Node·Expo SDK 58 확인, 공식 문서로 API 확인, 픽셀 접근 방식 결정(D-003), 플랫폼 규격·무료 한도·스토어 비용 조사, DECISIONS/ARCHITECTURE/COSTS/LICENSES 작성. REA 미사용(선택 사항) |
| 1 온보딩·로컬 기반 앱 | ✅ | 디자인 시스템, 홈, 사진 선택, 프로젝트 CRUD, SQLite·파일 저장, 취향 온보딩(저장·수정·초기화), 샘플 모드 |
| 2 로컬 사진 분석·추천 | 🟡 | 픽셀 품질 지표, 유사 사진 그룹, 추천 점수·이유, 대표 후보 3장, 수동 편집 완료. **실기기 30/100/300장 측정 미실행** |
| 3 SNS 내보내기 | 🟡 | 크롭·순번 파일·사진 앱 저장·OS 공유·캡션 구현. **iOS/Android에서 저장·공유·EXIF 제거 미검증** |
| 4 댓글 없는 커뮤니티 | 🟡 | 마이그레이션(RLS·트리거·RPC·스토리지), 게시·하트·삭제·신고·차단·계정 삭제 UI 완료. **Supabase 실프로젝트 연동·RLS 테스트 미실행** |
| 5 품질/개인정보/스토어 준비 | ❌ (문서만 일부) | 정책 문서 초안, 개인정보 문서 작성. 실기기 빌드·지원 이메일·법률 검토·자체 아이콘·연령 정책 미완 |
| 6 수익화/ML 고도화 | ❌ (의도적 보류) | 프롬프트 지시대로 핵심 검증 전 착수하지 않음 |

### 완료 기준 (프롬프트 13장)
| 기준 | 상태 |
|---|---|
| React Native + Expo iOS/Android 프로젝트 | ✅ |
| 사용자가 고른 사진만 처리, 전체 라이브러리 자동 스캔 없음 | ✅ (코드) |
| 30장 기본 분석 흐름이 **실제 기기**에서 동작 | ❌ 실기기 없음 (웹 미리보기에서 18장 동작 확인) |
| 유사 사진 그룹화가 실제 입력 사진으로 검증 | 🟡 합성 샘플 이미지로 검증(통합 테스트), 실사진 미검증 |
| 품질 신호와 추천 점수 구분 | ✅ |
| Instagram/TikTok/카카오톡 목적별 결과 구성 | ✅ |
| 프리셋에 출처·검토일·상태 | ✅ (출처 없음 = hypothesis로 명시) |
| 추천 수동 수정·순서 변경 | ✅ |
| 파일 저장·OS 공유를 iOS/Android에서 각각 확인 | ❌ |
| 로컬 기능은 유료 API·커뮤니티 서버 없이 동작, 장애 시 로컬 유지 | ✅ |
| 원본 수정/삭제 없음, 프로젝트 데이터 삭제 기능 | ✅ |
| 테스트 실제 실행·결과 기록 | ✅ (59개 통과, docs/TESTING.md) |
| Android 빌드/테스트 검증 | ❌ Android SDK 없음 |
| iOS 빌드/실기기 여부와 미검증 이유 명시 | ✅ (미검증: macOS 없음) |
| 비용·개인정보·라이선스·플랫폼 규칙 문서화 | ✅ |

### 프롬프트 21장 보안·테스트 기준
| 항목 | 상태 |
|---|---|
| 온보딩 건너뛰기·중단·재실행·수정 일관성 | ✅ 코드 + 웹 확인 |
| 취향별 추천 결과 차이, 기술 점수 비왜곡 | ✅ 단위 테스트 |
| 게시 안 한 사진이 네트워크에 안 나감 | 🟡 정적 확인만(프록시 실측 미실행) |
| 업로드 사본 EXIF/GPS 제거 | 🟡 재인코딩 구조, 실측 미실행 |
| RLS 격리·비인가 삭제·하트 중복·경로 위조 | 🟡 `supabase/tests/rls_test.sql` 작성, 미실행 |
| 하트 추가/취소·오프라인·중복 요청 | 🟡 낙관적 갱신·롤백·PK 멱등 구현, 실서버 미검증 |
| 차단 즉시 숨김 / 해제 | 🟡 `get_feed` 양방향 필터, 실서버 미검증 |
| 신고 실제 저장·처리 상태 | 🟡 테이블·상태값 구현, 실서버 미검증 |
| 게시물·계정 삭제 시 스토리지 정리 | 🟡 구현, 실서버 미검증 |
| 정책·연락처 링크 접근 | 🟡 화면 존재, **지원 이메일 미설정** |
| env 비면 크래시 없이 로컬 모드 | ✅ 웹에서 확인 |

## 다음 작업 이어가기 (Resume Guide)

새 세션에서 이 README만 보고 바로 이어서 작업할 수 있도록 정리한 절차다. Claude Code에 그대로 이렇게 요청하면 된다: **"README의 '다음 작업 이어가기'를 읽고 우선순위 1번부터 진행해. 마스터 프롬프트 규칙(정직한 검증 보고, 무료 우선, 프라이버시)을 계속 지켜."**

### 1) 개발 환경 복원
```bash
git clone https://github.com/Logic-Phantom/CutPick.git
```
```bash
npm install
```
```bash
npm test
```
- Node.js 20+ 필요(이 저장소는 24.20.0으로 개발). Windows PowerShell에서 방금 설치한 Node가 안 잡히면 새 터미널을 열거나 PATH를 갱신.
- 웹 미리보기: `npm run web` (UI 확인 전용). 실기기: `npx expo start` 후 Expo Go로 QR 스캔 — 현재 코드는 Expo Go 포함 모듈만 쓰므로 개발 빌드 불필요.
- Claude Code 브라우저 미리보기 설정: `.claude/launch.json`의 `cutpick-web`.

### 2) 작업 전 반드시 알아둘 것
- **Expo SDK 58 API는 학습 데이터와 다르다.** `AGENTS.md` 지시대로 https://docs.expo.dev/versions/v58.0.0/ 를 확인할 것. 이미 맞춰 둔 부분:
  - 사진 앱 저장: `import { Asset, requestPermissionsAsync } from 'expo-media-library'` → `Asset.create(uri)` (구 `createAssetAsync`는 런타임 throw)
  - 파일: `expo-file-system`의 `File`/`Directory`/`Paths` 객체 API (`move()`는 Promise)
  - 이미지: `ImageManipulator.manipulate(uri).resize().renderAsync()` → `saveAsync()`
  - 탭: `expo-router/native-tabs` (웹은 `src/app/(tabs)/_layout.web.tsx`에서 `expo-router/js-tabs`)
  - 패키지 추가는 `npx expo install <pkg>` (네트워크 오류 시 `npm i`로 버전 직접 지정)
- 모든 가중치·임계값은 `src/domain/recommendation-policy.ts` 한 곳. 분석 결과 형식을 바꾸면 `ANALYSIS_VERSION`을 올릴 것(기존 사진 자동 재분석).
- 테스트 위치: `tests/unit`, `tests/integration`(샘플 이미지 실디코드), `tests/benchmark`(`npm run bench`, 기기 측정 아님).
- 웹은 출시 대상이 아니다(썸네일 data URI 저장, 사진 앱 저장·공유 불가). 결과를 "기기 검증"으로 기록하지 말 것.
- 결정 변경 시 `docs/DECISIONS.md`에 D-0xx로 추가, 마지막에 이 README의 Work Log에 날짜별 항목 추가(기존 내용 보존, 섹션 중복 금지).

### 3) 우선순위별 다음 작업
1. **실기기 검증 (Phase 2·3 마무리)** — Android 폰/에뮬레이터(Android Studio 설치 필요) 또는 iPhone + Expo Go
   - 실사진 30/100/300장 선택 → 분석 화면 하단 "사진당 약 N ms" 기록 + 프로파일러로 피크 메모리 → `docs/DEVICE_BENCHMARKS.md` 표 채우기 → 필요 시 `IMPORT_LIMITS` 조정
   - 권한 거부/제한 접근(iOS "선택한 사진만"), HEIC·세로 EXIF 회전 사진, 한글·긴 파일명
   - 사진 앱 저장 순서·파일명, 한 장씩 공유 시트(Instagram/TikTok/카카오톡 각각)
   - 내보내기 사본 EXIF 검사: GPS 포함 사진 → 내보내기 → `exiftool`로 GPS 태그 없음 확인 → `docs/PRIVACY.md` 갱신
   - 큰 글자·VoiceOver/TalkBack·다크 모드·노치/제스처 바 → `docs/DESIGN_QA.md` 갱신
   - 실사진 연사로 중복 임계값(서명 거리 5) 재보정, 노이즈 사진 선명도 과대평가 개선 검토
2. **Supabase 실검증 (Phase 4 마무리)**
   - Supabase Free 프로젝트 생성 → `supabase/migrations/20261018000000_community_init.sql` 적용
   - `supabase/tests/rls_test.sql` 실행(로컬 `supabase start` 또는 일회용 프로젝트) → 결과를 `docs/TESTING.md`에 기록
   - `.env.local`에 URL·publishable key·지원 이메일 → 이메일 OTP 로그인, 프로필, 게시(검토 대기→대시보드 승인), 하트, 신고, 차단, 게시물·계정 삭제 후 스토리지 잔존 확인
   - Supabase 대시보드 Auth 설정에서 이메일 OTP 템플릿에 6자리 코드가 포함되는지 확인
3. **출시 준비 (Phase 5)** — 지원 이메일(`EXPO_PUBLIC_SUPPORT_EMAIL`), 처리방침·약관 법률 검토, 자체 앱 아이콘·스플래시(현재 Expo 템플릿 이미지), 앱 내 오픈소스 라이선스 화면, 연령 정책(Apple 1.2.1(a)), 상표 조사, `npx license-checker` 등 의존성 감사, Android targetSdk 36 확인, EAS Build 설정
4. **UX 잔여 과제** — 표시용 Tag 컴포넌트(비활성 칩 대체), 웹 가로 사진 4:5 내보내기 해상도 이상 원인 확인, 드래그 정렬(버튼 대체 수단 유지)
5. **보류** — 온디바이스 ML(라이선스·성능 게이트 통과 시, 개발 빌드 필요), 색 보정 프리셋, 캐러셀 게시, 수익화

### 4) 주요 파일 지도
| 하고 싶은 일 | 파일 |
|---|---|
| 점수·임계값 조정 | `src/domain/recommendation-policy.ts` |
| 분석 지표 | `src/features/image-analysis/pixel-metrics.ts`, `perceptual-hash.ts` |
| 분석 실행 흐름 | `src/features/image-analysis/analysis-runner.ts`, `heuristic-provider.ts` |
| 추천 로직 / 편집 상태 | `src/features/recommendations/engine.ts` / `use-recommendation-editor.ts` |
| 플랫폼 규격 | `src/features/platforms/platform-profiles.ts` (+ `docs/PLATFORM_RULES.md`) |
| 프리셋 | `src/features/style-presets/presets.ts` |
| 로컬 DB 스키마 | `src/infrastructure/database/db.ts` (마이그레이션 배열에 추가) |
| 커뮤니티 백엔드 | `src/features/community/supabase-community-repository.ts`, `supabase/migrations/` |
| 화면 | `src/app/**` |
| 디자인 토큰 | `src/design-system/tokens.ts` |

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

### 2026-10-18 — GitHub 업로드 및 이어가기 문서화
- 원격 저장소 https://github.com/Logic-Phantom/CutPick (빈 저장소)에 origin 연결, 지금까지의 작업(eat/cutpick-mvp 브랜치의 커밋 포함)을 main 브랜치로 푸시.
- README에 **마스터 프롬프트 기준 진행 현황**(Phase 0~6, 13장 완료 기준, 21장 보안·테스트 기준)과 **다음 작업 이어가기**(환경 복원, SDK 58 주의점, 우선순위 작업, 파일 지도) 섹션 추가.
- 코드 변경 없음. 테스트 재실행 결과는 직전 항목과 동일(59개 통과) — 이번 항목에서 새로 검증한 기능 없음.
