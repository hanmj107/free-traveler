---
version: D-001
name: Free-Traveler-design-system
description: Free Traveler의 공식 디자인 정본(canonical design reference). 흰 배경과 짙은 잉크 텍스트를 기본으로 하고, 코랄(#FF6B4A) 한 가지 포인트 컬러만 Primary CTA·활성 탭·강조 요소에 절제해서 사용하는 여행 정보 서비스 디자인 시스템이다. Airbnb류 마켓플레이스의 레이아웃 밀도, 단일 포인트 컬러 운용, 카드 중심 그리드, 단일 shadow tier, 라운드 코너 형태 언어를 구조적으로만 참고했으며, Airbnb의 정확한 색상값·서체·워드마크·배지 문구·예약/결제 UI는 재현하지 않는다. 이 문서는 `docs/04_UIUX_PLAN.md`와 승인된 Stitch 화면(SCR-001~SCR-005)을 기준으로 고정(LOCKED)된 디자인 정본이며, 이후 화면 작업은 이 문서의 토큰과 규칙을 따른다.

colors:
  canvas: "#FFFFFF"
  surface-soft: "#F7F7F8"
  surface-strong: "#F1F1F3"
  ink: "#23262B"
  body: "#4B505A"
  muted: "#767B85"
  hairline: "#E4E6EA"
  border-strong: "#C7CBD1"
  coral: "#FF6B4A"
  coral-active: "#E14E2E"
  coral-tint: "#FFE4DA"
  on-coral: "#FFFFFF"
  error: "#DC2626"
  warning-text: "#854D0E"
  warning-bg: "#FEF9C3"
  danger-text: "#B91C1C"
  danger-bg: "#FEE2E2"
  success-text: "#15803D"
  success-bg: "#ECFDF5"
  info-link: "#2563EB"

typography:
  display-lg:
    fontFamily: "'Inter', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 40px
    fontSizeMobile: 28px
    fontWeight: 700
  display-md:
    fontFamily: "'Inter', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 28px
    fontSizeMobile: 22px
    fontWeight: 700
  title-lg:
    fontSize: 20px
    fontSizeMobile: 18px
    fontWeight: 600
  title-md:
    fontSize: 17px
    fontSizeMobile: 16px
    fontWeight: 600
  body-lg:
    fontSize: 17px
    fontSizeMobile: 16px
    fontWeight: 400
  body-md:
    fontSize: 15px
    fontSizeMobile: 15px
    fontWeight: 400
  body-sm:
    fontSize: 13px
    fontSizeMobile: 13px
    fontWeight: 400
  label:
    fontSize: 13px
    fontSizeMobile: 13px
    fontWeight: 600
  button:
    fontSize: 16px
    fontSizeMobile: 16px
    fontWeight: 600

rounded:
  sm: 8px
  md: 12px
  lg: 20px
  full: 9999px

spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 24px
  space-6: 32px
  space-7: 48px
  space-8: 64px
  space-9: 96px

shadow:
  tier-1: "0 1px 2px rgba(16,24,32,.04), 0 8px 24px rgba(16,24,32,.08)"

components:
  header-desktop:
    height: 72px
    background: "{colors.canvas}"
  header-mobile:
    height: 56px
    background: "{colors.canvas}"
  footer:
    background: "{colors.canvas}"
    columns: 3
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    rounded: "{rounded.sm}"
    minHeight: 44px
  button-primary-active:
    backgroundColor: "{colors.coral-active}"
  button-primary-disabled:
    backgroundColor: "{colors.coral-tint}"
  search-bar-pill:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.full}"
  chip:
    backgroundColor: "{colors.surface-strong}"
    rounded: "{rounded.full}"
  chip-selected:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
  destination-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
    hoverShadow: "{shadow.tier-1}"
  mate-post-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
  drawer-desktop:
    width: "480px-560px"
    rounded: "{rounded.lg} (상단 모서리만)"
  drawer-mobile:
    type: "Bottom Sheet (전체 화면)"
  toast:
    rounded: "{rounded.sm}"
    shadow: "{shadow.tier-1}"
  tab-pill:
    rounded: "{rounded.full}"
    activeIndicator: "coral underline 또는 coral fill"
---

## 1. Overview — Visual Theme

Free Traveler는 **흰 배경(90%) + 잉크색 텍스트 + 코랄 포인트 컬러(한두 곳)** 로 구성되는 절제된 여행 정보 서비스 디자인이다. 화면의 시각적 무게는 타이포그래피가 아니라 **여행지 사진**이 담당하며, 텍스트는 절제된 크기와 무게를 유지한다. 형태 언어는 부드러운 라운드 코너(카드 12px, 버튼 8px, Hero/대형 카드 20px, 검색바·칩·탭은 완전한 pill)로 통일하고, 각진 요소는 그리드 자체에만 남긴다.

이 문서는 `design-reference/vendor/airbnb/DESIGN.md`(Airbnb 참고본)의 **구조적 원칙**(레이아웃 밀도, 단일 포인트 컬러 운용, 카드 중심 그리드, 단일 shadow tier, 라운드 코너 형태 언어)만 차용했다. Airbnb의 정확한 색상값(#ff385c 등), Cereal 서체, 3-product 내비게이션, "Guest favorite" 배지, 예약/결제 플로우는 어떤 형태로도 재현하지 않는다.

**핵심 특징**
- 단일 포인트 컬러: `{colors.coral}` (#FF6B4A)가 Primary CTA, 활성 탭 밑줄, 선택 상태, 브랜드 강조를 전담한다. 화면의 90%는 흰색+잉크이며, 코랄은 한두 곳에서만 등장한다.
- 사진 우선: 여행지·대표 소개 Section은 사진이 시각적 무게를 담당하고, 타이포그래피는 절제한다.
- 단일 shadow tier: `{shadow.tier-1}` 하나만 존재하며 카드 hover, Drawer/Modal, 드롭다운에만 적용한다. 그 외 표면은 flat이다.
- 완성된 한국어 문장: 모든 제목·설명은 Lorem ipsum이나 "준비 중" 같은 placeholder 없이 완성된 한국어 문장으로 작성한다.

---

## 2. Color Token

| 토큰 | 값 | 용도 |
|---|---|---|
| `{colors.canvas}` | #FFFFFF | 페이지 기본 배경 |
| `{colors.surface-soft}` | #F7F7F8 | 섹션 배경 밴드, 비활성 필드 |
| `{colors.surface-strong}` | #F1F1F3 | 카드 대체 배경, 칩 기본 배경 |
| `{colors.ink}` | #23262B | 제목·기본 텍스트(순수 검정 아님) |
| `{colors.body}` | #4B505A | 본문 문단 |
| `{colors.muted}` | #767B85 | 메타 정보, 보조 라벨, 비활성 텍스트 |
| `{colors.hairline}` | #E4E6EA | 1px 구분선, 카드 테두리 |
| `{colors.border-strong}` | #C7CBD1 | 입력 포커스 이전 강조 테두리 |
| **`{colors.coral}`** | **#FF6B4A** | **브랜드 유일 포인트 컬러.** Primary CTA, 활성 탭 밑줄, 선택 상태 |
| `{colors.coral-active}` | #E14E2E | 코랄 버튼 press/hover |
| `{colors.coral-tint}` | #FFE4DA | 코랄 비활성/저강도 배경 |
| `{colors.on-coral}` | #FFFFFF | 코랄 배경 위 텍스트(항상 흰색, 16px 이상 굵게) |
| `{colors.error}` | #DC2626 | 폼 검증 실패, 파괴적 동작 확인 |
| `{colors.warning-text}` / `{colors.warning-bg}` | #854D0E / #FEF9C3 | 주의 배너(안전정보 확인일 경과 등) |
| `{colors.danger-text}` / `{colors.danger-bg}` | #B91C1C / #FEE2E2 | 중대 경보 배너(여행금지·출국권고) — 항상 아이콘+텍스트 병기 |
| `{colors.success-text}` / `{colors.success-bg}` | #15803D / #ECFDF5 | 참가 승인, 신고 접수 완료 등 확인 상태 |
| `{colors.info-link}` | #2563EB | 외교부 등 공식 출처 외부 링크 |

**규칙:** 코랄 배경 위에는 항상 흰 텍스트만 사용한다. 경보·오류·성공 상태는 배경색만으로 의미를 전달하지 않고 항상 아이콘·텍스트 라벨을 함께 표기한다. **이 표에 없는 임의의 색상값을 새로 추가하지 않는다** — 새 색이 필요하면 이 문서를 개정(버전 상향)해서 토큰으로 등록한 뒤에만 사용한다.

---

## 3. Typography

폰트 스택: `'Inter', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif`. Inter는 오픈소스 웹폰트(Google Fonts)로 라이선스 파일 배포 없이 CDN/시스템 폴백으로만 사용하며, **Proprietary(독점) 폰트 파일을 프로젝트에 포함하지 않는다.** 숫자·영문은 Inter로, 한글 본문은 시스템 한글 폰트(Apple SD Gothic Neo / Malgun Gothic / Noto Sans KR)로 자동 대체된다.

| 토큰 | Desktop | Mobile | 굵기 | 용도 |
|---|---|---|---|---|
| `{typography.display-lg}` | 40px | 28px | 700 | Hero 타이틀(SCR-001, SCR-002) |
| `{typography.display-md}` | 28px | 22px | 700 | Section 제목(H2) |
| `{typography.title-lg}` | 20px | 18px | 600 | 카드 제목, 서브섹션 제목 |
| `{typography.title-md}` | 17px | 16px | 600 | 컴포넌트 제목, 폼 라벨 그룹 |
| `{typography.body-lg}` | 17px | 16px | 400 | Section 설명 문단(1~3문장) |
| `{typography.body-md}` | 15px | 15px | 400 | 기본 본문, 카드 설명 |
| `{typography.body-sm}` | 13px | 13px | 400 | 메타 정보(날짜, 지역, 상태) |
| `{typography.label}` | 13px | 13px | 600 | 칩, 배지, 필터 라벨 |
| `{typography.button}` | 16px | 16px | 600 | 버튼 레이블 |

---

## 4. Spacing

8px(중간값 4px) 기반 스케일: `{spacing.space-1}` 4 · `{spacing.space-2}` 8 · `{spacing.space-3}` 12 · `{spacing.space-4}` 16 · `{spacing.space-5}` 24 · `{spacing.space-6}` 32 · `{spacing.space-7}` 48 · `{spacing.space-8}` 64 · `{spacing.space-9}` 96px.

- Desktop Section 상하 여백: 64~96px(`{spacing.space-8}`~`{spacing.space-9}`)
- Mobile Section 상하 여백: 40~64px
- 카드 내부 패딩: 16~24px, 카드 간 gutter: 16~24px
- 터치 영역: 모든 인터랙티브 요소 최소 44×44px

---

## 5. Radius (Shape)

| 토큰 | 값 | 용도 |
|---|---|---|
| `{rounded.sm}` | 8px | 입력창, 작은 버튼 |
| `{rounded.md}` | 12px | 카드(Destination Card, Mate Post Card 등) |
| `{rounded.lg}` | 20px | Hero 패널, 대형 카드, Drawer 상단 모서리 |
| `{rounded.full}` | 9999px | 검색바, 칩, 탭 |

각진 모서리는 그리드 자체(레이아웃 컬럼 정렬)에만 남기고, 모든 인터랙티브 요소·카드·표면은 위 4개 토큰 중 하나를 사용한다.

---

## 6. Shadow (Elevation)

시스템에는 **단 하나의 shadow tier**만 존재한다.

- `{shadow.tier-1}`: `0 1px 2px rgba(16,24,32,.04), 0 8px 24px rgba(16,24,32,.08)`
- 적용 대상: 카드 hover, Drawer/Modal, 드롭다운
- 그 외 모든 표면(Header, Footer, Hero, Section 배경)은 **flat**(그림자 없음)로 유지한다. 2단계 이상의 elevation tier를 새로 만들지 않는다.

---

## 7. Desktop·Mobile 규칙

| 항목 | Desktop 1440 | Mobile 390 |
|---|---|---|
| Page Section 콘텐츠 최대 폭 | 1200~1280px 중앙 정렬 | 100% - 좌우 여백 20px |
| Section 상하 여백 | 64~96px | 40~64px |
| Header 높이 | 72px, 스크롤 시 sticky | 56px, 스크롤 시 sticky |
| Card Grid 열 수 | 4열(여행지·안전정보), 3열(요약형) | 1열 |
| 내비게이션 | 인라인 4개 링크 | 햄버거 시트 |
| SCR-001 Drawer | 우측 슬라이드 패널(480~560px) | 전체 화면 Bottom Sheet |
| SCR-003 조건입력 Section | 폼+요약 좌우 분할 | 폼 → 요약 세로 스택 |
| SCR-004 목록-상세 | 좌우 분할 | 목록 → 상세 Drawer |
| 터치 영역 | 44px 이상 | 44px 이상(동일 기준) |

**Hero 높이 규칙:** Hero는 Desktop 1440px 뷰포트 기준 **화면 전체 높이를 차지하지 않는다.** 약 560~600px(승인된 SCR-001 기준 실측값 580px)로 제한하여, 뷰포트 높이 900px 기준으로 **다음 Section 상단이 120~150px 미리 보이도록** 구성한다. Mobile Hero는 이 규칙을 유지하되 절대 높이는 화면 폭에 비례해 축소한다. Hero 아래에 큰 빈 여백을 두지 않고 곧바로 다음 Section이 이어지는지 매 화면마다 확인한다.

---

## 8. Section별 제목·설명·본문·CTA 계층과 시각적 리듬

모든 Section은 다음 4단 계층을 이 순서로 갖는다.

1. **제목**(`{typography.display-md}`, H2) — 완성된 한국어 문장 또는 명사구
2. **설명**(`{typography.body-lg}`, 1~3문장) — 왜 이 Section이 존재하는지, 무엇을 할 수 있는지
3. **본문**(Card Grid / Chip 목록 / Timeline / Gallery / Form 등 실제 콘텐츠)
4. **CTA**(선택) — 다음 행동으로 연결하는 버튼 또는 링크

**시각적 리듬:** 같은 형태의 Card만 연속으로 반복하지 않는다. 한 화면 안에서 **패턴 팔레트**(Hero / Card Grid / 좌우 분할 / Chip 목록 / 3단계 안내 / CTA Banner / Timeline / Gallery)를 Section마다 교차 사용해 리듬을 만든다. 두 Section이 연속으로 동일한 그리드 열 수·카드 비율을 쓰지 않도록 구성한다.

---

## 9. Header · Footer

### Header (공통, 5개 화면 모두 동일)

| 영역 | Desktop(1440) | Mobile(390) |
|---|---|---|
| 높이 | `{component.header-desktop}` 72px, sticky | `{component.header-mobile}` 56px, sticky |
| 좌측 | 코랄 점 아이콘 + 잉크색 "Free Traveler" 워드마크 → `/` | 축약 워드마크 |
| 중앙 | 내비 4개(홈·대표 소개·여행 준비·동행 찾기), 현재 위치는 코랄 밑줄 | 숨김(햄버거 시트) |
| 우측 | 계정 진입 버튼(비로그인 "로그인", 로그인 시 닉네임 이니셜 아바타 + 관리자 배지) | 계정 아이콘 + 햄버거 |
| 모바일 시트 | — | 4개 내비 링크 전체 폭 리스트, 항목당 44px 이상 |

### Footer (공통, 정확히 3컬럼 + 하단 바)

1. **Free Traveler 소개** — "50회 이상의 자유여행, 30개국 이상의 경험을 바탕으로 여행 준비를 돕는 서비스입니다." 1문장 + `/about` 링크
2. **바로가기** — 홈 · 대표 소개 · 여행 준비 · 동행 찾기 · 계정(로그인 상태에 따라 라벨 변경), 정확히 5개 링크만
3. **이용 안내** — "항공·숙소 링크는 외부 사이트로 연결되며 예약을 대행하지 않습니다.", "국가별 안전정보는 외교부 해외안전여행 공식 자료를 기준으로 확인일을 표기합니다." 2문장, **링크를 넣지 않는다**
4. 하단 바: "© 2026 Free Traveler" 저작권 문구만

**규칙(STITCH_VALIDATION_REPORT.md에서 확인된 위반 사례 반영):** 이용약관·개인정보처리방침·고객센터·서비스 가이드 등 **실제로 존재하지 않는 페이지로 연결되는 링크나 컬럼을 추가하지 않는다.** Footer는 위 3컬럼 구조를 벗어나지 않는다. Desktop은 3컬럼 그리드, Mobile은 세로 스택(아코디언 없이 순서대로).

---

## 10. Search · Filter

- **검색바(SCR-001 Hero):** `{component.search-bar-pill}` — 흰 배경, `{rounded.full}`, 도시·국가 입력. 입력 후 여행지 목록 결과로 스크롤 이동.
- **테마/스타일 Chip(SCR-001 §4, SCR-004 §2):** `{component.chip}` 기본 상태(surface-strong 배경), `{component.chip-selected}` 선택 상태(코랄 배경 + 흰 텍스트). 최소 44px 터치 높이.
- **Filter 결과 요약:** 필터 적용 시 "조건에 맞는 모집글 N건" 형태의 결과 요약 텍스트를 Chip 목록 바로 아래에 표기한다. 0건일 때는 §14 Empty State 규칙을 따른다.

---

## 11. Destination Card

여행지 카드(SCR-001 국내/해외 인기 여행지, SCR-002 기억에 남는 여행지)의 공통 규격.

- 구조: `{component.destination-card}` — 사진(고정 비율) → 제목 → 메타(태그·추천 시기·안전등급 배지) → (선택) CTA
- 표면: 흰 배경, `{rounded.md}`, 기본은 `{colors.hairline}` 1px 테두리(flat), hover 시에만 `{shadow.tier-1}` 적용
- 그리드: Desktop 4열(여행지) 또는 3열(요약형), Mobile 1열
- 클릭 시 같은 화면 위에서 상세 Drawer(§13)를 연다

---

## 12. Form · Tabs

### Tabs (SCR-003 기준)

- 3개 이상의 탭은 `{component.tab-pill}`로 구현하며, **실제 클릭 가능한 `<button>` 요소**로 만든다(단순 텍스트 나열 금지).
- 활성 탭: 코랄 배경 채움(pill) 또는 코랄 밑줄 중 하나로 명확히 구분한다.
- 비활성 탭: `{colors.muted}` 텍스트, 배경 없음.
- 예: SCR-003의 "항공편 / 숙소 / 동행 구하기" — 3개 탭 모두 존재해야 하며, 입력값·검증 상태·완료 상태를 탭 간 완전히 분리해서 관리한다(탭 전환 시 다른 탭 입력이 섞이지 않는다).

### Form

- 입력창: `{rounded.sm}`, 흰 배경, 포커스 시 2px 코랄 또는 잉크 아웃라인(`outline-offset: 2px`)
- 실시간 요약 미리보기: Desktop은 폼 좌측 + 요약 우측 좌우 분할, Mobile은 폼 → 요약 순서의 세로 스택
- 필드별 실시간 오류 메시지는 `{colors.error}`로 표기하고 `aria-describedby`로 필드와 연결한다

---

## 13. Mate Post Card

동행 모집글 카드(SCR-001 최근 동행글, SCR-004 목록)의 공통 규격.

- 구조: `{component.mate-post-card}` — 국가·지역·기간 → 여행 스타일 태그 → 모집중/마감 상태 배지 → 작성자 닉네임(연락처는 절대 노출하지 않는다)
- 표면: 흰 배경, `{rounded.md}`, `{colors.hairline}` 테두리
- SCR-004 목록-상세: Desktop은 좌측 카드 목록(최대 8개 우선 노출) + 우측 상세 패널 좌우 분할, Mobile은 카드 선택 시 하단 전체 화면 Drawer로 상세를 연다
- 참가 요청·신고·차단 등 파괴적/민감 동작 버튼은 `{colors.error}` 또는 확인 모달을 동반한다

---

## 14. Drawer · Modal

- **Desktop:** 화면 우측에서 슬라이드인, 폭 480~560px(`{component.drawer-desktop}`), 상단 모서리 `{rounded.lg}`, `{shadow.tier-1}` 적용
- **Mobile:** 전체 화면 Bottom Sheet(`{component.drawer-mobile}`)로 전환
- 용도: 여행지 상세(11개 필수 콘텐츠: 소개·대표이미지·명소·추천시기·일정·예산·교통·음식·에티켓·안전정보 연결·출처), 국가별 안전정보 패널(같은 Drawer 안에서 전환), SCR-004 Mobile 상세
- Modal 배경(scrim)은 `rgba(0,0,0,.5)` 고정 톤을 사용하고, Drawer/Modal에만 `{shadow.tier-1}`을 적용한다(그 외 표면은 flat 유지)

---

## 15. Alert · Toast

| 유형 | 배경/텍스트 토큰 | 사용처 |
|---|---|---|
| 주의(Warning) | `{colors.warning-bg}` / `{colors.warning-text}` | 안전정보 확인일 경과 배너 |
| 중대 경보(Danger) | `{colors.danger-bg}` / `{colors.danger-text}` | 여행금지·출국권고 — 항상 아이콘+텍스트 라벨 병기 |
| 성공(Success) | `{colors.success-bg}` / `{colors.success-text}` | 참가 요청 승인, 신고 접수 완료, 동행글 등록 완료 Toast |
| 오류(Error) | `{colors.error}` 텍스트 + 흰/연한 배경 | 폼 검증 실패, 링크 이동 실패, 중복 요청 |

Toast(`{component.toast}`)는 `{rounded.sm}` + `{shadow.tier-1}`을 적용하고 화면 하단 또는 상단에 짧게 노출한 뒤 사라진다. **색상만으로 상태를 구분하지 않고 항상 아이콘·텍스트 라벨을 함께 표기한다**(REQ-NFR-ACC-004).

---

## 16. Loading · Empty · Error 상태

| 상태 | 처리 |
|---|---|
| Loading | 카드형 콘텐츠는 카드 자리에 스켈레톤 블록, 버튼 액션은 비활성화 + 스피너 |
| Empty | §17의 완성형 Empty State 규칙을 따른다 |
| Error | 상황을 설명하는 한 문장 + 재시도(새로고침) 버튼. 예: "동행글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." |
| Unauthorized | 로그인 유도 카드 또는 해당 화면의 Guest 버전으로 대체 표시(빈 화면·백지 리다이렉트 금지) |

---

## 17. 완성형 Empty State와 Placeholder 문구 금지 규칙

**Empty State 규칙:** 서버/DB 데이터가 없는 상태에도 다음 3가지를 **항상 함께** 표시한다.
1. **상황 설명** — 무엇이 비어있는지 한 문장
2. **이용 방법** — 어떻게 하면 채워지는지(예: 로그인 후 작성)
3. **다음 행동 CTA** — 실제로 누를 수 있는 버튼

빈 카드나 아이콘 하나만 덩그러니 두는 것을 금지한다. (승인된 SCR-001 §6 "최근 동행글" Empty State가 이 규칙의 기준 예시다: "아직 등록된 동행 모집글이 없습니다." + "동행 모집은 로그인 후 국가·기간·여행 스타일을 입력해 작성할 수 있습니다." + "동행 모집글 작성하기" CTA.)

**Placeholder 문구 금지:** 아래 문구·패턴을 어떤 화면에도 사용하지 않는다.
- "Lorem ipsum" 및 그 변형
- "준비 중"
- "정보 확인 필요"
- 의미 없는 반복 문구, 내용 없는 빈 카드, 과도한 빈 여백

모든 제목·설명·카드 본문은 **완성된 한국어 문장**으로 작성한다.

---

## 18. 화면별 Section 순서와 Card·Timeline·Gallery 최소 콘텐츠 수

아래는 `docs/04_UIUX_PLAN.md`와 승인된 Stitch 화면을 기준으로 고정된 화면별 계약이다. Section 순서를 바꾸거나 최소 콘텐츠 수를 줄이지 않는다.

### SCR-001 `/` 메인 (7 Sections)
Hero(검색, 높이 ~580px) → 국내 인기 여행지(카드 6개) → 해외 인기 여행지(카드 6개) → 여행 동기·테마(Chip 6개) → 국가별 주의사항(카드 6개) → 최근 동행글(카드 3개 또는 완성형 Empty State) → free_traveler 요약(좌우 분할 + CTA Banner)

### SCR-002 `/about` 대표 소개 (7 Sections)
Hero → 여행 지표(숫자 카드 2개: 50+ Trips / 30+ Countries) → 소개·철학(좌우 분할) → 여행 Timeline(순차 항목 **6개 이상**) → 방문 국가(Chip, **30개국** 4개 권역) → 여행 사진 Gallery(**8장 이상**) → 기억에 남는 여행지(카드 **4개** + CTA Banner)

### SCR-003 `/travel-tools` 통합 여행 준비 (6 Sections, 3탭 구조)
Intro(3단계 안내) → 탭(항공편/숙소/동행 구하기, **3개 모두 클릭 가능한 버튼**) → 조건 입력 Form(좌우 분할: 폼 + 실시간 요약 미리보기) → 요약·이동 Action Card → 고지·Tip(카드 **3개**) → 동행 작성(로그인 유도 또는 작성 폼 + 안전 안내)

### SCR-004 `/mates` 동행 조회 (6 Sections)
Intro(CTA Banner) → 검색 Filter(Chip + 결과 요약) → 모집글 목록(카드 **최대 8개**) → 목록-상세 좌우 분할(Desktop) / Drawer(Mobile) → 참가 방법 안내(3단계) → 안전 안내(CTA Banner)

### SCR-005 `/account` 계정·관리 (역할 기반)
- **Guest:** Intro(축소 Hero) → 계정 Card(로그인/회원가입/재설정, **카드 3개**) → 로그인 후 기능 Chip(**3개**) → 보안 안내 텍스트 Card
- **Member:** 탭(프로필 / 내 활동) — 내 활동은 ①내가 쓴 동행글 ②참가 요청 관리 ③차단 목록 ④CTA Banner, 각 항목 데이터 없으면 §17 Empty State 규칙 적용
- **Admin:** Member 탭 + "관리자" 탭 — Intro + 신고 목록(리스트/표) + 외부 URL 설정 Form. **차트·통계 Dashboard는 만들지 않는다.**

---

## 19. Do / Do Not

### Do
- 코랄(`{colors.coral}`) 한 가지 포인트 컬러만 Primary CTA·활성 상태에 사용한다
- 모든 Section에 제목·설명·본문(또는 CTA)을 완성된 한국어 문장으로 채운다
- Empty State는 항상 상황 설명 + 이용 방법 + CTA 3요소를 함께 표시한다
- Hero 높이를 560~600px로 제한해 다음 Section이 미리 보이게 한다
- Card Grid, 좌우 분할, Chip 목록, 3단계 안내, CTA Banner, Timeline, Gallery 패턴을 화면 내에서 교차 사용한다
- 경보·오류·성공 상태는 색상 + 아이콘 + 텍스트 라벨을 항상 함께 표기한다
- 이 문서에 정의된 토큰(`{colors.*}`, `{typography.*}`, `{rounded.*}`, `{spacing.*}`, `{shadow.*}`)만 사용한다

### Do Not
- **Airbnb 상표 요소를 재현하지 않는다** — 정확한 색상값(#ff385c 등), Cereal/Circular 서체, 워드마크 형태, "NEW"/"Guest favorite" 등 배지 문구·형태를 복제하지 않는다
- **구매·예약·결제 UI를 만들지 않는다** — 항공·숙소는 외부 사이트로 연결만 하고 예약/결제/장바구니/가격 비교 UI를 자체 구현하지 않는다
- **Proprietary(독점) 폰트 파일을 추가하지 않는다** — Inter(오픈소스)와 시스템 한글 폰트 폴백만 사용한다
- **이 문서에 없는 임의의 색상을 추가하지 않는다** — 새 색상이 필요하면 이 문서를 개정한 뒤에만 사용한다
- 실제로 존재하지 않는 페이지로 연결되는 링크(이용약관, 개인정보처리방침, 고객센터 등)를 Footer나 다른 곳에 추가하지 않는다
- 별점(rating star), 실시간 항공권/호텔 가격, 광고 배너를 추가하지 않는다
- Lorem ipsum, "준비 중", "정보 확인 필요" 같은 placeholder 문구나 내용 없는 빈 카드를 사용하지 않는다
- SCR-005 관리자 탭에 차트·통계 Dashboard를 만들지 않는다
- 같은 형태의 Card만 화면 전체에서 반복하지 않는다(시각적 리듬 규칙 위반)
