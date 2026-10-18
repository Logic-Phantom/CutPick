# 모델·라이브러리·에셋 라이선스

확인일: 2026-10-18. 버전은 `package.json`/설치본 기준. "무료"와 "상업적 재배포 허용"은 별개이므로 각 항목을 따로 기록한다.

## ML 모델
**포함된 모델 없음.** 장면 분류·얼굴·눈 감김·미학 모델은 라이선스·성능 게이트를 통과한 후보가 없어 넣지 않았다(D-004). `assets/models/` 폴더도 만들지 않았다.

## 런타임 의존성 (주요)
| 패키지 | 버전 | 라이선스 | 출처 | 비고 |
|---|---|---|---|---|
| expo 및 expo-* (image-picker, image-manipulator, sqlite, file-system, sharing, media-library, clipboard, haptics, asset, image, router 등) | 58.x | MIT | https://github.com/expo/expo | Expo Go 포함 모듈만 사용 |
| react-native | 0.88.0 | MIT | https://github.com/react/react-native | |
| react / react-dom | 19.3.0 | MIT | https://github.com/facebook/react | |
| react-native-web | 0.21.x | MIT | https://github.com/necolas/react-native-web | 웹 미리보기 |
| react-native-safe-area-context / screens / gesture-handler / reanimated / worklets | 템플릿 버전 | MIT | 각 GitHub | |
| @expo/vector-icons (Ionicons 포함) | 15.x | MIT (Ionicons: MIT, © Ionic) | https://github.com/expo/vector-icons, https://github.com/ionic-team/ionicons | 앱 내 아이콘 = Ionicons만 사용 |
| jpeg-js | 0.4.4 | **BSD-3-Clause** | https://github.com/eugeneware/jpeg-js | 저작권 고지 보존 필요 → THIRD_PARTY_NOTICES.md |
| @supabase/supabase-js | 2.118.x | MIT | https://github.com/supabase/supabase-js | 커뮤니티 전용 |
| expo-sqlite 웹 빌드의 wa-sqlite | expo 번들 | MIT(Expo 포크) | https://github.com/expo/wa-sqlite | 웹 미리보기만 |

SF Symbols(iOS 탭 아이콘 이름)·Material Symbols(Android 탭 아이콘 이름)는 OS 제공 심볼을 이름으로 참조한다. Apple SF Symbols는 Apple 플랫폼 앱 UI에서만 사용 허용 — 마케팅 이미지 등에 쓰지 않는다.

## 개발 의존성
jest(MIT), jest-expo(MIT), typescript(Apache-2.0), @types/*(MIT), eslint(MIT), eslint-config-expo(MIT).

## 폰트
커스텀 폰트 없음(시스템 폰트).

## 이미지·에셋
| 에셋 | 출처 | 상태 |
|---|---|---|
| `assets/samples/sample-*.jpg` | `scripts/generate-sample-photos.mjs`로 직접 생성한 합성 이미지 | 자체 제작, 인물·제3자 저작물 없음 |
| `assets/onboarding/styles/*.jpg` (16장, 취향 설정 예시) | Wikimedia Commons — CC0 1.0 6장, CC BY 2.0 7장, CC BY 4.0 3장 | 상업 이용·재배포·수정 허용 라이선스만(D-032). CC BY는 저작자·라이선스·원본·수정 사실을 앱 "설정 → 이미지 출처"와 `docs/IMAGE_ASSET_ATTRIBUTIONS.md`에 표시. 파일별 기록·남은 확인 사항은 그 문서 |
| 앱 아이콘·스플래시·파비콘 (`assets/images/*`, `assets/expo.icon`) | Expo 기본 템플릿(MIT 저장소) | **임시**. Expo 로고 형상이 포함돼 있어 출시 전 자체 아이콘으로 교체 필요 |
| 프리셋 이름·설명 | 직접 작성한 일반 스타일 명칭 | 상용 필터 팩·브랜드 명칭 미사용 |

## GPL/AGPL·비상업 라이선스
런타임 의존성에서 발견되지 않음(주요 패키지 수동 확인 기준). 전체 트리 자동 감사(`npx license-checker` 등)는 **미실행** — 출시 전 실행 권장.

## 상표
앱 이름 "컷픽/Cutpick", 패키지 ID `app.cutpick.mobile`의 상표·혼동 가능성은 조사하지 않았다. 출시 전 확인 필요(사용 가능성을 보장하지 않음).
