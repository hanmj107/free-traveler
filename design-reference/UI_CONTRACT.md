# Free Traveler — UI Contract (Next.js App Router)

- **문서 ID:** UI-CONTRACT-001
- **작성일:** 2026-09-15
- **참고 문서:** `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`
- **목적:** 승인된 5개 Screen(SCR-001~SCR-005)을 Next.js App Router 구현 계약으로 고정한다. 이 문서와 `design-reference/SCREEN_ROUTE_CONTRACT.json`은 항상 함께 갱신하며, 서로 모순되지 않아야 한다.
- **현재 `src/app` 상태:** `src/app/page.tsx`는 아직 Create Next App 기본 스타터(starter) 템플릿이다. SCR-001 구현 시 이 스타터 콘텐츠(Next.js 로고, "To get started..." 문구, Deploy/Documentation 링크)를 전부 제거해야 한다.

---

## SCR-001 — 메인

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-001 |
| **Route** | `/` |
| **Page Entry** | `src/app/page.tsx` |
| **영역 순서** | Header(공통) → ①검색 Hero(~580px) → ②국내 인기 여행지(카드 6) → ③해외 인기 여행지(카드 6) → ④여행 동기·테마(Chip 6) → ⑤국가별 주의사항(카드 6) → ⑥최근 동행글(카드 3 또는 Empty State) → ⑦free_traveler 요약(좌우 분할+CTA) → Footer(공통) |
| **주요 Component** | Header·Footer(공통), Search Bar(pill), Destination Card(§11 D-001, 국내/해외 공용), Theme Chip, 안전정보 컴팩트 카드, Mate Post Card(요약형, Section 6), 여행지 상세 Drawer/Modal(11개 필수 콘텐츠: 소개·대표이미지·명소·추천시기·일정·예산·교통·음식·에티켓·안전정보 연결·출처), 안전정보 패널(같은 Drawer 내 전환) |
| **상태** | Loading: Section 6 동행글 카드 3개 자리 스켈레톤(Supabase 조회) · Success: 전체 정상 렌더링 · Empty: Section 4 필터 결과 0건 / Section 6 동행글 0건 → 완성형 Empty State(D-001 §17) · Error: Section 6 조회 실패 시 "동행글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." + 새로고침 · Unauthorized: 해당 없음(전체 공개) |
| **사용자 행동** | 도시·국가 검색 → 목록으로 스크롤 · 테마 Chip 선택 → 필터 적용된 목록으로 스크롤 · 여행지 카드 클릭 → 상세 Drawer 오픈 · 안전정보 카드 클릭 또는 Drawer 내 "국가별 주의사항 보기" → 안전정보 패널로 전환 · 즐겨찾기 저장(localStorage) · 안전정보 내 공식 출처 링크 클릭(새 탭) |
| **다른 화면으로의 이동** | Drawer 내 "항공/숙소 알아보기" CTA → SCR-003(국가값 사전 입력) · 안전정보 공식 출처 링크 → 외부 사이트(새 탭, `noopener noreferrer`) · Section 7 "대표 소개 보기" → SCR-002 · Section 6 "동행 모집글 작성하기"(Empty State CTA) → SCR-003(동행 구하기 탭) · Header 내비 → SCR-002/003/004, 계정 버튼 → SCR-005 |
| **Desktop·Mobile 규칙** | Desktop: Hero 580px(다음 Section 120~150px 미리 보임), Card Grid 4열, Drawer는 우측 슬라이드 480~560px · Mobile: Hero 비율 축소, Card 1열, Drawer는 전체 화면 Bottom Sheet, 내비는 햄버거 시트 |
| **금지 기능** | Airbnb 상표 요소, 예약/결제 UI, 별점·실시간 항공권/호텔 가격·광고 배너, Lorem ipsum/준비 중/정보 확인 필요 등 placeholder, Footer의 존재하지 않는 페이지 링크(이용약관 등), **Create Next App 기본 스타터 콘텐츠 잔존**(`starter_template_forbidden`) |

---

## SCR-002 — 대표 소개

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-002 |
| **Route** | `/about` |
| **Page Entry** | `src/app/about/page.tsx` |
| **영역 순서** | Header(공통) → ①대표 Hero → ②여행 지표(50+ Trips/30+ Countries) → ③소개·철학(좌우 분할) → ④여행 Timeline(6개 이상) → ⑤방문 국가(Chip, 30개국·4개 권역) → ⑥여행 사진 Gallery(8장 이상) → ⑦기억에 남는 여행지(카드 4+CTA Banner) → Footer(공통) |
| **주요 Component** | Header·Footer(공통), 숫자 강조 카드(2개), 좌우 분할 프로필 블록, Timeline 리스트, 권역별 Chip 목록, Photo Gallery Card, Destination Card(4개, §11 D-001), CTA Banner(2버튼) |
| **상태** | 전체 정적 콘텐츠(`src/data`)이므로 Loading·Empty·Unauthorized 해당 없음 · Error: 이미지 로드 실패 시 대체 배경 + alt 텍스트만 표시 |
| **사용자 행동** | 방문 국가 Chip 클릭 → 관련 여행지 또는 방문 기록으로 이동 · Gallery 이미지 열람(대체텍스트·촬영시기·출처 캡션 확인) · 추천 여행지 카드 클릭 |
| **다른 화면으로의 이동** | 방문 국가 Chip·추천 여행지 카드 → SCR-001(해당 여행지 상세 Drawer) · CTA Banner "여행 조건 정리하기" → SCR-003 · CTA Banner "동행 찾아보기" → SCR-004 |
| **Desktop·Mobile 규칙** | Desktop: 좌우 분할 유지, Gallery 4열, Timeline 세로 순차 · Mobile: 좌우 분할 → 세로 스택, Gallery 2열, Timeline 세로 순차 유지 |
| **금지 기능** | Airbnb 상표 요소, 예약/결제 UI, 별점·광고, placeholder 문구, Footer 존재하지 않는 페이지 링크, 실제 인물 얼굴이 특정되는 이미지 오인 유발 표현 |

---

## SCR-003 — 통합 여행 준비

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-003 |
| **Route** | `/travel-tools` |
| **Page Entry** | `src/app/travel-tools/page.tsx` |
| **영역 순서** | Header(공통) → ①Intro(3단계 안내) → ②탭 네비게이션(항공편/숙소/동행 구하기) → [항공편·숙소 탭] ③조건 입력 Form(좌우 분할)+실시간 요약 → ④요약·이동 Action Card → ⑤고지·Tip(카드 3) / [동행 구하기 탭] ⑥동행 작성 Form 또는 로그인 유도+안전 안내(좌우 분할) → Footer(공통) |
| **주요 Component** | Header·Footer(공통), Tab(pill, `<button>` 3개, 활성 상태 명확 구분), Form Input(국가·지역·날짜), 실시간 요약 미리보기 카드, Action Card(외부 이동 CTA), Tip Card(3개), 동행 작성 Form(국가·지역·기간·스타일·소개글, 연락처 탐지 경고), 안전수칙 사이드 패널, 로그인 유도 카드 |
| **상태** | Loading: 외부 URL 설정값 조회 지연 시 버튼 비활성+스피너 · Success: 요약 확인/등록 완료 시 Toast → SCR-004로 이동 · Empty: 해당 없음(폼 기반) · Error: 필드별 검증 오류(aria-describedby 연결), 외부 링크 오류+재시도, 연락처 탐지 시 제출 차단 경고 · Unauthorized: 동행 탭 비로그인/성인 미확인 시 작성 폼 비노출 + 로그인 유도 카드로 대체 |
| **사용자 행동** | 탭 전환(항공편/숙소/동행 구하기 — 탭별 입력·검증·완료 상태 완전 분리) · 국가·지역/날짜 입력 → 실시간 요약 갱신 · "항공편/숙소 보러 가기" 클릭(새 탭 이동) · 동행 모집글 작성 후 제출 · 로그인 필요 시 로그인 CTA 클릭 |
| **다른 화면으로의 이동** | 항공/숙소 "보러 가기" → 외부 사이트(새 탭, `noopener noreferrer`) · 동행 작성 완료 → SCR-004(작성한 모집글 상세 패널) · 동행 탭에서 미인증 상태로 작성 시도 → SCR-005(로그인·성인확인) · SCR-001에서 국가값을 들고 진입 시 항공/숙소 탭에 사전 입력 |
| **Desktop·Mobile 규칙** | Desktop: 폼+요약 좌우 분할, 동행 탭도 좌우 분할(폼/안내 + 안전 안내) · Mobile: 폼 → 요약 세로 스택, 탭은 가로 스크롤 가능한 pill 유지 |
| **금지 기능** | **항공/숙소 예약·결제·장바구니·가격비교 UI 자체 구현 금지**(외부 사이트 연결만 허용), 입력값 서버 저장 금지(REQ-FUNC-FLIGHT-006/HOTEL-006), 입력값 URL·쿠키·본문 통한 외부 전달 금지(REQ-FUNC-HOTEL-005), 공개 연락처 포함 모집글 제출 허용 금지(REQ-FUNC-MATE-009), Airbnb 상표 요소, 별점·실시간 가격·광고, placeholder 문구 |

---

## SCR-004 — 동행 조회

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-004 |
| **Route** | `/mates` |
| **Page Entry** | `src/app/mates/page.tsx` |
| **영역 순서** | Header(공통) → ①Intro(CTA Banner) → ②검색 Filter+결과 요약 → ③모집글 목록(카드 최대 8개) → ④목록-상세(Desktop 좌우 분할 / Mobile Drawer) → ⑤참가 방법 안내(3단계) → ⑥안전 안내(CTA Banner) → Footer(공통) |
| **주요 Component** | Header·Footer(공통), CTA Banner, Filter(국가/지역/기간 드롭다운, 여행 스타일 Chip, 모집중/전체 토글), Mate Post Card(§13 D-001, 목록), 상세 패널(전체 소개글, 참가 요청 버튼, 작성자 닉네임), 3단계 안내, 신고·차단 진입점 |
| **상태** | Loading: 목록 카드 스켈레톤(최대 8개), 상세 패널 스켈레톤 · Success: 목록·상세 정상 표시 · Empty: 필터 결과 0건 → "조건에 맞는 동행 모집글이 없습니다." + "검색 조건을 초기화하거나 기간을 넓혀보세요." + "필터 초기화" 버튼 + "동행 모집글 작성하기" CTA(완성형 Empty State) · Error: 목록/상세 조회 실패·참가 요청 제출 실패 → "다시 시도" 버튼, 중복 요청 시 "이미 참가 요청을 보낸 모집글입니다." · Unauthorized: 참가 요청·신고·차단 버튼 클릭 시 로그인 유도 카드 또는 SCR-005로 이동 |
| **사용자 행동** | 필터 조건 변경(국가/지역/기간/스타일/모집상태) · 모집글 카드 선택 → 상세 패널/Drawer 오픈 · "참가 요청 보내기" 클릭 · 신고하기/차단하기 클릭 · "동행 모집글 작성하기" 클릭 |
| **다른 화면으로의 이동** | 비인증 상태에서 참가 요청·신고·차단 시도 → SCR-005(로그인·성인확인) · "동행 모집글 작성하기" → SCR-003(동행 구하기 탭) · 안전 안내 "여행 조건도 함께 정리해 보세요" → SCR-003 · 참가 요청 승인/거절 결과는 SCR-005(내 활동 탭)에서 관리되며 상태가 이 화면에도 반영됨 |
| **Desktop·Mobile 규칙** | Desktop: 좌측 목록 + 우측 상세 패널 좌우 분할 · Mobile: 카드 선택 시 하단에서 전체 화면 Drawer로 상세 오픈 |
| **금지 기능** | 연락처(전화번호·메신저 ID 등) 노출 금지, 신원·안전 보증 문구 금지("Free Traveler는 신원이나 안전을 보증하지 않습니다" 고지 유지), Airbnb 상표 요소, 별점·실시간 가격·광고, placeholder 문구, 빈 목록을 안내 없이 방치하는 것 금지 |

---

## SCR-005 — 계정·관리

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-005 |
| **Route** | `/account` |
| **Page Entry** | `src/app/account/page.tsx` |
| **영역 순서(역할별, 역할에 없는 탭은 렌더링하지 않음)** | **Guest:** Header → Intro(축소 Hero) → 계정 Card(로그인/회원가입/재설정, 카드 3개) → 로그인 후 기능 Chip(3개) → 보안 안내 텍스트 Card → Footer · **Member:** Header → 탭(프로필/내 활동) → 내 활동: 내가 쓴 동행글 → 참가 요청 관리 → 차단 목록 → CTA Banner → Footer · **Admin:** Member 탭 + "관리자" 탭(Intro → 신고 목록 → 외부 URL 설정 Form) → Footer |
| **주요 Component** | Header·Footer(공통), 로그인/회원가입/비밀번호 재설정 Form(성인 확인 체크박스 포함), 기능 소개 Chip, 프로필 요약 카드+정보 수정 Form, 내 활동 리스트(동행글/참가 요청/차단), 신고 목록(리스트/표, 상태 드롭다운: 접수/검토중/처리완료), 외부 URL 설정 Form(항공/호텔 랜딩 URL) |
| **상태** | Loading: 내 활동 목록·관리자 신고 목록 조회 시 리스트 스켈레톤 · Success: 정상 표시 · Empty: 내가 쓴 글/참가 요청/차단 목록/신고 목록 0건 → 각각 완성형 Empty State(예: "아직 작성한 동행글이 없습니다." + "새 동행글 작성하기" CTA) · Error: 프로필 수정 실패·상태 변경 실패·URL 저장 실패 → 인라인 오류 메시지+재시도 · Unauthorized: 비로그인 사용자가 프로필/내 활동 접근 시 Guest 화면으로 대체, 비관리자가 관리자 탭 URL 직접 접근 시 관리자 탭 미렌더링+403 안내 |
| **사용자 행동** | 로그인/회원가입/비밀번호 재설정 제출 · 프로필 정보 수정 · 참가 요청 승인/거절 · 차단 해제 · 신고 상태 변경(관리자) · 외부 URL 저장(관리자) · "새 동행글 작성하기" 클릭 |
| **다른 화면으로의 이동** | 로그인 완료 후 이전에 시도하던 SCR-003/SCR-004 동작으로 복귀 · 즐겨찾기 항목 선택 → SCR-001(여행지 상세 Drawer) · 참가 요청 항목 선택 → SCR-004(해당 모집글 상세 패널) · "새 동행글 작성하기" → SCR-003(동행 구하기 탭) |
| **Desktop·Mobile 규칙** | Desktop/Mobile 모두 탭 기반 세로 스택 레이아웃 유지(별도 좌우 분할 없음), 터치 영역 44px 이상 동일 적용 |
| **금지 기능** | **관리자 탭에 차트·통계 Dashboard 금지**(신고 상태 처리와 외부 URL 설정만 구성), 여행지·안전정보 콘텐츠 CRUD 화면 금지(REQ-FUNC-ADMIN-001/001-2, `src/data` 코드 관리로 대체), 범용 감사 로그 화면 금지(REQ-FUNC-ADMIN-004/OBS-002), 생년월일 저장 금지(성인 확인 여부+시각만 저장), Airbnb 상표 요소, placeholder 문구 |

---

## 공통 규칙 (5개 Screen 전체 적용)

- Header·Footer는 `design-reference/D-001/DESIGN.md` §9를 그대로 따르며 화면마다 다르게 구현하지 않는다.
- 외부 사이트로 이동하는 모든 링크는 `target="_blank" rel="noopener noreferrer"`를 사용한다(REQ-NFR-SEC-002).
- 색상만으로 상태를 구분하지 않고 아이콘·텍스트 라벨을 항상 병기한다(REQ-NFR-ACC-004).
- 모든 인터랙티브 요소의 터치 영역은 최소 44×44px을 확보한다.
- API Route, Supabase 인증 콜백, 404/500 등 공통 오류 처리는 이 5개 Screen에 포함되지 않는 기술 Route로 별도 관리한다(`design-reference/SCREEN_ROUTE_CONTRACT.json`의 `technical_routes` 참조).
