# COMP-SCR001-HERO-SEARCH — 검색 Hero

- **Category:** COMPONENT (Component — 화면 구성 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 6

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 6)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 검색 Hero은(는) SCR-001(`/`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-DEST-001`
- `REQ-FUNC-DEST-002`

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** `/`
- **Page Entry:** N/A

## Design Ref

- `design-reference/D-001/DESIGN.md` §2(Color Token) §3(Typography) §4(Spacing) §5(Radius) §6(Shadow) — 임의 토큰 추가 금지
- `design-reference/D-001/DESIGN.md` §10(Search·Filter)
- `design-reference/UI_CONTRACT.md` SCR-001 절

## Depends On

없음(선행 Task 없이 착수 가능)

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/scr001/HeroSearch.tsx`

## Functional AC

도시·국가 검색 입력 시 목록 Section으로 스크롤 이동

## Visual AC

높이 약 580px(560~600px), 배경 여행 사진, 다음 Section 상단이 보이도록 제한

## Security/Privacy AC

(해당 없음 — 별도 보안/개인정보 취급 요소 없음)

## Test Cases

- **TC-01:** 도시·국가 검색 입력 시 목록 Section으로 스크롤 이동 여부를 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)

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
