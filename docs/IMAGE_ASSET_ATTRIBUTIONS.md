# 이미지 에셋 출처 (취향 설정 예시 사진)

확인일: **2026-10-18** · 위치: `assets/onboarding/styles/` · 코드 원본: `src/features/onboarding/style-cards.ts` · 앱 안에서는 **설정 → 정보 → 이미지 출처**(`/legal/image-credits`, 같은 코드에서 생성)

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

## 남은 확인 사항
- `mood-film-vintage.jpg`(1971년 코다크롬 스캔) 배경에 작은 Coca-Cola 간판(약 20px)과 상점 간판이 있음 — 상표가 주제가 아니고 보증 표현도 없지만, 출시 전 법률 검토 시 함께 확인할 것.
- `comp-negative-space.jpg` 작가의 Commons 맞춤 라이선스 틀이 정리(삭제) 논의 중 — 라이선스 자체(CC BY 4.0)에는 영향 없음.
- 이 문서는 법률 자문이 아니다. 상업 출시 전 자격 있는 사람이 검토해야 한다.
