# 이미지 에셋 출처 (취향 설정 예시 사진 · 샘플 체험 사진)

확인일: **2026-10-18** · 위치: `assets/onboarding/styles/`(예시 16장), `assets/samples/`(샘플 18장, 아래 "샘플 체험 사진" 절) · 코드 원본: `src/features/onboarding/style-cards.ts`, `src/features/photo-import/sample-credits.ts` · 앱 안에서는 **설정 → 정보 → 이미지 출처**(`/legal/image-credits`, 같은 코드에서 생성)

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

## 남은 확인 사항
- `sample-10.jpg` 피자 접시에 식당 접시 그림(작은 일러스트)이 인쇄돼 있음, `sample-14.jpg` 왼쪽 벽에 어두운 광고 포스터 일부가 보임 — 둘 다 주제가 아니고 식별이 어렵지만 출시 전 법률 검토 때 함께 확인할 것.
- `sample-14.jpg`는 500px 보관본(Archive Team)이라 CC0 근거가 보관된 500px 라이선스 정보다(위 `light-warm-natural.jpg`와 같은 유형).
- `mood-film-vintage.jpg`(1971년 코다크롬 스캔) 배경에 작은 Coca-Cola 간판(약 20px)과 상점 간판이 있음 — 상표가 주제가 아니고 보증 표현도 없지만, 출시 전 법률 검토 시 함께 확인할 것.
- `comp-negative-space.jpg` 작가의 Commons 맞춤 라이선스 틀이 정리(삭제) 논의 중 — 라이선스 자체(CC BY 4.0)에는 영향 없음.
- 이 문서는 법률 자문이 아니다. 상업 출시 전 자격 있는 사람이 검토해야 한다.
