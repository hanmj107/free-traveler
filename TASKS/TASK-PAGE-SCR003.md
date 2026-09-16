# PAGE-SCR003 — `/travel-tools` 통합 여행 준비 조립

- **Category:** PAGE_OWNER (Page Owner — Route Page 조립)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 3

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 3)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. `/travel-tools` 통합 여행 준비 조립은(는) SCR-003(`/travel-tools`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-FLIGHT-001`
- `REQ-FUNC-FLIGHT-002`
- `REQ-FUNC-FLIGHT-003`
- `REQ-FUNC-FLIGHT-004`
- `REQ-FUNC-FLIGHT-005`
- `REQ-FUNC-FLIGHT-006`
- `REQ-FUNC-HOTEL-001`
- `REQ-FUNC-HOTEL-002`
- `REQ-FUNC-HOTEL-003`
- `REQ-FUNC-HOTEL-004`
- `REQ-FUNC-HOTEL-005`
- `REQ-FUNC-HOTEL-006`
- `REQ-FUNC-HOTEL-007`
- `REQ-FUNC-MATE-001`
- `REQ-FUNC-MATE-003`
- `REQ-FUNC-MATE-009`

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** `/travel-tools`
- **Page Entry:** `src/app/travel-tools/page.tsx`

## Design Ref

- `design-reference/D-001/DESIGN.md` §18(화면별 Section 순서·최소 콘텐츠 수), §7(Desktop·Mobile 규칙), §17(완성형 Empty State)
- `design-reference/UI_CONTRACT.md` SCR-003 절(영역 순서·주요 Component·상태·이동·금지 기능)
- `design-reference/SCREEN_ROUTE_CONTRACT.json` screens[] 중 SCR-003 항목(route/page_entry 정본)

## Depends On

- `COMP-COMMON-HEADER` — 공통 Header(내비게이션+계정 진입)
- `COMP-COMMON-FOOTER` — 공통 Footer(3컬럼+하단 바)
- `COMP-SCR003-INTRO-TABS` — Intro 3단계 안내 + 탭 네비게이션
- `COMP-SCR003-FLIGHT-FORM` — 항공 조건 입력·검증·요약·외부이동
- `COMP-SCR003-HOTEL-FORM` — 숙소 조건 입력·검증·요약·외부이동
- `COMP-SCR003-TIPS` — 찾기 Tip 카드 3개
- `COMP-SCR003-MATE-COMPOSE` — 동행 작성 Form(연락처 탐지+안전수칙)
- `COMP-SCR003-LOGIN-GUARD` — 로그인 유도 카드 + 안전 안내 패널
- `API-EXTERNAL-URLS` — 외부 URL 설정 저장/조회 API
- `AUTH-ADULT-VERIFICATION` — 성인 확인 로직

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/travel-tools/page.tsx`

## Functional AC

Section 순서: Header→Intro(3단계 안내)→탭(항공편/숙소/동행 구하기, 탭별 입력·검증·완료 상태 완전 분리)→여행정보 Form(좌: 입력, 우: 실시간 요약)→입력 요약·외부 이동 Action Card→찾기 Tip 3개→[동행 구하기 탭] 동행 작성 Form 또는 (비인증 시) 로그인 안내+안전 안내 사이드 패널→Footer

## Visual AC

Desktop(폼+요약 좌우 분할)·Mobile(폼→요약 세로 스택), 탭 pill 가로 스크롤 가능. Lorem ipsum·"준비 중" 금지, Tip 카드 3개 모두 실제 문구

## Security/Privacy AC

항공·숙소 입력값 서버·URL·쿠키 미전송(FLIGHT-006, HOTEL-005/006), 외부 이동 `noopener noreferrer`(SEC-002), 연락처 패턴 탐지 시 제출 차단(MATE-009), 모집글 본문 새니타이즈(SEC-008)

## Test Cases

- **TC-01:** Section 순서: Header→Intro(3단계 안내)→탭(항공편/숙소/동행 구하기, 탭별 입력·검증·완료 상태 완전 분리)→여행정보 Form(좌: 입력, 우: 실시간 요약)→입력 요약·외부 이동 Action Card→찾기 Tip 3개→[동행 구하기 탭] 동행 작성 Form 또는 (비인증 시) 로그인 안내+안전 안내 사이드 패널→Footer 여부를 확인한다.

## Verify

- `E2E-TRAVEL-TOOLS` — 여행 준비 Smoke(항공·숙소·Tip)
- `UNIT-TRAVEL-DATES` — 날짜 검증 Unit Test
- `UNIT-CONTACT-DETECTION` — 연락처 탐지 Unit Test

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
