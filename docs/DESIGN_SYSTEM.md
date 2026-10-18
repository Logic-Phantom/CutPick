# 디자인 시스템 — Photo-first, Editorial (CutPick)

코드: `src/design-system/` (`tokens.ts`, `theme.ts`, `components/*`). **모든 화면이 이 토큰·컴포넌트만 사용**하며 화면에서 색·간격을 새로 정의하지 않는다(예외: 사진 위 배지의 반투명 검정 등 사진 가독성용 고정값과 런치 화면 고정색 `launch`는 컴포넌트 내부에만 존재).

## 방향 (2026-10-18 2차 리프레시 — "AI가 만든 것처럼 보이지 않게")
- 사용자 피드백: 보라·자홍 그라데이션, 글자마다 다른 무지개 워드마크, 파스텔 알약, 오로라 빛·반짝이가 "AI가 만든 앱" 느낌. → 전부 제거(D-040).
- 참고한 방향: 사진·패션 앱(VSCO, 29CM, Kream, Instagram)의 공통점 — **종이색 배경 + 잉크(흑백) UI + 사진이 색을 담당**. 특정 앱 화면을 복제하지 않고 원칙만 따름.
- 주 CTA·선택 칩은 **단색 잉크**(라이트 #191919 / 다크 종이색 #F4F4F2), 그라데이션 없음.
- 포인트 색은 **코랄 `point` 하나**: 사용자가 "픽"한 것(사진 카드 체크·테두리, 순번 배지, 진행 바, "이어서 하기" 표시)에만. 장식에 쓰지 않음.
- 워드마크는 한 색(잉크) Bricolage Grotesque. 앱 안 헤더에는 아이콘 이미지를 붙이지 않고 워드마크만(아이콘은 런치 화면에서만).
- 런치 화면: 무채색 다크 배경에 아이콘·워드마크·문구가 조용히 떠오르고 코랄 얇은 로딩 선만 움직임(최소 1.3초).
- 아이콘은 Ionicons outline 위주로 통일, 아이콘 단독 버튼은 항상 접근성 라벨.

## 색상 토큰
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| background | #FAFAF8 | #111111 | 화면 배경(따뜻한 무채색) |
| surface / surfaceElevated / surfaceSunken | #FFF / #FFF / #F1F1EE | #1B1B1B / #242424 / #0A0A0A | 카드, 시트, 입력 |
| textPrimary / Secondary / Tertiary | #191919 / #5C5C59 / #878783 | #F4F4F2 / #ABABA7 / #82827E | 본문 계층 |
| border / borderStrong | #E9E9E5 / #D3D3CE | #2A2A2A / #3D3D3B | 구분선, 칩 테두리 |
| accent / accentPressed / accentSoft | #191919 / #000 / #F1F1EE | #F4F4F2 / #D9D9D5 / #262626 | 주 CTA 배경, 스위치, 정보 메시지 |
| textOnAccent | #FFFFFF | #111111 | accent 위 글자(대비 15:1 이상) |
| selected / selectedText | #191919 / #FFF | #F4F4F2 / #111 | 선택 칩 |
| point / pointText / pointSoft / onPoint | #FF5A36 / #C23A14 / #FFEEE8 / #FFF | #FF6A45 / #FF9573 / #33201A / #FFF | "픽" 표시: 사진 카드 체크·테두리, 순번 배지, 진행 바. 그래픽 전용(3:1 이상), 글자는 pointText |
| success / warning / error (+Soft) | #1F7A4D / #8A5A00 / #C0352B | #5CC58F / #E8B54A / #FF8A80 | 상태 |
| heart | #F0384F | #FF5C70 | 하트만 |

## 간격·형태·타이포
- 간격: 4/8/12/16/20/24/32 (`spacing.xxs…xxl`).
- radius: 사진(촘촘한 그리드) 6, **타일(큰 사진 카드) 12**, 칩 999, 버튼 14, 카드 18, 시트 22. 알약형은 칩·기능 알약에만.
- 그림자: `elevation.raised` 하나뿐(화면당 히어로 카드 1개). 목록·카드는 테두리로 구분.
- 글꼴(모두 SIL OFL 1.1, 상업적 이용·앱 번들 가능): UI 전체 **Pretendard**(`assets/fonts/`, Regular·Medium·SemiBold·Bold), 워드마크만 **Bricolage Grotesque ExtraBold**(`@expo-google-fonts/bricolage-grotesque`). 굵기마다 별도 family라 `fontWeight` 대신 `fontFamily`를 쓴다 — `AppText`는 인라인 `fontWeight`를 자동으로 해당 family로 바꾼다. 시작 시 `useFonts`로 불러오고(Expo Go 포함), 실패하면 시스템 글꼴로 대체.
- 타이포: screenTitle 28/36 Bold · **title 22/30 Bold(질문·히어로)** · sectionTitle 18/25 Bold · body 16/24 Regular · bodyStrong 16/24 SemiBold · secondary 14/21 · **label 14/20 SemiBold(사진 아래 짧은 이름)** · caption 12/17 Medium · numeric 22/28 tabular-nums. 제목은 자간 -0.2~-0.4.
- 큰 글자: `AppText`는 `maxFontSizeMultiplier=2`까지 허용, 버튼 라벨 2줄 허용.
- 최소 터치 44pt(`touchTarget`), 하단 바 높이 상한 96(`bottomBarMaxHeight`) + 요약 줄 28(`bottomBarSummaryHeight`), 스크롤 영역에 바 높이+safe area 여백(`ScreenScroll withBottomBar="summary"`). OS 글자 배율이 1보다 크면(최대 2배까지) 바가 커지는 만큼 여백을 더 둠 — Android 글자 2.0배에서 확인.
- 콘텐츠 폭 상한 640(`contentMaxWidth`) — 태블릿·웹에서 사진 카드가 과하게 커지지 않게(온보딩 그리드에 적용).

## 컴포넌트
| 컴포넌트 | 상태 지원 |
|---|---|
| BrandWordmark / BrandMark / BrandLockup | 한 색 "CutPick" 워드마크 / 앱 아이콘(런치 화면 전용) / 헤더용(워드마크만) |
| LaunchOverlay (`src/features/launch/`) | 콜드 스타트 런치 화면: 아이콘·워드마크·문구가 차례로 떠오르고 코랄 로딩 선, 앱 준비 후 페이드아웃(최소 1.3초). Reduce Motion이면 움직임 없이 페이드만 |
| PrimaryButton / SecondaryButton / DangerButton / GhostButton | loading, disabled, compact, 아이콘, a11y role/state. Primary는 단색 `accent`(잉크) 배경 + `textOnAccent` |
| IconButton | 라벨 필수, active, disabled, onPhoto/heart 톤 |
| FilterChip | 선택 = 채움 + 체크 아이콘 + checked state, radio/checkbox 역할 |
| SectionHeader, Card | — |
| PhotoThumbnail + SelectionBadge | 순번/체크/고정/제외/그룹/실패/대기 배지(아이콘+숫자), selected 테두리, dimmed, 접근성 라벨에 상태 포함 |
| SelectablePhotoCard | 4:5 사진 + 아래 이름·설명. 선택 = 3px 코랄 테두리 + 채워진 코랄 체크 원 + `checkbox`/`radio` checked 상태(색만으로 구분하지 않음). 미선택은 흰 테두리 빈 원. 이미지 로드 실패 시 아이콘 자리표시 + 이름 유지 |
| StepHeader | 이전 단계(해당 시만) · 단계 이름 + n/전체 · 건너뛰기 링크 · 진행 바(progressbar 역할, 실제 단계 수) |
| ListRow / Divider | 설정·정보 목록 행(아이콘·라벨·값·chevron, 52pt) / 들여쓰기 가능한 hairline |
| BottomBar `summary` | 버튼 위 한 줄 상태(예: "4개 선택 · 4개 더 고를 수 있어요"), polite live region |
| ProgressPanel | 실제 단계·처리 수만 표시, progressbar 역할, 가짜 % 없음 |
| EmptyState / ErrorState / InlineMessage | 자동 사라짐 없음, error는 alert 역할 |
| BottomSheet | Modal, Reduce Motion 시 애니메이션 없음 |
| BottomBar, ScreenScroll, Row | safe area 처리 |
| AppSwitch | 토큰 색 적용한 네이티브 스위치 |

## 화면별 적용 (2026-10-18 리뉴얼)
- **온보딩**: 1단계 = 사진 카드 2열 그리드(카테고리 칩: 전체/분위기/구도/색감·빛/장면), 하단 바에 선택 수 요약 + "넘기기"(이 단계만) + "계속하기". 음식 각도·인물 구도도 사진 카드 2열, 보정 정도는 같은 사진의 무보정/약한 보정/감성 프리셋 3장을 나란히 비교(단일 선택). 올릴 곳만 칩.
- **홈**: 워드마크 + 한 줄 설명 + 테두리만 있는 기능 알약 3개. 최근 프로젝트가 있으면 커버 사진이 큰 "이어서 하기" 카드(유일한 그림자) + "새 프로젝트 시작"(주 CTA), 없으면 히어로 카드 하나. 취향 미설정 시에만 사진 취향 고르기 안내.
- **분석**: 진행 패널 → (접힘) 분석 범위 → 사진 그리드. 분석 범위는 "무엇을 분석하나요?"로 펼침.
- **추천**: 요약 카드에 "내 취향 반영 · …" 한 줄(탭하면 취향 수정). 실제 반영된 취향만 이유에 표시.
- **설정**: 내 취향(고른 사진 썸네일 + 요약 + 수정/초기화) → 개인화(스위치·학습 기록) → 데이터 관리 → 커뮤니티 → 정보(처리방침·약관·이미지 출처) → 분석 범위.

## 참고와 차별화
참고: Apple HIG, Material 3, Expo Safe Areas 문서(일반 원칙만). 특정 경쟁 앱 화면을 복제하지 않았다. 드래그 대신 "앞으로/뒤로/첫 장으로" 버튼을 둔 것은 접근성 대체 수단 요구(9.5)에 따른 독자 설계다.
