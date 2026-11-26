# 링크페이먼트 홈페이지 (정적 HTML)

빌드 도구 없이 바로 열고 고칠 수 있는 순수 HTML · CSS · JS 사이트입니다.
`index.html`을 브라우저로 열면 바로 볼 수 있고, 웹 서버(예: Nginx, S3, GitHub Pages)에 폴더째 올리면 그대로 동작합니다.

## 폴더 구조

```
index.html                      메인(랜딩)
company.html                    회사소개
payments.html                   결제 서비스 목록
payments-card.html              카드결제
payments-virtual-account.html   가상계좌
payments-easy-pay.html          간편결제
payments-payment-link.html      SMS·URL 결제
payments-manual.html            수기결제
solutions.html                  플랫폼·솔루션 목록
solutions-linku.html            LinkU(링크유)
solutions-sportsnote.html       스포츠노트(구 케어아이)
solutions-table-order.html      테이블오더
solutions-smart-order.html      스마트오더
solutions-kiosk.html            키오스크
trust.html                      신뢰·공시
trust-notices-settlement-protection-2026-10-01.html   공시 상세
onboarding.html                 도입 안내
contact.html                    문의하기
privacy.html                    개인정보처리방침
developers.html                 API 연동 매뉴얼
404.html                        없는 페이지 안내

assets/css/site.css             모든 페이지 공통 스타일
assets/js/site.js               모든 페이지 공통 동작
assets/img/                     이미지
assets/data/card-error-codes.json   에러 코드 원본 데이터(참고용)
```

## 자주 하는 수정

**문구 수정**
각 페이지 HTML을 열어 해당 문장을 직접 고치면 됩니다. 페이지마다 내용이 그대로 들어 있습니다.

**헤더·푸터 수정**
헤더(`<header class="hdr">`)와 푸터(`<footer>`)는 모든 페이지에 똑같이 들어 있습니다.
메뉴나 연락처를 바꿀 때는 모든 HTML 파일에서 같은 부분을 함께 바꿔 주세요(에디터의 '모든 파일에서 바꾸기' 기능을 쓰면 편합니다).

**이미지 교체**
`assets/img/`의 파일을 같은 이름으로 덮어쓰면 모든 페이지에 반영됩니다.
흑백 필터는 `class="ph"` 이미지에 적용되고, `class="ph ph-color"`이면 원본 색으로 보입니다.

**색상·간격**
`assets/css/site.css` 맨 위의 `.site.t-light`(라이트 테마), `.site.t-dark`(다크 테마) 변수에서 주요 색을 바꿀 수 있습니다. 메인 라임색은 `#BEFF6A`입니다.

**오시는 길 지도 (company.html)**
`<div class="map-card">` 안의 `.map-ph` 블록을 카카오맵 '지도 퍼가기' 또는 네이버 지도의 iframe 코드로 바꾸면 실제 지도가 표시됩니다.

**문의 메일 받는 주소 (contact.html)**
문의하기는 서버 없이 방문자의 메일 앱을 여는 방식입니다. 받는 주소는 `contact.html` 맨 아래 `<script id="page-data">` 안의 `"email"` 값입니다.

**에러 코드 목록 (developers.html)**
목록이 HTML에 모두 들어 있습니다(`<ul class="err-list">`). 검색과 '더 보기'는 site.js가 처리합니다.

**링크 공유 썸네일**
카카오톡·슬랙 등에 링크를 붙였을 때 보이는 이미지는 `assets/img/og-image.jpg`(1200×630)입니다. 같은 이름으로 덮어쓰면 바뀝니다.
각 HTML의 `og:image`·`og:url`은 `https://www.linkpayment.co.kr/` 기준 주소라, 다른 도메인에 올리면 그 주소로 바꿔야 썸네일이 보입니다. 메신저는 이미지를 캐시하므로, 바꾼 뒤 바로 반영되지 않으면 각 서비스의 캐시 초기화 도구를 쓰세요.

## 동작 규칙 (site.js)

HTML의 속성으로 동작을 연결합니다. 이 속성은 지우지 마세요.

| 속성 | 의미 |
| --- | --- |
| `data-act="..."` | 버튼 동작 (예: `toggleTheme` 테마 전환, `toggleMenu` 모바일 메뉴, `v.toggle` 메인 아코디언, `q.toggle` FAQ, `f.pick` 결제 서비스 필터, `st.pick` LinkU 단계, `u.pick`·`t.pick` 솔루션 탭) |
| `data-when="..."` + `hidden` | 상태에 따라 보이고 숨는 블록 (예: 메뉴 열림, 문의 유형별 입력 항목, 오류 문구) |
| `data-i="0"` | 목록에서의 순번 |
| `<script type="application/json" id="page-data">` | 페이지 동작에 필요한 데이터 (결제 서비스 분류, 솔루션 탭 화면, 문의 유형) |

움직이는 요소:
- 메인·회사소개 히어로의 0/1 유리 심볼 (`<canvas id="ascii-logo">`)
- 결제 서비스 히어로의 회전 카드 0/1 (`.tap-scene`, 원본 프레임은 `assets/img/card-spin-sheet.webp`)
- 메인 LinkU 섹션의 휴대폰 화면 자동 넘김 (3.2초)
- 기기에서 '동작 줄이기'를 켜면 모두 멈춘 화면으로 보입니다.

## 참고

- 한국어 전용입니다(언어 전환 버튼은 뺐습니다).
- 테마는 라이트가 기본이고, 방문자가 바꾸면 브라우저에 기억됩니다.
- 글꼴은 Google Fonts의 Noto Sans KR을 불러옵니다.
