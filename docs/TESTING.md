# 테스트

## 실행 명령
```bash
npm test            # jest (unit + integration)
npm run typecheck   # tsc --noEmit
npx eslint .        # 린트 (npm run lint 은 expo lint)
npm run bench       # 데스크톱 Node 분석 코어 벤치마크 (기기 측정 아님)
```

## 결과 (2026-10-18, Windows 11 / Node 24.20.0)
| 명령 | 결과 |
|---|---|
| `npx jest` | **6 suites, 64 tests 모두 통과** (실기기 대응 후. 최초 59) |
| `npx tsc --noEmit` | 오류 0 |
| `npx eslint .` | 오류 0, 경고 0 (수정 후) |
| `npm run bench` | 3 통과, 수치는 DEVICE_BENCHMARKS.md |

## 범위
| 파일 | 다루는 것 |
|---|---|
| `tests/unit/pixel-metrics.test.ts` | 라플라시안·선명도(흐림 비교), 노출(암부/명부 클리핑), 대비, 해상도 포화, 색 통계, 분석 버전 |
| `tests/unit/duplicates.test.ts` | 휘도 서명(안정성, 밝기 불변, 근접/원거리), 그룹 대표 선택, 색 차이·촬영시간 차이로 분리, union-find 전이, 해시 없는 사진 제외 |
| `tests/unit/recommendation.test.ts` | 목표 장수, 목적별 상한, 제외/고정 준수, 중복 동시 선택 회피, 그룹 대표 교체, 수동 순서 유지, 단일 목적 대안 3장, **취향별 결과 차이 + 기술 점수 불변**, 개인화 on/off, 설명에 얼굴/눈/외모 단어 없음, 미분석 사진 하위, MMR, 시간순 정렬, moveItem |
| `tests/unit/platform-preset-misc.test.ts` | 플랫폼 프로필 무결성·크롭 수학, 프리셋 검증(출처·상태·만료), 취향 마이그레이션·색 목표, 학습 가중치 상한, 선택 사진 정규화(영상/형식/상한, **GPS 미저장**), 분석 큐(동시성 상한·실패 격리·취소), 핸들·카테고리·태그 검증, 캡션, 파일명(ASCII·순번), base64 |
| `tests/integration/sample-images.test.ts` | 실제 JPEG 샘플 18장 디코드→지표→서명→그룹: 정확히 [1,2,3],[4,5],[9,17], 흐린 사본은 대표 아님, 6장 캐러셀에 그룹당 1장 이하 |

## Android 실기기 (2026-10-18, Galaxy Z Flip5 SM-F731N / Android 16 / Expo Go 58.0.4, USB adb)
| 항목 | 결과 |
|---|---|
| 앱 실행(Expo Go, `adb reverse tcp:8081`) | ✅ 홈·탭·다크 모드 정상 |
| OS 다중 사진 선택 → 프로젝트 생성 | ✅ 사용자 실사진 9장 (사용자가 직접 선택) |
| 실사진 분석 | ✅ 9/9 완료, 유사 그룹 2개 (사진 내용은 보지 않음 — 그룹이 맞는지는 사용자 확인 필요) |
| 샘플 18장 분석 | ✅ 사진당 약 60ms |
| 추천 화면·이유 표시 (실사진·샘플) | ✅ |
| 9:16 크롭 손실 과다 추천 | ❌ 발견 → D-027로 수정 → ✅ 재확인 |
| 내보내기 파일 생성·크기 | ✅ 506×900, 405×720, 1080×1920 등 9:16 정확, 순번 파일명 |
| OS 공유 시트 | ✅ `com.android.intentresolver/.ChooserActivityLauncher` 열림 → 뒤로 가기로 앱 복귀 |
| 사진 앱 저장 | ❌ Expo Go 제약으로 권한 거부 → 안내·버튼 비활성 처리(D-026). **개발/정식 빌드에서 재검증 필요** |
| 내보내기 사본 EXIF/GPS | ✅ 사본에 EXIF 블록 없음 (원본: EXIF 있음·GPS 없음 → GPS 실제 제거는 미확인) |

## 미실행 / 미검증 (숨기지 않음)
| 항목 | 상태 | 이유 |
|---|---|---|
| iOS 실기기·시뮬레이터 | 미실행 | macOS·iPhone 없음 |
| 30/100/300장 실사진 분석 시간·메모리 | 미실행 | 다음 세션 |
| 권한 거부/제한 접근 | 미실행 | Android 선택기는 권한 불필요, iOS 미검증 |
| EXIF 회전(세로 촬영)·HEIC | 미확인 | 사용자 사진 화면을 보지 않아 회전 정확성 미확인 |
| 사진 앱 저장 | 미검증 | Expo Go 불가 → 개발 빌드 필요 |
| GPS가 있는 원본의 제거 | 미검증 | 테스트한 원본에 GPS 없음 |
| 네트워크 프록시로 로컬 분석 중 요청 없음 확인 | 미실행 | 코드 구조상 커뮤니티 모듈 외 네트워크 호출 없음(정적 확인만) |
| Supabase RLS·트리거·RPC (`supabase/tests/rls_test.sql`) | 작성만, 미실행 | Supabase 프로젝트/로컬 Docker 없음 |
| 커뮤니티 화면 실제 백엔드 연동 | 미실행 | env 미설정 → "미설정" 상태 화면만 확인 |
| E2E 프레임워크 | 미도입 | |
| 웹 미리보기 UI 흐름 | **실행** | 온보딩→샘플 프로젝트→분석→추천 편집→내보내기 파일 생성→캡션 복사, 커뮤니티 미설정, 설정 (DESIGN_QA.md) |
