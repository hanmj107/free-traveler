# DB-RLS-BASE — RLS 정책 정의

- **Category:** DB (DB — 스키마/RLS/접근 계층)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 43

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 43)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. RLS 정책 정의은(는) 여러 화면에 걸친 공통/백엔드 계층에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-NFR-PRIV-003`
- `REQ-NFR-PRIV-004`

## Screen / Route / Page Entry

- **Screen:** N/A(화면 비종속)
- **Route:** N/A
- **Page Entry:** N/A

## Design Ref

- 해당 없음(비UI, 백엔드 데이터 계층). 단 `.claude/skills/traveler-project-pipeline/SKILL.md` §6(DB 제약 — 정확히 6개 테이블)을 따른다
- `docs/06_SRS_UIUX_REVISED.md`의 관련 REQ-FUNC-MATE-*, REQ-NFR-PRIV-* 절

## Depends On

- `DB-SCHEMA-BASE` — Supabase 스키마 정의(6개 테이블)

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `supabase/migrations/0002_rls_policies.sql`

## Functional AC

`reports`는 관리자 role만 SELECT, `user_blocks` 반영 시 상대방 `mate_posts`가 서로 비노출되도록 정책/뷰 정의, `mate_applications`는 본인 또는 대상 글 작성자만 조회

## Visual AC

(해당 없음 — 비UI Task)

## Security/Privacy AC

신고·피신고 정보 관리자 전용(PRIV-003), 차단 상호 비노출(PRIV-004)

## Test Cases

- **TC-01:** `reports`는 관리자 role만 SELECT 여부를 확인한다.
- **TC-02:** `user_blocks` 반영 시 상대방 `mate_posts`가 서로 비노출되도록 정책/뷰 정의 여부를 확인한다.
- **TC-03:** `mate_applications`는 본인 또는 대상 글 작성자만 조회 여부를 확인한다.

## Verify

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
- `DB-SCHEMA-BASE`가 정의한 6개 테이블 구조를 벗어나는 새 테이블을 추가하지 않는다.
