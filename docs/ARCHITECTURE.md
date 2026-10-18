# 아키텍처

단일 Expo 앱(마이크로서비스 없음). 로컬 기능은 게스트로 완전 동작하고, 커뮤니티만 서버 경계를 넘는다.

```
src/
├── app/                      Expo Router 화면 (파일 = 라우트)
│   ├── (tabs)/               홈 · 커뮤니티 · 설정 (네이티브 탭, 웹은 _layout.web.tsx)
│   ├── onboarding/           취향 마법사 (index=첫 실행, edit=설정에서 수정)
│   ├── project/new, [id]     새 프로젝트·사진 선택 / 프로젝트 개요
│   ├── analysis/[id]         분석 진행·취소·재시도
│   ├── recommendations/[id]  추천 결과 + 직접 편집
│   ├── export/[id]           크롭·캡션·저장·공유
│   ├── photo/[id]            사진 상세·장면 태그
│   ├── community/*           게시 동의, 게시물, 내 게시물, 차단 목록, 계정
│   └── legal/[doc]           개인정보 처리방침·약관·가이드라인·이미지 출처(image-credits)
├── design-system/            토큰 + 공통 컴포넌트 (모든 화면이 사용)
├── domain/                   모델, 오류, recommendation-policy(모든 가중치·임계값)
├── features/
│   ├── photo-import/         OS 선택기, 정규화(EXIF 촬영시각만), 샘플 이미지
│   ├── image-analysis/       픽셀 지표, 휘도 서명, 중복 그룹, 큐, 휴리스틱 provider, runner
│   ├── recommendations/      점수, 다양성 선택, 캐러셀 순서, 설명, 엔진, 편집 훅
│   ├── platforms/            플랫폼·목적 규칙(데이터), 크롭 수학
│   ├── style-presets/        프리셋 데이터 + 검증
│   ├── onboarding/           설문 스키마·마이그레이션, 로컬 저장, 사진 취향 카드(style-cards: 이미지·태그·라이선스 단일 원본)
│   ├── preferences/          로컬 개인화(학습 가중치), taste-profile(취향 태그 → 색 목표·장면/방향 보너스)
│   ├── captions/             템플릿 캡션·해시태그
│   ├── export-share/         크롭 내보내기, 사진 앱 저장, OS 공유
│   ├── project-library/      SQLite 저장소
│   ├── community/            CommunityRepository 인터페이스 + Supabase 구현, 정책
│   └── legal/                정책 문서 텍스트
├── infrastructure/
│   ├── database/db.ts        expo-sqlite + 마이그레이션(PRAGMA user_version)
│   ├── file-storage/         앱 전용 파일(네이티브) / 웹 스텁
│   └── image-processing/     manipulator → jpeg-js 파이프라인
├── hooks/                    AppState(취향·학습), 커뮤니티 세션
└── utils/
assets/onboarding/styles/     취향 예시 사진 600×750 (Wikimedia Commons, docs/IMAGE_ASSET_ATTRIBUTIONS.md)
supabase/migrations/          스키마·RLS·트리거·RPC·스토리지 정책
tests/unit, tests/integration, tests/benchmark
```

## 책임 분리 (스펙 5장 대응)

| 책임 | 구현 |
|---|---|
| PhotoImportService | `photo-import/photo-picker-service.ts`, `asset-normalizer.ts` |
| ThumbnailService | `heuristic-provider.ts` 1단계 + `image-pipeline.renderJpeg` |
| QualityAnalyzer | `image-analysis/pixel-metrics.ts` |
| DuplicateAnalyzer | `perceptual-hash.ts`(서명) + `duplicate-analyzer.ts` |
| SceneClassifier | **미구현**(사용자 수동 태그, `photo/[id].tsx`) |
| RecommendationEngine | `recommendations/engine.ts`, `scoring.ts`, `diversity-selector.ts`, `carousel-ordering.ts` |
| RecommendationExplainer | `recommendations/explanations.ts` |
| PlatformProfileService | `platforms/platform-profiles.ts`, `crop.ts` |
| StylePresetService | `style-presets/preset-registry.ts` |
| ExportShareService | `export-share/export-service.ts` |
| ProjectRepository | `project-library/project-repository.ts` |

`PhotoAnalysisProvider` 인터페이스(`image-analysis/contracts.ts`)는 `getCapabilities()` + `analyzeOne()`. 큐·진행률·취소는 provider 밖의 `analysis-queue.ts`/`analysis-runner.ts`가 담당해 모델 provider를 추가해도 재사용된다.

## 데이터 흐름

0. 취향: 온보딩 사진 카드 탭 → `toggleStyleCard`(3~8개) → "계속하기" 시 `styleCardsPatch`로 `styleCardIds` + 파생 `styleTags`를 `kv['preference.v1']`에 저장(단계마다) → `recommend()`가 `tasteProfileFrom(preference)`로 색 목표·장면/방향 취향을 만들어 점수와 이유에 사용. 이미지는 번들 자산이라 네트워크 요청 없음, 취향 데이터는 기기 밖으로 나가지 않음.
1. 선택기 → `normalizeAssets` (영상·미지원 형식 제외, 최대 300장, 허용 시 촬영시각만 읽음) → `projects`/`photos` 행 생성(status=pending)
2. `startAnalysis` → 동시성 2 큐 → 사진마다: 480px 썸네일(앱 저장소) → 128px JPEG → RGBA → 지표 + 서명 → DB 저장. 상태가 사진별로 저장되므로 앱 종료 후 이어하기 가능
3. 전체 완료 후 중복 그룹 계산·저장
4. 추천 화면: `recommend()`를 메모리에서 즉시 재계산(입력: 사진, 목적, 비율, 목표 수, 프리셋, 취향, 학습 가중치, 고정/제외/대표/수동 순서) → 모든 편집을 `recommendation_sets`에 저장
5. 내보내기: 원본에서 크롭·리사이즈 JPEG 재인코딩 → 앱 저장소 → 사진 앱 저장/공유

## 오프라인·장애 정책
- 백엔드 env 없음 → `SUPABASE_CONFIGURED=false` → 커뮤니티 화면은 "미설정" 상태, 나머지 기능 정상.
- 백엔드 오류는 `mapBackendError`로 quota/paused/network/auth 구분 표시. 결제·업그레이드 자동 진행 없음.
