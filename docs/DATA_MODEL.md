# 데이터 모델

타입 정의: `src/domain/models.ts`. 로컬 스키마: `src/infrastructure/database/db.ts`. 서버 스키마: `supabase/migrations/20261018000000_community_init.sql`.

## 로컬 (SQLite `cutpick.db`, PRAGMA user_version = 1)
| 테이블 | 주요 컬럼 | 비고 |
|---|---|---|
| `projects` | id, title, created_at, updated_at, source_context, platforms_json, target_count, preset_id, is_sample | CutpickProject |
| `photos` | id, project_id(FK cascade), local_uri, asset_id, width, height, file_size, mime_type, created_at(촬영시각, 허용 시), orientation, thumbnail_uri, phash(16×16 휘도 서명), metrics_json(PhotoQualityMetrics), scene_tags_json, dup_group_id, status, error, import_index | PhotoAsset. 바이너리 없음 (웹 미리보기만 썸네일 data URI) |
| `recommendation_sets` | id, project_id, purpose_id, data_json, updated_at, UNIQUE(project_id, purpose_id) | RecommendationSet: 목적별 1개. orderedPhotoIds(최종), manualOrder(사용자 편집), pinned/excluded, groupRepresentatives, cropPreferences, captionDraft, aspectId, targetCount, details(점수·이유) |
| `preference_events` | id, type(keep/exclude/pin/reorder), features_json(밝기·채도·색온도·대비·방향), preset_id, created_at | 최대 200건 |
| `kv` | key, value | `preference.v1`(UserPreference, schemaVersion 1), `learned.v1`(LearnedWeights) |

`PhotoQualityMetrics`: sharpnessScore, exposureScore, contrastScore, resolutionScore, meanLuma, highlightClipRatio, shadowClipRatio, colorfulness, warmth, meanRgb, analysisVersion(현재 2), calculatedAt.
`analysisVersion`이 현재 값과 다르면 분석 대상에 다시 포함된다(`needsAnalysis`).

## 서버 (Supabase / PostgreSQL, 모든 테이블 RLS)
| 테이블 | 컬럼 | 제약 |
|---|---|---|
| `profiles` | id(auth.users FK), handle(unique, `^[a-z0-9_.]{3,20}$`), display_name(≤30), avatar_path, created_at | 본인만 insert/update, 공개 읽기 |
| `posts` | id, author_id, image_path, thumbnail_path, category(9종), style_tags(≤3, 8종), visibility, moderation_status(pending/visible/hidden/removed), created_at, updated_at | 경로 첫 폴더 = author_id, 작성자는 moderation 필드 변경 불가(트리거), 하루 게시 제한·스토리지 한도(트리거) |
| `likes` | post_id, user_id, created_at, PK(post_id,user_id) | 본인 행만, visible 게시물만 |
| `reports` | id, reporter_id, post_id \| reported_user_id, reason_code(7종), status, created_at, resolved_at | 본인 신고만 조회, 수정·삭제 정책 없음(운영자만), 중복 신고 unique |
| `blocks` | blocker_id, blocked_id, created_at, PK, 자기 차단 금지 | 본인 행만 |
| `community_settings` | uploads_enabled, require_review, daily_post_limit, max_storage_bytes, auto_hide_report_threshold | 정책 없음 = 클라이언트 접근 불가 |

RPC: `get_feed(...)`(하트 수·내 하트·양방향 차단 필터, security definer), `get_my_blocks()`, `delete_my_account()`.
스토리지: 버킷 `post-images` (public read, JPEG만, 2MB), 본인 폴더만 업로드·삭제.
