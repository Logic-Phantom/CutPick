# 이미지 에셋 출처 (취향 설정 예시 사진 · 음식/인물/보정 예시 사진 · 샘플 체험 사진 · 베스트샷 샘플)

확인일: **2026-10-18** (음식 각도 5장은 **2026-10-22**) · 위치: `assets/onboarding/styles/`(예시 16장), `assets/samples/`(샘플 18장, 아래 "샘플 체험 사진" 절) · 코드 원본: `src/features/onboarding/style-cards.ts`, `src/features/photo-import/sample-credits.ts` · 앱 안에서는 **설정 → 정보 → 이미지 출처**(`/legal/image-credits`, 같은 코드에서 생성)

## 기준 (D-032)
- 출처는 **Wikimedia Commons 파일 페이지만** 사용. 각 파일의 라이선스는 ① Commons API `extmetadata`(LicenseShortName·LicenseUrl·Restrictions), ② 파일 페이지의 라이선스 틀, ③ 라이선스 분류 세 곳에서 확인했고, Flickr에서 옮겨 온 파일은 Flickr 라이선스 검토(license review) 통과를 확인. 2026-10-18 API로 16장 모두 다시 조회해 같은 결과를 확인.
- 허용: **CC0 1.0, 퍼블릭 도메인, CC BY 2.0/2.5/3.0/4.0** (상업적 이용·앱 번들 재배포·수정 허용). 제외: CC BY-SA, NC, ND, GFDL 전용, 라이선스 불명, Restrictions(초상권·상표 등) 표시 파일.
- 의도적으로 쓰지 않은 소스: Unsplash(유사 서비스용 이미지 모음 제한), Pexels·Hugging Face(개별 검토 부담·권리 불명확), Cloudflare(호스팅일 뿐 라이선스 근거 아님). 조사 중 출처가 의심스러운 대량 업로더, 합성 이미지, Unsplash·Rawpixel 출신 파일, 워터마크 있는 파일, 얼굴이 보이는 거리 사진, 상표 신발이 주인공인 사진은 제외.
- 사람 얼굴이 식별되는 사진 없음. 상표가 주인공인 사진 없음. 워터마크·문자 오버레이 없음(검수: 16장 모두 직접 확인).
- **수정 사항(모든 파일 공통)**: Commons 썸네일(약 900~1200px)을 받아 4:5로 크롭(피사체가 잘리지 않게 중심 조정)하고 600×750으로 축소, JPEG(품질 약 80, `scene-travel`은 52)로 다시 저장. `scene-ootd`는 빈 테이블을 잘라내느라 약 7%, `light-vivid-contrast`는 원본이 16:9라 약 4% 확대됨. 색 보정·합성 없음.
- 런타임에 네트워크로 받지 않는다(정적 `require`). 다운로드는 조사 시 1회만 수행.

## 파일별 기록
| 파일 | 카드(태그) | 작가 | 원본 페이지 | 라이선스 | 라이선스 URL | 표시 문구 |
|---|---|---|---|---|---|---|
| mood-warm-cozy.jpg | 따뜻하고 포근한 (warm) | spurekar | https://commons.wikimedia.org/wiki/File:19._Coffee_Shop_(12644020424).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | "19. Coffee Shop (12644020424).jpg" — spurekar, CC BY 2.0 |
| mood-bright-airy.jpg | 밝고 산뜻한 (bright) | Klearchos Kapoutsis from Santorini, Greece | https://commons.wikimedia.org/wiki/File:Blue_Door_-_White_Wall_(3179426312).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | "Blue Door - White Wall" — Klearchos Kapoutsis, CC BY 2.0 |
| mood-calm-moody.jpg | 차분한 무드 (calm) | Matthew.kowal | https://commons.wikimedia.org/wiki/File:The_floating_dock_at_Rose_Canyon_Lake_on_a_rainy_and_foggy_January_1_2026.jpg | CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/ | — Matthew.kowal, CC BY 4.0 |
| mood-film-vintage.jpg | 필름·빈티지 (film) | lindsaybridge from Sydney, Australia | https://commons.wikimedia.org/wiki/File:1971_MEMPHIS,_TENNESSEE_(4309898979).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — lindsaybridge, CC BY 2.0 |
| comp-centered.jpg | 피사체 중심 구도 (centered) | Jebulon | https://commons.wikimedia.org/wiki/File:Lighthouse_Chania_evening.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | (저작자 표시 의무 없음, 앱에는 표시) |
| comp-negative-space.jpg | 여백 있는 구도 (negative-space) | Vyacheslav Argenberg | https://commons.wikimedia.org/wiki/File:Koh_Mak_(island),_Thailand,_Solitary_tree_in_lagoon.jpg | CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/ | **© Vyacheslav Argenberg** (작가가 파일 페이지에서 요구한 문구) |
| comp-wide-landscape.jpg | 넓은 풍경 (wide) | Joe Hayhurst from Preston, England | https://commons.wikimedia.org/wiki/File:Highlands_re-edit_2_(Explored)_-_Flickr_-_Joe_Hayhurst.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — Joe Hayhurst, CC BY 2.0 |
| comp-detail-closeup.jpg | 디테일 클로즈업 (closeup) | Havardtl | https://commons.wikimedia.org/wiki/File:Strawberry_up_close.jpg | CC BY 4.0 | https://creativecommons.org/licenses/by/4.0/ | — Havardtl, CC BY 4.0 |
| light-warm-natural.jpg | 따뜻한 자연광 (natural-light, warm) | Brian Hunter | https://commons.wikimedia.org/wiki/File:Evening_Light_(228585707).jpeg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | (표시 의무 없음) — 500px에서 Archive Team이 옮긴 파일, CC0 근거는 보관된 500px 라이선스 페이지 |
| light-soft-muted.jpg | 부드러운 저채도 (muted) | Tony Hisgett from Birmingham, UK | https://commons.wikimedia.org/wiki/File:Pastel_Houses_Tenby_2_(34818643203).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — Tony Hisgett, CC BY 2.0 |
| light-vivid-contrast.jpg | 선명한 색감 (vivid) | Szalax | https://commons.wikimedia.org/wiki/File:Colorful_umbrellas_over_the_Szinva_Bridge_01.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | (표시 의무 없음) |
| light-dark-night.jpg | 어두운 무드 조명 (dark) | Wilfredor | https://commons.wikimedia.org/wiki/File:Hong_Kong_night_street_2.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | (표시 의무 없음) — 지역 상점 네온 간판이 보임(세계적 브랜드 아님), 보행자는 작고 멀어 식별 불가 |
| scene-travel.jpg | 여행·장소 (travel) | s9-4pr | https://commons.wikimedia.org/wiki/File:Lucignano_-_old_town_-_stairs_(18772862825).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — s9-4pr, CC BY 2.0 |
| scene-cafe-food.jpg | 카페·음식 (food) | Andy Li | https://commons.wikimedia.org/wiki/File:A_slice_of_coffee_and_walnut_cake_-_Audit_Room_Café,_Petworth_House.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | (표시 의무 없음) |
| scene-ootd.jpg | OOTD·패션 (fashion) | UNIFORM Studio | https://commons.wikimedia.org/wiki/File:Clothes_rack.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — UNIFORM Studio, CC BY 2.0 |
| scene-lifestyle-objects.jpg | 일상 소품 (objects) | Nenad Stojkovic | https://commons.wikimedia.org/wiki/File:Old_glasses_on_old_book_from_above.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | — Nenad Stojkovic, CC BY 2.0 |

합계 16장, 약 1.17MB(파일당 31~109KB). CC0 6장, CC BY 2.0 7장, CC BY 4.0 3장.

## 음식 각도·인물 구도·보정 예시 사진 (`assets/onboarding/food|portrait|retouch/`, D-042)
코드 원본: `src/features/onboarding/choice-cards.ts`. 기준은 위 D-032와 같고, 2026-10-18 Commons API로 다시 조회해 라이선스·Restrictions를 확인했다. 인물 사진은 **얼굴이 드러나지 않는 장면**(뒷모습·모자·카메라로 가림·실루엣·작은 인물)만 골랐고 어린이 없음. 보정 3장은 CC0 사진 한 장을 Pillow로 세 가지로 보정(무보정/약한 보정/필름 프리셋)했다. 인물 7장 중 3장이 Nenad Stojkovic(Flickr에서 옮겨 와 FlickreviewR 통과한 파일만 — 같은 작가가 Commons에 직접 올린 own-work 파일 일부에 저작권 의심 지적이 있어 제외)라 출시 전 법률 검토 때 함께 확인할 것. 음식 5장은 2026-10-22에 Andy Li(CC0) 사진으로 교체됐다(아래 표).

| 파일 | 카드 | 작가 | 원본 페이지 | 라이선스 | 라이선스 URL | 수정 | 메모 |
|---|---|---|---|---|---|---|---|
| food/food-top.jpg | 음식 · 탑뷰 | Andy Li (Commons: Onthewings) | https://commons.wikimedia.org/wiki/File:King_prawn_curry_-_Sunoso.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | Commons 1920px 렌더(원본 4032×3024)의 가운데 1152×1440을 크롭해 600×750으로 축소, 메타데이터 없는 sRGB JPEG(품질 85). 색 보정·합성 없음 (그릇 좌우 끝이 조금 잘림, 왼쪽 프라이팬은 프레임 밖) | 새우 커리 그릇을 바로 위에서. 사람·로고 없음. |
| food/food-front.jpg | 음식 · 정면 | Andy Li (Commons: Onthewings) | https://commons.wikimedia.org/wiki/File:Cheddar_Cheese_Beef_Burger_-_Gourmet_Burger_Kitchen_2023-10-03.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 1920×2560 렌더에서 (422, 973)부터 1166×1458 크롭 → 600×750. 색 보정·합성 없음 | 눈높이 버거. 뒤쪽 소스병은 아랫부분(빨간 병)만 남고 **라벨은 프레임 밖**, "MEDIUM" 꽂이는 위쪽이 잘림. 사람 없음. |
| food/food-45.jpg | 음식 · 45도 | Andy Li (Commons: Onthewings) | https://commons.wikimedia.org/wiki/File:Chicken_curry_rice_-_Milk_No_Sugar.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 1920×2560 렌더에서 (0, 512)부터 1536×1920 크롭 → 600×750. 색 보정·합성 없음 | 커리 라이스를 비스듬히(약 45도), 뒤에 작은 그릇이 보여 각도가 드러남. 원본 오른쪽의 식사 중인 손과 위쪽 벽 글자는 **프레임 밖**(숟가락 손잡이만 남음). |
| food/food-detail.jpg | 음식 · 근접 디테일 | Andy Li (Commons: Onthewings) | https://commons.wikimedia.org/wiki/File:Close_up_of_western_fried_rice.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 1920×2560 렌더에서 (192, 640)부터 1440×1800 크롭 → 600×750. 색 보정·합성 없음 | 볶음밥 낟알·소시지가 보이는 클로즈업(숟가락으로 떠 올림). 사람·로고 없음. |
| food/food-table.jpg | 음식 · 테이블 전체 | Andy Li (Commons: Onthewings) | https://commons.wikimedia.org/wiki/File:Mixed_Mushrooms_Joe's_'on_toast'_and_Le_Hash_-_Joe's_Cafe.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 1920×2560 렌더에서 (125, 461)부터 1661×2076 크롭 → 600×750. 색 보정·합성 없음 | 두 사람 몫 브런치 접시 2개 + 라테 2잔을 위에서. 원본 위쪽의 사람 팔·손은 **프레임 밖**(오른쪽 위에 포크 끝만 남음). 컵 로고 없음. |
| portrait/portrait-full.jpg | 인물 · 전신 | Kristoffer Trolle | https://commons.wikimedia.org/wiki/File:Girl_walking_on_Frederiksberg_Allé_on_a_summer_day._Taken_with_Kodak_Ektar_100_+_Canon_EOS_650_+_Canon_EF_135mm_f2_-_45557775225.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (원본 필름 스캔 가로 사진 중앙부) | 전신, 뒷모습(얼굴 안 보임). 배경 버스정류장 광고판(풍경 사진, 글자 판독 불가 수준)이 흐리게 보임. 원본 왼쪽의 노인은 크롭으로 제외. |
| portrait/portrait-half.jpg | 인물 · 반신 | Nenad Stojkovic | https://commons.wikimedia.org/wiki/File:Lonely_girl_with_beautiful_hair_standing_outdoors_with_cottage_background.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (원본 세로 사진에서 모자~허리 부분만 잘라 약 1.7배 확대 크롭) | 반신, 뒤/옆모습(얼굴 안 보임). 로고 없음. |
| portrait/portrait-close.jpg | 인물 · 클로즈업 | Nenad Stojkovic | https://commons.wikimedia.org/wiki/File:The_girl_is_hiding_behind_a_hat.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (3840px 썸네일에서 모자·손·어깨 부분만 타이트하게 크롭) | 클로즈업, 모자로 얼굴이 가려짐. 원본 가장자리에 보정 흔적으로 보이는 옅은 헤일로가 모자 윤곽에 있음. |
| portrait/portrait-low.jpg | 인물 · 로우 앵글 | CutPick 프로젝트 소유자 제공 | (공개 원본 페이지 없음 — 2026-10-22 대화에서 소유자가 직접 제공, ChatGPT로 생성한 AI 이미지) | 소유자 제공 | — | 콜라주(1536×1024) 2행 4번째 칸을 4:5(312×390)로 잘라 600×750으로 확대(약 1.9배)·약한 선명화, 메타데이터 없는 JPEG(품질 88) | 하늘을 배경으로 아래에서 올려 찍은 전신. 얼굴은 옷깃·모자에 가려 식별 불가. 로고 없음. 확대 때문에 다른 카드보다 디테일이 약함 |
| portrait/portrait-mirror.jpg | 인물 · 거울샷 | CutPick 프로젝트 소유자 제공 | (공개 원본 페이지 없음 — 2026-10-22 대화에서 소유자가 직접 제공, ChatGPT로 생성한 AI 이미지) | 소유자 제공 | — | 콜라주(1536×1024) 1행 1번째 칸을 4:5(314×392)로 잘라 600×750으로 확대(약 1.9배)·약한 선명화, 메타데이터 없는 JPEG(품질 88) | 아치형 전신 거울 앞에서 휴대폰으로 얼굴을 가린 셀카. 휴대폰 뒷면 로고는 보이지 않음. 확대 때문에 다른 카드보다 디테일이 약함 |
| portrait/portrait-snap.jpg | 인물 · 자연스러운 스냅 | Nenad Stojkovic | https://commons.wikimedia.org/wiki/File:Woman_in_a_white_dress_walking_down_the_beach._(50668697041).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (원본 세로 사진 위아래만 잘라냄) | 자연스러운 스냅(걷는 모습), 얼굴은 프레임 밖. 맨발·흰 원피스, 노출 문제 없음. |
| portrait/portrait-environment.jpg | 인물 · 배경을 살린 구도 | Kristoffer Trolle from Copenhagen, Denmark | https://commons.wikimedia.org/wiki/File:Lady_sitting_in_front_of_Parthenon_on_Acropolis,_Athens,_Greece_(17088729869).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (파르테논 왼쪽·중앙부 기준) | 배경을 살린 구도. 인물은 작게 등을 돌려 앉아 있음. 파르테논 복원용 비계·크레인이 우측에 작게 보임. 문화재 사진(공공장소 건축물)이며 저작권 문제 없음. |
| retouch/retouch-none.jpg | 보정 · 무보정 | Andy Li | https://commons.wikimedia.org/wiki/File:Latte_-_Taith,_Lewes_2026-07-03.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장. 색 보정·합성 없음 (오른쪽 가장자리의 인쇄물(글자 포함)을 빼려고 폭 1080px 구간만 크롭) | 세 보정 카드 모두 같은 원본. 사람 없음. 원본 우측 인쇄물(“Simo…” 글자)은 크롭으로 제외. 작가 Andy Li는 기존 scene-cafe-food.jpg와 같은 CC0 작가 |
| retouch/retouch-light.jpg | 보정 · 약한 보정 | Andy Li | https://commons.wikimedia.org/wiki/File:Latte_-_Taith,_Lewes_2026-07-03.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장 후 Pillow로 약한 보정: 밝기 ×1.07, 대비 ×1.10, 채도 ×1.20 | 세 보정 카드 모두 같은 원본. 사람 없음. 원본 우측 인쇄물(“Simo…” 글자)은 크롭으로 제외. 작가 Andy Li는 기존 scene-cafe-food.jpg와 같은 CC0 작가 |
| retouch/retouch-preset.jpg | 보정 · 감성 프리셋 | Andy Li | https://commons.wikimedia.org/wiki/File:Latte_-_Taith,_Lewes_2026-07-03.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | Commons 썸네일을 4:5(600×750)로 크롭·축소하고 메타데이터 없는 sRGB JPEG(품질 85)로 다시 저장 후 Pillow로 필름 프리셋: 채도 ×0.80, 채널별 톤커브(검정 들어올림 30~44, 하이라이트 따뜻하게·그림자 푸르게), 가우시안 그레인(σ5) 추가 | 세 보정 카드 모두 같은 원본. 사람 없음. 원본 우측 인쇄물(“Simo…” 글자)은 크롭으로 제외. 작가 Andy Li는 기존 scene-cafe-food.jpg와 같은 CC0 작가 |

**음식 각도 5장 교체(2026-10-22, D-046)**: README UX 과제 0-1에 따라 커피잔·생크림 머그·디저트처럼 "요리"인지 애매하거나 질문과 관계없어 보이던 사진을 모두 빼고, **한 작가(Andy Li, CC0)가 카페·식당에서 찍은 접시 요리 사진**으로 바꿨다. 같은 접시를 다섯 각도로 찍은 무료 라이선스 사진은 찾지 못해, 같은 작가·같은 휴대폰·비슷한 실내 조명으로 각도 외의 차이를 줄였다. 5장 모두 2026-10-22 Commons API로 LicenseShortName=CC0·Restrictions 없음·업로더 Onthewings(작가 본인, Own work)를 다시 확인한 뒤 1920px 렌더를 한 번 받았다(원본은 커밋하지 않음). 작가는 기존 `retouch/*`, `scene-cafe-food.jpg`와 같다. 파일 이름에 식당 이름이 들어 있지만 앱 화면에는 출처 페이지에만 나오고, 사진 안에 식당 로고는 없다.

합계 15장(원본 13장): CC0 8장(음식 5장 + 보정 3장의 같은 원본), CC BY 2.0 5장, 소유자 제공 2장(거울샷·로우 앵글, D-047). 파일당 57~131KB, 600×750, EXIF·ICC·XMP 없음.

## 샘플 체험 사진 (`assets/samples/`)
"샘플 사진으로 체험하기"(`src/features/photo-import/sample-photos.ts`)와 분석 통합 테스트가 쓰는 18장. 예전의 합성 이미지(`scripts/generate-sample-photos.mjs`)를 대체했다. 여행 사진첩처럼 보이도록 고른 **실제 사진 14장**과, 그중 3장에서 만든 **가공본 4장**(연사·흔들림·밝기 예시)으로 구성. 07번은 별도 해변 사진의 노출을 일부러 날린 과노출 예시.

- 기준은 위 D-032와 같다. 14장 모두 2026-10-18 Commons API `extmetadata`로 LicenseShortName·LicenseUrl·Restrictions(전부 비어 있음)·Artist를 확인했고, 빌드 스크립트의 `--download`가 받기 전에 같은 검사를 다시 한다. Flickr 출신은 FlickreviewR 통과, Panoramio 출신은 신뢰 사용자 검토 통과 분류를 확인. 예시 카드 16장과 겹치는 파일 없음(테스트로 확인).
- 사람 얼굴이 식별되는 사진 없음(08번 성당 앞 보행자는 몇 픽셀 크기). 상표가 주인공인 사진 없음, 워터마크 없음(18장 모두 직접 확인). 06번 네온은 일반 명사 "CLEANERS" 간판.
- **재현 방법**: `python scripts/build-sample-photos.py <원본폴더> --download` — 레시피 `scripts/sample-photos.json`의 각 파일 썸네일(폭 1280px)을 한 번 받아 `<원본폴더>/<key>.jpg`로 저장(원본은 커밋하지 않음)하고, 크롭·축소·가공 후 EXIF/ICC 없는 JPEG(품질 80, 08·09·17은 70)로 `assets/samples/`에 쓴다.
- **가공(의도적 결함)**: 02 = 01을 몇 픽셀 어긋나게 자른 연사 컷 · 03 = 01에 가우시안 블러(반경 5) · 05 = 04를 몇 픽셀 어긋나게 자르고 밝기 +16 · 07 = 다른 해변 사진에 노출 ×1.5+60(하이라이트 날림) · 17 = 09를 몇 픽셀 어긋나게 자른 연사 컷. 나머지는 크롭·축소만(08은 약 8%, 18은 가게 창문 로고를 빼려고 약 15% 확대, 16은 원본이 작아 약 6% 확대). 색 보정·합성 없음.
- 분석 검증(`tests/integration/sample-images.test.ts`): 중복 그룹은 정확히 {01,02,03}·{04,05}·{09,17}. 서명 거리 — 가공 쌍 0.6–2.4, 무관 사진 최소 30.3(임계값 5).

| 파일 | 장면 | 작가 | 원본 페이지 | 라이선스 | 라이선스 URL | 가공 |
|---|---|---|---|---|---|---|
| sample-01.jpg | 해 질 녘 바닷가 | Bonnie Moreland | https://commons.wikimedia.org/wiki/File:Lone_Ranch_Beach_Oregon_at_sunset.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 4:5 크롭 |
| sample-02.jpg | 〃 연사 컷 | Bonnie Moreland | https://commons.wikimedia.org/wiki/File:Lone_Ranch_Beach_Oregon_at_sunset.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 01과 몇 px 어긋난 크롭 |
| sample-03.jpg | 〃 흔들린 컷 | Bonnie Moreland | https://commons.wikimedia.org/wiki/File:Lone_Ranch_Beach_Oregon_at_sunset.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 01 + 블러 |
| sample-04.jpg | 카페 | Guwashi999 from Tokyo, Japan | https://commons.wikimedia.org/wiki/File:Coffee_@_IHATOBO_-_Shimokitazawa,_2008-09-20_16.07.25_(by_Guwashi999).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 4:5 크롭 |
| sample-05.jpg | 〃 밝게 찍힌 컷 | Guwashi999 from Tokyo, Japan | https://commons.wikimedia.org/wiki/File:Coffee_@_IHATOBO_-_Shimokitazawa,_2008-09-20_16.07.25_(by_Guwashi999).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 어긋난 크롭 + 밝기 +16 |
| sample-06.jpg | 밤 네온사인 | Romain Guy from San Francisco, USA | https://commons.wikimedia.org/wiki/File:Night_lights_in_Loyola,_California.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 4:5 크롭 |
| sample-07.jpg | 해변(과노출) | Pat McNally (Patrick_McNally), Panoramio | https://commons.wikimedia.org/wiki/File:Papohaku_Beach_Molokai_Hawaii_(Maui_County)_Photo_by_Pat_McNally_-_panoramio.jpg | CC BY 3.0 | https://creativecommons.org/licenses/by/3.0/ | 4:5 크롭 + 노출 날림 |
| sample-08.jpg | 도시(베를린 대성당) | Terry Kearney from Liverpool, Merseyside | https://commons.wikimedia.org/wiki/File:Berliner_Dom._(Explored)_-_Flickr_-_Oneterry_AKA_Terry_Kearney.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 3:2 크롭(약 8% 확대) |
| sample-09.jpg | 공원 | vastateparksstaff (Virginia State Parks) | https://commons.wikimedia.org/wiki/File:SK-10-17-23-Tupelotreeinhistoricarea.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 3:2 크롭 |
| sample-10.jpg | 음식(피자, 위에서) | Nenad Stojkovic from Srbija | https://commons.wikimedia.org/wiki/File:Overhead_view_of_a_variety_of_pizza_pies._Above_closeup._(49259889958).jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 1:1 크롭 |
| sample-11.jpg | 안개 낀 부두 | Andreas Kolleger (Flickr: kolleggerium) | https://commons.wikimedia.org/wiki/File:Foggy_pier_in_Fell's_Point.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 4:5 크롭 |
| sample-12.jpg | 바다 | Tomwsulcer | https://commons.wikimedia.org/wiki/File:View_of_the_Atlantic_Ocean_from_Wildwood_New_Jersey.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 3:2 크롭 |
| sample-13.jpg | 산과 빙하 | Mr.KhalidJawed | https://commons.wikimedia.org/wiki/File:Hoper_Valley_Glacier.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 3:2 크롭 |
| sample-14.jpg | 밤 골목(로비니) | Nils Söderman | https://commons.wikimedia.org/wiki/File:Night_Lights_(218082587).jpeg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 4:5 크롭 — 500px에서 Archive Team이 옮긴 파일 |
| sample-15.jpg | 꽃(백일홍) | Amaury Laporte | https://commons.wikimedia.org/wiki/File:Field_of_Zinnia_Magellan_Pink_Flowers_2.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 1:1 크롭 |
| sample-16.jpg | 빗방울 너머 불빛 | Lemuel Cantos from Cebu, Philippines | https://commons.wikimedia.org/wiki/File:Night_Lights_-_Flickr_-_lemuelinchrist.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 4:5 크롭(약 6% 확대) |
| sample-17.jpg | 공원 연사 컷 | vastateparksstaff (Virginia State Parks) | https://commons.wikimedia.org/wiki/File:SK-10-17-23-Tupelotreeinhistoricarea.jpg | CC BY 2.0 | https://creativecommons.org/licenses/by/2.0/ | 09와 몇 px 어긋난 크롭 |
| sample-18.jpg | 골목길(코르푸) | GinoOnassis | https://commons.wikimedia.org/wiki/File:1_a_small_street_in_corfou_old_town_july_2025.jpg | CC0 1.0 | https://creativecommons.org/publicdomain/zero/1.0/ | 4:5 크롭(약 15% 확대) |

합계 18장(원본 14장), 약 2.5MB(파일당 32~236KB). 원본 기준 CC0 7장, CC BY 2.0 6장, CC BY 3.0 1장.

## 베스트샷 샘플 (`assets/showcase/`, D-051)
- 출처: **프로젝트 소유자 제공** 5×4 콜라주 이미지(1536×1024, 2026-10-23 대화에서 제공). 소유자가 "커뮤니티에 쓸 베스트샷 샘플"로 쓰라고 지정.
- 생성 경로(2026-10-24 소유자 확인): 소유자가 **OpenAI ChatGPT 이미지 생성**으로 직접 만든 AI 이미지. 실제 촬영 사진이 아니며 실존 인물·특정 장소를 지정해 만들지 않음. OpenAI 이용약관상 생성물(Output)의 권리는 이용자에게 귀속되고 상업적 이용이 가능 → 앱 번들 재배포·잘라내기·확대 가능. 사진 속 인물은 실존 인물이 아니라 초상권 동의 대상이 아님. 앱 상세 화면에 "AI로 만든 예시 이미지", 이미지 출처 화면에 ChatGPT 생성으로 표시.
- 남은 주의: AI 생성물은 저작권 보호를 받지 못할 수 있음(남이 복제해도 막기 어려움 — 사용에는 문제 없음). 생성 당시 대화(프롬프트·날짜)를 소유자가 보관해 두면 출처 증빙이 됨.
- 가공: 칸 경계를 픽셀 분석으로 찾아(열 x 22–307·325–609·626–911·928–1213·1231–1515, 행 y 16–271·283–504·516–742·755–987) 둥근 모서리를 피하려 7px 안쪽을 잘라 **2배 확대**(LANCZOS + 약한 언샤프 마스크), 메타데이터 없는 JPEG(품질 86)로 저장. 색 보정·합성 없음. 크기 542~544 × 416~484, 20장 합계 약 0.8MB. 원본 칸이 작아(약 270×230) 확대 사진이라 디테일이 약함.
- 앱 표시: 홈·커뮤니티의 "CutPick 샘플" 카드와 상세. 작성자·하트 수를 붙이지 않고 실제 게시물과 섹션을 분리. 앱 "설정 → 이미지 출처"에 "베스트샷 샘플" 항목.
- 인물 사진(03·09·12·18·19)은 얼굴이 휴대폰·뒷모습·발끝 시점으로 드러나지 않음.

| 파일 | 장면 | 카테고리 |
|---|---|---|
| showcase-01 | 라떼 아트·크루아상 | 카페 |
| showcase-02 | 해안 산책길 | 여행 |
| showcase-03 | 거울 셀카(검은 니트) | OOTD |
| showcase-04 | 파스타 | 음식 |
| showcase-05 | 강변 도시 노을 | 여행 |
| showcase-06 | 올려다본 유리 빌딩 | 풍경 |
| showcase-07 | 바다 앞 밀짚모자·선글라스 | 여행 |
| showcase-08 | 창가 딸기 케이크·아이스 커피 | 카페 |
| showcase-09 | 데님 코디 | OOTD |
| showcase-10 | 하늘 배경 데이지 | 일상 |
| showcase-11 | 보랏빛 야경 | 풍경 |
| showcase-12 | 카페 거울 셀카(니트) | OOTD |
| showcase-13 | 포케·말차 라떼 | 음식 |
| showcase-14 | 해변 | 여행 |
| showcase-15 | 아침 침대 | 일상 |
| showcase-16 | 꽃 핀 골목 | 여행 |
| showcase-17 | 딸기 크루아상·라떼 | 카페 |
| showcase-18 | 노을 앞 뒷모습 | 여행 |
| showcase-19 | 흰 스니커즈 | OOTD |
| showcase-20 | 흰 수국 | 일상 |

## 남은 확인 사항
- ~~베스트샷 샘플 20장(D-051) 출처~~ → 2026-10-24 해결: 소유자가 ChatGPT로 생성한 AI 이미지(위 "베스트샷 샘플" 절). 사진 속 일부 장소(강변 야경의 전망 타워 등)가 실제 장소처럼 보이므로 제목에 특정 지명을 쓰지 않는 원칙은 유지.
- ~~인물 거울샷·로우 앵글(D-047) 출처~~ → 2026-10-24 해결: 원본 콜라주는 소유자가 **OpenAI ChatGPT로 생성한 AI 이미지**(베스트샷 샘플과 같은 기준 — OpenAI 약관상 생성물 권리는 이용자에게 있고 상업 이용 가능, 실존 인물이 아니라 초상 동의 대상 아님). 앱 이미지 출처 화면에 ChatGPT 생성으로 표시. 콜라주의 나머지 6칸은 쓰지 않음. 생성 대화(프롬프트·날짜)는 소유자가 보관.
- 사진 취향 1단계 16장은 2026-10-22 같은 기준(질문·선택지 의미와 일치, 작은 화면에서 차이 보임)으로 다시 봤다. `scene-ootd.jpg`는 사람 없이 옷걸이만 있어 "OOTD"보다 "패션 소품"에 가깝지만 카드 이름이 "OOTD·패션"이고 얼굴 제외 기준 때문에 유지. 나머지는 이름과 사진이 맞음.
- `sample-10.jpg` 피자 접시에 식당 접시 그림(작은 일러스트)이 인쇄돼 있음, `sample-14.jpg` 왼쪽 벽에 어두운 광고 포스터 일부가 보임 — 둘 다 주제가 아니고 식별이 어렵지만 출시 전 법률 검토 때 함께 확인할 것.
- `sample-14.jpg`는 500px 보관본(Archive Team)이라 CC0 근거가 보관된 500px 라이선스 정보다(위 `light-warm-natural.jpg`와 같은 유형).
- `mood-film-vintage.jpg`(1971년 코다크롬 스캔) 배경에 작은 Coca-Cola 간판(약 20px)과 상점 간판이 있음 — 상표가 주제가 아니고 보증 표현도 없지만, 출시 전 법률 검토 시 함께 확인할 것.
- `comp-negative-space.jpg` 작가의 Commons 맞춤 라이선스 틀이 정리(삭제) 논의 중 — 라이선스 자체(CC BY 4.0)에는 영향 없음.
- 이 문서는 법률 자문이 아니다. 상업 출시 전 자격 있는 사람이 검토해야 한다.
