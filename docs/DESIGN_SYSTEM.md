# 디자인 시스템 — Photo-first Editorial Utility

코드: `src/design-system/` (`tokens.ts`, `theme.ts`, `components/*`). **모든 화면이 이 토큰·컴포넌트만 사용**하며 화면에서 색·간격을 새로 정의하지 않는다(예외: 사진 위 배지의 반투명 검정 등 사진 가독성용 고정값은 컴포넌트 내부에만 존재).

## 방향
- 사진이 주인공: 따뜻한 중성 배경(`#F7F5F1`/다크 `#121212`)으로 사진 색을 왜곡하지 않음. 강조색은 파랑 하나.
- 장식 최소화: 그라데이션·글래스·강한 그림자·이모지 없음. 아이콘은 Ionicons 하나로 통일, 아이콘 단독 버튼은 항상 접근성 라벨.
- 레트로·필름 감성은 프리셋(추천 기준)에만 적용, UI 자체는 유행 스타일로 꾸미지 않음.

## 색상 토큰
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| background | #F7F5F1 | #121212 | 화면 배경 |
| surface / surfaceElevated / surfaceSunken | #FFF / #FFF / #EFECE6 | #1C1C1C / #262626 / #0B0B0B | 카드, 시트, 입력 |
| textPrimary / Secondary / Tertiary | #1B1A18 / #5C5852 / #8A857D | #F2F0EC / #B9B4AC / #8C877F | 본문 계층 |
| border / borderStrong | #E3DED6 / #C9C2B7 | #2E2E2E / #454545 | 구분선, 칩 테두리 |
| accent / accentPressed / accentSoft | #2F5BD3 / #2449B0 / #E5ECFB | #7FA2FF / #6A8EF0 / #1E2A4A | 주요 CTA, 링크, 진행 |
| textOnAccent | #FFFFFF | **#0B1330** | 강조 버튼 글자 (다크 수정, D-021) |
| selected / selectedText | accent / #FFF | accent / #0B1330 | 선택 칩·순번 배지 |
| selectedOverlay | rgba(47,91,211,.14) | rgba(127,162,255,.18) | 선택된 사진 카드 위 옅은 틴트 (테두리·체크와 함께만 사용) |
| success / warning / error (+Soft) | #1E7A4C / #8A5A00 / #B3261E | #5CC58F / #E8B54A / #FF8A80 | 상태 (강조색과 겹치지 않음) |
| heart | #D6336C | #FF6B9A | 하트만 |

## 간격·형태·타이포
- 간격: 4/8/12/16/20/24/32 (`spacing.xxs…xxl`).
- radius: 사진(촘촘한 그리드) 6, **타일(큰 사진 카드) 12**, 칩 999, 버튼 12, 카드 16, 시트 20. 알약형은 칩에만.
- 그림자: `elevation.raised` 하나뿐(화면당 히어로 카드 1개). 목록·카드는 테두리로 구분.
- 타이포: screenTitle 28/34 bold · **title 22/29 bold(질문·히어로)** · sectionTitle 18/24 bold · body 16/23 · bodyStrong 16/23 600 · secondary 14/20 · **label 14/19 600(사진 아래 짧은 이름)** · caption 12/16 · numeric 22/28 tabular-nums.
- 큰 글자: `AppText`는 `maxFontSizeMultiplier=2`까지 허용, 버튼 라벨 2줄 허용.
- 최소 터치 44pt(`touchTarget`), 하단 바 높이 상한 96(`bottomBarMaxHeight`) + 요약 줄 28(`bottomBarSummaryHeight`), 스크롤 영역에 바 높이+safe area 여백(`ScreenScroll withBottomBar="summary"`). OS 글자 배율이 1보다 크면(최대 2배까지) 바가 커지는 만큼 여백을 더 둠 — Android 글자 2.0배에서 확인.
- 콘텐츠 폭 상한 640(`contentMaxWidth`) — 태블릿·웹에서 사진 카드가 과하게 커지지 않게(온보딩 그리드에 적용).

## 컴포넌트
| 컴포넌트 | 상태 지원 |
|---|---|
| PrimaryButton / SecondaryButton / DangerButton / GhostButton | loading, disabled, compact, 아이콘, a11y role/state |
| IconButton | 라벨 필수, active, disabled, onPhoto/heart 톤 |
| FilterChip | 선택 = 채움 + 체크 아이콘 + checked state, radio/checkbox 역할 |
| SectionHeader, Card | — |
| PhotoThumbnail + SelectionBadge | 순번/체크/고정/제외/그룹/실패/대기 배지(아이콘+숫자), selected 테두리, dimmed, 접근성 라벨에 상태 포함 |
| SelectablePhotoCard | 4:5 사진 + 아래 이름·설명. 선택 = 3px 강조 테두리 + 채워진 체크 원 + 옅은 틴트 + 이름 강조색 + `checkbox` checked 상태(색만으로 구분하지 않음). 미선택은 흰 테두리 빈 원. 이미지 로드 실패 시 아이콘 자리표시 + 이름 유지 |
| StepHeader | 이전 단계(해당 시만) · 단계 이름 + n/전체 · 건너뛰기 링크 · 진행 바(progressbar 역할, 실제 단계 수) |
| ListRow / Divider | 설정·정보 목록 행(아이콘·라벨·값·chevron, 52pt) / 들여쓰기 가능한 hairline |
| BottomBar `summary` | 버튼 위 한 줄 상태(예: "4개 선택 · 4개 더 고를 수 있어요"), polite live region |
| ProgressPanel | 실제 단계·처리 수만 표시, progressbar 역할, 가짜 % 없음 |
| EmptyState / ErrorState / InlineMessage | 자동 사라짐 없음, error는 alert 역할 |
| BottomSheet | Modal, Reduce Motion 시 애니메이션 없음 |
| BottomBar, ScreenScroll, Row | safe area 처리 |
| AppSwitch | 토큰 색 적용한 네이티브 스위치 |

## 화면별 적용 (2026-10-18 리뉴얼)
- **온보딩**: 1단계 = 사진 카드 2열 그리드(카테고리 칩: 전체/분위기/구도/색감·빛/장면), 하단 바에 선택 수 요약 + "넘기기"(이 단계만) + "계속하기". 나머지 단계는 질문(title) + 칩.
- **홈**: 최근 프로젝트가 있으면 커버 사진이 큰 "이어서 하기" 카드(유일한 그림자) + "새 프로젝트 시작"(주 CTA), 없으면 히어로 카드 하나. 취향 미설정 시에만 사진 취향 고르기 안내.
- **분석**: 진행 패널 → (접힘) 분석 범위 → 사진 그리드. 분석 범위는 "무엇을 분석하나요?"로 펼침.
- **추천**: 요약 카드에 "내 취향 반영 · …" 한 줄(탭하면 취향 수정). 실제 반영된 취향만 이유에 표시.
- **설정**: 내 취향(고른 사진 썸네일 + 요약 + 수정/초기화) → 개인화(스위치·학습 기록) → 데이터 관리 → 커뮤니티 → 정보(처리방침·약관·이미지 출처) → 분석 범위.

## 참고와 차별화
참고: Apple HIG, Material 3, Expo Safe Areas 문서(일반 원칙만). 특정 경쟁 앱 화면을 복제하지 않았다. 드래그 대신 "앞으로/뒤로/첫 장으로" 버튼을 둔 것은 접근성 대체 수단 요구(9.5)에 따른 독자 설계다.
