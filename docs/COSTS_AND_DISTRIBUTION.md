# 비용·배포

확인일: **2026-10-18**. 금액·한도는 바뀔 수 있다. 앱 코드에 무료 한도 숫자를 하드코딩하지 않는다(서버 측 `community_settings`만 운영자가 조정).

## "무료"의 범위
| 구분 | 비용 |
|---|---|
| 로컬 개발(Node, Expo CLI, Expo Go, jest) | 0원 |
| 로컬 사진 분석·추천·저장 | 0원, 네트워크·유료 API 없음 |
| 커뮤니티 백엔드(Supabase Free) | 한도 내 0원, 한도·정책은 아래 |
| **앱스토어 배포** | **유료** (아래) — "상용 배포까지 영구 무료"가 아님 |

## 스토어 등록비
| 항목 | 금액 | 출처 |
|---|---|---|
| Apple Developer Program | US$99/년 (원화 금액은 공식 확인 못 함) | https://developer.apple.com/programs/ |
| Google Play Console | US$25 1회 | https://support.google.com/googleplay/android-developer/answer/6112435 |

## 빌드
- Android 로컬 빌드: Android Studio + SDK(이 PC에는 미설치) 후 `npx expo run:android`. 또는 EAS Build.
- iOS 빌드: macOS + Xcode 필요(이 PC는 Windows) → EAS Build(클라우드) 사용 가능. 서명에는 Apple Developer 계정 필요.
- 현재 앱은 Expo Go 포함 모듈만 사용 → 개발 중에는 Expo Go로 실행 가능(개발 빌드 불필요). 네이티브 모듈 추가 시 개발 빌드 필요.

## Expo EAS Free (https://expo.dev/pricing)
- 빌드: Android 15회 + iOS 15회 (월 단위 리셋 여부는 페이지에서 확인 못 함), 빌드당 45분 제한, 저우선순위 대기열(피크 시 90분+ 대기 가능).
- EAS Update: 1,000 MAU, Free는 초과 과금 없이 하드 리밋.

## Supabase Free (https://supabase.com/pricing, https://supabase.com/docs/guides/platform/cost-control)
| 항목 | 한도 |
|---|---|
| DB | 프로젝트당 500MB |
| Storage | 1GB |
| Egress | 5GB (+ 캐시 egress 5GB) |
| MAU | 50,000 |
| 비활성 | 1주일 비활성 시 프로젝트 일시 중지, 활성 프로젝트 2개 |
| 과금 | "Free Plan 사용 중에는 과금되지 않음". Spend cap은 Pro 전용 |
| 한도 초과 시 동작 | 공식 문서에서 확인 못 함(미확인) |

### 컷픽 사용량 추정과 안전장치
- 게시 1건 ≈ 공유 이미지(긴 변 1440, q0.82) 약 200–500KB + 썸네일 약 30–60KB(추정, 미측정).
- 1GB Storage → 대략 2,000–4,000건. 피드 썸네일 조회가 egress의 대부분 → 5GB ≈ 썸네일 10만 회 내외(추정).
- 안전장치(fail-closed, `supabase/migrations`의 `community_settings`):
  - `max_storage_bytes` 기본 800MB 도달 시 새 게시 거부(`quota_exceeded`) — 로컬 기능은 유지.
  - `uploads_enabled=false`로 즉시 업로드 중단 가능.
  - 사용자당 하루 게시 5건.
- 결제 수단 등록·업그레이드는 하지 않는다. 앱은 quota/paused/network 오류를 구분해 안내만 한다.

## Google Play 타깃 API
2026-08-31부터 신규 앱·업데이트는 Android 16(API 36) 이상 타깃 (연장 신청 시 2026-11-01). https://developer.android.com/google/play/requirements/target-sdk — Expo SDK 58 기본 targetSdk가 이를 충족하는지 **빌드 후 확인 필요**.

## 왜 자동 게시를 하지 않는가
Instagram/TikTok/카카오톡 자동 게시는 공식 API 권한·앱 심사·비즈니스 계정 등 조건이 필요하고, 비공식 API·자동 로그인은 약관 위반 위험이 크다. 컷픽은 파일 저장과 OS 공유 시트로 사용자가 직접 올리게 한다. 커뮤니티 공개는 외부 SNS가 아닌 컷픽 자체 커뮤니티다.
