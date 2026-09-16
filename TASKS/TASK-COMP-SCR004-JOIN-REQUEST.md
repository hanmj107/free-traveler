# COMP-SCR004-JOIN-REQUEST — 참가 요청 UI(중복 방지)

- **Category:** COMPONENT (Component — 화면 구성 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 31

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 31)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 참가 요청 UI(중복 방지)은(는) SCR-004(`/mates`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

`docs/PROJECT_SCOPE.md` §3 "알림" 원칙: 실제 이메일 발송 대신 Toast 또는 화면 내 상태 표시로 알림을 대체한다(참가 요청 알림, 신고 접수 확인 등). 외부 이메일 사업자 연동은 만들지 않는다.

## Requirement Ref

- `REQ-FUNC-MATE-004`
- `REQ-FUNC-MATE-005`

## Screen / Route / Page Entry

- **Screen:** SCR-004
- **Route:** `/mates`
- **Page Entry:** N/A

## Design Ref

- `design-reference/D-001/DESIGN.md` §2(Color Token) §3(Typography) §4(Spacing) §5(Radius) §6(Shadow) — 임의 토큰 추가 금지
- `design-reference/UI_CONTRACT.md` SCR-004 절

## Depends On

- `API-MATE-APPLICATIONS` — 참가 요청 생성/승인/거절 API

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/scr004/JoinRequestButton.tsx`

## Functional AC

"참가 요청 보내기" 클릭 시 PENDING 요청 생성, `(post_id, applicant_user_id)` 중복(PENDING/APPROVED) 시 409 안내("이미 참가 요청을 보낸 모집글입니다."), 승인/거절 결과는 Toast로 대체 알림(이메일 미사용)

## Visual AC

버튼+상태 배지

## Security/Privacy AC

비인증 시 SCR-005로 유도(MATE-001)

## Test Cases

- **TC-01:** "참가 요청 보내기" 클릭 시 PENDING 요청 생성 여부를 확인한다.
- **TC-02:** `(post_id, applicant_user_id)` 중복(PENDING/APPROVED) 시 409 안내("이미 참가 요청을 보낸 모집글입니다.") 여부를 확인한다.
- **TC-03:** 승인/거절 결과는 Toast로 대체 알림(이메일 미사용) 여부를 확인한다.

## Verify

- `UNIT-MATE-STATE` — 동행 상태 전이 Unit Test
- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke

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
