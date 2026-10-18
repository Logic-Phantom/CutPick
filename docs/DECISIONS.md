# 결정 기록 (Decisions)

작은 결정은 사용자에게 묻지 않고 안전한 기본값으로 정한 뒤 여기에 기록한다. 날짜는 모두 2026-10-18.

| ID | 결정 | 이유 / 위험 |
|---|---|---|
| D-001 | **Expo SDK 58 (expo 58.0.14, RN 0.88, React 19.3)**, `create-expo-app` default 템플릿에서 시작. 라우트는 템플릿 규칙대로 `src/app/` 사용 | 2026-10-18 기준 npm `latest` 안정 버전. beta/canary 미사용. 스펙의 `app/` 대신 SDK 58 템플릿의 `src/app/` 관례를 따름 |
| D-002 | Node.js 24.20.0 LTS를 winget으로 설치 (사용자 승인) | 개발 PC에 Node가 없었음 |
| D-003 | **픽셀 접근 = expo-image-manipulator(네이티브 디코드·축소) → 128px JPEG(base64) → jpeg-js(순수 JS) RGBA 디코드** | Expo Go에 포함된 모듈만 사용 → 개발 빌드 없이 동작. HEIC·EXIF 회전은 네이티브 디코더가 처리. Skia·ONNX 등 네이티브 추가 모듈 불필요. 위험: 매 사진 2회 JPEG 인코딩 비용(실기기 미측정) |
| D-004 | **온디바이스 ML 모델 미탑재** (장면 분류·얼굴·눈 감김·미학 점수 = 미지원, UI에 명시) | 라이선스·성능 검증 게이트를 통과한 모델이 없음. 장면은 사용자가 직접 태그 |
| D-005 | 상태 관리는 React state + Context + 작은 서비스 모듈. 외부 상태 라이브러리 없음 | 스펙 권장 |
| D-006 | 로컬 저장 = expo-sqlite(메타데이터·URI) + expo-file-system(썸네일·내보내기 파일). **웹 미리보기**는 expo-file-system 미지원이라 썸네일을 작은 data URI로 DB에 저장 | 웹은 UI QA용 개발 대상일 뿐 출시 플랫폼이 아님. 네이티브는 사진 바이너리를 SQLite에 넣지 않음 |
| D-007 | 화면 수 축소: 스펙의 `editor/[id]`를 별도 화면으로 두지 않고 **추천 결과 화면에서 직접 편집**(고정·제외·순서·대표 교체) + 저장·공유 화면에서 크롭 위치 조정 | 핵심 플로우 탭 수 감소(9.3). `history.tsx`는 홈의 최근 프로젝트 목록으로 대체 |
| D-008 | **유사 사진 지문 = 16×16 면적평균 휘도 서명** (dHash 폐기) | 샘플에서 dHash는 실제 중복 쌍이 해밍 18–31로 무관한 사진과 겹침(노이즈가 평평한 영역 비트를 뒤집음). 서명은 중복 ≤ 2.2, 무관 ≥ 10.0으로 분리 → 임계값 5. 분석 버전 1→2로 올려 기존 결과 자동 재분석 |
| D-009 | 그룹화 조건 = 서명 거리 ≤ 5 **AND** 평균색 거리 ≤ 40 **AND** (둘 다 촬영시각이 있으면) 10분 이내 | 구도가 비슷해도 다른 음식/장소를 묶지 않기 위함 |
| D-010 | 추천 = 점수(품질+취향+학습+목적 적합+중복 보정) 후 **MMR식 탐욕 선택**(유사도 페널티·방향/장면 보너스). 첫 장=최고점, 나머지는 촬영시각 60% 이상이면 시간순, 아니면 인접 유사도 회피 | "상위 N장"이 아닌 다양성·흐름 고려(5.3) |
| D-011 | 감성 프리셋은 **순위 조정만** 하고 색 필터는 적용하지 않음. 모든 프리셋 `status: experimental`, `confidence: hypothesis`, `sources: []` | 출처로 검증된 트렌드가 없음. 거짓 "실시간 트렌드" 표시 금지 |
| D-012 | 개인화 = 명시적 행동(고정·유지·제외·순서변경)만, 학습률 0.04, 최대 200건, 8건 이전엔 약하게 적용, 설정에서 끄기/삭제 | 15.2 |
| D-013 | 내보내기 파일명은 ASCII `cutpick-YYYYMMDD-<purpose>-NN.jpg` | 일부 앱이 비ASCII 파일명을 깨뜨림. 순번으로 순서 보존 |
| D-014 | 공유 = `expo-sharing`으로 **한 장씩**. 여러 장은 "번호 붙여 사진 앱에 저장" 경로를 기본 CTA로 | expo-sharing은 단일 URL만 지원(문서 확인). 다중 공유 보장처럼 표시하지 않음 |
| D-015 | 사진 앱 저장 = `expo-media-library` SDK58 신 API `Asset.create()` + `requestPermissionsAsync(true, ['photo'])`(쓰기 전용) | 구 API `createAssetAsync`는 SDK58에서 런타임 throw |
| D-016 | 커뮤니티 백엔드 = Supabase(supabase-js 2.x) — `src/features/community` 의 `CommunityRepository` 인터페이스 뒤에 격리. 환경변수 없으면 "미설정" 화면(가짜 피드 없음) | 18장 |
| D-017 | 커뮤니티 로그인 = 이메일 OTP(6자리 코드), 딥링크 불필요 | 비밀번호 저장 없음, 앱 심사 시 소셜 로그인 의무 회피 |
| D-018 | 새 게시물 기본 `moderation_status = 'pending'`(운영자 승인 후 공개), 신고 3명 이상 자동 숨김, 하루 게시 5건, 스토리지 800MB 도달 시 업로드 차단 — 모두 `community_settings` 테이블 값 | 자동 이미지 검열 없음 → 보수적 기본값. fail-closed |
| D-019 | 게시 이미지 버킷은 public read(경로는 `<uid>/<uuid>.jpg`) | 서명 URL보다 단순·무료 한도 친화적. 위험: 숨김/삭제 전까지 URL을 아는 사람은 접근 가능 (UGC_SAFETY에 명시) |
| D-020 | 웹 미리보기 탭은 `expo-router/js-tabs`(하단 탭) 별도 레이아웃 | native-tabs 웹 대체 구현이 상단에 겹쳐 콘텐츠를 가림. iOS/Android는 네이티브 탭 유지 |
| D-021 | 다크 모드 강조 버튼 글자색 `#0B1330` | 밝은 파랑 위 흰 글자 대비 부족(약 2.3:1) 발견 → 수정 |
| D-022 | 앱 아이콘·스플래시 이미지는 Expo 템플릿 기본 이미지 임시 사용 | 출시 전 자체 제작 필요(MODEL_AND_LIBRARY_LICENSES 참고) |
| D-023 | 샘플 모드 = `scripts/generate-sample-photos.mjs`로 직접 생성한 합성 이미지 18장. 프로젝트에 `isSample` 표시, UI에 "샘플(합성 이미지)" 경고 | 저작권·초상권 없는 테스트 데이터. 분석 자체는 실제 실행 |
| D-024 | REA(Reverse Engineer Anything) 미사용 | 설치돼 있지 않고 이번 범위에서 필요성이 없음. 필수 완료 조건 아님 |
| D-025 | 실기기 테스트는 USB + adb(Google platform-tools, winget) + Expo Go 58.0.4. Play 스토어 Expo Go가 57이라 Expo 공식 GitHub 릴리스 APK를 사용자 승인 후 설치 | SDK 58 호환 Expo Go가 스토어에 아직 없음. 사용자 사진은 텍스트 덤프로만 확인하고 화면 캡처는 합성 샘플 화면에서만 함 |
| D-026 | Expo Go(Android)에서는 사진 앱 저장 버튼 비활성 + 안내, 한 장씩 공유로 대체. 감지는 `isRunningInExpoGo()` | 실기기에서 `requestPermissionsAsync`가 "Expo Go can no longer provide full access to the media library"로 거부됨. `Constants.executionEnvironment`는 Expo Go 58에서도 `bare`로 보고돼 사용 불가 |
| D-027 | 크롭 보존율 60% 미만이면 추가 감점(최대 0.45) | 실기기에서 9:16 스토리 2번째 자리에 63%가 잘리는 가로 사진이 추천됨 → 수정 후 세로 사진 선택 확인 |
| D-028 | 내보내기·업로드 사본 GPS 런타임 가드 | 재인코딩에만 의존하지 않고 결과를 직접 검사 |
