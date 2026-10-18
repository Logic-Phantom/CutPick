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
| 폰트 | 버전 | 라이선스 | 출처 | 비고 |
|---|---|---|---|---|
| Pretendard (Regular·Medium·SemiBold·Bold) | 1.3.9 | **SIL OFL 1.1** | https://github.com/orioncactus/pretendard (jsDelivr `pretendard@1.3.9/dist/public/static`에서 받음) | UI 전체. `assets/fonts/`, 라이선스 전문 `assets/fonts/Pretendard-OFL.txt`. 4개 약 6.3MB |
| Bricolage Grotesque ExtraBold | @expo-google-fonts 0.4.1 | **SIL OFL 1.1** | https://github.com/ateliertriay/bricolage | "CutPick" 워드마크 전용 |

OFL은 상업적 이용·앱 번들 재배포 허용(폰트 단독 판매, 수정본의 예약 이름 사용만 금지). 고지: THIRD_PARTY_NOTICES.md.

## 이미지·에셋
| 에셋 | 출처 | 상태 |
|---|---|---|
| `assets/samples/sample-*.jpg` (18장, 샘플 체험) | Wikimedia Commons 원본 14장 — CC0 1.0 7장, CC BY 2.0 6장, CC BY 3.0 1장. `scripts/build-sample-photos.py`로 크롭·축소, 5장(02·03·05·07·17)은 연사·흐림·밝기·과노출 예시로 가공 | D-032와 같은 기준. CC BY 표시는 앱 "설정 → 이미지 출처"(`src/features/photo-import/sample-credits.ts`)와 `docs/IMAGE_ASSET_ATTRIBUTIONS.md` |
| `assets/onboarding/styles/*.jpg` (16장, 취향 설정 예시) | Wikimedia Commons — CC0 1.0 6장, CC BY 2.0 7장, CC BY 4.0 3장 | 상업 이용·재배포·수정 허용 라이선스만(D-032). CC BY는 저작자·라이선스·원본·수정 사실을 앱 "설정 → 이미지 출처"와 `docs/IMAGE_ASSET_ATTRIBUTIONS.md`에 표시. 파일별 기록·남은 확인 사항은 그 문서 |
| 앱 아이콘·스플래시·파비콘·로고 (`assets/images/{icon,android-icon-*,splash-icon,favicon,logo}.png`) | 프로젝트 소유자가 제공한 CutPick 아이콘(`assets/brand/icon-source.webp`)에서 `scripts/build-app-icons.py`로 생성 | 자체 에셋. Expo 템플릿 아이콘·`assets/expo.icon`은 삭제. 아이콘 원본의 제작 경위(직접 제작/생성 도구 약관)는 출시 전 소유자가 확인 |
| 프리셋 이름·설명 | 직접 작성한 일반 스타일 명칭 | 상용 필터 팩·브랜드 명칭 미사용 |

## GPL/AGPL·비상업 라이선스
런타임 의존성에서 발견되지 않음(주요 패키지 수동 확인 기준). 전체 트리 자동 감사(`npx license-checker` 등)는 **미실행** — 출시 전 실행 권장.

## 상표
앱 이름 "CutPick/컷픽", 패키지 ID `app.cutpick.mobile`의 상표·혼동 가능성은 조사하지 않았다. 출시 전 확인 필요(사용 가능성을 보장하지 않음).
