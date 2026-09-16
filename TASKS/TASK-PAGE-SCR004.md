# PAGE-SCR004 — `/mates` 동행 조회 조립

- **Category:** PAGE_OWNER (Page Owner — Route Page 조립)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 4

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 4)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. `/mates` 동행 조회 조립은(는) SCR-004(`/mates`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-MATE-002`
- `REQ-FUNC-MATE-004`
- `REQ-FUNC-MATE-005`
- `REQ-FUNC-MATE-006`
- `REQ-FUNC-MATE-007`
- `REQ-FUNC-MATE-008`

## Screen / Route / Page Entry

- **Screen:** SCR-004
- **Route:** `/mates`
- **Page Entry:** `src/app/mates/page.tsx`

## Design Ref

- `design-reference/D-001/DESIGN.md` §18(화면별 Section 순서·최소 콘텐츠 수), §7(Desktop·Mobile 규칙), §17(완성형 Empty State)
- `design-reference/UI_CONTRACT.md` SCR-004 절(영역 순서·주요 Component·상태·이동·금지 기능)
- `design-reference/SCREEN_ROUTE_CONTRACT.json` screens[] 중 SCR-004 항목(route/page_entry 정본)

## Depends On

- `COMP-COMMON-HEADER` — 공통 Header(내비게이션+계정 진입)
- `COMP-COMMON-FOOTER` — 공통 Footer(3컬럼+하단 바)
- `COMP-SCR004-INTRO-CTA` — Intro CTA Banner
- `COMP-SCR004-FILTER` — 검색 Filter + 결과 요약
- `COMP-SCR004-LIST` — 동행 목록 카드(최대 8개)
- `COMP-SCR004-DETAIL` — 상세 패널(Desktop 분할)/Drawer(Mobile)
- `COMP-SCR004-JOIN-REQUEST` — 참가 요청 UI(중복 방지)
- `COMP-SCR004-REPORT` — 신고 UI(접수번호 표시)
- `COMP-SCR004-BLOCK` — 차단 UI
- `COMP-SCR004-GUIDE-SAFETY` — 참가 방법 3단계 + 안전 안내 CTA
- `API-MATE-POSTS` — 모집글 생성/조회 API
- `API-MATE-APPLICATIONS` — 참가 요청 생성/승인/거절 API
- `API-REPORTS` — 신고 생성/상태 변경 API
- `API-BLOCKS` — 차단 생성/해제 API

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/mates/page.tsx`

## Functional AC

Section 순서: Header→Intro(CTA Banner)→Filter+결과 요약("조건에 맞는 모집글 N건")→동행 목록(카드 최대 8개, API-MATE-POSTS)→상세(Desktop 좌우 분할/Mobile Drawer)→신청 방법 3단계→안전·신고·차단 안내+CTA→Footer

## Visual AC

Desktop(목록+상세 좌우 분할)·Mobile(목록→상세 Drawer). 필터 결과 0건 시 완성형 Empty State("조건에 맞는 동행 모집글이 없습니다."+조건 완화 안내+필터 초기화+작성 CTA). Lorem ipsum·연락처 노출 카드 금지

## Security/Privacy AC

목록·상세에 작성자 닉네임만 표시(연락처 비노출, MATE-002), 차단 관계 상호 비노출(PRIV-004), 비인증 참가요청/신고/차단 시도 시 SCR-005로 유도(MATE-001)

## Test Cases

- **TC-01:** Section 순서: Header→Intro(CTA Banner)→Filter+결과 요약("조건에 맞는 모집글 N건")→동행 목록(카드 최대 8개, API-MATE-POSTS)→상세(Desktop 좌우 분할/Mobile Drawer)→신청 방법 3단계→안전·신고·차단 안내+CTA→Footer 여부를 확인한다.

## Verify

- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke
- `UNIT-MATE-STATE` — 동행 상태 전이 Unit Test
- `TEST-RLS-BASIC` — RLS 기본 정책 Integration Test

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
