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
| `npx jest` | **5 suites, 59 tests 모두 통과** |
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

## 미실행 / 미검증 (숨기지 않음)
| 항목 | 상태 | 이유 |
|---|---|---|
| iOS/Android 실기기·에뮬레이터 실행 | 미실행 | Android SDK·macOS 없음 |
| 30/100/300장 실사진 분석 시간·메모리 | 미실행 | 위와 같음 |
| OS 다중 사진 선택, 권한 거부/제한 접근 | 미실행 | 위와 같음 |
| EXIF 회전, 내보내기 사본 GPS 제거 실측 | 미실행 | 위와 같음 |
| 사진 앱 저장·OS 공유 시트 | 미실행 | 웹은 미지원(안내 표시 확인함) |
| 네트워크 프록시로 로컬 분석 중 요청 없음 확인 | 미실행 | 코드 구조상 커뮤니티 모듈 외 네트워크 호출 없음(정적 확인만) |
| Supabase RLS·트리거·RPC (`supabase/tests/rls_test.sql`) | 작성만, 미실행 | Supabase 프로젝트/로컬 Docker 없음 |
| 커뮤니티 화면 실제 백엔드 연동 | 미실행 | env 미설정 → "미설정" 상태 화면만 확인 |
| E2E 프레임워크 | 미도입 | |
| 웹 미리보기 UI 흐름 | **실행** | 온보딩→샘플 프로젝트→분석→추천 편집→내보내기 파일 생성→캡션 복사, 커뮤니티 미설정, 설정 (DESIGN_QA.md) |
