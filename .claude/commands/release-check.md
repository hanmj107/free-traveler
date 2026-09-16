---
description: Task/Wave 상태·5개 Page Owner 완료·CI·Playwright Smoke·Supabase 6테이블 RLS·Vercel Preview Checkpoint·EXCLUDED 목록을 점검해 RELEASE_READY 또는 RELEASE_BLOCKED를 판정한다
---

# /release-check

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)과 루트 `CLAUDE.md`를 먼저 로드한다. **이 커맨드는 어떤 파일도 생성·수정하지 않고, Git Tag·GitHub Release·Deploy·Merge를 실행하지 않는다.** 오직 "지금 Release해도 되는가?"를 점검하고 보고한 뒤 끝난다.

## 절차

**8개 검사를 전부 실행하고 결과를 모두 기록한 뒤에, 마지막에 최종 판정 하나를 결정한다.** 검사 도중 하나가 실패했다고 뒤 검사를 생략하지 않는다.

### 검사 1 — Task Audit 통과 여부
`scripts/audit_tasks.py`를 실행한다(`python3` 우선, 없으면 `python`):
```
python scripts/audit_tasks.py
```
`AUDIT_PASS (18/18 검사 통과)`인지 확인한다. 표준 출력을 요약하지 말고 실패한 검사 번호가 있으면 전부 옮긴다.
- 결과: `AUDIT_PASS` 또는 `AUDIT_FAIL`(실패 검사 번호·이름 포함)

### 검사 2 — Task·Wave 상태
1. `TASKS/00_TASK_LIST.md`를 읽어 `Implementation Status`가 `IN_SCOPE_PENDING`(또는 그에 준하는 미완료 상태)로 남아 있는 행이 있는지 확인한다.
2. `TASKS/WAVE_STATE.md`가 존재하는지 확인한다. 없으면 Wave 실행 기록 자체가 없다는 뜻이므로 이 검사는 실패로 기록한다(추측으로 통과시키지 않는다).
3. 존재하면 모든 Wave의 `Overall Status`가 `COMPLETE`인지, `BLOCKED`나 `WAITING_FOR_PREVIEW`로 멈춰 있는 Wave가 없는지 확인한다.
4. `TASKS/00_TASK_LIST.md`의 IMPLEMENT 대상 Task 전부가 `WAVE_STATE.md`의 Task Status에서 `DONE`인지 대조한다.
- 결과: `ALL_DONE` 또는 미완료/중단된 Task·Wave 목록

### 검사 3 — 5개 Page Owner DONE
1. `TASKS/00_TASK_LIST.md`에서 `Category`가 `PAGE_OWNER`인 행을 모두 뽑는다(정확히 5개: `PAGE-SCR001`~`PAGE-SCR005`이어야 한다).
2. 각 Task가 `TASKS/WAVE_STATE.md`에서 `DONE`인지 확인한다.
- 결과: 5개 각각 `DONE`/`NOT_DONE`, 5개 미만/초과 발견 시 그 사실도 기록

### 검사 4 — CI PASS
1. `.github/workflows/`에 워크플로 파일이 실제로 존재하는지 확인한다. 없으면 `NOT_CONFIGURED`로 기록한다(지어내지 않는다).
2. `gh` CLI를 사용할 수 있으면(`gh --version`) `gh run list --branch main --limit 1`(또는 동등한 조회)로 가장 최근 실행 상태를 조회한다. `gh`가 없거나 원격 저장소에 연결되어 있지 않으면 조회 불가로 기록한다.
- 결과: `CI_PASS` / `CI_FAIL` / `NOT_CONFIGURED` / `UNKNOWN — 조회 불가(사유)`

### 검사 5 — Playwright Smoke PASS
1. `E2E-PUBLIC-SMOKE`(SCR-001/002), `E2E-TRAVEL-TOOLS`(SCR-003), `E2E-MATE-AUTH`(SCR-004/005)에 대응하는 테스트 파일이 실제로 존재하는지 확인한다.
2. 존재하는 파일만 `npx playwright test <경로> --project=chromium`으로 실행한다.
3. 파일이 아직 없는 항목은 "실행 불가(미구현)"로 정직하게 기록한다 — 통과했다고 지어내지 않는다.
- 결과: 3개 Smoke 대상 각각 `PASS`/`FAIL`/`NOT_RUN — 사유`

### 검사 6 — Supabase 6개 Table·기본 RLS 확인 기록
1. `supabase/migrations/`를 읽어 실제로 생성되는 테이블이 정확히 `profiles`/`mate_posts`/`mate_applications`/`user_blocks`/`reports`/`app_settings` 6개인지 확인한다(그 외 테이블이 있으면 기록).
2. 6개 테이블 모두 RLS가 활성화되어 있는지, 최소 3개 규칙(신고 관리자 전용 SELECT, 차단 사용자 상호 콘텐츠 숨김, 참가요청은 작성자/게시자만 조회)에 대응하는 정책이 마이그레이션에 존재하는지 확인한다.
3. **확인 기록**: `TEST-RLS-*` Task가 `TASKS/WAVE_STATE.md`에서 `DONE`인지, 그리고 그 Task의 `Verify` 절에 명시된 테스트가 실제로 실행된 기록(테스트 파일 존재 + 이번 검사 또는 직전 `/implement-task` 실행에서 남긴 PASS 결과)이 있는지 확인한다. 실행 기록을 찾을 수 없으면 "확인 기록 없음"으로 정직하게 남긴다(있다고 추측하지 않는다).
- 결과: 테이블 수/목록, RLS 3규칙 존재 여부, 확인 기록 유무

### 검사 7 — Vercel Preview Checkpoint
이 항목은 저장소 내부 파일만으로 확정할 수 없는 사람의 행동(루트 `CLAUDE.md` 규칙 22)이다.
1. `docs/ARCHITECTURE.md` §16(착수 차단)에 "Vercel 연결 확인 불가"가 아직 남아 있는지 확인한다. 남아 있으면 그 자체로 미확정 상태다.
2. `TASKS/WAVE_STATE.md`에서 각 Wave가 `WAITING_FOR_PREVIEW`를 거쳤는지, 그 이후 다시 진행되었는지(=사람이 확인했다는 간접 정황) 확인한다. 이는 정황 증거일 뿐 확정 증거가 아님을 보고서에 명시한다.
3. **위 정황만으로 통과 처리하지 않는다.** 최종적으로는 사용자에게 "Production/Preview 배포를 실제로 확인했습니까?"를 직접 물어 명시적 답변을 받아야 `CONFIRMED`로 기록한다. 답변을 받지 못했으면 `UNCONFIRMED`로 남긴다.
- 결과: `CONFIRMED`(사용자 확답 포함) / `UNCONFIRMED` / 정황 요약

### 검사 8 — EXCLUDED 목록
1. `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`(EXCLUDED) 표가 `docs/PROJECT_SCOPE.md`의 EXCLUDED 판정과 여전히 일치하는지(개수·ID) 확인한다.
2. EXCLUDED로 분류된 Requirement ID가 어떤 `TASKS/TASK-*.md`의 `Requirement Ref`에도 등장하지 않는지, 그런 기능을 구현한 소스 코드가 없는지 확인한다(검사 1의 `audit_tasks.py` 17·18번 검사 결과를 인용하되, Release 시점 기준으로 다시 한 번 명시적으로 재확인한다).
- 결과: `NO_VIOLATION` 또는 위반 목록(ID·근거 포함)

## 최종 판정

아래 중 **하나라도** 해당하면 → **`RELEASE_BLOCKED`**:
- 검사 1이 `AUDIT_FAIL`
- 검사 2에서 미완료/중단된 Task·Wave 존재, 또는 `WAVE_STATE.md` 자체가 없음
- 검사 3에서 5개 Page Owner 중 하나라도 `NOT_DONE`이거나 5개가 아님
- 검사 4가 `CI_FAIL`
- 검사 5에서 3개 Smoke 대상 중 하나라도 `FAIL`
- 검사 6에서 테이블이 6개가 아니거나, RLS 3규칙 중 하나라도 없거나, 확인 기록이 없음
- 검사 7이 `UNCONFIRMED`
- 검사 8에서 위반 발견

**위 어느 것에도 해당하지 않을 때만** → **`RELEASE_READY`**

`CI_FAIL`이 아니라 `NOT_CONFIGURED`/`UNKNOWN`인 경우도 확정된 PASS가 아니므로 `RELEASE_BLOCKED`로 처리하고 그 사유를 명확히 구분해 보고한다(무엇이 진짜 실패이고 무엇이 확인 불가인지 섞지 않는다).

## 보고 형식

1. 검사 1~8 각각의 결과(위 "결과:" 형식 그대로, 생략 없이)
2. **최종 판정**(`RELEASE_READY` 또는 `RELEASE_BLOCKED` 중 정확히 하나)
3. `RELEASE_BLOCKED`인 경우, 각 실패 항목을 해소하려면 무엇을 해야 하는지 구체적으로 안내한다(예: "`PAGE-SCR004`가 아직 `DONE`이 아닙니다 — `/run-wave`로 해당 Wave를 계속 진행하세요", "`.github/workflows/`가 없습니다 — CI 워크플로를 먼저 구성해야 합니다").

## 금지

- 어떤 파일도 생성·수정·삭제하지 않는다. Git Tag, GitHub Release, `git push`, 배포 트리거를 실행하지 않는다.
- 확인할 수 없는 항목(CI 미구성, Vercel 확인 불가, RLS 확인 기록 없음 등)을 PASS로 지어내지 않는다 — 반드시 `NOT_CONFIGURED`/`UNKNOWN`/`UNCONFIRMED`로 있는 그대로 남긴다.
- 실행하지 않았거나 실패한 테스트를 통과했다고 보고하지 않는다.
- 정황 증거(Wave가 `WAITING_FOR_PREVIEW`를 지나갔다는 기록)만으로 검사 7을 `CONFIRMED`로 판정하지 않는다 — 반드시 사용자의 명시적 답변을 받는다.
- 8개 검사 중 일부를 생략하거나 결과를 요약·축소해서 보고하지 않는다.
- 실패 항목이 하나라도 있는 상태에서 `RELEASE_READY`로 보고하지 않는다.
