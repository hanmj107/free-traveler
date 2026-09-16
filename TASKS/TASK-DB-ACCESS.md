# DB-ACCESS — DB 접근 계층(클라이언트/서버)

- **Category:** DB (DB — 스키마/RLS/접근 계층)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 44

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 44)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. DB 접근 계층(클라이언트/서버)은(는) 여러 화면에 걸친 공통/백엔드 계층에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

`docs/PROJECT_SCOPE.md` §3 "모집글 자동 마감" 원칙: 별도 배치 작업(cron) 없이 목록·상세 조회 시점에 `end_date`와 현재일을 비교해 마감 상태를 계산한다.

## Requirement Ref

- `REQ-FUNC-MATE-002`
- `REQ-FUNC-MATE-004`
- `REQ-FUNC-MATE-005`
- `REQ-FUNC-MATE-006`
- `REQ-FUNC-MATE-007`
- `REQ-FUNC-MATE-008`
- `REQ-NFR-AVAIL-003`

## Screen / Route / Page Entry

- **Screen:** N/A(화면 비종속)
- **Route:** N/A
- **Page Entry:** N/A

## Design Ref

- 해당 없음(비UI, 백엔드 데이터 계층). 단 `.claude/skills/traveler-project-pipeline/SKILL.md` §6(DB 제약 — 정확히 6개 테이블)을 따른다
- `docs/06_SRS_UIUX_REVISED.md`의 관련 REQ-FUNC-MATE-*, REQ-NFR-PRIV-* 절

## Depends On

- `DB-SCHEMA-BASE` — Supabase 스키마 정의(6개 테이블)
- `DB-RLS-BASE` — RLS 정책 정의

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

## Functional AC

Supabase 클라이언트(브라우저)/서버(Route Handler) 인스턴스 분리 제공, 마감 상태는 조회 시점 계산(배치 없음, MATE-008), Supabase 장애 시에도 정적 데이터(§9) 화면은 정상 열람(AVAIL-003)

## Visual AC

(해당 없음 — 비UI Task)

## Security/Privacy AC

서비스 role 키는 서버 전용, 브라우저 노출 금지

## Test Cases

- **TC-01:** Supabase 클라이언트(브라우저)/서버(Route Handler) 인스턴스 분리 제공 여부를 확인한다.
- **TC-02:** 마감 상태는 조회 시점 계산(배치 없음, MATE-008) 여부를 확인한다.
- **TC-03:** Supabase 장애 시에도 정적 데이터(§9) 화면은 정상 열람(AVAIL-003) 여부를 확인한다.

## Verify

- `TEST-RLS-BASIC` — RLS 기본 정책 Integration Test
- `RELEASE-CHECK-VERCEL-SUPABASE` — Vercel/Supabase 배포 확인

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
