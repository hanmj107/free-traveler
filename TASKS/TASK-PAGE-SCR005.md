# PAGE-SCR005 — `/account` 계정·관리 조립

- **Category:** PAGE_OWNER (Page Owner — Route Page 조립)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 5

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 5)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. `/account` 계정·관리 조립은(는) SCR-005(`/account`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-MATE-001`
- `REQ-FUNC-MATE-005`
- `REQ-FUNC-ADMIN-003`
- `REQ-NFR-PRIV-001`
- `REQ-NFR-PRIV-002`
- `REQ-NFR-PRIV-003`
- `REQ-NFR-PRIV-005`
- `REQ-NFR-SEC-004`

## Screen / Route / Page Entry

- **Screen:** SCR-005
- **Route:** `/account`
- **Page Entry:** `src/app/account/page.tsx`

## Design Ref

- `design-reference/D-001/DESIGN.md` §18(화면별 Section 순서·최소 콘텐츠 수), §7(Desktop·Mobile 규칙), §17(완성형 Empty State)
- `design-reference/UI_CONTRACT.md` SCR-005 절(영역 순서·주요 Component·상태·이동·금지 기능)
- `design-reference/SCREEN_ROUTE_CONTRACT.json` screens[] 중 SCR-005 항목(route/page_entry 정본)

## Depends On

- `COMP-COMMON-HEADER` — 공통 Header(내비게이션+계정 진입)
- `COMP-COMMON-FOOTER` — 공통 Footer(3컬럼+하단 바)
- `COMP-SCR005-AUTH` — 로그인/회원가입/재설정 + 성인확인
- `COMP-SCR005-PROFILE` — 프로필 요약 + 수정 Form
- `COMP-SCR005-MY-ACTIVITY` — 내 활동(글/참가요청/차단+CTA)
- `COMP-SCR005-ADMIN` — 신고 처리 + 외부 URL 설정
- `AUTH-SUPABASE-CLIENT` — Supabase Auth 이메일 로그인/가입 + 콜백
- `AUTH-ADULT-VERIFICATION` — 성인 확인 로직
- `API-MATE-APPLICATIONS` — 참가 요청 생성/승인/거절 API
- `API-REPORTS` — 신고 생성/상태 변경 API
- `API-BLOCKS` — 차단 생성/해제 API
- `API-EXTERNAL-URLS` — 외부 URL 설정 저장/조회 API

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/account/page.tsx`

## Functional AC

역할별 Section: **Guest** — Intro(축소 Hero)→계정 Card(로그인/회원가입/재설정)→로그인 후 기능 Chip 3개→보안 안내. **Member** — 탭(프로필/내 활동): 프로필 요약+수정, 내 활동(내가 쓴 글/참가요청 관리/차단 목록/CTA). **Admin** — Member 탭 + "관리자" 탭(신고 목록+상태변경, 외부 URL 설정, **Dashboard·통계 없음**). 역할에 없는 관리 영역은 렌더링하지 않는다(비관리자 접근 시 관리자 탭 자체 미렌더링+403)

## Visual AC

3역할 모두 Intro→핵심 작업→도움말/다음 행동 구조 유지. 각 목록(동행글/참가요청/차단/신고) 0건 시 완성형 Empty State. Lorem ipsum 금지

## Security/Privacy AC

생년월일 미저장(PRIV-002), 신고·피신고 정보 관리자만 접근(PRIV-003, RLS), 외부 URL 하드코딩 금지(SEC-004)

## Test Cases

- **TC-01:** 역할별 Section: **Guest** — Intro(축소 Hero)→계정 Card(로그인/회원가입/재설정)→로그인 후 기능 Chip 3개→보안 안내 여부를 확인한다.
- **TC-02:** **Member** — 탭(프로필/내 활동): 프로필 요약+수정 여부를 확인한다.
- **TC-03:** 내 활동(내가 쓴 글/참가요청 관리/차단 목록/CTA) 여부를 확인한다.
- **TC-04:** **Admin** — Member 탭 + "관리자" 탭(신고 목록+상태변경, 외부 URL 설정, **Dashboard·통계 없음**) 여부를 확인한다.
- **TC-05:** 역할에 없는 관리 영역은 렌더링하지 않는다(비관리자 접근 시 관리자 탭 자체 미렌더링+403) 여부를 확인한다.

## Verify

- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke
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
