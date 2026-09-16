# PAGE-SCR001 — `/` 메인 페이지 조립

- **Category:** PAGE_OWNER (Page Owner — Route Page 조립)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 1

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 1)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. `/` 메인 페이지 조립은(는) SCR-001(`/`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-DEST-001`
- `REQ-FUNC-DEST-002`
- `REQ-FUNC-DEST-003`
- `REQ-FUNC-DEST-004`
- `REQ-FUNC-DEST-005`
- `REQ-FUNC-SAFETY-001`
- `REQ-FUNC-SAFETY-002`
- `REQ-FUNC-SAFETY-003`
- `REQ-FUNC-SAFETY-004`
- `REQ-FUNC-SAFETY-005`
- `REQ-NFR-CONTENT-001`
- `REQ-NFR-CONTENT-002`
- `REQ-NFR-CONTENT-005`

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** `/`
- **Page Entry:** `src/app/page.tsx`

## Design Ref

- `design-reference/D-001/DESIGN.md` §18(화면별 Section 순서·최소 콘텐츠 수), §7(Desktop·Mobile 규칙), §17(완성형 Empty State)
- `design-reference/UI_CONTRACT.md` SCR-001 절(영역 순서·주요 Component·상태·이동·금지 기능)
- `design-reference/SCREEN_ROUTE_CONTRACT.json` screens[] 중 SCR-001 항목(route/page_entry 정본)

## Depends On

- `COMP-COMMON-HEADER` — 공통 Header(내비게이션+계정 진입)
- `COMP-COMMON-FOOTER` — 공통 Footer(3컬럼+하단 바)
- `COMP-SCR001-HERO-SEARCH` — 검색 Hero
- `COMP-SCR001-DEST-DOMESTIC` — 국내 인기 여행지 카드 6개
- `COMP-SCR001-DEST-GLOBAL` — 해외 인기 여행지 카드 6개
- `COMP-SCR001-THEME-CHIPS` — 여행 동기·테마 Chip 6개
- `COMP-SCR001-SAFETY-CARDS` — 국가별 주의사항 카드 6개
- `COMP-SCR001-DEST-DRAWER` — 여행지 상세 Drawer + 안전정보 패널
- `COMP-SCR001-MATE-SUMMARY` — 최근 동행글 요약 3개 또는 Empty State
- `COMP-SCR001-ABOUT-SUMMARY` — free_traveler 요약(좌우 분할+CTA)
- `DATA-DESTINATIONS` — 여행지 정적 데이터
- `DATA-SAFETY` — 국가별 안전정보 정적 데이터
- `DATA-REPRESENTATIVE` — 대표 소개 정적 데이터

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/page.tsx`

## Functional AC

Section 순서: Header→①Hero(검색, ~580px)→②국내 여행지 6개(DATA-DESTINATIONS)→③해외 여행지 6개(DATA-DESTINATIONS)→④여행 동기 Chip 6개→⑤국가별 주의사항 6개(DATA-SAFETY)→⑥최근 동행글 3개 또는 완성형 Empty State(API-MATE-POSTS)→⑦free_traveler 소개(DATA-REPRESENTATIVE)→Footer. 각 Section 데이터 출처를 코드 주석 없이 컴포넌트 props로 명시. Create Next App 기본 스타터(로고·"To get started"·Deploy Now/Documentation 링크) 완전 제거. Next.js Metadata API로 SEO 메타데이터 생성(CONTENT-001)

## Visual AC

Desktop 1440(Card 4열, Hero 아래 다음 Section 120~150px 노출)·Mobile 390(Card 1열) 반응형 콘텐츠 밀도 준수. Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 Card 금지. Section 6 데이터 0건 시 상황설명+이용방법+CTA 3요소를 갖춘 완성형 Empty State 필수

## Security/Privacy AC

외부 링크(안전정보 출처) `target=_blank rel=noopener noreferrer`(SEC-002)

## Test Cases

- **TC-01:** Section 순서: Header→①Hero(검색, ~580px)→②국내 여행지 6개(DATA-DESTINATIONS)→③해외 여행지 6개(DATA-DESTINATIONS)→④여행 동기 Chip 6개→⑤국가별 주의사항 6개(DATA-SAFETY)→⑥최근 동행글 3개 또는 완성형 Empty State(API-MATE-POSTS)→⑦free_traveler 소개(DATA-REPRESENTATIVE)→Footer 여부를 확인한다.
- **TC-02:** 각 Section 데이터 출처를 코드 주석 없이 컴포넌트 props로 명시 여부를 확인한다.
- **TC-03:** Create Next App 기본 스타터(로고·"To get started"·Deploy Now/Documentation 링크) 완전 제거 여부를 확인한다.
- **TC-04:** Next.js Metadata API로 SEO 메타데이터 생성(CONTENT-001) 여부를 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)
- `CHECK-MANUAL-ACCESSIBILITY` — 접근성 수동 확인(브라우저)
- `CHECK-MANUAL-PERFORMANCE` — 성능 수동 확인(Lighthouse)

## Definition of Done

- [ ] Functional AC 전부 충족
- [ ] Visual AC 전부 충족(해당 사항이 있는 경우)
- [ ] Security/Privacy AC 전부 충족(해당 사항이 있는 경우)
- [ ] Verify에 명시된 Task가 통과함
- [ ] Expected Files 목록에 명시된 파일만 추가·수정됨(그 밖의 파일 변경 없음)
- [ ] `design-reference/D-001/DESIGN.md`·`design-reference/UI_CONTRACT.md` 규칙과 상충하지 않음
- [ ] Depends On에 명시된 Task가 모두 완료된 상태에서 작업을 시작함
- [ ] Requirement Ref로 연결된 모든 Requirement의 관련 동작이 구현·검증됨

## Forbidden

- **Expected Files 목록 밖의 파일을 생성·수정하지 않는다.**
- Airbnb 상표 요소(정확한 색상값·서체·워드마크·배지 문구), 구매·예약·결제 UI를 추가하지 않는다.
- Proprietary(독점) 폰트 파일을 추가하지 않는다(Inter + 시스템 한글 폰트 폴백만 사용).
- `design-reference/D-001/DESIGN.md`에 정의되지 않은 임의의 색상·타이포그래피·Radius·Shadow 토큰을 추가하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 등 placeholder 문구나 내용 없는 빈 Card를 두지 않는다.
- `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`에 등재된 EXCLUDED Requirement에 대응하는 기능(콘텐츠 CRUD, 감사 로그, 관리자 Dashboard·통계, MFA, 이메일 발송 연동 등)을 구현하지 않는다.
- **하위 Component·Data·API 파일을 이 Task에서 직접 생성하지 않는다.** Depends On에 명시된 Task들이 이미 제공하는 결과물을 Route Page에서 조립하는 것만 이 Task의 범위다.
