---
name: traveler-project-pipeline
description: Free Traveler 프로젝트에서 승인된 5개 Screen과 SRS 요구사항 매핑을 근거로 구현 Task List/상세 Task를 생성·검증하는 파이프라인. `/gen-tasklist`, `/gen-task-details`, `/audit-tasks` 명령과 `scripts/validate_inputs.py`, `scripts/audit_tasks.py`가 이 Skill의 규칙을 공유한다. Task 생성/검증 작업을 할 때 항상 이 문서를 먼저 읽는다.
---

# Traveler Task 생성 Pipeline

이 Skill은 Free Traveler의 "설계 확정 → Task 생성 → Task 상세화 → 감사" 파이프라인의 단일 규칙 출처(source of truth)다. `/gen-tasklist`, `/gen-task-details`, `/audit-tasks` 세 커맨드와 `scripts/validate_inputs.py`, `scripts/audit_tasks.py` 두 스크립트는 모두 이 문서의 정의·규칙·파일 경로 규약을 따른다. 하나를 변경하면 이 문서와 나머지 4개 파일을 함께 갱신한다.

> **이력 고지:** 이 파이프라인은 초기에 `docs/tasks/TASK_LIST.json` + `docs/tasks/details/*.md` 경로를 정의했으나, 실제 운영은 `TASKS/00_TASK_LIST.md` + `TASKS/TASK-<ID>.md`(Markdown 전용, JSON 없음) 경로로 진행됐다. **이 문서와 세 커맨드는 실제 운영 경로(`TASKS/`)만을 정본으로 기록한다.** `docs/tasks/` 경로는 더 이상 사용하지 않는다.

## 0. 용어 고지 — Requirement 총수

이 프로젝트의 실제 Baseline Requirement 총수는 `docs/PROJECT_SCOPE.md`/`docs/UIUX_TRACEABILITY.md`/`docs/06_SRS_UIUX_REVISED.md` 기준 **77개**(`REQ-FUNC-*` 42개 + `REQ-NFR-*` 35개, 도메인 접두어 ID 체계)다. 외부에서 "REQ-FUNC-001~080·REQ-NF-001~034"(총 114개) 같은 순번 표기를 요구하더라도, 이 프로젝트에는 그런 ID가 존재하지 않는다. **§7 "모든 Requirement에 IMPLEMENT/EXCLUDED 기록" 규칙은 이 실제 77개 전체를 대상으로 한다.** Requirement의 IMPLEMENT/EXCLUDED 판정 정본은 `docs/PROJECT_SCOPE.md` §5다. 스크립트도 하드코딩된 개수(77 또는 114)를 강제하지 않고 `docs/PROJECT_SCOPE.md`에 실제로 등재된 행 수를 읽어 그 전체가 빠짐없이 처리되었는지 검증한다.

## 1. 입력 문서 (모두 읽고 시작)

| 파일 | 용도 |
|---|---|
| `docs/06_SRS_UIUX_REVISED.md` | Requirement별 최종 Screen/Route 배치 |
| `docs/PROJECT_SCOPE.md` | **IMPLEMENT/EXCLUDED 판정 정본**(6개 테이블 DB, 정적 데이터, 알림 대체 등 구현 방식 원칙 포함) |
| `docs/UIUX_TRACEABILITY.md` | Requirement 77개 전체의 Screen/Route/Page Entry 추적표(교차 확인용) |
| `design-reference/D-001/DESIGN.md` | **디자인 토큰·Section 계약 정본** — Header·Footer/Search·Filter/Card/Form·Tabs/Drawer·Modal/Alert·Toast/Loading·Empty·Error, §17 Empty State, §18 화면별 Section 순서·최소 콘텐츠 수, §19 Do/Do Not |
| `design-reference/UI_CONTRACT.md` | Screen별 영역 순서·컴포넌트·상태·이동·금지 기능 |
| `design-reference/SCREEN_ROUTE_CONTRACT.json` | **Screen 목록의 정본(source of truth)** — Route/Page Entry/기술 Route/이동 계약 |
| `docs/ARCHITECTURE.md` | Server/Client Component 경계, Supabase 사용 범위, DB 6테이블, 테스트·CI·배포, 착수 차단 항목 |
| `docs/DECISION_LOG.md` | DEC-001~014 확정 결정(Wave 실행 단위, EXCLUDED 관리 방식 등) |
| `CLAUDE.md`(루트) | Harness Marker와 23개 필수 규칙(§2에서 이 Skill과의 정합성을 확인한다) |
| 현재 `package.json`, `src/app`, `TASKS/` 파일 트리 | 이미 존재하는 파일을 실제로 확인해 중복 Task·중복 파일을 만들지 않기 위함 |

## 2. HARNESS_SCHEMA와 루트 CLAUDE.md Harness Marker

```
HARNESS_SCHEMA = "traveler-screen-route-v1"
```

이 값은 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `schema_version` 및 루트 `CLAUDE.md`의 `HARNESS_SCHEMA` 마커와 반드시 일치해야 한다. 세 값 중 하나라도 다르면 파이프라인을 중단하고 사람에게 보고한다.

루트 `CLAUDE.md`가 정의하는 나머지 Harness Marker(`DESIGN_PATH`, `SCREEN_CONTRACT`, `PROJECT_SCOPE`, `PLAYWRIGHT_ENABLED`, `PLAYWRIGHT_SCOPE=chromium-smoke`, `AUTO_MERGE=false`, `AWS_ENABLED=false`)는 이 Skill의 §1 입력 문서 경로, §9 금지 Task, §12 테스트 범위와 각각 대응하며 서로 모순되지 않는다.

## 3. Screen 목록의 정본

`design-reference/SCREEN_ROUTE_CONTRACT.json`의 `screens` 배열이 유일한 정본이다. 다른 문서의 Screen 설명은 참고용이며, Route·Page Entry 값이 JSON과 다르면 **JSON이 우선**한다.

| Screen ID | Route | Page Entry | Tier |
|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | core |
| SCR-002 | `/about` | `src/app/about/page.tsx` | core |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | core |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | core |
| SCR-005 | `/account` | `src/app/account/page.tsx` | auxiliary |

## 4. Task Category와 ID 접두어

| Category | 설명 | ID 접두어 예시 |
|---|---|---|
| `PAGE_OWNER` | Screen 1개를 전담해 Page Entry에서 Component를 실제로 조립하는 Task. **정확히 5개**, Screen당 1개 | `PAGE-SCR001`~`PAGE-SCR005` |
| `COMPONENT` | Page Owner가 조립하는 재사용 가능한 UI 조각(폼, 카드, 패널 등) | `COMP-SCR0NN-*` |
| `DATA` | 여행지·안전정보·대표 소개 정적 데이터(`src/data/*.ts`) | `DATA-DESTINATIONS`, `DATA-SAFETY`, `DATA-REPRESENTATIVE` |
| `DB` | Supabase 스키마·RLS·접근 계층·시드(6개 테이블 한정) | `DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE` |
| `AUTH` | Supabase Auth·성인 확인·인증 콜백 | `AUTH-SUPABASE-CLIENT`, `AUTH-ADULT-VERIFICATION` |
| `API` | Route Handler(`src/app/api/**/route.ts`) | `API-*` |
| `UNIT_TEST` | Vitest 단위 테스트 | `UNIT-*` |
| `INTEGRATION_TEST` | RLS 등 통합 테스트 | `TEST-RLS-*` |
| `E2E_TEST` | Playwright **Chromium Smoke** Task | `E2E-*` |
| `MANUAL_CHECK` | 브라우저 수동 확인(접근성·성능) | `CHECK-MANUAL-*` |
| `CI_DEPLOY` | CI 파이프라인·Vercel/Supabase 배포 확인 | `CI-*`, `RELEASE-*` |

**Page Owner와 Component Task는 명확히 구분한다.** Page Owner는 Page Entry에서 Component 결과물을 실제로 조립하는 것만 범위로 하며, **하위 Component 파일을 Page Owner Task 안에서 새로 만들지 않는다.** 개별 UI 로직(폼 검증, Drawer 애니메이션 등)은 Component Task로 분리한다. **Page Owner는 같은 Screen에 속한 모든 Component Task를 `Depends On`에 명시한다.**

## 5. Page Owner 5개 — Screen별 고유 규칙

- **`PAGE-SCR001`(`src/app/page.tsx`, SCR-001):** Functional AC에 **Create Next App 기본 스타터 콘텐츠(Next.js 로고, "To get started..." 문구, Deploy Now/Documentation 링크) 완전 제거**를 명시한다.
- **`PAGE-SCR003`(`src/app/travel-tools/page.tsx`, SCR-003):** Functional AC에 **항공편·숙소·동행 구하기 3개 탭을 실제로 조립**(탭별 입력/검증/완료 상태 완전 분리)함을 명시한다.
- **`PAGE-SCR005`(`src/app/account/page.tsx`, SCR-005):** Functional AC에 **Guest·Member·Admin 3개 역할 상태를 실제로 조립**(역할에 없는 탭은 렌더링하지 않음)함을 명시한다.

모든 Page Owner의 Functional/Visual AC는 다음을 반드시 포함한다:
1. `design-reference/D-001/DESIGN.md` §18에 정의된 **화면별 Section 순서**와 **최소 콘텐츠 수**(예: SCR-001 국내/해외 여행지 각 6개, SCR-002 Timeline 6개 이상·방문국가 30개국·Gallery 8장 이상·기억에 남는 여행지 4개, SCR-003 Tip 3개, SCR-004 목록 최대 8개)
2. 큰 빈 영역·Placeholder 문구(Lorem ipsum, "준비 중", "정보 확인 필요") 금지
3. 데이터가 없을 때도 상황 설명+이용 방법+CTA 3요소를 갖춘 완성형 Empty State(`design-reference/D-001/DESIGN.md` §17)

## 6. DB 제약 — 정확히 6개 테이블

`DB-SCHEMA-BASE` Task가 정의하는 Supabase 테이블은 **다음 6개로 제한**한다(그 이상도 이하도 만들지 않는다):

1. `profiles` — 이메일·닉네임·성인확인여부·확인시각(생년월일 미저장, REQ-NFR-PRIV-001/002)
2. `mate_posts` — 동행 모집글(국가·지역·기간·스타일·본문·상태)
3. `mate_applications` — 참가 요청(`(post_id, applicant_user_id)` 유니크 제약, REQ-FUNC-MATE-004)
4. `user_blocks` — 차단 관계(REQ-FUNC-MATE-007, REQ-NFR-PRIV-004)
5. `reports` — 신고(접수번호=PK, 상태: RECEIVED/IN_REVIEW/RESOLVED, REQ-FUNC-MATE-006, ADMIN-003)
6. `app_settings` — 외부 항공/호텔 랜딩 URL 등 환경설정(REQ-NFR-SEC-004)

여행지·국가별 안전정보·대표 소개는 테이블을 만들지 않고 **정적 데이터 Task(`DATA` category)**로 만든다(`src/data/destinations.ts`, `src/data/countrySafety.ts`, `src/data/about.ts`) — `docs/PROJECT_SCOPE.md` §3 "콘텐츠 저장 방식" 원칙.

## 7. Requirement 커버리지 — IMPLEMENT/EXCLUDED 전수 기록

`docs/PROJECT_SCOPE.md`에 등재된 **모든** Requirement(77개)에 대해 `TASKS/00_TASK_LIST.md`가 다음을 보장해야 한다.

- **IMPLEMENT** Requirement는 하나 이상의 Task의 `Requirement Ref`에 등장해야 한다.
- **EXCLUDED** Requirement는 상세 구현 Task를 만들지 않는다(§8 참조). 대신 `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION` 표에 ID·근거·후속 방향을 그대로 유지해 추적표에서 삭제하지 않는다.
- Task 하나가 여러 Requirement를 커버할 수 있고(예: `PAGE-SCR003`이 FLIGHT/HOTEL 여러 건을 커버), Requirement 하나가 여러 Task에 걸칠 수도 있다(예: REQ-FUNC-MATE-001은 SCR-003/004/005에 걸침).

## 8. EXCLUDED 처리 규칙

EXCLUDED Requirement(16개: `REQ-FUNC-ADMIN-001/001-2/002/004/005/006`, `REQ-NFR-AVAIL-001/002`, `REQ-NFR-SEC-005/006/007`, `REQ-NFR-PRIV-007`, `REQ-NFR-OBS-001/002`, `REQ-NFR-CONTENT-003/004`)는:
- 상세 구현 Task(코드를 작성하는 Task)와 `TASKS/TASK-*.md` 파일을 **만들지 않는다.**
- 그러나 `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION` 표에서 ID와 제외 사유·후속 방향(`docs/PROJECT_SCOPE.md` §4 인용)을 유지해 추적표에서 사라지지 않게 한다.
- 어떤 Task의 `Requirement Ref`에도 EXCLUDED ID가 등장해서는 안 된다(`scripts/audit_tasks.py` 검사 18).

## 9. 금지 Task (만들지 않는다)

- 자동 Merge/병합 파이프라인 Task(`AUTO_MERGE=false`, `docs/DECISION_LOG.md` DEC-012)
- EC2·AWS 인프라 구축 Task(`AWS_ENABLED=false`, `docs/DECISION_LOG.md` DEC-013). 배포는 Vercel만 사용한다.
- Playwright의 Firefox/WebKit 등 **Chromium 외 브라우저** Task, 또는 "Smoke"가 아닌 회귀/시각적 테스트 Task(`PLAYWRIGHT_SCOPE=chromium-smoke`)
- 항공·숙소 입력값을 서버·DB·URL 쿼리·로그·분석 도구로 전송하는 어떤 형태의 Task/구현(REQ-FUNC-FLIGHT-006, HOTEL-005/006 — Client Component의 일시 상태로만 유지, `docs/ARCHITECTURE.md` §4·§5)
- `docs/PROJECT_SCOPE.md`/`design-reference/D-001/DESIGN.md`가 EXCLUDED로 명시한 기능(콘텐츠 CRUD CMS, 감사 로그, 관리자 Dashboard·통계, 외부 Email 공급자, Monitoring)을 구현하는 Task(`docs/ARCHITECTURE.md` §15)
- Prisma·Drizzle·TypeORM 등 ORM을 추가하는 Task(`docs/ARCHITECTURE.md` §11)
- Airbnb 상표 요소, 예약/결제 UI, Proprietary 폰트, 임의 색상 토큰을 추가하는 Task(`design-reference/D-001/DESIGN.md` §19)
- **실제 애플리케이션 구현 코드(`src/**`, `supabase/**` 등)를 직접 작성하는 것은 이 세 커맨드(`/gen-tasklist`, `/gen-task-details`, `/audit-tasks`)의 범위가 아니다.** 이 커맨드들은 Task 계획 문서(`TASKS/*.md`, `TASKS/*.csv`)만 생성·검증한다. 실제 코드 작성은 별도의 Wave 실행 단계(`docs/DECISION_LOG.md` DEC-010·DEC-011, 루트 `CLAUDE.md` 규칙 6·7)에서 이루어진다.

## 10. 산출물 경로 규약

| 산출물 | 경로 | 생성/검증 커맨드 |
|---|---|---|
| Task List(유일한 정본, Markdown) | `TASKS/00_TASK_LIST.md` | `/gen-tasklist` |
| Task 상세 파일 | `TASKS/TASK-<TASK_ID>.md` | `/gen-task-details` |
| Task 매니페스트(CSV) | `TASKS/TASK_MANIFEST.csv` | `/audit-tasks`(`scripts/audit_tasks.py`가 생성) |
| 감사 결과 리포트 | `TASKS/TASK_AUDIT_REPORT.md` | `/audit-tasks`(`scripts/audit_tasks.py`가 생성) |

**JSON 형태의 Task List(`TASK_LIST.json`)는 만들지 않는다.** `TASKS/00_TASK_LIST.md`가 유일한 Task List 정본이다.

### TASKS/00_TASK_LIST.md 표 형식(16열, 고정)

```
Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority
```

- `Category`는 §4의 11개 값 중 하나만 사용한다.
- `Implementation Status`는 `IN_SCOPE_PENDING`(아직 미구현)만 사용한다. 실제로 코드가 완성되기 전까지 `IMPLEMENTED`로 거짓 기록하지 않는다.
- `TASKS/00_TASK_LIST.md` §16에 `NON_IMPLEMENTATION`(EXCLUDED Requirement) 표를 별도로 둔다(§8 참조).

### TASKS/TASK-<TASK_ID>.md 상세 파일 형식(14개 절, 고정)

```
# <TASK_ID> — <제목>
## Context
## Project Scope
## Requirement Ref
## Screen / Route / Page Entry
## Design Ref
## Depends On
## Expected Files
## Functional AC
## Visual AC
## Security/Privacy AC
## Test Cases
## Verify
## Definition of Done
## Forbidden
```

`Expected Files` 절에 나열된 파일 밖은 실제 구현 단계에서도 수정하지 않는다는 문구를 항상 포함한다(루트 `CLAUDE.md` 규칙 8).

## 11. Task 개수

약 45~65개를 예상한다(현재 63개). **개수 자체를 완료 조건으로 사용하지 않는다** — `scripts/audit_tasks.py`는 특정 총 개수를 강제하지 않고 §5·§6·§7·§8·§9의 규칙 준수만 검사한다.

## 12. 감사 규칙 — `scripts/audit_tasks.py` 18개 검사

`scripts/audit_tasks.py`는 `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `docs/PROJECT_SCOPE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json` 4개 입력만으로 아래 18개를 검사하고, 성공 시 `AUDIT_PASS`와 검사 수를 출력하며 `TASKS/TASK_MANIFEST.csv`·`TASKS/TASK_AUDIT_REPORT.md`를 생성한다. 실패 시 `AUDIT_FAIL`을 출력하고 exit 1로 종료한다.

1. Task List 구현 ID와 상세 Task 파일 1:1
2. 중복 Task ID 0
3. Depends On 누락 0
4. Dependency Cycle 0
5. Screen 5개 모두 Page Owner 정확히 1개
6. Route·Page Entry·Expected Files 일치
7. Component-only Screen 0
8. SCR-001 Starter 제거 AC 존재
9. SCR-003 세 탭 조립 AC 존재
10. SCR-005 역할별 상태 조립 AC 존재
11. DB Schema·RLS·Access·Seed Task 존재
12. DB Table 범위가 6개 기본 테이블을 크게 넘지 않음
13. 외부 입력 비저장 AC 존재
14. Auth·성인·기본 RLS AC 존재
15. Playwright Chromium Smoke Task 존재
16. AWS·EC2·자동 Merge 구현 Task 0
17. Baseline Requirement 77개 전부가 Task 또는 EXCLUDED 표에 존재
18. EXCLUDED 상세 구현 파일이 생성되지 않음

**이 18개 검사 결과는 반드시 사람에게 그대로 전달한다. 실패를 요약하거나, 일부만 보고하거나, "대체로 통과"처럼 얼버무리지 않는다(Task Audit 실패를 무시하지 않는다).**

## 13. Expected Files 규칙

Task를 만들거나 수정할 때 반드시 **현재 `src/app`, `src/data`, `supabase/`, `tests/`, `.github/` 파일 트리를 실제로 확인**한 뒤 `Expected Files`를 작성한다(이미 존재하는 파일을 "생성"으로 잘못 기록하지 않기 위함). 이 Skill 갱신 시점(2026-09-16) 기준 `src/app`에는 `layout.tsx`, `page.tsx`(Create Next App 스타터), `globals.css`, `favicon.ico`만 있고, `src/data`는 빈 디렉터리이며, `supabase/`·`tests/`·`.github/`는 존재하지 않는다(`docs/ARCHITECTURE.md` §16 착수 차단 참조).

## 14. 1:1 매핑과 감사 순서

1. `/gen-tasklist` → `TASKS/00_TASK_LIST.md` 생성/갱신(이미 있으면 함부로 덮어쓰지 않고 사용자에게 확인).
2. `/gen-task-details` → `TASKS/00_TASK_LIST.md`의 각 Task ID에 대해 **정확히 1개**의 `TASKS/TASK-<TASK_ID>.md` 생성(1:1, 누락·중복 금지).
3. 상세 생성 완료 후 **반드시 `python scripts/audit_tasks.py`(또는 `python3`)를 실행**한다(`/gen-task-details` 커맨드 마지막 단계이자 `/audit-tasks` 커맨드의 본체).
4. 감사 실패 시 지적된 Task 상세 파일만 최소 수정하고 다시 감사한다. **감사가 통과(`AUDIT_PASS`, exit 0)하기 전까지는 어떤 단계도 "완료"로 보고하지 않는다.**
