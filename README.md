# CutPick (컷픽)

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

## 제품·UX 우선 원칙
1. **핵심 가치는 베스트샷 추천이다.** 커뮤니티가 없어도 사진 선택 → 분석 → 추천 편집 → 플랫폼별 내보내기까지 완결되어야 한다.
2. **질문과 이미지가 정확히 일치해야 한다.** 취향 온보딩의 사진은 선택지의 의미를 즉시 설명해야 하며, 질문 대상·각도·구도 외의 변수를 최소화한다.
3. **추천은 설명 가능하고 사용자가 수정할 수 있어야 한다.** 실제로 추천에 영향을 준 항목만 이유로 표시하고, 고정·제외·순서 변경 등 수동 제어를 유지한다.
4. **공유는 명시적 선택이다.** 사용자가 선택한 사진만 별도 재인코딩 사본으로 공유하고 원본은 수정하지 않는다. 게시하지 않은 사진은 서버로 보내지 않는다.
5. **커뮤니티는 선택 기능이다.** 커뮤니티 서버가 없어도 로컬 사진 선택·분석·추천·내보내기는 계속 동작해야 한다.
6. **검증 상태를 과장하지 않는다.** 웹 미리보기, 자동 테스트, Android 실기기, iOS 실기기, Supabase 실연동 결과를 구분해 기록한다.

> **다음 작업 우선순위:** ① 기존 UX 과제(취향 예시 사진 재선정부터) 해결 → ② 로컬 사진 분석·내보내기 실기기 검증 → ③ Supabase 보안·실연동 검증 → ④ 최소 커뮤니티 활성화 실험.


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
Expo Go로 QR 코드를 스캔한다. 폰을 PC와 같은 Wi-Fi에 두고 LAN 모드로 띄우면 USB 없이 바로 확인할 수 있다(Windows PowerShell은 `npx.cmd` 사용):
```bash
npx.cmd expo start --lan --go
```
`app.json`(이름·아이콘·스플래시)을 바꾼 뒤에는 서버를 끄고 `--clear`를 붙여 다시 시작한다. 웹 미리보기(UI 확인용, 출시 대상 아님):
```bash
npm run web
```

### 폰에 독립 실행 APK 설치 (Android, 로컬 빌드)
PC 없이 폰에서 계속 쓰며 테스트할 때. Expo Go와 달리 사진 앱 저장도 동작한다. **서명은 Expo 템플릿 기본 디버그 키** — 개인 테스트용이며 스토어 배포용이 아니다(배포는 EAS Build + 업로드 키).
1. 준비(한 번만): JDK 17(`winget install Microsoft.OpenJDK.17`), Android 명령줄 도구를 `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest`에 풀고 `sdkmanager --licenses`로 약관 동의. 전역 `JAVA_HOME`은 바꾸지 않고 빌드할 때만 지정한다.
2. 네이티브 프로젝트 생성(`android/`는 CNG 산출물이라 git 무시, 손으로 고치지 않음):
```bash
npx expo prebuild -p android --no-install
```
   prebuild가 `package.json`의 `android`/`ios` 스크립트를 `expo run:*`으로 바꾸면 되돌린다(이 저장소는 Expo Go 흐름을 기본으로 유지).
3. 빌드(Git Bash, 첫 빌드는 Gradle·SDK 플랫폼·NDK를 받아 오래 걸림):
```bash
cd android && JAVA_HOME="/c/Program Files/Microsoft/jdk-17.0.20.101-hotspot" ANDROID_HOME="$LOCALAPPDATA/Android/Sdk" ./gradlew.bat assembleRelease
```
4. 설치(USB 디버깅 허용된 폰):
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```
   앱 표시 이름 "CutPick", 패키지 `app.cutpick.mobile`. Expo Go 안의 CutPick과는 저장 데이터가 따로다.

**macOS(Apple Silicon)에서 같은 절차** (2026-10-18 검증, sudo·Homebrew 없이 사용자 폴더에 설치):
- Node 24 LTS → `~/.local/node`, Temurin JDK 17 → `~/Library/Java/JavaVirtualMachines`, Android 명령줄 도구 → `~/Library/Android/sdk/cmdline-tools/latest`, platform-tools(adb) → `~/Library/Android/sdk/platform-tools`. `~/.zshrc`에 Node·`ANDROID_HOME`·adb PATH 추가. 전역 `JAVA_HOME`(JDK 11)은 그대로 두고 빌드 때만 17 지정.
- `sdkmanager --licenses` 동의 후, 플랫폼·빌드 도구·NDK는 Gradle이 첫 빌드 때 자동으로 받는다.
```bash
npm ci && npx expo prebuild -p android --no-install && git checkout package.json
```
```bash
cd android && JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew assembleRelease
```
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 커뮤니티(선택) 설정
값이 비어 있으면 커뮤니티 탭은 "서버 미설정" 화면을 보여 주고 나머지 기능은 그대로 동작한다. 켜려면 아래를 **프로젝트 소유자가 직접** 한다(계정 생성·키 입력은 대신할 수 없음).

1. **Supabase 프로젝트 만들기**: https://supabase.com → New project(Free 플랜, 리전은 사용자와 가까운 곳 예: Northeast Asia (Seoul)). DB 비밀번호는 앱에 넣지 않는다.
2. **스키마 적용**: 대시보드 → SQL Editor → `supabase/migrations/20261018000000_community_init.sql` 전체를 붙여 넣고 Run. (CLI를 쓴다면 `npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase db push`.) 테이블 6개(RLS 켜짐), 트리거, `get_feed`·`get_my_blocks`·`delete_my_account` 함수, 공개 스토리지 버킷 `post-images`(JPEG, 2MB)가 생긴다.
3. **이메일 로그인(OTP) 설정**: Authentication → Sign In / Providers → Email 켜기. Authentication → Emails → "Magic Link" 템플릿 본문에 6자리 코드 `{{ .Token }}`를 넣는다(앱은 링크가 아니라 코드를 입력받음). 무료 기본 메일 발송은 시간당 몇 통으로 제한되므로 테스트 이상이면 SMTP(Resend 등)를 연결한다.
4. **앱 키 넣기**: Project Settings → API Keys에서 **Publishable key**(또는 legacy anon key)와 Project URL을 복사 → `.env.example`을 `.env.local`로 복사해 입력:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   EXPO_PUBLIC_SUPPORT_EMAIL=<문의 받을 이메일>
   ```
   **service_role / secret 키, DB 비밀번호는 절대 넣지 않는다**(앱 번들에 그대로 들어감). `.env.local`은 git에 올라가지 않는다.
5. **다시 시작**: `npx.cmd expo start --clear`(환경 변수는 번들할 때 들어가므로 재시작 필요). 독립 APK는 다시 빌드해야 반영된다.
6. **동작 확인**: 커뮤니티 탭 → 로그인(이메일 코드) → 핸들 만들기 → 추천 결과에서 사진을 눌러 "이 사진을 커뮤니티에 공유" → 4개 동의 → 게시. 기본값이 **운영자 승인 후 공개**라 피드에는 바로 안 보인다 → 대시보드 Table Editor → `posts`에서 `moderation_status`를 `pending` → `visible`로 바꾸면 피드에 나온다.
7. **운영 설정(대시보드 `community_settings` 행)**: `require_review`(기본 true, 끄면 즉시 공개 — 운영자 없으면 끄지 말 것), `daily_post_limit`(기본 5), `uploads_enabled`(한도 근접 시 false). 신고 처리·차단·저작권 절차는 `docs/UGC_SAFETY.md`.
8. **공개 전 필수 검증**: `supabase/tests/rls_test.sql` 실행(RLS 격리·비인가 삭제·하트 중복·경로 위조), 차단·신고·게시물/계정 삭제 후 스토리지 잔존 확인, 지원 이메일·약관 법률 검토·연령 정책. **운영할 사람이 없으면 공개 출시하지 않는다**(현재는 지인 대상 제한 테스트 단계).

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
| docs/IMAGE_ASSET_ATTRIBUTIONS.md | 취향 설정 예시 사진 16장 + 샘플 체험 사진 18장의 출처·작가·라이선스·수정 내역 |
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
| 2 로컬 사진 분석·추천 | 🟡 | 픽셀 품질 지표, 유사 사진 그룹, 추천 점수·이유, 대표 후보 3장, 수동 편집 완료. Android 실기기(Z Flip5)에서 실사진 9장·샘플 18장 분석 확인(샘플 사진당 약 60ms). **실사진 30/100/300장 측정·메모리 미실행** |
| 3 SNS 내보내기 | 🟡 | 크롭·순번 파일·OS 공유·캡션은 Android 실기기 확인. 내보내기 사본 EXIF 없음 확인 + GPS 런타임 가드. **사진 앱 저장은 Expo Go 제약으로 미검증(개발 빌드 필요), iOS 전체 미검증** |
| 4 댓글 없는 커뮤니티 | 🟡 | 마이그레이션(RLS·트리거·RPC·스토리지), 게시·하트·삭제·신고·차단·계정 삭제 UI 완료. **Supabase 실프로젝트 연동·RLS 테스트 미실행** |
| 5 품질/개인정보/스토어 준비 | ❌ (문서만 일부) | 정책 문서 초안, 개인정보 문서 작성. 실기기 빌드·지원 이메일·법률 검토·자체 아이콘·연령 정책 미완 |
| 6 수익화/ML 고도화 | ❌ (의도적 보류) | 프롬프트 지시대로 핵심 검증 전 착수하지 않음 |

### 완료 기준 (프롬프트 13장)
| 기준 | 상태 |
|---|---|
| React Native + Expo iOS/Android 프로젝트 | ✅ |
| 사용자가 고른 사진만 처리, 전체 라이브러리 자동 스캔 없음 | ✅ (코드) |
| 30장 기본 분석 흐름이 **실제 기기**에서 동작 | 🟡 Android 실기기에서 실사진 9장·샘플 18장 동작 확인, 30장은 미실행 |
| 유사 사진 그룹화가 실제 입력 사진으로 검증 | 🟡 Commons 실사진 샘플(+연사·흐림·밝기 가공본)로 검증(통합 테스트), 사용자 실사진 묶음은 미검증 |
| 품질 신호와 추천 점수 구분 | ✅ |
| Instagram/TikTok/카카오톡 목적별 결과 구성 | ✅ |
| 프리셋에 출처·검토일·상태 | ✅ (출처 없음 = hypothesis로 명시) |
| 추천 수동 수정·순서 변경 | ✅ |
| 파일 저장·OS 공유를 iOS/Android에서 각각 확인 | 🟡 Android: 파일 생성·공유 시트 ✅, 사진 앱 저장 ❌(Expo Go 제약) / iOS ❌ |
| 로컬 기능은 유료 API·커뮤니티 서버 없이 동작, 장애 시 로컬 유지 | ✅ |
| 원본 수정/삭제 없음, 프로젝트 데이터 삭제 기능 | ✅ |
| 테스트 실제 실행·결과 기록 | ✅ (최초 59개 → 현재 88개 통과, docs/TESTING.md) |
| Android 빌드/테스트 검증 | 🟡 Expo Go로 실기기 테스트 ✅, 독립 APK/개발 빌드 ❌ (Android SDK 없음) |
| iOS 빌드/실기기 여부와 미검증 이유 명시 | ✅ (미검증: macOS 없음) |
| 비용·개인정보·라이선스·플랫폼 규칙 문서화 | ✅ |

### 프롬프트 21장 보안·테스트 기준
| 항목 | 상태 |
|---|---|
| 온보딩 건너뛰기·중단·재실행·수정 일관성 | ✅ 코드 + 웹 확인 |
| 취향별 추천 결과 차이, 기술 점수 비왜곡 | ✅ 단위 테스트 |
| 게시 안 한 사진이 네트워크에 안 나감 | 🟡 정적 확인만(프록시 실측 미실행) |
| 업로드 사본 EXIF/GPS 제거 | 🟡 Android 내보내기 사본 EXIF 없음 실측, GPS 런타임 가드(내보내기·업로드). GPS 있는 원본으로는 미확인 |
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

> **작업 순서 원칙:** 기존 README에 기록된 UX 문제를 가장 먼저 해결한다. 커뮤니티 기능을 확장하기 전에 사용자가 사진을 고르고 추천 결과를 이해하는 핵심 흐름을 완성한다.

0. **기존 UX 과제 우선 해결 — 가장 먼저 진행** (2026-10-22 진행 상황: 0-1 음식 5장 교체 완료·인물 거울샷/로우 앵글은 대체 사진 미확보, 0-2·0-3·0-4 완료, 0-5 웹 회귀 완료·실기기 큰 글자/TalkBack 미확인 — 아래 Work Log)
   1. **취향 예시 사진 재선정 (최우선)** — 각 질문의 카드는 질문에서 묻는 대상이 한눈에 보여야 한다. 음식 각도 질문이면 5장 모두 접시에 담긴 요리를 정면·멀리서(테이블 전체)·위에서(탑뷰)·45도·근접으로 촬영한 사진으로 구성한다. 커피잔·생크림 머그처럼 음식인지 애매하거나 질문과 관계없어 보이는 사진은 제외한다. 인물·OOTD 구도도 사람이 해당 구도로 찍힌 장면이 분명해야 한다. 현재 거울샷은 휴대폰 대신 카메라를 든 장면이고, 로우 앵글은 피사체가 너무 작아 의도가 약하므로 교체 후보로 본다.
      - 가능하면 한 질문 안에서 **같은 피사체·비슷한 톤을 유지하고 각도/구도만 바꿔** 비교를 쉽게 한다.
      - 기존 D-032 라이선스 기준(Commons CC0/CC BY, 식별 가능한 얼굴 제외)을 유지한다.
      - `src/features/onboarding/choice-cards.ts`의 `optionId`는 유지하고 사진 자산만 교체한다. `docs/IMAGE_ASSET_ATTRIBUTIONS.md`와 `tests/unit/choice-assets.test.ts`도 함께 갱신한다.
      - 기존 사진 취향 1단계의 16장 카드도 같은 기준으로 재검토한다. 실제 질문·선택지 의미와 이미지가 일치하는지, 작은 화면에서도 차이가 보이는지 확인한다.
   2. **표시용 Tag 컴포넌트 정리** — 비활성 칩을 단순 태그처럼 사용하는 부분을 찾아 의미에 맞는 표시용 Tag로 교체한다. 선택 가능한 컨트롤과 정보 표시용 태그의 접근성 역할을 구분하고 관련 디자인 문서를 갱신한다.
   3. **웹 가로 사진 4:5 내보내기 해상도 문제 조사** — 입력 크기·크롭 영역·리사이즈·인코딩 단계별로 원인을 확인하고 수정 전후를 테스트로 고정한다. 웹 미리보기와 네이티브 동작을 구분해 기록한다.
   4. **드래그 정렬 UX 보완** — 드래그 조작을 점검하되 드래그만 강제하지 않는다. 버튼으로 순서를 변경하는 대체 수단, 터치 영역, 접근성 라벨, 변경 결과를 확인한다.
   5. **UX 회귀 확인** — 작은 화면(320px), 큰 글자, 라이트/다크 모드, 하단 안전 영역, 카드 선택·해제·저장 후 재진입을 확인한다. 수정 후 `npm test`, `npm run typecheck`, `npm run lint`를 실행하고 결과를 `docs/TESTING.md`와 Work Log에 기록한다.

1. **실기기 테스트 방법 (Android, 이 PC에서 검증된 절차)**
   - 폰: 개발자 옵션 → USB 디버깅 켜고 PC 허용. Expo Go는 **SDK 58용(58.x)** 필요 — Play 스토어판이 57이면 https://github.com/expo/expo-go-releases 의 Expo-Go-58.x.apk 설치(`adb install -r`)
   - PC: `winget install Google.PlatformTools`(adb) → `npm run web` 또는 `npx expo start`로 Metro(8081) 실행 → `adb reverse tcp:8081 tcp:8081` → `adb shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8081 host.exp.exponent`
   - Wi-Fi(USB 없이): PC와 폰을 같은 Wi-Fi에 두고 `npx.cmd expo start --lan --go` → 터미널의 QR을 Expo Go로 스캔(`exp://<PC IP>:8081`). PowerShell은 실행 정책 때문에 `npx` 대신 `npx.cmd`. `--tunnel`은 `npx expo login` 후에만 동작
   - 자동 조작·캡처: `scripts/android-device.ps1` (`shot <이름>`, `tap <텍스트>`, `text`, `back`, `swipeup`, `top`). 캡처는 `.device/`(git 무시)에 저장. **사용자 실사진이 보이는 화면은 캡처하지 말고 `text`로만 확인**
   - Expo Go에서는 Android 사진 앱 저장이 막혀 있음(D-026) → 저장 검증은 개발 빌드 필요

2. **실기기 검증 계속 (Phase 2·3 마무리)** — 2026-10-18에 Android 기본 흐름은 확인함(`docs/TESTING.md`). UX 과제 해결 후 다음을 진행한다.
   - **개발 빌드**로 사진 앱 저장 검증: Android Studio+JDK 17 설치 후 `npx expo run:android`, 또는 `npx eas-cli@latest build --profile development --platform android`(Expo 계정 필요)
   - 실사진 30/100/300장 선택 → 분석 화면 하단 "사진당 약 N ms" 기록 + 프로파일러로 피크 메모리 → `docs/DEVICE_BENCHMARKS.md` 표 채우기 → 필요 시 `IMPORT_LIMITS` 조정
   - 권한 거부/제한 접근(iOS "선택한 사진만"), HEIC·세로 EXIF 회전 사진, 한글·긴 파일명
   - 사진 앱 저장 순서·파일명, 한 장씩 공유 시트(Instagram/TikTok/카카오톡 각각)
   - 내보내기 사본 EXIF 검사: GPS 포함 사진 → 내보내기 → `exiftool`로 GPS 태그 없음 확인 → `docs/PRIVACY.md` 갱신
   - 큰 글자·VoiceOver/TalkBack·다크 모드·노치/제스처 바 → `docs/DESIGN_QA.md` 갱신
   - 실사진 연사로 중복 임계값(서명 거리 5) 재보정, 노이즈 사진 선명도 과대평가 개선 검토

3. **Supabase 실검증 (Phase 4 마무리)**
   - Supabase Free 프로젝트 생성 → `supabase/migrations/20261018000000_community_init.sql` 적용
   - `supabase/tests/rls_test.sql` 실행(로컬 `supabase start` 또는 일회용 프로젝트) → 결과를 `docs/TESTING.md`에 기록
   - `.env.local`에 URL·publishable key·지원 이메일 → 이메일 OTP 로그인, 프로필, 게시(검토 대기→대시보드 승인), 하트, 신고, 차단, 게시물·계정 삭제 후 스토리지 잔존 확인
   - Supabase 대시보드 Auth 설정에서 이메일 OTP 템플릿에 6자리 코드가 포함되는지 확인
   - **검증 전 공개 출시 금지:** RLS 격리, 비인가 삭제, 하트 중복 방지, 양방향 차단, 신고 저장/자동 숨김, 게시물·계정 삭제 시 스토리지 정리, 권한 거부·네트워크 실패 처리를 실서버에서 확인한다.

4. **커뮤니티 UX·활성화 — 실서버 보안 검증 이후**
   - 커뮤니티는 CutPick의 주 기능을 대체하는 SNS가 아니라 **베스트샷 추천 결과를 공유하고 다른 촬영 사례를 발견하는 선택 기능**으로 유지한다. 로그인·게시를 강제하지 않고, 커뮤니티 서버가 없어도 로컬 기능은 계속 동작해야 한다.
   - **첫 공개 범위:** 승인된 게시물 피드, 최신순 정렬, 카테고리 필터(여행/카페/음식/OOTD/일상), 하트, 내 게시물 삭제, 신고, 차단/해제, 게시 상태 안내만 제공한다. 댓글·DM·팔로워·싫어요·외모 평가·인기 랭킹은 추가하지 않는다.
   - **게시 진입점:** 추천 결과에서 사용자가 명시적으로 선택한 사진에 한해 “커뮤니티에 공유”를 제공한다. 공개 전 미리보기에서 이미지·카테고리·공개 범위·삭제 가능 여부를 확인시키고 별도 동의를 받는다. 분석을 위해 고른 사진 전체나 게시하지 않은 원본은 업로드하지 않는다.
   - **피드 기본 원칙:** 초기에는 최신순을 기본값으로 사용한다. 하트 수 기반 인기순을 기본으로 두지 않아 신규 게시물이 묻히는 문제를 줄인다. 추천 피드는 이용 데이터가 쌓인 후 별도 실험으로 검토한다.
   - **활성화 아이디어 1 — 오늘의 픽(Daily Pick):** 하루 또는 주 단위로 촬영 주제를 제안한다. 참여는 선택 사항이며, 주제별 게시물은 별도 탭/필터로 모은다. 자동 게시나 연속 참여 압박은 금지한다.
   - **활성화 아이디어 2 — 같은 장면, 다른 시선:** 같은 장소·음식·상황을 서로 다른 각도/거리/구도로 촬영한 사진을 묶어 보여준다. 위치 메타데이터로 장소를 자동 식별하지 않고, 사용자가 선택한 주제·태그 또는 운영자 큐레이션으로만 묶는다.
   - **활성화 아이디어 3 — 추천 결과에서 공유:** 사용자가 추천 사진을 확인한 뒤 선택적으로 커뮤니티 공유를 시작한다. 공유를 취소해도 로컬 추천 결과는 유지하고 게시 성공 여부를 명확하게 안내한다.
   - **활성화 아이디어 4 — 개인 사진 취향 요약(후순위):** 사용자가 명시적으로 허용한 선택 취향·하트 이력만으로 취향을 요약한다. 끄기/기록 삭제 기능을 제공하고 얼굴·외모 분석이나 민감한 추론은 하지 않는다. 초기 출시에는 넣지 않는다.
   - **초기 콘텐츠:** 가짜 사용자·가짜 하트·가짜 활동을 만들지 않는다. 초기 피드가 비어 있다면 출처와 사용 허가가 명확한 샘플/에디토리얼 게시물만 별도 표시해 사용한다. 운영자 승인과 신고 대응을 감당할 수 있는 규모로 베타를 시작한다.
   - **측정 지표:** 커뮤니티 방문 대비 하트 비율, 추천 결과에서 공유 시작/완료 비율, 7일 내 재방문, 피드가 비어 있거나 반복되는 비율, 신고·숨김 비율, 게시물·계정 삭제 성공률을 확인한다. 초기에는 기준선을 수집하고 불필요한 개인정보 분석은 피한다.
   - **추가하지 않을 기능:** 댓글·DM·팔로워 경쟁·인기 랭킹·복잡한 AI 랭킹·강제 푸시 알림. 실제 사용 데이터와 운영 여력이 확인되기 전까지 보류한다.

5. **출시 준비 (Phase 5)** — 지원 이메일(`EXPO_PUBLIC_SUPPORT_EMAIL`), 처리방침·약관 법률 검토, ~~자체 앱 아이콘·스플래시~~(2026-10-18 CutPick 아이콘 적용 — 원본 제작 경위만 확인), 앱 내 오픈소스 라이선스 화면, 연령 정책(Apple 1.2.1(a)), 상표 조사, `npx license-checker` 등 의존성 감사, Android targetSdk 36 확인, EAS Build 설정

6. **보류** — 온디바이스 ML(라이선스·성능 게이트 통과 시, 개발 빌드 필요), 색 보정 프리셋, 캐러셀 게시, 수익화

### 4) 주요 파일 지도
| 하고 싶은 일 | 파일 |
|---|---|
| 점수·임계값 조정 | `src/domain/recommendation-policy.ts` |
| 분석 지표 | `src/features/image-analysis/pixel-metrics.ts`, `perceptual-hash.ts` |
| 분석 실행 흐름 | `src/features/image-analysis/analysis-runner.ts`, `heuristic-provider.ts` |
| 추천 로직 / 편집 상태 | `src/features/recommendations/engine.ts` / `use-recommendation-editor.ts` |
| 플랫폼 규격 | `src/features/platforms/platform-profiles.ts` (+ `docs/PLATFORM_RULES.md`) |
| 프리셋 | `src/features/style-presets/presets.ts` |
| 취향 예시 사진 카드(이미지·태그·라이선스) | `src/features/onboarding/style-cards.ts` (+ `assets/onboarding/styles/`, `docs/IMAGE_ASSET_ATTRIBUTIONS.md`) |
| 취향 태그의 실제 효과 | `src/features/preferences/taste-profile.ts`, 수치는 `recommendation-policy.ts`의 `TASTE` |
| 온보딩 마법사 | `src/features/onboarding/components/OnboardingWizard.tsx`, 스키마·마이그레이션 `preference-schema.ts` |
| 로컬 DB 스키마 | `src/infrastructure/database/db.ts` (마이그레이션 배열에 추가) |
| 커뮤니티 백엔드 | `src/features/community/supabase-community-repository.ts`, `supabase/migrations/` |
| 화면 | `src/app/**` |
| 디자인 토큰(색·그라데이션·tints·글꼴) | `src/design-system/tokens.ts` (+ `docs/DESIGN_SYSTEM.md`) |
| 로고·워드마크 | `src/design-system/components/Brand.tsx` |
| 런치(로딩) 화면 | `src/features/launch/LaunchOverlay.tsx`, 글꼴 로드·스플래시 처리는 `src/app/_layout.tsx` |
| 앱 아이콘·스플래시·파비콘 다시 만들기 | 원본 `assets/brand/icon-source.webp` → `python scripts/build-app-icons.py` |
| 샘플 체험 사진 | `scripts/sample-photos.json`(목록·가공법) → `python scripts/build-sample-photos.py <원본 폴더>`, 출처 `src/features/photo-import/sample-credits.ts` |
| 글꼴 파일 | `assets/fonts/`(Pretendard), 워드마크 `@expo-google-fonts/bricolage-grotesque` |

## 작업 내역 (Work Log)

### 2026-10-18 — 최초 구현 (Phase 0~4 코드, 웹 미리보기 QA)
**환경 조사**: 작업 폴더에는 `.claude/settings.local.json`만 있었고 Node.js가 없었다 → 사용자 승인 후 `winget install OpenJS.NodeJS.LTS`(Node 24.20.0, npm 11.19.0). Git 있음. Android SDK·macOS 없음. Expo 최신 안정 SDK 58(expo 58.0.14, RN 0.88.0, React 19.3)을 `npx create-expo-app@latest --template default`로 만든 뒤 프로젝트 폴더로 옮김(템플릿 `.claude/settings.json`의 플러그인 활성화는 가져오지 않음, 템플릿 예제 화면·README는 교체). 패키지는 `npx expo install`로 SDK 호환 버전 설치.

**구현**
- 디자인 시스템(`src/design-system`): 색(라이트/다크)·간격·radius·타이포 토큰, Button 4종·IconButton·FilterChip·PhotoThumbnail/SelectionBadge·ProgressPanel·Empty/Error/InlineMessage·BottomSheet·BottomBar·AppSwitch. 모든 화면에서 사용.
- 온보딩 7단계 + 개인정보 요약(건너뛰기, 단계별 저장, 설정에서 수정·초기화), 스키마 버전·마이그레이션.
- 프로젝트: 생성(OS 다중 선택, 최대 300장, 영상·미지원 형식 제외, 촬영시각만 선택적으로 읽음), 이름 변경, 삭제(파생 파일 포함, 원본 유지), 사진 상세·수동 장면 태그·프로젝트에서 빼기, 샘플 모드(무료 라이선스 실사진 18장).
- 분석: expo-image-manipulator → 128px JPEG → jpeg-js RGBA → 선명도·노출·대비·해상도·색 통계 + 16×16 휘도 서명, 동시성 2 큐, 진행·취소·재개·실패 재시도, 분석 버전 변경 시 자동 재분석, 앱 측정 사진당 처리시간 표시.
- 추천: 품질+취향+로컬 학습+크롭 적합+중복 보정 점수, MMR식 다양성 선택, 캐러셀 순서(시간순/유사 회피/수동 유지), 단일 목적 후보 3장, 근거 기반 이유, 고정·제외·순서·그룹 대표·되돌리기·초기화, 목적별 저장.
- 내보내기: 비율 크롭(앞/가운데/뒤), ASCII 순번 파일명, 사진 앱 저장(SDK58 `Asset.create`, 쓰기 전용 권한), 파일별 OS 공유, 캡션 템플릿·복사.
- 커뮤니티: `CommunityRepository` + Supabase 구현(이메일 OTP, 프로필 핸들, 피드·카테고리·페이지네이션, 하트(낙관적 갱신·멱등), 게시 동의 4항목·공유용 재인코딩 사본 업로드, 내 게시물 삭제(스토리지→DB), 신고 7사유, 차단/해제, 계정 삭제), 미설정 시 가짜 피드 없이 안내. SQL 마이그레이션: 6개 테이블 RLS, 작성자 moderation 변경 차단·하루 게시 제한·스토리지 한도·신고 자동 숨김 트리거, `get_feed`(양방향 차단)·`get_my_blocks`·`delete_my_account` RPC, 스토리지 버킷 정책.
- 정책 화면(처리방침·약관·가이드라인 초안), 설정(취향, 개인화 끄기, 학습 기록 삭제, 데이터 삭제, 분석 범위).

**핵심 결정**: Expo Go 모듈만으로 픽셀 분석(D-003), ML 모델 미탑재(D-004), dHash → 휘도 서명 교체(D-008, 샘플에서 dHash는 중복 쌍 해밍 18–31로 분리 실패), 프리셋은 순위만 조정·전부 가설(D-011), 새 게시물 운영자 승인 기본(D-018). 전체: docs/DECISIONS.md.

**주요 파일**: `src/app/**`(19개 화면), `src/features/**`, `src/design-system/**`, `src/domain/**`, `src/infrastructure/**`, `supabase/migrations/20261018000000_community_init.sql`, `supabase/tests/rls_test.sql`, `scripts/build-sample-photos.py`, `scripts/sample-photos.json`, `scripts/build-app-icons.py`, `assets/samples/*.jpg`, `assets/fonts/*`, `assets/brand/*`, `tests/**`, `docs/**`, `app.json`, `metro.config.js`, `eslint.config.js`, `jest.bench.config.js`, `.env.example`.

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
- 원격 저장소 https://github.com/Logic-Phantom/CutPick (빈 저장소)에 origin 연결, 지금까지의 작업(`feat/cutpick-mvp` 브랜치의 커밋 포함)을 main 브랜치로 푸시.
- README에 **마스터 프롬프트 기준 진행 현황**(Phase 0~6, 13장 완료 기준, 21장 보안·테스트 기준)과 **다음 작업 이어가기**(환경 복원, SDK 58 주의점, 우선순위 작업, 파일 지도) 섹션 추가.
- 코드 변경 없음. 테스트 재실행 결과는 직전 항목과 동일(59개 통과) — 이번 항목에서 새로 검증한 기능 없음.

### 2026-10-18 — Android 실기기(Galaxy Z Flip5) 검증과 수정
- 환경: 사용자 승인 후 winget install Google.PlatformTools(adb 1.0.41). 폰 SM-F731N / Android 16, USB 디버깅. Play 스토어 Expo Go 57.0.9는 SDK 58 비호환 → 사용자 승인 후 Expo 공식 릴리스 Expo-Go-58.0.4.apk(215.5MB, SHA256 BD3D3679…B3A6)를 `adb install -r`로 설치. `adb reverse tcp:8081`로 USB 연결 실행.
- 프라이버시: 사용자 실사진이 보이는 화면은 캡처하지 않고 UI 텍스트 덤프로만 확인. 처음 실수로 찍힌 개인 화면 캡처 1장은 즉시 삭제. 문서 스크린샷(12~14)은 합성 샘플 화면만.
- 확인 결과: 앱 실행·다크 모드·네이티브 탭 ✅, 실사진 9장 선택·분석 9/9·유사 그룹 2개 ✅, 샘플 18장 분석 사진당 약 60ms ✅, 실사진 추천·이유 ✅, 9:16 내보내기 파일 크기·순번 ✅, OS 공유 시트 열림 ✅, 내보내기 사본 EXIF 블록 없음 ✅(원본에 GPS가 없어 GPS 실제 제거는 미확인), 사진 앱 저장 ❌(Expo Go가 미디어 라이브러리 권한 거부).
- 수정: (1) 크롭 손실 60% 초과 사진 추가 감점(D-027) — 실기기에서 63% 잘리는 가로 사진이 스토리 2번째로 추천되던 문제, 수정 후 세로 사진으로 바뀜을 재확인 (2) Expo Go(Android)에서 사진 앱 저장 버튼 비활성 + 안내, 원인 오류를 개발 모드 로그에 남김(D-026, `isRunningInExpoGo()` 사용 — `Constants.executionEnvironment`는 Expo Go 58에서 `bare`로 보고됨) (3) 내보내기·업로드 사본 GPS 런타임 가드 `jpeg-metadata.ts`(D-028) (4) adb 조작 스크립트 `scripts/android-device.ps1` 추가.
- 명령·결과: `npx jest` 6 suites / **64 tests 통과**(신규: 9:16 크롭 통합 테스트, JPEG 메타데이터 4개), `npx tsc --noEmit` 오류 0, `npx eslint .` 오류 0.
- 미검증으로 남은 것: 실사진 30/100/300장 시간·메모리, 사진 앱 저장(개발 빌드), GPS 있는 원본, 세로/HEIC 회전 정확성, 플립 커버 화면, iOS 전체, Supabase 실연동.

### 2026-10-18 — 이미지 기반 취향 온보딩 + UI 정리
기준 문서: `Cutpick_Visual_Onboarding_Redesign_SuperPrompt.md`(사용자 제공).
- **사진 취향 단계**: 온보딩 1단계를 실제 사진 16장 2열 카드 선택(전체/분위기/구도/색감·빛/장면, 3~8개, 카테고리를 바꿔도 선택 유지)으로 교체. 따로 있던 피사체·색감·구도 칩 단계는 해당 카테고리의 "세부 취향" 칩으로 합쳐 단계 8 → 6(D-029, D-030). 건너뛰기·단계별 저장·설정에서 수정/초기화 유지.
- **저장→추천 반영**: `UserPreference` v2(`styleCardIds`, 파생 `styleTags`) — 같은 `kv` JSON, v1은 답변을 보존하며 자동 마이그레이션, 태그는 항상 카드에서 재계산. 색 태그는 기존 밝기·채도·색온도 목표에 합류, 장면 태그는 직접 붙인 장면 태그 일치 시, 넓은 풍경/OOTD는 사진 방향 일치 시 작은 보너스(D-031). 기술 품질 점수는 취향과 분리(테스트로 고정). 이유는 실제로 일치한 취향만 이름으로 표시(D-034). `RECOMMENDATION_VERSION` 1 → 2.
- **이미지**: Wikimedia Commons CC0 6 / CC BY 2.0 7 / CC BY 4.0 3, 600×750 번들(약 1.17MB), 라이선스를 Commons API로 2회(수집 시·검수 시) 확인, 16장 직접 검수(식별 가능한 얼굴·워터마크·주제 상표 없음). 앱 "설정 → 이미지 출처" + `docs/IMAGE_ASSET_ATTRIBUTIONS.md`(D-032). 런타임 네트워크 요청 없음.
- **디자인**: 토큰 추가(`selectedOverlay`, `radius.tile`, `elevation.raised`, `title`/`label` 타이포, `contentMaxWidth`, 하단 바 요약 줄), 컴포넌트 추가(`SelectablePhotoCard`, `StepHeader`, `ListRow`, `Divider`, `BottomBar summary`). 홈 "이어서 하기" 커버 카드, 분석 범위 접기, 추천 요약에 "내 취향 반영" 줄, 설정 그룹 재구성(내 취향 썸네일 / 개인화 / 데이터 / 커뮤니티 / 정보). 새 패키지 없음.
- **버그 수정**: 취향 초기화가 꺼 둔 개인화를 다시 켜던 문제(D-033), 온보딩 화면에서 재시작 시 저장값 로드 전 기본값으로 초기화되던 문제, 웹에서 카드·칩 `aria-checked` 누락, 근거 없는 "고른 취향" 이유 문구.
- **명령·결과**: `npx jest` 8 suites / **88 tests 통과**(신규 24: `taste-onboarding.test.ts`, `style-assets.test.ts`), `npx tsc --noEmit` 오류 0, `npx eslint .` 오류·경고 0. `npm run bench`는 분석 코드 변경이 없어 재실행하지 않음.
- **웹 미리보기**(Claude 데스크톱 브라우저 패널, 기기 아님): 첫 실행→카드 선택/해제·최소/최대·카테고리 전환·세부 칩→뒤로·새로고침 후 유지→완료→샘플 분석→추천(취향 줄·이유)→내보내기→개인화 끄기→취향 초기화(스위치 유지, 취향 언급 사라짐)→다른 취향으로 수정→이유 변화→이미지 출처. 375×812 라이트, 320×640 다크, 외부 호스트 요청 없음. 스크린샷 `docs/screenshots/15~19`.
- **미검증**: iOS/Android 실기기에서의 새 온보딩·이미지 표시, 큰 글자, VoiceOver/TalkBack, 노치·제스처 바. 이미지 라이선스는 출처 문서 기준으로 확인했지만 **법률 검토는 아님**(1971년 사진 배경의 작은 상표 간판 등 `docs/IMAGE_ASSET_ATTRIBUTIONS.md` 참고). (→ Android는 바로 아래 항목에서 일부 확인)

### 2026-10-18 — 사진 취향 온보딩 Android 실기기 확인 (Galaxy Z Flip5)
- 환경: SM-F731N / Android 16 / Expo Go 58.0.4, USB adb(사용자가 디버깅 재승인), 기존 웹 미리보기 Metro(8081)에 `adb reverse`. 다크 모드, 3버튼 내비게이션. 조작·확인은 `scripts/android-device.ps1`(탭·uiautomator 텍스트 덤프). 폰에 사용자 실사진 프로젝트가 있어 홈·설정은 캡처하지 않고 텍스트로만 확인, 캡처는 예시 카드·합성 샘플 화면만(`docs/screenshots/20~23`).
- ✅ 확인: 기존 v1 취향 데이터에서 크래시 없이 업그레이드·답변 보존 / 카드 16장 표시·하단 바와 내비게이션 바 겹침 없음 / 선택·해제 개수, 2개에서 "계속하기" 비활성·3개에서 활성, 9번째 거부 안내 / 카테고리 전환 후 선택 유지 / 카드 `checkable`·`checked`, 칩 RadioButton 접근성 노드 / 저장 후 강제 종료→콜드 스타트에서 8개 유지 / 합성 샘플 추천에 "내 취향 반영" 줄과 취향 이유 / 개인화를 끈 상태에서 취향 초기화 시 스위치 꺼짐 유지, 추천의 취향 언급 사라짐(사용자 승인, 확인 후 스위치 원복, 폰의 취향은 초기화된 상태로 둠).
- 발견·수정: 글자 크기 최대(2.0, 사용자가 직접 설정)에서 하단 바의 "계속하기 비활성 이유"가 잘림 → 두 줄 줄바꿈 + 글자 배율만큼 스크롤 하단 여백 확대(`ScreenScroll`), 기기 재확인 ✅. 홈 이어서 하기 카드 제목·날짜 2줄 허용. 설정 "내 취향" 요약이 기존 답변 포함 25개를 나열 → 사진 스타일을 주 줄로, 나머지는 "그 밖의 답변 N개".
- 명령·결과: `npx jest` 8 suites / **88 tests 통과**, `npx tsc --noEmit` 오류 0, `npx eslint .` 오류 0.
- 미확인: TalkBack 실제 음성(시스템 설정이라 켜지 않음), 오프라인 표시(Expo Go 개발 모드는 이미지를 Metro에서 받으므로 정식/개발 빌드 필요), 데이터 없는 첫 실행(실사진 프로젝트 보호를 위해 전체 삭제 안 함 — 웹에서만 확인), 플립 커버 화면, iOS. 사용자에게 폰 글자 크기를 원래대로 되돌려 달라고 요청함.

### 2026-10-18 — 이미지 취향 온보딩 작업 GitHub 푸시
- 위 두 항목(이미지 기반 취향 온보딩 + UI 정리, Android 실기기 확인)의 변경을 한 커밋으로 `main`에 커밋하고 https://github.com/Logic-Phantom/CutPick 의 `main`으로 푸시(사용자 요청).
- 포함: 코드(`src/**`), 예시 사진 16장(`assets/onboarding/styles/`), 테스트 2개 파일, 문서(`docs/**`, `README.md`, `THIRD_PARTY_NOTICES.md`), 스크린샷 15~23. `.device/`(기기 캡처 원본)는 git 무시 대상이라 올리지 않음.
- 푸시 직전 재확인: `npx jest` 88 통과, `npx tsc --noEmit` 오류 0, `npx eslint .` 오류 0. 이번 항목에서 새로 검증한 기능은 없음.

#### 다음에 이어서 할 일 (이미지 취향 관련)
- TalkBack/VoiceOver로 카드 선택 상태 낭독 확인, iOS 전체.
- 개발/정식 빌드에서 비행기 모드로 예시 사진 표시(번들 포함) 확인.
- 데이터 없는 첫 실행을 실기기에서 확인(테스트용 기기 또는 사용자 데이터 백업 후).
- 출시 전 예시 사진 라이선스 법률 검토(특히 `mood-film-vintage.jpg` 배경 간판), 앱 내 오픈소스/이미지 고지 화면 점검.

### 2026-10-18 — CutPick 브랜드 리프레시 (아이콘·글꼴·컬러·실사진 샘플·런치 화면)
사용자 요청: 이름을 영문 CutPick으로 노출, 상업적 무료 글꼴, 알록달록한 컬러, 제공한 아이콘을 앱 아이콘으로 전부 적용, 샘플 사진을 상업적 무료 실사진으로 교체, 트렌디한 로딩 화면.
- **이름**: `app.json` `name` = "CutPick"(웹 manifest 이름·테마색 포함). 홈 헤더는 로고+워드마크(`BrandLockup`), 설정 하단 워드마크, 권한 안내·약관·커뮤니티 동의 문구의 "컷픽" → "CutPick"(D-036).
- **아이콘**: 사용자 제공 원본을 `assets/brand/icon-source.webp`로 보관, `scripts/build-app-icons.py`(Pillow)가 `icon.png`(1024 꽉 찬 정사각, 모서리는 배경색을 부드럽게 연장), Android 적응형 배경/전경(안전 영역 66% 안)/흑백 테마 아이콘, `splash-icon.png`, `favicon.png`, 앱 내 `logo.png`를 생성. iOS는 템플릿 `assets/expo.icon` 대신 `icon.png` 사용. 쓰지 않던 Expo 템플릿 이미지 17개 삭제. 스플래시·적응형 아이콘 배경색 `#0B1024`.
- **글꼴**(D-037): Pretendard 1.3.9(Regular·Medium·SemiBold·Bold, `assets/fonts/`, 약 6.3MB) + Bricolage Grotesque ExtraBold(워드마크, `@expo-google-fonts/bricolage-grotesque`). 둘 다 SIL OFL 1.1 — 고지 `THIRD_PARTY_NOTICES.md`. `useFonts`로 런타임 로드(Expo Go 동작), 굵기별 family라 `AppText`가 인라인 `fontWeight`를 family로 바꿈. 헤더·탭·입력창에도 적용.
- **컬러**: 아이콘 팔레트로 토큰 교체 — 배경 `#F7F6FB`/다크 `#0B1024`, accent 보라 `#5B3FF5`/`#9D8CFF`, 주 CTA·진행 바 그라데이션(파랑→보라→자홍, 흰 글자 4.7:1 이상), 장식용 `tints` 6색, 글자별 색 워드마크. 홈 기능 알약 3개·그라데이션 아이콘, 개인정보 단계 아이콘 색 원. 상세 `docs/DESIGN_SYSTEM.md`.
- **런치 화면**(D-039): `LaunchOverlay`(Reanimated) — 네이비 배경의 은은한 오로라 빛, 뷰파인더 모서리 4개가 로고 주위로 초점 맞추듯 모임, 반짝이, "CutPick" 글자별 등장, 문구 "고민은 줄이고, 베스트 컷만 픽", 하단 로딩 빔 → 앱 준비 후 페이드아웃(최소 1.7초). Reduce Motion이면 페이드만. 네이티브 스플래시는 글꼴 로드까지만 유지. 새 패키지 `expo-linear-gradient`.
- **샘플 사진**(D-038): 합성 이미지 18장 → Wikimedia Commons 실사진(원본 14장: CC0 7, CC BY 2.0 6, CC BY 3.0 1, Commons API로 라이선스·Restrictions 확인). 02·03·05·07·17은 연사·흐림·밝기·과노출 예시로 가공해 중복 정리·흐림 판정 시연 유지. `scripts/build-sample-photos.py` + `scripts/sample-photos.json`(구 `generate-sample-photos.mjs` 삭제), EXIF·ICC 없음, 총 약 2.5MB. 출처는 앱 "설정 → 이미지 출처"(`sample-credits.ts`)와 `docs/IMAGE_ASSET_ATTRIBUTIONS.md`. UI 표시 "샘플(합성 이미지)" → "샘플(무료 라이선스 사진)". 통합 테스트의 중복 그룹(1·2·3 / 4·5 / 9·17)과 임계값 5는 그대로(가공 쌍 거리 0.6–2.4, 무관 사진 최소 30.3).
- **문서 정리**: README의 PowerShell 백틱 이스케이프로 깨져 있던 코드 표기(`` `adb `` → 벨 문자 등) 복구, Wi-Fi(LAN) 폰 연결 방법 추가.
- **명령·결과**: `npx jest` 9 suites / **96 tests 통과**(신규 `tests/unit/sample-assets.test.ts`), `npx tsc --noEmit` 오류 0, `npx expo lint` 오류 0, `npx expo-doctor` 20/20 통과.
- **웹 미리보기**(브라우저 패널, 기기 아님): 375×812 라이트·다크에서 런치 화면 애니메이션, 온보딩 헤더 워드마크, 홈(로고·기능 알약·그라데이션 CTA), 이미지 출처 화면의 샘플 항목 확인. 탭 제목 "CutPick".
- **미검증**: 실기기(Expo Go·APK)에서 런치 화면·글꼴·새 아이콘 표시(홈 화면 아이콘은 Expo Go가 아닌 빌드에서만 바뀜), iOS 전체, 샘플 프로젝트 분석 결과 화면(테스트로만 확인). 아이콘 원본의 제작 경위와 샘플 10번(접시 그림)·14번(벽 포스터 일부)은 출시 전 법률 검토 대상.

### 2026-10-18 — macOS 개발 환경 구성 및 Android 독립 APK 설치
- 환경: macOS 15.6(arm64)에 Node·adb·Android SDK가 없고 JDK 11만 있었음 → 사용자 승인 후 공식 배포판을 사용자 폴더에 설치(Node 24.22.0 nodejs.org SHA256 확인, Temurin JDK 17.0.20.1 SHA256 확인, Android cmdline-tools 15641748·platform-tools). Android SDK 라이선스는 사용자 동의 후 수락. `.claude/launch.json`의 Windows 경로(`npx.cmd`)를 `npx`로 변경.
- 명령·결과: `npm ci` 성공, `npx tsc --noEmit` 오류 0, `npx expo lint` 오류 0, `npx jest` 9 suites / **96 tests 통과**. `npx expo prebuild -p android --no-install`(스크립트 변경은 되돌림) → `./gradlew assembleRelease` **BUILD SUCCESSFUL**(첫 빌드 8분 43초, APK 약 119MB, Expo 템플릿 디버그 키 서명).
- 기기: Galaxy Z Flip5(SM-F731N, Android 16)에 `adb install -r` 성공, 실행 후 크래시 없음·온보딩 화면 텍스트 확인(캡처 없음). 독립 앱이라 Expo Go와 데이터가 따로이며 사진 앱 저장 등 Expo Go 제약 기능은 이 빌드에서 **아직 미검증**.

### 2026-10-18 — 샘플 분석 실패 수정, 음식·인물·보정 사진 선택, 컬러 2차 리프레시
사용자 요청: 음식 각도·인물 구도·보정도 사진으로 비교해 고르고 추천에 활용, 보라색 위주의 "AI가 만든 것 같은" 디자인 탈피, 샘플 사진 분석 실패 수정.
- **샘플 분석 실패(D-041)**: 독립 APK에서 샘플 18장 모두 `decode-failed`(logcat 재현). 원인은 릴리스 빌드에서 번들 이미지가 drawable 리소스 이름으로 잡혀 이미지 조작기가 읽을 수 없던 것(Expo Go·개발 모드는 Metro URL이라 재현 안 됨). 샘플을 불러올 때 파일로 복사해 `문서/cutpick/samples/`에 보관하고, 이미 만든 샘플 프로젝트는 분석 시작 시 경로를 고쳐 실패분을 다시 분석. `sample-photos.ts`, `app-files(.web).ts`, `analysis-runner.ts`, `project-repository.ts`.
- **사진으로 고르는 온보딩(D-042)**: 음식 각도 5장·인물/OOTD 구도 7장을 사진 카드 2열로, 보정 정도는 같은 사진의 무보정/약한 보정/감성 프리셋 3장을 나란히 비교(단일 선택). 이미지 15장(원본 13장, CC BY 2.0 12·CC0 3)은 Commons API로 라이선스·Restrictions 확인, 인물은 얼굴이 드러나지 않는 장면만 — `src/features/onboarding/choice-cards.ts`, `assets/onboarding/{food,portrait,retouch}/`, `docs/IMAGE_ASSET_ATTRIBUTIONS.md`, 앱 "이미지 출처". 옵션 id는 기존 칩과 같아 예전 답변이 그대로 이어짐. 설정 "내 취향"에 고른 사진 썸네일 표시. 올릴 곳 단계와 "세부 취향" 칩은 칩으로 유지(플랫폼 로고 상표 문제, 사진으로 표현하기 어려운 항목).
- **추천 활용**(`taste-profile.ts` `shotTasteFrom`, `scoring.ts`, `explanations.ts`, `RECOMMENDATION_VERSION` 3): 음식/인물 사진(직접 붙인 장면 태그 우선, 없으면 음식·카페/OOTD·프사 프로젝트)에서 테이블 전체·전신·배경 살린 구도 → 크롭 손실 가중 ×1.6, 근접·반신·클로즈업 → ×0.5, 각도에 맞는 가로·세로 +0.05. 무보정 → 기술 품질 ×1.1 + 기본 프리셋 '자연스러운 일상', 약한 보정 → 밝기 목표 145, 감성 프리셋 → (자연스러운 일상이 기본인 맥락에서) '차분한 필름'. 상충 선택은 상쇄, 실제 영향이 있을 때만 이유 표시. 각도 자체는 자동 판별하지 않음.
- **컬러 2차 리프레시(D-040)**: 보라 그라데이션 CTA·무지개 워드마크·파스텔 알약·오로라/반짝이 런치 화면 제거 → 종이색 배경(#FAFAF8/다크 #111111) + 잉크 단색 CTA + 코랄 포인트(#FF5A36, 사진 선택 체크·테두리·순번·진행 바 전용), 한 색 워드마크, 헤더에 아이콘 이미지 없음, 조용한 런치 화면, 네이티브 스플래시 배경 #111111. `docs/DESIGN_SYSTEM.md` 갱신. 앱 아이콘(사용자 제공)은 그대로.
- **실기기**: 수정본 APK 재빌드(4분 5초)·`adb install -r` 성공, 실행 중 크래시 없음, 설치 후 logcat에 `decode-failed` 없음. 단 사용자가 폰을 쓰는 중이라 **샘플 프로젝트 분석 완료를 실기기에서 직접 확인하지는 못함**(다음 세션에서 샘플 분석 → 18/18 완료 확인 필요). 새 런치 화면·컬러도 실기기 화면 확인 전.
- **환경**: `.claude/launch.json`의 웹 미리보기 실행 경로를 이 맥의 Node(`/Users/lim/.local/node/bin/node node_modules/expo/bin/cli`)로 변경 — Windows에서는 `npx.cmd`로 되돌려야 함.
- **사용자 피드백(다음 작업)**: 취향 예시 사진은 질문 대상이 그대로 보이게 다시 골라야 함 → 아래 "우선순위별 다음 작업" 4-1.
- **명령·결과**: `npx jest` 11 suites / **116 tests 통과**(신규 `shot-taste.test.ts` 11개, `choice-assets.test.ts` 9개), `npx tsc --noEmit` 오류 0, `npx expo lint` 오류 0. 웹 미리보기(375×812 라이트·다크): 온보딩 사진 카드 선택·코랄 선택 표시, 음식/인물/보정 카드 단계, 저장 후 설정 썸네일, 홈 확인.

### 2026-10-22 — UX 과제 0-1~0-5 (음식 예시 사진·Tag·내보내기 크롭·순서 변경)
- **0-1 음식 각도 사진 교체(D-046)**: 커피잔·생크림 머그·디저트 사진을 빼고 Andy Li(CC0, 기존 보정 카드와 같은 작가)의 접시 요리 사진 5장으로 교체 — 탑뷰 새우 커리 그릇, 눈높이 버거, 45도 커리 라이스, 볶음밥 클로즈업, 두 사람 브런치 테이블. 사용자 승인 후 Commons API로 CC0·Restrictions 없음을 다시 확인하고 1920px 렌더를 1회 받아 Pillow로 4:5 크롭(손·소스병 라벨·벽 글자 제외)·600×750 저장(EXIF/ICC 없음). `choice-cards.ts`의 `optionId`는 유지, `docs/IMAGE_ASSET_ATTRIBUTIONS.md`·`choice-assets.test.ts` 갱신. **인물 거울샷(휴대폰)·로우 앵글은 교체하지 못함** — Commons "Self-portrait photographs with mirror"·"Low-angle shots of people" 등에서 CC0/CC BY 후보가 모두 얼굴이 식별되거나 BY-SA라 D-032 기준 불충족. 사진 취향 16장은 같은 기준으로 다시 봤고 `scene-ootd`(사람 없는 옷걸이) 외에는 이름과 일치.
- **0-2 표시용 Tag(D-043)**: `Tag`/`TagList` 추가(`text` 역할, 눌리지 않음, 목록은 "태그: …" 한 문장으로 낭독). 게시물 상세의 비활성 칩과 홈 기능 알약을 교체. `docs/DESIGN_SYSTEM.md` 갱신.
- **0-3 웹 가로 4:5 내보내기(D-045)**: 현재 코드·샘플로는 재현되지 않음(1080×720 → 실제 JPEG 576×720). 원인 후보였던 "저장된 피커 크기 ≠ 실제 디코드 크기"(EXIF 회전 등)에서 manipulator가 크롭을 잘라 비율·해상도가 틀어지는 경로를 막음: 원본을 한 번 렌더해 실제 크기로 크롭(`cropForDecoded`, `cropToPixels`, `fitLongestSide` — `src/features/platforms/crop.ts`), 앞/뒤 위치 유지, 확대 없음. 수정 전후 동작을 `tests/unit/export-crop.test.ts`로 고정. 네이티브 실기기 재확인은 아직.
- **0-4 순서 변경(D-044)**: 추천 묶음 머리글 "순서 바꾸기" → 타일별 ←/→(44pt, 라벨 "N번째 사진을 앞으로/뒤로", 양 끝 비활성), 타일에 스크린 리더 동작(앞으로/뒤로/첫 장으로), 시트·버튼·동작 모두 "N번째로 옮겼어요" 안내. 드래그는 넣지 않음(실기기 검증 없이 제스처 추가 위험, 버튼만으로 모든 순서 가능).
- **0-5 회귀**: 웹 미리보기 375×812 라이트, 320×640 라이트·다크에서 홈 Tag, 순서 바꾸기, 내보내기 크기, 새 음식 카드 선택·저장 후 재진입 확인(`docs/TESTING.md`). 한 번 취향 수정 후 새로고침에서 첫 실행 온보딩으로 돌아간 일이 있었으나 재현되지 않음(기록만). **미확인**: 실기기 큰 글자·TalkBack/VoiceOver·하단 안전 영역.
- **환경**: `.claude/launch.json` 웹 미리보기 실행을 Windows용 `npx.cmd expo start --web`으로 되돌림.
- **명령·결과**: `npx jest` 12 suites / **127 tests 통과**, `npx tsc --noEmit` 오류 0, `npx expo lint` 오류 0.
- **GitHub**: 위 변경을 한 커밋으로 `main`에 커밋하고 https://github.com/Logic-Phantom/CutPick 의 `main`으로 푸시(사용자 요청). 조사용 썸네일 시트(`.device/gallery/`)와 다운로드 원본은 git 무시·스크래치 폴더라 올리지 않음.

### 2026-10-22 — 인물 거울샷·로우 앵글 교체, 커뮤니티 활성화 준비
- **인물 카드 2장 교체(D-047)**: 사용자가 준 콜라주(거울샷 4칸·로우 앵글 4칸, 1536×1024)에서 거울샷은 1행 1번째(아치형 전신 거울, 휴대폰으로 얼굴 가림), 로우 앵글은 2행 4번째(하늘 배경으로 올려 찍은 전신)를 4:5로 잘라 600×750 저장. 원본 칸이 약 314×392라 **약 1.9배 확대**(약한 선명화)해 다른 카드보다 디테일이 약함. 출처 모델에 "프로젝트 소유자 제공 / 소유자 제공"을 추가해 앱 "이미지 출처"에 표시, 이 두 장 외에는 쓰지 못하게 테스트로 고정. **출시 전 확인**: 원 촬영자 또는 구매·생성 경로와 사용 허락 범위를 문서로 남길 것(`docs/IMAGE_ASSET_ATTRIBUTIONS.md`).
- **커뮤니티 활성화 준비(D-048)**: 백엔드(마이그레이션·RLS·트리거·RPC·스토리지)와 피드·하트·신고·차단·게시·삭제 화면은 이미 있었고, 켜려면 소유자의 Supabase 프로젝트와 `.env.local`이 필요함 → README "커뮤니티(선택) 설정"을 8단계 절차(프로젝트 생성, SQL 적용, 이메일 OTP 템플릿 `{{ .Token }}`, publishable key, 재시작, 동작 확인·승인, 운영 설정, 공개 전 검증)로 다시 씀. 코드: 추천 결과 사진 시트에 "이 사진을 커뮤니티에 공유"(서버 설정 시·묶음 사진만), 게시 화면에 "검토 후 공개·언제든 삭제 가능" 안내와 게시 후 "추천 결과로 돌아가기", 빈 피드 안내 문구 갱신. 피드 최신순·운영자 승인 기본값·댓글 없음은 유지.
- **검증**: `npx jest` 12 suites / **128 tests 통과**, `npx tsc --noEmit` 오류 0, `npx expo lint` 오류 0. 웹 미리보기에서 새 거울샷 카드 표시, 이미지 출처 화면의 "소유자 제공" 표기 확인. **미검증**: Supabase 실연동 전체(이 PC에는 프로젝트·키 없음), 서버 설정 상태의 공유 버튼 표시(설정 전에는 숨김이 정상).
- **GitHub**: `main`에 커밋·푸시(사용자 요청).
