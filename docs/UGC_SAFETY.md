# UGC 안전 (댓글 없는 하트 커뮤니티)

참고: Apple App Review Guideline 1.2 (https://developer.apple.com/app-store/review/guidelines/#user-generated-content, 확인 2026-10-18) — 게시 전 필터링 수단, 신고와 적시 대응, 악성 사용자 차단, 공개 연락처를 요구한다.

## 제품 범위
- 있음: 단일 사진 게시, 카테고리·스타일 태그(정해진 목록), 하트 추가/취소, 내 게시물 삭제, 게시물·계정 신고, 차단/해제, 계정 삭제.
- 없음(의도적으로 구현하지 않음): 댓글, 답글, DM, 자유 텍스트 캡션, 싫어요, 외모 점수, 인물 랭킹, 인기순 정렬, 공개 하트 순위.
- 캐러셀(여러 장) 게시는 MVP 범위 밖(데이터 구조상 단일 이미지).

## 출시 체크리스트
| 요구 | 상태 | 구현 |
|---|---|---|
| 게시 전 정책 안내·동의 | ✅ 코드 | `community/publish.tsx` 4개 체크박스(공개 범위, 복사·저장 가능, 권리·초상권, 금지 콘텐츠) |
| 게시 전 필터링 | ⚠️ 부분 | 자동 이미지 검열 없음. 대신 **기본 운영자 승인 후 공개**(`require_review=true`), 카테고리/태그 화이트리스트, 하루 5건 제한 |
| 신고가 서버에 저장 | ✅ 코드 / ❌ 미실행 | `reports` 테이블, 사유 7종, `status` open/reviewing/resolved/rejected, 중복 신고 무시 |
| 신고 자동 대응 | ✅ 코드 | 서로 다른 신고자 3명 이상 → 자동 `hidden` (트리거) |
| 차단 | ✅ 코드 | `blocks` + `get_feed`가 양방향 숨김, 차단 목록·해제 화면 |
| 연락처 공개 | ❌ **미설정** | `EXPO_PUBLIC_SUPPORT_EMAIL` 비어 있음 → 정책 화면에 "미설정" 경고 표시. 출시 전 필수 |
| 이용약관·가이드라인·처리방침 | ⚠️ 초안 | `src/features/legal/documents.ts` — 법률 검토 필요 |
| 게시물·계정 삭제 시 스토리지 정리 | ✅ 코드 / ❌ 미실행 | 스토리지 먼저 삭제 후 DB 행 삭제, 실패 시 재시도 안내 |
| 저작권 침해 신고·조치 | ⚠️ | 신고 사유 `copyright`로 접수. 조치 절차는 아래 운영 절차 |
| 반복 위반자 제한 | ⚠️ 수동 | 운영자가 대시보드에서 게시물 `removed` 처리·`auth.users` 차단. 자동 스트라이크 없음 |
| 미성년자/연령 | ❌ 미정 | 1.2.1(a) 연령 확인 요구 검토 필요 |

## 운영 절차 (운영자 콘솔 없음 — Supabase 대시보드 사용)
1. 매일 `reports where status='open'` 확인 → `reviewing`.
2. 위반이면 `posts.moderation_status='removed'`, 아니면 `rejected`. `resolved_at` 기록.
3. 새 게시물 승인: `posts where moderation_status='pending'` 검토 → `visible`.
4. 반복 위반 계정: 게시물 일괄 `removed` + Auth에서 사용자 차단(ban).
5. 저작권 신고: 권리자 확인 → 게시물 `removed` + 스토리지 파일 삭제.
6. 한도 근접: `community_settings.uploads_enabled=false`.

**운영할 사람이 없으면 공개 출시하지 않는다.** 현재 상태는 "제한된 테스트 전용"이다.

## 알려진 위험
- 공개 버킷: 숨김/삭제 전까지 이미지 URL을 아는 사람은 접근 가능. 삭제 시 파일도 삭제하지만 캐시·저장본은 회수 불가(게시 동의에 고지).
- RLS·트리거·RPC는 SQL로 작성했으나 **실제 Supabase에서 실행·검증하지 않음** (`supabase/tests/rls_test.sql` 미실행).
