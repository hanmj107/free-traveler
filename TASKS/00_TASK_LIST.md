# Free Traveler — Task List v1.0

- **문서 ID:** TASKLIST-001
- **작성일:** 2026-09-15
- **선행 검사:** `python scripts/validate_inputs.py` → `VALIDATE_INPUTS_PASS (11/11 검사 통과)` (실행 로그는 본 문서 §0 참조)
- **참고 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/06_SRS_UIUX_REVISED.md`, `docs/UIUX_TRACEABILITY.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, 현재 `src/app` 파일 트리(`layout.tsx`, `page.tsx`[Create Next App 스타터], `globals.css`, `favicon.ico`만 존재)

> **Requirement ID 고지:** 이 프로젝트의 실제 Baseline Requirement는 `docs/UIUX_TRACEABILITY.md`/`docs/02_SRS_BASELINE.md` 기준 **REQ-FUNC 42개 + REQ-NFR 35개 = 77개**(도메인 접두어 ID 체계)다. "REQ-FUNC-001~080·REQ-NF-001~034"(합계 114개) 표기는 이 프로젝트에 존재하지 않는 순번 체계이며, `scripts/validate_inputs.py` §0/§10과 `.claude/skills/traveler-project-pipeline/SKILL.md` §0에서 이미 동일하게 확인·기록했다. 아래 커버리지는 실제 77개 전체를 기준으로 한다.

---

## 0. 선행 검사 로그

```
[PASS] 01. next_dependency
[PASS] 02. app_entrypoints
[PASS] 03. core_docs_exist
[PASS] 04. design_locked
[PASS] 05. screen_route_contract_parses
[PASS] 06. screen_count_is_5
[PASS] 07. all_screen_ids_present
[PASS] 08. routes_match_expected
[PASS] 09. page_entry_is_app_router_format
[PASS] 10. project_scope_covers_all_requirements
[PASS] 11. no_active_aws_ec2
VALIDATE_INPUTS_PASS (11/11 검사 통과)
```

검증 통과를 확인한 뒤에만 아래 Task List를 작성했다.

---

## 1. 요약

### 1-1. Task 총계

| Category | 개수 |
|---|---:|
| PAGE_OWNER | 5 |
| COMPONENT | 35 |
| DATA | 3 |
| DB | 4 |
| AUTH | 2 |
| API | 5 |
| UNIT_TEST | 3 |
| INTEGRATION_TEST | 1 |
| E2E_TEST | 3 |
| MANUAL_CHECK | 2 |
| CI_DEPLOY | 2 |
| **총 Task 수** | **65** |

> 2026-09-16 감사 보강: 5개 Screen 모두 Section 순서 최상단/최하단에 공통 Header·Footer(`design-reference/D-001/DESIGN.md` §9, `design-reference/UI_CONTRACT.md` 공통 규칙)를 요구하지만, 이를 생성하는 Task가 없어 모든 `PAGE-SCR0NN`이 존재하지 않는 Component에 암묵적으로 의존하는 누락이 있었다. `COMP-COMMON-HEADER`·`COMP-COMMON-FOOTER` 2개 Task를 §2-1에 신설하고 5개 `PAGE-SCR0NN`의 Depends On에 추가해 보강했다(Task 총량 63→65, `Page Owner Task는... 새 Component 파일을 만들지 않는다`는 원칙상 공통 Header/Footer도 선행 Task로 명시돼야 한다).

### 1-2. Requirement 커버리지

| 구분 | 총수 | 처리 |
|---|---:|---|
| IMPLEMENT (`IN_SCOPE_PENDING`) | 61 | §3~§13의 구현 Task `Requirement Ref`에 전수 연결, 각각 최소 1개 이상의 Test/Verify Task와 연결(§14 검증) |
| EXCLUDED | 16 | §15 `NON_IMPLEMENTATION`표에 근거·후속 방향과 함께 전수 기록(구현 Task 없음) |
| **합계** | **77** | **빠진 Requirement ID 없음 — §14 전수 대조 결과 참조** |

---

## 2. Task ID 규약

| 접두어 | Category |
|---|---|
| `PAGE-SCR0NN` | PAGE_OWNER |
| `COMP-SCR0NN-*` | COMPONENT(화면별) |
| `COMP-COMMON-*` | COMPONENT(공통, 5개 Screen 전체가 동일하게 재사용) |
| `DATA-*` | 정적 데이터(DATA_STATIC) |
| `DB-*` | DB 스키마/RLS/접근 계층 |
| `AUTH-*` | Supabase Auth/성인확인 |
| `API-*` | Route Handler |
| `UNIT-*` | Unit Test |
| `TEST-RLS-*` | Integration Test(RLS) |
| `E2E-*` | Playwright E2E(Chromium) |
| `CHECK-MANUAL-*` | 브라우저 수동 확인/Release Check |
| `CI-*`, `RELEASE-*` | CI·배포 확인 |

---

## 2-1. COMPONENT — 공통 Header·Footer (2개, 2026-09-16 감사 보강)

5개 Screen 모두 Section 순서가 Header(공통)로 시작해 Footer(공통)로 끝나며(`design-reference/UI_CONTRACT.md` 각 Screen 절 "영역 순서", `design-reference/D-001/DESIGN.md` §9), UI_CONTRACT.md 공통 규칙은 "Header·Footer는 `design-reference/D-001/DESIGN.md` §9를 그대로 따르며 화면마다 다르게 구현하지 않는다"고 명시한다. Page Owner Task는 새 Component 파일을 만들 수 없으므로(루트 `CLAUDE.md` 규칙 9), 이 2개 Task가 먼저 Header·Footer Component를 만들고 5개 `PAGE-SCR0NN`이 이를 Depends On으로 조립한다.

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 64 | COMP-COMMON-HEADER | 공통 Header(내비게이션+계정 진입) | COMPONENT | IN_SCOPE_PENDING | REQ-NFR-ACC-003, REQ-NFR-ACC-006 | - | - | N/A | AUTH-SUPABASE-CLIENT | `src/components/common/Header.tsx` | Desktop: 좌측 코랄 점 아이콘+"Free Traveler" 워드마크(`/`로 이동)+중앙 내비 4개(홈·대표 소개·여행 준비·동행 찾기, 현재 위치 코랄 밑줄)+우측 계정 진입 버튼(비로그인 "로그인", 로그인 시 닉네임 이니셜 아바타+관리자 배지, 클릭 시 SCR-005). Mobile: 축약 워드마크+계정 아이콘+햄버거, 시트 열림 시 내비 4개 전체 폭 리스트(항목당 44px 이상). 5개 Screen이 동일한 이 Component를 그대로 재사용하고 화면마다 다르게 구현하지 않는다(D-001 §9) | Desktop 72px·Mobile 56px, 스크롤 시 sticky, flat(그림자 없음, D-001 §6) | 계정 버튼은 로그인 세션 상태만 읽으며 쓰기 작업을 수행하지 않는다 | E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS, E2E-MATE-AUTH | P0 |
| 65 | COMP-COMMON-FOOTER | 공통 Footer(3컬럼+하단 바) | COMPONENT | IN_SCOPE_PENDING | - | - | - | N/A | - | `src/components/common/Footer.tsx` | 정확히 3컬럼만 구성: ①Free Traveler 소개 1문장+`/about` 링크 ②바로가기(홈·대표 소개·여행 준비·동행 찾기·계정, 정확히 5개 링크) ③이용 안내 2문장(링크 없음)+하단 바 "© 2026 Free Traveler" 저작권 문구만. 존재하지 않는 페이지(이용약관·개인정보처리방침·고객센터 등)로 연결되는 링크나 컬럼을 추가하지 않는다(D-001 §9) | Desktop 3컬럼 그리드·Mobile 세로 스택(아코디언 없이 순서대로), flat(그림자 없음) | - | E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS, E2E-MATE-AUTH | P0 |

---

## 3. PAGE_OWNER (5개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | PAGE-SCR001 | `/` 메인 페이지 조립 | PAGE_OWNER | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002, REQ-FUNC-DEST-003, REQ-FUNC-DEST-004, REQ-FUNC-DEST-005, REQ-FUNC-SAFETY-001, REQ-FUNC-SAFETY-002, REQ-FUNC-SAFETY-003, REQ-FUNC-SAFETY-004, REQ-FUNC-SAFETY-005, REQ-NFR-CONTENT-001, REQ-NFR-CONTENT-002, REQ-NFR-CONTENT-005 | SCR-001 | `/` | `src/app/page.tsx` | COMP-COMMON-HEADER, COMP-COMMON-FOOTER, COMP-SCR001-HERO-SEARCH, COMP-SCR001-DEST-DOMESTIC, COMP-SCR001-DEST-GLOBAL, COMP-SCR001-THEME-CHIPS, COMP-SCR001-SAFETY-CARDS, COMP-SCR001-DEST-DRAWER, COMP-SCR001-MATE-SUMMARY, COMP-SCR001-ABOUT-SUMMARY, DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE | `src/app/page.tsx` | Section 순서: Header→①Hero(검색, ~580px)→②국내 여행지 6개(DATA-DESTINATIONS)→③해외 여행지 6개(DATA-DESTINATIONS)→④여행 동기 Chip 6개→⑤국가별 주의사항 6개(DATA-SAFETY)→⑥최근 동행글 3개 또는 완성형 Empty State(API-MATE-POSTS)→⑦free_traveler 소개(DATA-REPRESENTATIVE)→Footer. 각 Section 데이터 출처를 코드 주석 없이 컴포넌트 props로 명시. Create Next App 기본 스타터(로고·"To get started"·Deploy Now/Documentation 링크) 완전 제거. Next.js Metadata API로 SEO 메타데이터 생성(CONTENT-001) | Desktop 1440(Card 4열, Hero 아래 다음 Section 120~150px 노출)·Mobile 390(Card 1열) 반응형 콘텐츠 밀도 준수. Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 Card 금지. Section 6 데이터 0건 시 상황설명+이용방법+CTA 3요소를 갖춘 완성형 Empty State 필수 | 외부 링크(안전정보 출처) `target=_blank rel=noopener noreferrer`(SEC-002) | E2E-PUBLIC-SMOKE, CHECK-MANUAL-ACCESSIBILITY, CHECK-MANUAL-PERFORMANCE | P0 |
| 2 | PAGE-SCR002 | `/about` 대표 소개 조립 | PAGE_OWNER | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001, REQ-FUNC-ABOUT-002, REQ-FUNC-ABOUT-003 | SCR-002 | `/about` | `src/app/about/page.tsx` | COMP-COMMON-HEADER, COMP-COMMON-FOOTER, COMP-SCR002-PROFILE-HERO, COMP-SCR002-METRICS, COMP-SCR002-PHILOSOPHY, COMP-SCR002-TIMELINE, COMP-SCR002-COUNTRY-CHIPS, COMP-SCR002-GALLERY, COMP-SCR002-MEMORABLE-CTA, DATA-REPRESENTATIVE | `src/app/about/page.tsx` | Section 순서: Header→Profile Hero(DATA-REPRESENTATIVE)→여행 지표(50+ Trips/30+ Countries)→소개·철학(좌우 분할)→Timeline 6개 이상→방문 국가 30개국(4권역 Chip)→Gallery 8개 이상→기억에 남는 여행지 4개+CTA→Footer. 모든 Section 데이터는 DATA-REPRESENTATIVE 단일 소스에서 조회(수치 불일치 금지, Risk R-07 대응) | Desktop(Gallery 4열, 좌우 분할 유지)·Mobile(Gallery 2열, 좌우 분할→세로 스택) 반응형 밀도. Lorem ipsum·"준비 중"·내용 없는 Card 금지(전체 정적 콘텐츠이므로 Empty State 해당 없음, 이미지 로드 실패 시 대체 배경+alt만 허용) | 이미지 대체텍스트 필수(ACC-002), 실제 인물 얼굴 특정 오인 방지 표현 | E2E-PUBLIC-SMOKE, CHECK-MANUAL-ACCESSIBILITY | P0 |
| 3 | PAGE-SCR003 | `/travel-tools` 통합 여행 준비 조립 | PAGE_OWNER | IN_SCOPE_PENDING | REQ-FUNC-FLIGHT-001, REQ-FUNC-FLIGHT-002, REQ-FUNC-FLIGHT-003, REQ-FUNC-FLIGHT-004, REQ-FUNC-FLIGHT-005, REQ-FUNC-FLIGHT-006, REQ-FUNC-HOTEL-001, REQ-FUNC-HOTEL-002, REQ-FUNC-HOTEL-003, REQ-FUNC-HOTEL-004, REQ-FUNC-HOTEL-005, REQ-FUNC-HOTEL-006, REQ-FUNC-HOTEL-007, REQ-FUNC-MATE-001, REQ-FUNC-MATE-003, REQ-FUNC-MATE-009 | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | COMP-COMMON-HEADER, COMP-COMMON-FOOTER, COMP-SCR003-INTRO-TABS, COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM, COMP-SCR003-TIPS, COMP-SCR003-MATE-COMPOSE, COMP-SCR003-LOGIN-GUARD, API-EXTERNAL-URLS, AUTH-ADULT-VERIFICATION | `src/app/travel-tools/page.tsx` | Section 순서: Header→Intro(3단계 안내)→탭(항공편/숙소/동행 구하기, 탭별 입력·검증·완료 상태 완전 분리)→여행정보 Form(좌: 입력, 우: 실시간 요약)→입력 요약·외부 이동 Action Card→찾기 Tip 3개→[동행 구하기 탭] 동행 작성 Form 또는 (비인증 시) 로그인 안내+안전 안내 사이드 패널→Footer | Desktop(폼+요약 좌우 분할)·Mobile(폼→요약 세로 스택), 탭 pill 가로 스크롤 가능. Lorem ipsum·"준비 중" 금지, Tip 카드 3개 모두 실제 문구 | 항공·숙소 입력값 서버·URL·쿠키 미전송(FLIGHT-006, HOTEL-005/006), 외부 이동 `noopener noreferrer`(SEC-002), 연락처 패턴 탐지 시 제출 차단(MATE-009), 모집글 본문 새니타이즈(SEC-008) | E2E-TRAVEL-TOOLS, UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION | P0 |
| 4 | PAGE-SCR004 | `/mates` 동행 조회 조립 | PAGE_OWNER | IN_SCOPE_PENDING | REQ-FUNC-MATE-002, REQ-FUNC-MATE-004, REQ-FUNC-MATE-005, REQ-FUNC-MATE-006, REQ-FUNC-MATE-007, REQ-FUNC-MATE-008 | SCR-004 | `/mates` | `src/app/mates/page.tsx` | COMP-COMMON-HEADER, COMP-COMMON-FOOTER, COMP-SCR004-INTRO-CTA, COMP-SCR004-FILTER, COMP-SCR004-LIST, COMP-SCR004-DETAIL, COMP-SCR004-JOIN-REQUEST, COMP-SCR004-REPORT, COMP-SCR004-BLOCK, COMP-SCR004-GUIDE-SAFETY, API-MATE-POSTS, API-MATE-APPLICATIONS, API-REPORTS, API-BLOCKS | `src/app/mates/page.tsx` | Section 순서: Header→Intro(CTA Banner)→Filter+결과 요약("조건에 맞는 모집글 N건")→동행 목록(카드 최대 8개, API-MATE-POSTS)→상세(Desktop 좌우 분할/Mobile Drawer)→신청 방법 3단계→안전·신고·차단 안내+CTA→Footer | Desktop(목록+상세 좌우 분할)·Mobile(목록→상세 Drawer). 필터 결과 0건 시 완성형 Empty State("조건에 맞는 동행 모집글이 없습니다."+조건 완화 안내+필터 초기화+작성 CTA). Lorem ipsum·연락처 노출 카드 금지 | 목록·상세에 작성자 닉네임만 표시(연락처 비노출, MATE-002), 차단 관계 상호 비노출(PRIV-004), 비인증 참가요청/신고/차단 시도 시 SCR-005로 유도(MATE-001) | E2E-MATE-AUTH, UNIT-MATE-STATE, TEST-RLS-BASIC | P0 |
| 5 | PAGE-SCR005 | `/account` 계정·관리 조립 | PAGE_OWNER | IN_SCOPE_PENDING | REQ-FUNC-MATE-001, REQ-FUNC-MATE-005, REQ-FUNC-ADMIN-003, REQ-NFR-PRIV-001, REQ-NFR-PRIV-002, REQ-NFR-PRIV-003, REQ-NFR-PRIV-005, REQ-NFR-SEC-004 | SCR-005 | `/account` | `src/app/account/page.tsx` | COMP-COMMON-HEADER, COMP-COMMON-FOOTER, COMP-SCR005-AUTH, COMP-SCR005-PROFILE, COMP-SCR005-MY-ACTIVITY, COMP-SCR005-ADMIN, AUTH-SUPABASE-CLIENT, AUTH-ADULT-VERIFICATION, API-MATE-APPLICATIONS, API-REPORTS, API-BLOCKS, API-EXTERNAL-URLS | `src/app/account/page.tsx` | 역할별 Section: **Guest** — Intro(축소 Hero)→계정 Card(로그인/회원가입/재설정)→로그인 후 기능 Chip 3개→보안 안내. **Member** — 탭(프로필/내 활동): 프로필 요약+수정, 내 활동(내가 쓴 글/참가요청 관리/차단 목록/CTA). **Admin** — Member 탭 + "관리자" 탭(신고 목록+상태변경, 외부 URL 설정, **Dashboard·통계 없음**). 역할에 없는 관리 영역은 렌더링하지 않는다(비관리자 접근 시 관리자 탭 자체 미렌더링+403) | 3역할 모두 Intro→핵심 작업→도움말/다음 행동 구조 유지. 각 목록(동행글/참가요청/차단/신고) 0건 시 완성형 Empty State. Lorem ipsum 금지 | 생년월일 미저장(PRIV-002), 신고·피신고 정보 관리자만 접근(PRIV-003, RLS), 외부 URL 하드코딩 금지(SEC-004) | E2E-MATE-AUTH, TEST-RLS-BASIC | P0 |

---

## 4. COMPONENT — SCR-001 (8개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | COMP-SCR001-HERO-SEARCH | 검색 Hero | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002 | SCR-001 | `/` | N/A | - | `src/components/scr001/HeroSearch.tsx` | 도시·국가 검색 입력 시 목록 Section으로 스크롤 이동 | 높이 약 580px(560~600px), 배경 여행 사진, 다음 Section 상단이 보이도록 제한 | - | E2E-PUBLIC-SMOKE | P0 |
| 7 | COMP-SCR001-DEST-DOMESTIC | 국내 인기 여행지 카드 6개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002, REQ-FUNC-DEST-004 | SCR-001 | `/` | N/A | DATA-DESTINATIONS | `src/components/scr001/DomesticDestinations.tsx` | `region_type='domestic'` 데이터 6개 이상을 클라이언트 필터링(AND 조건: 계절·테마·기간)으로 표시, 결과 0건 시 조건 완화 안내+초기화 버튼(DEST-004) | Card Grid 4열(Desktop)/1열(Mobile), 사진 우선 카드, 카드 6개 미만 노출 금지 | - | E2E-PUBLIC-SMOKE | P0 |
| 8 | COMP-SCR001-DEST-GLOBAL | 해외 인기 여행지 카드 6개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002, REQ-FUNC-DEST-004 | SCR-001 | `/` | N/A | DATA-DESTINATIONS | `src/components/scr001/GlobalDestinations.tsx` | `region_type='global'` 데이터 6개 이상, 국가·도시명+안전등급 배지, 필터 AND 조건 동일 적용 | Card Grid 4열/1열, 안전등급 배지는 색상+텍스트 라벨 병기(ACC-004) | - | E2E-PUBLIC-SMOKE | P0 |
| 9 | COMP-SCR001-THEME-CHIPS | 여행 동기·테마 Chip 6개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-DEST-002, REQ-FUNC-DEST-004 | SCR-001 | `/` | N/A | - | `src/components/scr001/ThemeChips.tsx` | 휴양/도시 탐방/미식/자연·하이킹/가족여행/저예산 Chip 선택 시 위 두 목록에 필터 적용, 결과 0건 시 완성형 Empty State | Chip pill 형태, 선택 상태 코랄 배경+흰 텍스트, 터치 영역 44px 이상(ACC-006) | - | E2E-PUBLIC-SMOKE | P1 |
| 10 | COMP-SCR001-SAFETY-CARDS | 국가별 주의사항 카드 6개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-SAFETY-004, REQ-FUNC-SAFETY-005 | SCR-001 | `/` | N/A | DATA-SAFETY | `src/components/scr001/SafetyNoticeCards.tsx` | 국기·국가명·경보 배지·최종 확인일 표시, 중대 경보는 카드 상단에 우선 배치(SAFETY-005) | 컴팩트 카드 6개, 경보 배지는 색상+텍스트 라벨 병기(ACC-004) | - | E2E-PUBLIC-SMOKE | P0 |
| 11 | COMP-SCR001-DEST-DRAWER | 여행지 상세 Drawer + 안전정보 패널 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-DEST-003, REQ-FUNC-DEST-005, REQ-FUNC-SAFETY-001, REQ-FUNC-SAFETY-002, REQ-FUNC-SAFETY-003, REQ-NFR-CONTENT-002, REQ-NFR-CONTENT-005, REQ-NFR-SEC-002, REQ-NFR-ACC-002 | SCR-001 | `/` | N/A | DATA-DESTINATIONS, DATA-SAFETY | `src/components/scr001/DestinationDrawer.tsx`, `src/components/scr001/SafetyInfoPanel.tsx` | §3-4 필수 11개 항목(소개 300자+·대표이미지·명소 5개+·추천시기·일정·예산·교통·음식 3개+·에티켓 3개+·안전정보 연결[해외]·출처/수정일) 전부 렌더링. 안전정보 패널 전환 시 6개 카테고리+최종 확인일, 확인일 7일 초과 시 렌더링 시점 계산으로 경고 표시(SAFETY-003). 공식 출처 링크 새 탭 제공(SAFETY-002) | Desktop 우측 슬라이드 480~560px / Mobile 전체화면 Bottom Sheet, `rounded-lg` 상단 모서리 | 외부 출처 링크 `noopener noreferrer`(SEC-002), 이미지 alt 텍스트 필수(ACC-002) | E2E-PUBLIC-SMOKE | P0 |
| 12 | COMP-SCR001-MATE-SUMMARY | 최근 동행글 요약 3개 또는 Empty State | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-002(읽기 전용 요약) | SCR-001 | `/` | N/A | API-MATE-POSTS | `src/components/scr001/RecentMatePosts.tsx` | 공개·모집중 모집글 최신 3개(연락처 비노출), 0건 시 "아직 등록된 동행 모집글이 없습니다."+이용 방법+"동행 모집글 작성하기" CTA(완성형 Empty State), 조회 실패 시 재시도 안내 | Card Grid 3(Desktop)/1열(Mobile), Loading 시 스켈레톤 3개 | 연락처·작성자 개인정보 비노출 | E2E-PUBLIC-SMOKE | P1 |
| 13 | COMP-SCR001-ABOUT-SUMMARY | free_traveler 요약(좌우 분할+CTA) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001(요약 인용) | SCR-001 | `/` | N/A | DATA-REPRESENTATIVE | `src/components/scr001/AboutSummary.tsx` | "50+ Trips"·"30+ Countries" 수치는 DATA-REPRESENTATIVE 단일 소스 인용, "대표 소개 보기" CTA → `/about` | 좌: 소개 문장+수치, 우: 대표 사진+버튼 | - | E2E-PUBLIC-SMOKE | P2 |

---

## 5. COMPONENT — SCR-002 (7개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 14 | COMP-SCR002-PROFILE-HERO | 대표 Hero | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/ProfileHero.tsx` | 대표 사진+한 문장 소개, 실제 인물 오인 방지 원칙 | 높이 560~600px 제한 | - | E2E-PUBLIC-SMOKE | P1 |
| 15 | COMP-SCR002-METRICS | 여행 지표 숫자 카드 2개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/MetricCards.tsx` | "50+ Trips", "30+ Countries" 카드, PAGE-SCR001 요약과 동일 소스·동일 값 | 대형 숫자 카드 2개 | - | E2E-PUBLIC-SMOKE | P1 |
| 16 | COMP-SCR002-PHILOSOPHY | 소개·철학 좌우 분할 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/PhilosophySplit.tsx` | 자기소개·여행을 시작한 이유·여행 철학 2~4개 문단 | 좌: 이미지, 우: 문단(Desktop)/세로 스택(Mobile) | - | E2E-PUBLIC-SMOKE | P2 |
| 17 | COMP-SCR002-TIMELINE | 여행 Timeline 6개 이상 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/TravelTimeline.tsx` | 연도별 항목 **최소 6개**(연도·여행지·한 줄 설명), 6개 미만 렌더링 금지 | 순차 세로 Timeline | - | E2E-PUBLIC-SMOKE | P1 |
| 18 | COMP-SCR002-COUNTRY-CHIPS | 방문 국가 Chip(30개국, 4권역) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-003 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/CountryChips.tsx` | 아시아/유럽/북미/오세아니아 4권역, **최소 30개국** Chip, 선택 시 관련 여행지/기록으로 이동 | 권역별 그룹 Chip 목록 | - | E2E-PUBLIC-SMOKE | P1 |
| 19 | COMP-SCR002-GALLERY | 여행 사진 Gallery 8장 이상 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-002 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/PhotoGallery.tsx` | **최소 8장**, 각 사진 alt 텍스트+촬영시기+출처 캡션 필수 | 4열(Desktop)/2열(Mobile) | 이미지 alt 필수(ACC-002) | E2E-PUBLIC-SMOKE, CHECK-MANUAL-ACCESSIBILITY | P1 |
| 20 | COMP-SCR002-MEMORABLE-CTA | 기억에 남는 여행지 4개 + CTA Banner | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-003 | SCR-002 | `/about` | N/A | DATA-REPRESENTATIVE | `src/components/scr002/MemorableDestinations.tsx` | **정확히 4개** 카드(→ SCR-001 상세 Drawer 이동) + "여행 조건 정리하기"(`/travel-tools`)·"동행 찾아보기"(`/mates`) 버튼 | Card Grid 4 + CTA Banner | - | E2E-PUBLIC-SMOKE | P1 |

---

## 6. COMPONENT — SCR-003 (항공·숙소·동행 작성 분리, 6개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 21 | COMP-SCR003-INTRO-TABS | Intro 3단계 안내 + 탭 네비게이션 | COMPONENT | IN_SCOPE_PENDING | - | SCR-003 | `/travel-tools` | N/A | - | `src/components/scr003/IntroSteps.tsx`, `src/components/scr003/TabNav.tsx` | ①조건 입력 ②요약 확인 ③외부 이동 3단계 안내, 탭 3개(항공편/숙소/동행 구하기)는 `<button>` 요소, 활성 탭 코랄 표시 | pill 탭, 활성/비활성 명확 구분 | - | E2E-TRAVEL-TOOLS | P1 |
| 22 | COMP-SCR003-FLIGHT-FORM | 항공 조건 입력·검증·요약·외부이동 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-FLIGHT-001, REQ-FUNC-FLIGHT-002, REQ-FUNC-FLIGHT-003, REQ-FUNC-FLIGHT-004, REQ-FUNC-FLIGHT-005, REQ-FUNC-FLIGHT-006, REQ-NFR-SEC-002, REQ-NFR-SEC-003, REQ-NFR-ACC-005 | SCR-003 | `/travel-tools` | N/A | API-EXTERNAL-URLS | `src/components/scr003/FlightForm.tsx` | 국가·지역·출발일·귀국일 필수값 미입력 시 이동 버튼 비활성화+필드별 오류(FLIGHT-001), 과거 출발일/귀국일<출발일 차단(FLIGHT-002), 입력 요약+비전달 고지(FLIGHT-003), "항공편 보러 가기"는 설정된 외부 URL을 새 탭으로 이동(FLIGHT-004), URL 미설정/오류 시 이동 불가 안내+재시도(FLIGHT-005) | 좌: 폼, 우: 실시간 요약(Desktop) / 세로 스택(Mobile) | 입력값 서버·쿼리·쿠키 미전송(FLIGHT-006), 외부 이동 `noopener noreferrer`(SEC-002), 오류 메시지 `aria-describedby` 연결(ACC-005) | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS | P0 |
| 23 | COMP-SCR003-HOTEL-FORM | 숙소 조건 입력·검증·요약·외부이동 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-HOTEL-001, REQ-FUNC-HOTEL-002, REQ-FUNC-HOTEL-003, REQ-FUNC-HOTEL-004, REQ-FUNC-HOTEL-005, REQ-FUNC-HOTEL-006, REQ-FUNC-HOTEL-007, REQ-NFR-SEC-002, REQ-NFR-SEC-003, REQ-NFR-ACC-005 | SCR-003 | `/travel-tools` | N/A | API-EXTERNAL-URLS | `src/components/scr003/HotelForm.tsx` | 국가·지역·체크인·체크아웃 필수값 검증(HOTEL-001), 과거 체크인/체크아웃≤체크인 차단(HOTEL-002), 요약+비전달 고지(HOTEL-003), "숙소 보러 가기" 새 탭 이동(HOTEL-004), URL 오류 시 재시도 UI(HOTEL-007) | FlightForm과 동일 좌우 분할/스택 패턴 | 입력값 URL·본문·쿠키·서버 미전송(HOTEL-005,006), `noopener noreferrer`(SEC-002) | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS | P0 |
| 24 | COMP-SCR003-TIPS | 찾기 Tip 카드 3개 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-FLIGHT-003, REQ-FUNC-HOTEL-003(비전달 고지 동반) | SCR-003 | `/travel-tools` | N/A | - | `src/components/scr003/TipCards.tsx` | "환율은 출발 전 다시 확인하세요", "왕복보다 각각 검색하면 더 저렴할 수 있어요", "숙소는 위치와 후기를 함께 비교하세요" 3개 카드 + "입력하신 정보는 저장되지 않습니다" 고지 문구 | Card Grid 3 | - | E2E-TRAVEL-TOOLS | P2 |
| 25 | COMP-SCR003-MATE-COMPOSE | 동행 작성 Form(연락처 탐지+안전수칙) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-003, REQ-FUNC-MATE-009, REQ-NFR-PRIV-005, REQ-NFR-PRIV-006, REQ-NFR-SEC-008 | SCR-003 | `/travel-tools` | N/A | API-MATE-POSTS, AUTH-ADULT-VERIFICATION | `src/components/scr003/MateComposeForm.tsx` | 국가·지역·기간·스타일·소개글 필수 필드+안전수칙 동의 체크 후 제출 가능(MATE-003), 본문 내 전화번호·메신저 ID 패턴 탐지 시 제출 차단(MATE-009), 안전고지 문구 표시(PRIV-005) | 로그인+성인확인 완료 시에만 노출 | 본문 새니타이즈(SEC-008), 연락처 필드 비공개(PRIV-006) | UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS | P0 |
| 26 | COMP-SCR003-LOGIN-GUARD | 로그인 유도 카드 + 안전 안내 패널 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-001 | SCR-003 | `/travel-tools` | N/A | AUTH-SUPABASE-CLIENT | `src/components/scr003/LoginPromptCard.tsx` | 비로그인/성인 미확인 상태에서 동행 구하기 탭 진입 시 작성 폼 대신 로그인 유도 카드+안전 안내 사이드 패널 표시, 작성 폼은 렌더링하지 않음 | 좌: 로그인 유도, 우: 안전 안내(Desktop 좌우 분할) | - | E2E-TRAVEL-TOOLS | P1 |

---

## 7. COMPONENT — SCR-004 (목록·필터·상세·참가·신고·차단 분리, 8개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 27 | COMP-SCR004-INTRO-CTA | Intro CTA Banner | COMPONENT | IN_SCOPE_PENDING | - | SCR-004 | `/mates` | N/A | - | `src/components/scr004/IntroCtaBanner.tsx` | "동행 모집글 작성하기" → `/travel-tools` 동행 구하기 탭 | CTA Banner | - | E2E-MATE-AUTH | P2 |
| 28 | COMP-SCR004-FILTER | 검색 Filter + 결과 요약 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-002 | SCR-004 | `/mates` | N/A | API-MATE-POSTS | `src/components/scr004/MateFilter.tsx` | 국가/지역/기간/여행스타일/모집상태 필터, 기간은 구간 중첩(overlap) 매칭, 스타일은 OR 매칭, "조건에 맞는 모집글 N건" 결과 요약 | Chip+드롭다운 필터, 0건 시 완성형 Empty State(필터 초기화+작성 CTA) | 비회원 열람 허용(로그인 불필요) | E2E-MATE-AUTH | P0 |
| 29 | COMP-SCR004-LIST | 동행 목록 카드(최대 8개) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-002, REQ-FUNC-MATE-008 | SCR-004 | `/mates` | N/A | API-MATE-POSTS | `src/components/scr004/MatePostList.tsx` | 최대 8개 우선 노출, 모집중/마감 상태는 조회 시점 `end_date` 비교로 계산(cron 없음, MATE-008), 닉네임만 표시 | Card Grid, Loading 시 스켈레톤 8개 | 연락처 비노출 | E2E-MATE-AUTH, UNIT-MATE-STATE | P0 |
| 30 | COMP-SCR004-DETAIL | 상세 패널(Desktop 분할)/Drawer(Mobile) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-002, REQ-FUNC-MATE-008 | SCR-004 | `/mates` | N/A | API-MATE-POSTS | `src/components/scr004/MateDetailPanel.tsx` | 선택한 모집글 전체 내용, 마감 상태 계산 반영, 작성자 닉네임만 표시 | Desktop 좌우 분할 / Mobile 전체화면 Drawer | 연락처 비노출 | E2E-MATE-AUTH | P0 |
| 31 | COMP-SCR004-JOIN-REQUEST | 참가 요청 UI(중복 방지) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-004, REQ-FUNC-MATE-005 | SCR-004 | `/mates` | N/A | API-MATE-APPLICATIONS | `src/components/scr004/JoinRequestButton.tsx` | "참가 요청 보내기" 클릭 시 PENDING 요청 생성, `(post_id, applicant_user_id)` 중복(PENDING/APPROVED) 시 409 안내("이미 참가 요청을 보낸 모집글입니다."), 승인/거절 결과는 Toast로 대체 알림(이메일 미사용) | 버튼+상태 배지 | 비인증 시 SCR-005로 유도(MATE-001) | UNIT-MATE-STATE, E2E-MATE-AUTH | P0 |
| 32 | COMP-SCR004-REPORT | 신고 UI(접수번호 표시) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-006 | SCR-004 | `/mates` | N/A | API-REPORTS | `src/components/scr004/ReportDialog.tsx` | 신고 사유 제출 시 생성된 레코드 ID를 접수번호로 Toast/화면 표시 | 모달/Dialog | 비인증 시 SCR-005로 유도 | E2E-MATE-AUTH | P1 |
| 33 | COMP-SCR004-BLOCK | 차단 UI | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-007, REQ-NFR-PRIV-004 | SCR-004 | `/mates` | N/A | API-BLOCKS | `src/components/scr004/BlockButton.tsx` | 차단 설정 시 이후 목록·상세에서 상대방 콘텐츠 상호 비노출 | 버튼 | 상호 비노출 원칙(PRIV-004, RLS 연동) | TEST-RLS-BASIC, E2E-MATE-AUTH | P1 |
| 34 | COMP-SCR004-GUIDE-SAFETY | 참가 방법 3단계 + 안전 안내 CTA | COMPONENT | IN_SCOPE_PENDING | - | SCR-004 | `/mates` | N/A | - | `src/components/scr004/JoinGuideSafety.tsx` | ①참가 요청 ②작성자 승인 대기 ③승인 시 알림 확인 3단계 + "Free Traveler는 신원이나 안전을 보증하지 않습니다" 고지 + 신고/차단 진입점 안내 + "여행 조건도 함께 정리해 보세요" → `/travel-tools` | 3단계 안내 + CTA Banner | 안전 고지 문구 상시 노출 | E2E-MATE-AUTH | P2 |

---

## 8. COMPONENT — SCR-005 (Auth·Profile·My Activity·Admin 분리, 4개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 35 | COMP-SCR005-AUTH | 로그인/회원가입/재설정 + 성인확인 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-001, REQ-NFR-PRIV-001, REQ-NFR-PRIV-002, REQ-NFR-PRIV-005 | SCR-005 | `/account` | N/A | AUTH-SUPABASE-CLIENT, AUTH-ADULT-VERIFICATION | `src/components/scr005/AuthForms.tsx` | 이메일 로그인/회원가입(닉네임+성인확인 체크박스)/비밀번호 재설정, 성인확인은 자기신고 체크박스+확인 시각 저장(생년월일 미저장) | Guest 전용 3개 카드 + 로그인 후 기능 Chip 3개 | 이메일·닉네임·성인확인여부만 수집(PRIV-001), 생년월일 미저장(PRIV-002) | E2E-MATE-AUTH | P0 |
| 36 | COMP-SCR005-PROFILE | 프로필 요약 + 수정 Form | COMPONENT | IN_SCOPE_PENDING | - | SCR-005 | `/account` | N/A | AUTH-SUPABASE-CLIENT, DB-ACCESS | `src/components/scr005/ProfileEdit.tsx` | 닉네임·이메일·성인확인 배지·연령대/스타일(선택) 표시+수정, 저장 실패 시 인라인 오류 | Member 탭 "프로필" | - | E2E-MATE-AUTH | P1 |
| 37 | COMP-SCR005-MY-ACTIVITY | 내 활동(글/참가요청/차단+CTA) | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-MATE-005, REQ-FUNC-MATE-007 | SCR-005 | `/account` | N/A | API-MATE-POSTS, API-MATE-APPLICATIONS, API-BLOCKS | `src/components/scr005/MyActivity.tsx` | ①내가 쓴 동행글(0건 시 완성형 Empty State) ②참가 요청 관리(보낸 요청 상태 목록+받은 요청 승인/거절 버튼, 0건 시 완성형 Empty State) ③차단 목록(해제 옵션, 0건 시 완성형 Empty State) ④"새 동행글 작성하기" CTA Banner | Member 탭 "내 활동" | 차단 목록은 본인만 조회(RLS) | E2E-MATE-AUTH, TEST-RLS-BASIC | P0 |
| 38 | COMP-SCR005-ADMIN | 신고 처리 + 외부 URL 설정 | COMPONENT | IN_SCOPE_PENDING | REQ-FUNC-ADMIN-003, REQ-NFR-SEC-004, REQ-NFR-PRIV-003 | SCR-005 | `/account` | N/A | API-REPORTS, API-EXTERNAL-URLS | `src/components/scr005/AdminPanel.tsx` | 신고 목록(접수번호/대상/사유/상태 드롭다운: 접수/검토중/처리완료) + 항공·호텔 외부 URL 설정 Form(저장). **차트·통계 Dashboard·콘텐츠 CRUD·감사 로그 화면은 만들지 않는다** | 관리자 role에서만 "관리자" 탭 노출, 비관리자 접근 시 탭 미렌더링+403 | 신고·피신고 상세는 관리자만 접근(PRIV-003, RLS), 외부 URL은 DB 환경설정(하드코딩 금지, SEC-004) | E2E-MATE-AUTH, TEST-RLS-BASIC | P0 |

---

## 9. DATA (정적 데이터, 3개 — 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 39 | DATA-DESTINATIONS | 여행지 정적 데이터 | DATA | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002, REQ-FUNC-DEST-003, REQ-FUNC-DEST-004, REQ-FUNC-DEST-005, REQ-NFR-AVAIL-003 | SCR-001 | - | N/A | - | `src/data/destinations.ts`, `src/types/destination.ts` | 국내 10개 이상·해외 15개국 30개 도시 이상, §3-4 11개 필수 항목을 TypeScript 타입으로 강제(빌드 실패로 누락 방지). **정적 데이터로만 구현하며 DB 테이블을 만들지 않는다**(구현 방법 고정) | - | - | E2E-PUBLIC-SMOKE(타입체크는 CI-PIPELINE-SETUP) | P0 |
| 40 | DATA-SAFETY | 국가별 안전정보 정적 데이터 | DATA | IN_SCOPE_PENDING | REQ-FUNC-SAFETY-001, REQ-FUNC-SAFETY-002, REQ-FUNC-SAFETY-003, REQ-FUNC-SAFETY-004, REQ-FUNC-SAFETY-005, REQ-FUNC-DEST-005, REQ-NFR-AVAIL-003 | SCR-001 | - | N/A | - | `src/data/countrySafety.ts` | 해외 15개국 전체, 6개 안전 카테고리+최종 확인일(`last_verified_at`)+경보 레벨(`alert_level`)+범위(`alert_scope`) 필드 정의. **정적 데이터로만 구현**(구현 방법 고정) | - | - | E2E-PUBLIC-SMOKE | P0 |
| 41 | DATA-REPRESENTATIVE | 대표 소개 정적 데이터 | DATA | IN_SCOPE_PENDING | REQ-FUNC-ABOUT-001, REQ-FUNC-ABOUT-002, REQ-FUNC-ABOUT-003, REQ-NFR-AVAIL-003 | SCR-002 | - | N/A | - | `src/data/about.ts` | 대표 수치(50+/30+)·Timeline 6개 이상·방문국가 30개국·Gallery 8장 이상(alt+캡션)·기억에 남는 여행지 4개 단일 소스. **정적 데이터로만 구현**(구현 방법 고정) | - | - | E2E-PUBLIC-SMOKE | P0 |

---

## 10. DB — Schema/RLS/Access/Seed (4개 — 필수, 6개 테이블로 제한)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 42 | DB-SCHEMA-BASE | Supabase 스키마 정의(6개 테이블) | DB | IN_SCOPE_PENDING | REQ-FUNC-MATE-003, REQ-FUNC-MATE-004, REQ-FUNC-MATE-005, REQ-FUNC-MATE-006, REQ-FUNC-MATE-007, REQ-NFR-PRIV-001, REQ-NFR-PRIV-002, REQ-NFR-PRIV-003, REQ-NFR-SEC-004 | - | - | N/A | - | `supabase/migrations/0001_base_schema.sql` | 정확히 6개 테이블만 정의: `profiles`(이메일·닉네임·성인확인여부·확인시각, 생년월일 컬럼 없음)·`mate_posts`·`mate_applications`(`(post_id, applicant_user_id)` UNIQUE)·`user_blocks`·`reports`(상태: RECEIVED/IN_REVIEW/RESOLVED)·`app_settings`(항공/호텔 랜딩 URL). 그 이상의 테이블을 만들지 않는다 | - | 생년월일 컬럼 없음(PRIV-002) | TEST-RLS-BASIC | P0 |
| 43 | DB-RLS-BASE | RLS 정책 정의 | DB | IN_SCOPE_PENDING | REQ-NFR-PRIV-003, REQ-NFR-PRIV-004 | - | - | N/A | DB-SCHEMA-BASE | `supabase/migrations/0002_rls_policies.sql` | `reports`는 관리자 role만 SELECT, `user_blocks` 반영 시 상대방 `mate_posts`가 서로 비노출되도록 정책/뷰 정의, `mate_applications`는 본인 또는 대상 글 작성자만 조회 | - | 신고·피신고 정보 관리자 전용(PRIV-003), 차단 상호 비노출(PRIV-004) | TEST-RLS-BASIC | P0 |
| 44 | DB-ACCESS | DB 접근 계층(클라이언트/서버) | DB | IN_SCOPE_PENDING | REQ-FUNC-MATE-002, REQ-FUNC-MATE-004, REQ-FUNC-MATE-005, REQ-FUNC-MATE-006, REQ-FUNC-MATE-007, REQ-FUNC-MATE-008, REQ-NFR-AVAIL-003 | - | - | N/A | DB-SCHEMA-BASE, DB-RLS-BASE | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` | Supabase 클라이언트(브라우저)/서버(Route Handler) 인스턴스 분리 제공, 마감 상태는 조회 시점 계산(배치 없음, MATE-008), Supabase 장애 시에도 정적 데이터(§9) 화면은 정상 열람(AVAIL-003) | - | 서비스 role 키는 서버 전용, 브라우저 노출 금지 | TEST-RLS-BASIC, RELEASE-CHECK-VERCEL-SUPABASE | P0 |
| 45 | DB-SEED-BASE | 개발/테스트 시드 데이터 | DB | IN_SCOPE_PENDING | - | - | - | N/A | DB-SCHEMA-BASE | `supabase/seed.sql` | 6개 테이블 각각 E2E/RLS 테스트에 필요한 최소 샘플 레코드(모집글 8건 이상, 신고 1건 이상, 차단 관계 1건 이상) 시드 | - | 시드 데이터에 실제 개인정보 미포함 | TEST-RLS-BASIC, E2E-MATE-AUTH | P1 |

---

## 11. AUTH (2개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 46 | AUTH-SUPABASE-CLIENT | Supabase Auth 이메일 로그인/가입 + 콜백 | AUTH | IN_SCOPE_PENDING | REQ-FUNC-MATE-001, REQ-NFR-PRIV-001, REQ-NFR-SEC-001 | - | - | `src/app/auth/callback/route.ts` | DB-SCHEMA-BASE | `src/lib/auth/supabaseAuth.ts`, `src/app/auth/callback/route.ts` | 이메일 회원가입/로그인/세션 관리, `/auth/callback`은 기술 Route(디자인 Screen에 미포함) | - | HTTPS 전제(SEC-001), 비밀번호는 Supabase Auth 위임(자체 저장 없음) | E2E-MATE-AUTH | P0 |
| 47 | AUTH-ADULT-VERIFICATION | 성인 확인 로직 | AUTH | IN_SCOPE_PENDING | REQ-FUNC-MATE-001, REQ-NFR-PRIV-002 | - | - | N/A | AUTH-SUPABASE-CLIENT, DB-SCHEMA-BASE | `src/lib/auth/adultVerification.ts` | 자기신고 체크박스 제출 시 `profiles.adult_verified_at`에 확인 시각만 저장, 생년월일 저장 금지, 미확인 사용자는 모집글 작성/참가요청 시 SCR-005로 리디렉션 | - | 생년월일 미저장(PRIV-002) | E2E-MATE-AUTH | P0 |

---

## 12. API (5개)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 48 | API-MATE-POSTS | 모집글 생성/조회 API | API | IN_SCOPE_PENDING | REQ-FUNC-MATE-002, REQ-FUNC-MATE-003, REQ-FUNC-MATE-008, REQ-FUNC-MATE-009, REQ-NFR-PRIV-006 | - | - | `src/app/api/mates/route.ts` | DB-ACCESS, AUTH-ADULT-VERIFICATION | `src/app/api/mates/route.ts`, `src/app/api/mates/[id]/route.ts` | 공개·모집중 글만 비회원에게도 노출(연락처 필드 응답에서 제외), 생성 시 안전수칙 동의+연락처 미포함 검증, 마감 상태는 응답 시점 계산 | - | 서버 측 연락처 패턴 재검증(SEC-008), 공개 응답에 연락처 필드 없음(PRIV-006) | UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS, E2E-MATE-AUTH | P0 |
| 49 | API-MATE-APPLICATIONS | 참가 요청 생성/승인/거절 API | API | IN_SCOPE_PENDING | REQ-FUNC-MATE-004, REQ-FUNC-MATE-005 | - | - | `src/app/api/mates/[id]/applications/route.ts` | DB-ACCESS | `src/app/api/mates/[id]/applications/route.ts`, `src/app/api/applications/[id]/route.ts` | `(post_id, applicant_user_id)` PENDING/APPROVED 중복 시 409, 작성자만 승인/거절 가능, 승인/거절은 Toast로 알림 대체(이메일 미사용, 구현 방법 고정) | - | 신청자 본인/글 작성자만 상태 변경 가능 | UNIT-MATE-STATE, E2E-MATE-AUTH | P0 |
| 50 | API-REPORTS | 신고 생성/상태 변경 API | API | IN_SCOPE_PENDING | REQ-FUNC-MATE-006, REQ-FUNC-ADMIN-003, REQ-NFR-PERF-004 | - | - | `src/app/api/reports/route.ts` | DB-ACCESS | `src/app/api/reports/route.ts`, `src/app/api/reports/[id]/route.ts` | 신고 생성 시 접수번호(레코드 ID) 반환, 관리자만 상태(RECEIVED/IN_REVIEW/RESOLVED) 변경, 응답 p95 3초 이내 목표(PERF-004) | - | 관리자 role만 상태 변경(RLS 연동) | E2E-MATE-AUTH, CHECK-MANUAL-PERFORMANCE | P1 |
| 51 | API-BLOCKS | 차단 생성/해제 API | API | IN_SCOPE_PENDING | REQ-FUNC-MATE-007, REQ-NFR-PRIV-004 | - | - | `src/app/api/blocks/route.ts` | DB-ACCESS | `src/app/api/blocks/route.ts` | 차단 생성/해제, 본인 관계만 생성 가능 | - | 상호 비노출 원칙 서버 측 강제(PRIV-004) | TEST-RLS-BASIC, E2E-MATE-AUTH | P1 |
| 52 | API-EXTERNAL-URLS | 외부 URL 설정 저장/조회 API | API | IN_SCOPE_PENDING | REQ-NFR-SEC-004 | - | - | `src/app/api/admin/external-urls/route.ts` | DB-ACCESS | `src/app/api/admin/external-urls/route.ts` | 관리자만 항공/호텔 랜딩 URL 저장, 일반 사용자는 조회만(SCR-003 Action Card가 이 값을 읽음) | - | 관리자 role만 쓰기 권한(RLS) | TEST-RLS-BASIC, E2E-TRAVEL-TOOLS | P0 |

---

## 13. UNIT_TEST / INTEGRATION_TEST (4개 — 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 53 | UNIT-TRAVEL-DATES | 날짜 검증 Unit Test | UNIT_TEST | IN_SCOPE_PENDING | REQ-FUNC-FLIGHT-002, REQ-FUNC-HOTEL-002 | SCR-003 | - | N/A | COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM | `tests/unit/travelDates.spec.ts` | 과거 출발일/체크인 차단, 귀국일<출발일 차단, 체크아웃≤체크인 차단 경계값(당일 포함) 테스트 | - | - | 자체 검증(CI-PIPELINE-SETUP에서 자동 실행) | P0 |
| 54 | UNIT-CONTACT-DETECTION | 연락처 탐지 Unit Test | UNIT_TEST | IN_SCOPE_PENDING | REQ-FUNC-MATE-009, REQ-NFR-PRIV-006 | SCR-003 | - | N/A | COMP-SCR003-MATE-COMPOSE, API-MATE-POSTS | `tests/unit/contactDetection.spec.ts` | 전화번호·메신저 ID 기본 패턴 포함 시 제출 차단 검증(정상 텍스트는 통과) | - | - | 자체 검증(CI-PIPELINE-SETUP) | P0 |
| 55 | UNIT-MATE-STATE | 동행 상태 전이 Unit Test | UNIT_TEST | IN_SCOPE_PENDING | REQ-FUNC-MATE-004, REQ-FUNC-MATE-005, REQ-FUNC-MATE-008 | SCR-004 | - | N/A | API-MATE-APPLICATIONS, COMP-SCR004-LIST | `tests/unit/mateState.spec.ts` | PENDING→APPROVED/REJECTED 전이, 중복 PENDING/APPROVED 차단, `end_date` 경과 시 마감 계산 경계값 테스트 | - | - | 자체 검증(CI-PIPELINE-SETUP) | P0 |
| 56 | TEST-RLS-BASIC | RLS 기본 정책 Integration Test | INTEGRATION_TEST | IN_SCOPE_PENDING | REQ-NFR-PRIV-003, REQ-NFR-PRIV-004 | SCR-004, SCR-005 | - | N/A | DB-RLS-BASE, DB-SEED-BASE | `supabase/tests/rls_basic.sql` 또는 `tests/integration/rls.spec.ts` | 비관리자가 `reports` 조회 시 차단됨, 차단된 상대방의 `mate_posts`가 목록/상세에 노출되지 않음을 실제 쿼리로 검증 | - | - | CI-PIPELINE-SETUP | P0 |

---

## 14. E2E_TEST — Playwright Chromium (3개 — 필수, 핵심 7개 흐름을 3개 Task로 묶음)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 57 | E2E-PUBLIC-SMOKE | 공개 화면 Smoke(여행지·안전정보·대표소개) | E2E_TEST | IN_SCOPE_PENDING | REQ-FUNC-DEST-001, REQ-FUNC-DEST-002, REQ-FUNC-DEST-003, REQ-FUNC-DEST-004, REQ-FUNC-DEST-005, REQ-FUNC-SAFETY-001, REQ-FUNC-SAFETY-002, REQ-FUNC-SAFETY-003, REQ-FUNC-SAFETY-004, REQ-FUNC-SAFETY-005, REQ-FUNC-ABOUT-001, REQ-FUNC-ABOUT-002, REQ-FUNC-ABOUT-003, REQ-NFR-CONTENT-002, REQ-NFR-CONTENT-005, REQ-NFR-SEC-002 | SCR-001, SCR-002 | `/`, `/about` | N/A | PAGE-SCR001, PAGE-SCR002 | `tests/e2e/public-smoke.spec.ts` | Chromium 프로젝트만 사용. 흐름: (1)국내/해외 탭 전환+필터 (2)여행지 상세→해외 안전정보 패널 이동 (3)대표 소개 핵심 정보·방문국가 연결. 새 탭 오픈 속성 검증 | - | - | 자체(Playwright assertion) | P0 |
| 58 | E2E-TRAVEL-TOOLS | 여행 준비 Smoke(항공·숙소·Tip) | E2E_TEST | IN_SCOPE_PENDING | REQ-FUNC-FLIGHT-001, REQ-FUNC-FLIGHT-002, REQ-FUNC-FLIGHT-003, REQ-FUNC-FLIGHT-004, REQ-FUNC-FLIGHT-005, REQ-FUNC-FLIGHT-006, REQ-FUNC-HOTEL-001, REQ-FUNC-HOTEL-002, REQ-FUNC-HOTEL-003, REQ-FUNC-HOTEL-004, REQ-FUNC-HOTEL-005, REQ-FUNC-HOTEL-006, REQ-FUNC-HOTEL-007, REQ-NFR-SEC-002, REQ-NFR-SEC-003 | SCR-003 | `/travel-tools` | N/A | PAGE-SCR003, API-EXTERNAL-URLS | `tests/e2e/travel-tools.spec.ts` | Chromium만. 흐름: (4)항공 조건입력→검증오류→정상입력→요약→외부사이트 새 탭 이동 (5)호텔 동일 흐름 | - | - | 자체(Playwright assertion) | P0 |
| 59 | E2E-MATE-AUTH | 동행·인증·관리자 Smoke | E2E_TEST | IN_SCOPE_PENDING | REQ-FUNC-MATE-001, REQ-FUNC-MATE-002, REQ-FUNC-MATE-003, REQ-FUNC-MATE-004, REQ-FUNC-MATE-005, REQ-FUNC-MATE-006, REQ-FUNC-MATE-007, REQ-FUNC-MATE-008, REQ-FUNC-MATE-009, REQ-FUNC-ADMIN-003, REQ-NFR-SEC-004, REQ-NFR-SEC-008, REQ-NFR-PRIV-001, REQ-NFR-PRIV-002, REQ-NFR-PRIV-003, REQ-NFR-PRIV-004, REQ-NFR-PRIV-005 | SCR-003, SCR-004, SCR-005 | `/travel-tools`, `/mates`, `/account` | N/A | PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | `tests/e2e/mate-auth.spec.ts` | Chromium만. 흐름: (6)회원가입→로그인→성인확인→동행글 작성(연락처 차단 포함) (7)비회원 목록·상세 열람(연락처 비노출) (8)참가요청→중복차단→승인/거절 (9)신고(접수번호)·차단(상호비노출) (10)관리자 신고 상태변경·외부URL설정 | - | - | 자체(Playwright assertion) | P0 |

---

## 15. MANUAL_CHECK / CI_DEPLOY (4개 — 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 60 | CI-PIPELINE-SETUP | CI 파이프라인(Lint·타입체크·Unit·RLS) | CI_DEPLOY | IN_SCOPE_PENDING | REQ-NFR-SEC-003, REQ-NFR-ACC-003, REQ-NFR-ACC-006 | - | - | N/A | UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE, TEST-RLS-BASIC | `.github/workflows/ci.yml` | PR마다 `next lint`(`eslint-plugin-jsx-a11y`로 키보드 접근성·터치 규칙 정적 검사, ACC-003/006 일부 자동화), `tsc --noEmit`, Unit/RLS 테스트 자동 실행, 서버 저장 API 부재를 코드 리뷰 체크리스트에 명시(SEC-003) | - | - | 파이프라인 자체가 Verify | P1 |
| 61 | RELEASE-CHECK-VERCEL-SUPABASE | Vercel/Supabase 배포 확인 | CI_DEPLOY | IN_SCOPE_PENDING | REQ-NFR-SEC-001, REQ-NFR-AVAIL-003 | - | - | N/A | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005, DB-ACCESS, CI-PIPELINE-SETUP | `TASKS/checklists/release-vercel-supabase.md` | 배포 URL 5개 Route 전부 HTTPS 접근 확인(SEC-001), Supabase 연결 차단 상태를 인위적으로 만들어 SCR-001/SCR-002 정적 콘텐츠가 계속 열람되는지 브라우저로 확인(AVAIL-003) — **브라우저 확인 필요 항목을 본 Release Check에 연결**(원칙 4) | - | - | 수동 실행 결과를 체크리스트 문서에 기록 | P1 |
| 62 | CHECK-MANUAL-ACCESSIBILITY | 접근성 수동 확인(브라우저) | MANUAL_CHECK | IN_SCOPE_PENDING | REQ-NFR-ACC-001, REQ-NFR-ACC-002, REQ-NFR-ACC-003, REQ-NFR-ACC-004, REQ-NFR-ACC-005, REQ-NFR-ACC-006 | SCR-001~SCR-005 | - | N/A | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | `TASKS/checklists/manual-accessibility.md` | 5개 화면 전체 스크린리더 낭독, 키보드만으로 전체 흐름 조작, 색상 배지 옆 텍스트 라벨 존재, 터치 영역 44px 실측 — **브라우저 확인이 필요한 항목이므로 Manual Check Task로 연결**(원칙 4) | - | - | 수동 실행 결과를 체크리스트 문서에 기록 | P1 |
| 63 | CHECK-MANUAL-PERFORMANCE | 성능 수동 확인(Lighthouse) | MANUAL_CHECK | IN_SCOPE_PENDING | REQ-NFR-PERF-001, REQ-NFR-PERF-002, REQ-NFR-PERF-003, REQ-NFR-CONTENT-001 | SCR-001~SCR-005 | - | N/A | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | `TASKS/checklists/manual-performance.md` | Lighthouse로 LCP p75 목표 측정(PERF-001), 필터 응답 체감 측정(PERF-002), 입력 검증 지연 체감 측정(PERF-003), 여행지 상세 meta title/description/canonical/OG 태그 확인(CONTENT-001) — **브라우저 확인이 필요한 항목이므로 Manual Check Task로 연결**(원칙 4) | - | - | 수동 실행 결과를 체크리스트 문서에 기록 | P2 |

---

## 16. NON_IMPLEMENTATION — EXCLUDED Requirement (16개)

구현 Task를 만들지 않는다. 근거와 후속 방향을 아래에 기록해 추적표에서 삭제하지 않는다(원칙 5).

| Requirement | 요약 | 근거(`docs/PROJECT_SCOPE.md` §4 인용) | 후속 방향 |
|---|---|---|---|
| REQ-FUNC-ADMIN-001 | 여행지 콘텐츠 CRUD | 전체 콘텐츠 CMS 제외 — `src/data` 코드(PR)로 관리, 게시 승인 워크플로 운영 인력 없음 | 콘텐츠 볼륨이 늘어나 코드 관리가 비효율적이 되면 Headless CMS 도입 재검토 |
| REQ-FUNC-ADMIN-001-2 | 국가별 안전정보 CRUD | 위와 동일(전체 콘텐츠 CMS 제외) | 위와 동일 |
| REQ-FUNC-ADMIN-002 | 게시 전 완전성 검사 게이트 | 정적 데이터 구조상 런타임 게이트 불필요, TypeScript 타입 검사+코드 리뷰로 대체 | CMS 도입 시 게시 게이트 재설계 |
| REQ-FUNC-ADMIN-004 | 감사 로그 기록 | 범용 감사 로그 인프라 구축 비용 대비 운영 가치 낮음(관리자 액션이 신고 처리·URL 설정으로 한정) | 관리자 액션 범위가 넓어지면(콘텐츠 CRUD 등 추가 시) 감사 로그 재검토 |
| REQ-FUNC-ADMIN-005 | 이미지 라이선스 메타데이터 관리 | 미디어 업로드·라이선스 승인 워크플로 제외, 이미지는 URL+alt만 사용 | 자체 이미지 스토리지/업로드 기능 도입 시 재검토 |
| REQ-FUNC-ADMIN-006 | 안전정보 갱신 처리(관리자 UI) | `src/data` 코드 수정 후 배포로 갱신(CMS 제외) | 관리자 인원이 늘거나 갱신 빈도가 높아지면 UI 제공 검토 |
| REQ-NFR-AVAIL-001 | 월간 가용성 99.5% 이상 | 업타임 모니터링·SLA 운영 체계 미구축, Vercel/Supabase 기본 가용성에 의존 | 트래픽·SLA 요구 증가 시 모니터링 도구(예: UptimeRobot) 도입 |
| REQ-NFR-AVAIL-002 | 내부 API 5xx 비율 0.5% 이하 | 별도 에러율 모니터링 대시보드 미구축 | 위와 함께 관측성 도구 도입 시 재검토 |
| REQ-NFR-SEC-005 | 로그인 시도 제한(브루트포스 방지) | Supabase Auth 기본 보호에 의존, 커스텀 잠금 로직은 필수 범위 밖 | 어뷰징 징후 발견 시 rate limiting 도입 |
| REQ-NFR-SEC-006 | 세션·토큰 만료 정책(관리자 차등) | Supabase Auth 기본 세션 만료만 사용 | 관리자 보안 강화 요구 발생 시 차등 정책 설계 |
| REQ-NFR-SEC-007 | 관리자 계정 보호 강화(MFA 등) | 추가 보호 조치는 필수 범위 밖 | 관리자 계정 수 증가 시 MFA 도입 |
| REQ-NFR-PRIV-007 | 회원 탈퇴 시 개인정보 파기 | 탈퇴 플로우 자체가 필수 구현 범위에 없음 | 탈퇴 기능 추가 결정 시 파기 로직 함께 구현 |
| REQ-NFR-OBS-001 | North Star·보조 KPI 핵심 이벤트 로깅 | 별도 분석 도구 연동 필요, 필수 범위 밖 | GA4/PostHog 등 연동 결정 시 이벤트 스키마 설계 |
| REQ-NFR-OBS-002 | 관리자 변경 이력 감사 로그 보존 | REQ-FUNC-ADMIN-004와 동일 사유 | 위와 동일 |
| REQ-NFR-CONTENT-003 | 게시 전 완전성 검사 통과 의무 | REQ-FUNC-ADMIN-002와 동일 사유(CMS 제외) | 위와 동일 |
| REQ-NFR-CONTENT-004 | 이미지·텍스트 출처 정보 관리자 DB 보존 | REQ-FUNC-ADMIN-005와 동일 사유(미디어 워크플로 제외) | 위와 동일 |

---

## 17. 커버리지 전수 대조 결과

- Baseline Requirement 총수: **77개**(REQ-FUNC 42 + REQ-NFR 35)
- §3~§14 구현/검증 Task `Requirement Ref`에 등장하는 IMPLEMENT ID: **61/61**(빠짐없이 연결, 각 ID는 최소 1개 구현 Task + 최소 1개 Test/Verify Task와 연결)
- §16 `NON_IMPLEMENTATION` 표에 등재된 EXCLUDED ID: **16/16**
- **빠진 Requirement ID: 없음**

이 문서는 코드, Branch, Commit, Issue를 생성하지 않았으며 `TASKS/00_TASK_LIST.md` 산출물만 작성했다.
