# TEST-RLS-BASIC — RLS 기본 정책 Integration Test

- **Category:** INTEGRATION_TEST (Integration Test)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 56

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 56)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. RLS 기본 정책 Integration Test은(는) SCR-004, SCR-005(경로 -)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-NFR-PRIV-003`
- `REQ-NFR-PRIV-004`

## Screen / Route / Page Entry

- **Screen:** SCR-004, SCR-005
- **Route:** N/A
- **Page Entry:** N/A

## Design Ref

- 해당 없음(비UI, 테스트 코드). 검증 대상 Task의 Functional AC를 테스트 케이스의 근거로 삼는다

## Depends On

- `DB-RLS-BASE` — RLS 정책 정의
- `DB-SEED-BASE` — 개발/테스트 시드 데이터

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `supabase/tests/rls_basic.sql`
- `tests/integration/rls.spec.ts`

## Functional AC

비관리자가 `reports` 조회 시 차단됨, 차단된 상대방의 `mate_posts`가 목록/상세에 노출되지 않음을 실제 쿼리로 검증

## Visual AC

(해당 없음 — 비UI Task)

## Security/Privacy AC

(해당 없음 — 별도 보안/개인정보 취급 요소 없음)

## Test Cases

- **TC-01:** 비관리자가 `reports` 조회 시 차단됨 여부를 확인한다.
- **TC-02:** 차단된 상대방의 `mate_posts`가 목록/상세에 노출되지 않음을 실제 쿼리로 검증 여부를 확인한다.
- **TC-03:** 위 시나리오가 실패(회귀)할 경우 CI에서 실패로 표시되는지 확인한다.

## Verify

- `CI-PIPELINE-SETUP` — CI 파이프라인(Lint·타입체크·Unit·RLS)

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
