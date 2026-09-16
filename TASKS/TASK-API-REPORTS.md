# API-REPORTS — 신고 생성/상태 변경 API

- **Category:** API (API — Route Handler)
- **Priority:** P1
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 50

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 50)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 신고 생성/상태 변경 API은(는) 여러 화면에 걸친 공통/백엔드 계층에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

`docs/PROJECT_SCOPE.md` §3 "알림" 원칙: 실제 이메일 발송 대신 Toast 또는 화면 내 상태 표시로 알림을 대체한다(참가 요청 알림, 신고 접수 확인 등). 외부 이메일 사업자 연동은 만들지 않는다.

## Requirement Ref

- `REQ-FUNC-MATE-006`
- `REQ-FUNC-ADMIN-003`
- `REQ-NFR-PERF-004`

## Screen / Route / Page Entry

- **Screen:** N/A(화면 비종속)
- **Route:** N/A
- **Page Entry:** `src/app/api/reports/route.ts`

## Design Ref

- 해당 없음(비UI, Route Handler). `docs/PROJECT_SCOPE.md` §3 관련 원칙 및 이 Task의 Requirement Ref 절

## Depends On

- `DB-ACCESS` — DB 접근 계층(클라이언트/서버)

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/api/reports/route.ts`
- `src/app/api/reports/[id]/route.ts`

## Functional AC

신고 생성 시 접수번호(레코드 ID) 반환, 관리자만 상태(RECEIVED/IN_REVIEW/RESOLVED) 변경, 응답 p95 3초 이내 목표(PERF-004)

## Visual AC

(해당 없음 — 비UI Task)

## Security/Privacy AC

관리자 role만 상태 변경(RLS 연동)

## Test Cases

- **TC-01:** 신고 생성 시 접수번호(레코드 ID) 반환 여부를 확인한다.
- **TC-02:** 관리자만 상태(RECEIVED/IN_REVIEW/RESOLVED) 변경 여부를 확인한다.
- **TC-03:** 응답 p95 3초 이내 목표(PERF-004) 여부를 확인한다.

## Verify

- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke
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
- 실제 이메일 발송 기능(외부 이메일 사업자 연동)을 추가하지 않는다 — Toast/화면 상태로만 대체한다.
