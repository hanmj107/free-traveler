# Free Traveler — Project State

이 문서는 지금 시점의 프로젝트 진행 상태를 한눈에 보여주는 **스냅샷**이다. 계획·정본 문서가 아니다 — 규칙은 항상 루트 `CLAUDE.md`와 각 정본 문서(`$DESIGN_PATH`, `$SCREEN_CONTRACT`, `$PROJECT_SCOPE`)를 따른다. `/run-wave`·`/release-check` 실행 후에는 이 문서를 실제 결과로 갱신해야 하며, 실행하지 않은 내용을 미리 채워 넣지 않는다.

- **Last Updated:** 2026-09-16
- **Updated By:** `/prepare-task`·`/implement-task`·`/run-wave`·`/release-check` 실행 결과를 반영해 수동 또는 해당 커맨드가 갱신

---

## Harness Schema

`traveler-screen-route-v1` (루트 `CLAUDE.md` Harness Marker, `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `schema_version`과 일치해야 한다)

## Design Version

- **Active Version:** D-001
- **Status:** LOCKED (`design-reference/DESIGN_MANIFEST.md`)

## Scope Mode

- **정본:** `docs/PROJECT_SCOPE.md`
- **Baseline Requirement 총계:** 77개 (`REQ-FUNC-*` 42 + `REQ-NFR-*` 35)
- **IMPLEMENT:** 61개 / **EXCLUDED:** 16개 (`TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`과 `docs/PROJECT_SCOPE.md` §5 기준)

## Current Wave

`NOT_STARTED` — `TASKS/WAVE_PLAN.md`가 아직 저장소에 없다. Wave 경계는 사람이 확정해야 하며(`docs/DECISION_LOG.md` DEC-010), 확정 전까지는 `/run-wave`를 실행할 수 없다.

## Current Task

`NONE` — 진행 중인 Task 없음.

## Completed Tasks

`0 / 63` — `TASKS/00_TASK_LIST.md`의 63개 Task 전부 `Implementation Status: IN_SCOPE_PENDING`. `TASKS/WAVE_STATE.md`가 아직 없어 `DONE`으로 기록된 Task도 없다.

## Blocked Tasks

`NONE_RECORDED` — Wave 실행이 아직 시작되지 않아 `BLOCKED_*` 기록 자체가 없다. (`docs/ARCHITECTURE.md` §16 "착수 차단"에 구조적 선행 조건 8건이 별도로 기록되어 있다 — 아래 Deferred Items 참고.)

## Latest CI

`NOT_CONFIGURED` — `.github/workflows/`가 저장소에 없다. GitHub Actions 워크플로 구성이 아직 진행되지 않았다.

## Supabase State

`NOT_PROVISIONED` — `supabase/` 디렉터리(마이그레이션)가 없고, `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY` 등 환경변수를 선언할 `.env`/`.env.local` 파일도 없다(`docs/ARCHITECTURE.md` §16). 6개 테이블(`profiles`/`mate_posts`/`mate_applications`/`user_blocks`/`reports`/`app_settings`) 중 생성된 테이블: 0개.

## Vercel Preview URL

`UNKNOWN — 연결 확인 불가` — 저장소 내부에서 Vercel 프로젝트 연결 여부를 확정할 수 없다(`docs/ARCHITECTURE.md` §16). 확인되는 즉시 실제 URL로 이 값을 교체한다.

## Screen Checkpoints

| Screen | Route | Checkpoint |
|---|---|---|
| SCR-001 | `/` | PENDING |
| SCR-002 | `/about` | PENDING |
| SCR-003 | `/travel-tools` | PENDING |
| SCR-004 | `/mates` | PENDING |
| SCR-005 | `/account` | PENDING |
| FINAL | - | PENDING |

각 Screen은 해당 `PAGE-SCR0NN` Task가 `DONE`이 되고 루트 `CLAUDE.md` 규칙 22에 따라 사람이 Preview를 확인한 뒤 `CONFIRMED`로 갱신한다(`READY_FOR_PREVIEW`를 거칠 수 있음). `FINAL`은 `/release-check`가 `RELEASE_READY`를 반환했을 때만 `CONFIRMED`로 갱신한다.

## Playwright State

`NOT_CONFIGURED` — `tests/` 디렉터리와 Playwright 설정·의존성이 아직 없다(`package.json`에 `@playwright/test` 없음). Smoke 대상 3건(`E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`) 모두 미구현.

## Deferred Items

- **EXCLUDED Requirement 16건** — `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`에 목록. 콘텐츠 CRUD/CMS, 감사 로그, 관리자 통계 Dashboard, 외부 Email 공급자, Monitoring 등. 사람이 별도로 승인하기 전까지 구현하지 않는다(루트 `CLAUDE.md` 규칙 19).
- **Stitch 디자인 산출물 미완성** — `docs/STITCH_VALIDATION_REPORT.md` 최종 판정 `STITCH_VALIDATION_NEEDS_HUMAN`. SCR-003 orphaned/중복 콘텐츠, SCR-004/005 및 Mobile 변형 2종 미생성. Task 구현 자체는 `design-reference/D-001/DESIGN.md`(정본)로 진행 가능하나, Stitch 원본 자산 정리는 사람 확인이 필요한 별도 항목으로 남아 있다.
- **`docs/ARCHITECTURE.md` §16 착수 차단 8건** — Supabase 프로젝트/env 변수, npm 의존성 4종(Supabase/Vitest/Playwright 등), `.github/workflows`, Vercel 연결 확인. Wave 실행 전에 해소해야 하는 구조적 선행 조건.

## Next Action

1. `TASKS/00_TASK_LIST.md`의 Depends On 그래프를 위상정렬해 `TASKS/WAVE_PLAN.md` 초안을 제안하고 사람 승인을 받는다(`/run-wave`가 없으면 실행할 수 없음, DEC-010).
2. 승인 후 `docs/ARCHITECTURE.md` §16의 선행 조건(Supabase 프로젝트 생성, 필요 env 변수 선언, 필요 npm 의존성 설치)부터 해소한다.
3. `/run-wave W01`로 첫 Wave를 시작한다.
