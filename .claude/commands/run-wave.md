---
description: Wave 단위로 Task를 순차 실행하는 오케스트레이터. prepare-task로 검사하고 implement-task로 구현하며, WAVE_PLAN·WAVE_STATE를 근거로 진행 상태를 관리한다. Branch·PR·Merge는 자동으로 만들지 않는다.
---

# /run-wave

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)과 루트 `CLAUDE.md`(특히 규칙 6·7·11·20·21·22)를 먼저 로드한다. 이 커맨드는 `/prepare-task`(검사)와 `/implement-task`(구현)를 Wave 안에서 **하나씩 순차로** 호출하는 오케스트레이터다(DEC-011). 새 코드를 이 커맨드가 직접 작성하지 않는다 — 실제 구현은 매 반복에서 `/implement-task`에게 위임한다.

## 지원 명령

| 명령 | 동작 |
|---|---|
| `/run-wave W03` | Wave `W03`을 처음부터 또는 이어서 실행한다(§ "W03 실행 절차") |
| `/run-wave status` | 현재 모든 Wave/Task 상태를 읽기 전용으로 보고한다(§ "status") |
| `/run-wave resume` | 가장 최근에 진행 중이던 Wave를 찾아 이어서 실행한다(§ "resume") |
| `/run-wave dry-run W03` | Task를 구현하지 않고 `/prepare-task` 검사만 순서대로 돌려 무엇이 실행될지 미리 보여준다(§ "dry-run") |

## 상태 파일

이 오케스트레이터는 두 파일을 사용한다. **둘 다 아직 저장소에 존재하지 않을 수 있다** — 아래 규칙대로 다룬다.

### `TASKS/WAVE_PLAN.md` (계획 — 사람이 승인해야 하는 파일)

Wave별 Task ID 목록(해당 Wave 안에서의 실행 순서, `TASKS/00_TASK_LIST.md`의 Depends On을 위상정렬한 결과)을 담는다.

```
| Wave | Task IDs (실행 순서) | 설명 |
|---|---|---|
| W01 | DB-SCHEMA-BASE, DB-RLS-BASE, DB-ACCESS, DB-SEED-BASE, DATA-DESTINATIONS, ... | 기반 DB/정적 데이터/Auth |
| W02 | COMP-SCR001-HERO-SEARCH, COMP-SCR001-DEST-DOMESTIC, ..., PAGE-SCR001 | SCR-001 Component + Page Owner |
```

**이 파일이 없으면 `/run-wave WXX`를 실행하지 않는다.** 대신 `TASKS/00_TASK_LIST.md`의 Depends On 그래프를 위상정렬해 **제안 초안**을 사용자에게 보여주고, 사용자가 승인해야만 `TASKS/WAVE_PLAN.md`로 저장한다(Wave 경계는 사람이 확정한다 — `docs/DECISION_LOG.md` DEC-010). `dry-run`과 `status`는 파일이 없어도 이 제안 초안 기준으로 미리보기를 보여줄 수 있다.

### `TASKS/WAVE_STATE.md` (실행 상태 — 이 커맨드가 직접 갱신)

```
## Wave Summary
| Wave | Overall Status | Last Task | Updated At |
|---|---|---|---|
| W01 | COMPLETE | DATA-REPRESENTATIVE | 2026-..T..Z |
| W02 | WAITING_FOR_PREVIEW | PAGE-SCR001 | 2026-..T..Z |

## Task Status
| Wave | Task ID | Status | Detail | Updated At |
|---|---|---|---|---|
| W02 | COMP-SCR001-HERO-SEARCH | DONE | - | ... |
| W02 | PAGE-SCR001 | DONE | Preview 대기 | ... |
| W02 | COMP-SCR002-... | PENDING | 아직 W02에 없음(참고용 예시) | - |
```

`Overall Status` 값: `NOT_STARTED` / `RUNNING` / `WAITING_FOR_PREVIEW` / `COMPLETE` / `BLOCKED`.
`Task Status` 값: `PENDING`(의존 미완료) / `READY`(의존 완료, 미착수) / `BLOCKED`(`/prepare-task`가 `BLOCKED_*` 반환, 상세는 Detail 열에) / `IN_PROGRESS`(구현 도중 — 비정상 종료 감지용) / `DONE`.

파일이 없으면 `TASKS/WAVE_PLAN.md`를 근거로 전체 Task를 `PENDING`으로 새로 만든다(이미 완료된 Task가 있다고 추측하지 않는다 — 각 Task의 `Expected Files` 존재 여부로 초기 상태를 보수적으로만 보정할 수 있으며, 그 경우 반드시 그 사실을 사용자에게 알린다).

---

## `/run-wave WXX` 실행 절차

1. **`TASKS/WAVE_PLAN.md`와 `TASKS/WAVE_STATE.md`를 실제로 읽는다.** `WXX`가 `WAVE_PLAN`에 없으면 중단하고 알린다.
2. 이 Wave의 Task 목록을 `WAVE_PLAN`의 순서(=Depends On 위상정렬)로 가져오고, `WAVE_STATE`에서 각 Task의 현재 상태를 조회한다. 상태가 없는 Task는 `PENDING`으로 취급한다. 의존 Task가 전부 `DONE`인 `PENDING` Task는 `READY`로 갱신한다.
3. **가장 앞선 순서의 `READY` Task 하나만 선택**한다. `READY` Task가 하나도 없으면:
   - 전부 `DONE`이면 7번으로 간다.
   - `DONE`이 아닌데 `READY`도 없으면(모두 `PENDING`/`BLOCKED`) 순환 의존이나 이전 Wave 미완료 등 원인을 보고하고 `BLOCKED`로 종료한다.
4. 선택한 Task에 대해 **`/prepare-task WXX <TASK_ID>`의 검사 절차를 그대로 수행**한다.
   - `READY_TO_IMPLEMENT`가 아니면 `WAVE_STATE`의 해당 Task를 `BLOCKED`(상세 사유 포함)로 기록하고, `Overall Status`를 `BLOCKED`로 바꾼 뒤 **종료**한다(다음 Task로 건너뛰지 않는다 — Depends On 순서를 지키기 위함).
5. `READY_TO_IMPLEMENT`면 `WAVE_STATE`의 해당 Task를 `IN_PROGRESS`로 기록한 뒤, **`/implement-task WXX <TASK_ID>`의 구현 절차를 그대로 수행**한다.
6. `/implement-task`의 검증(포맷·관련 Unit Test·해당 시 Playwright Smoke)이 **전부 PASS**하면(또는 아직 구현되지 않은 테스트라 `NOT_RUN`으로 정직하게 보고된 경우는 실패로 치지 않되 그 사실을 그대로 남긴다) `WAVE_STATE`의 해당 Task를 `DONE`으로 갱신한다. 하나라도 `FAIL`이면 `BLOCKED`로 기록하고 사유와 함께 **종료**한다(다음 Task로 넘어가지 않는다).
7. **사람 Preview Checkpoint 확인:** 방금 `DONE`이 된 Task가 `Category: PAGE_OWNER`이면(화면 하나가 조립 완료됐다는 뜻, 루트 `CLAUDE.md` 규칙 22), `WAVE_STATE`의 `Overall Status`를 `WAITING_FOR_PREVIEW`로 기록하고 **여기서 종료**한다. 사람이 실제로 화면을 확인(Preview)하기 전까지 같은 Wave든 다음 Wave든 자동으로 진행하지 않는다.
8. Preview Checkpoint에 해당하지 않으면 2번으로 돌아가 **같은 Wave의 다음 `READY` Task를 계속 처리**한다.
9. Wave의 모든 Task가 `DONE`이면 `Overall Status`를 `COMPLETE`로 기록하고 종료한다. 완료 보고에는 이번 Wave에서 처리한 Task 목록, 각 Task의 검증 결과, 남은 제약사항(전체 Wave 관점)을 포함한다.

## `status`

`TASKS/WAVE_STATE.md`(없으면 `TASKS/WAVE_PLAN.md`만)를 읽기 전용으로 읽어, Wave별 `Overall Status`와 Task별 진행 상태(DONE/READY/PENDING/BLOCKED 개수)를 요약해 보고한다. 아무 파일도 만들거나 고치지 않는다.

## `resume`

1. `TASKS/WAVE_STATE.md`를 읽어 `Overall Status`가 `RUNNING`, `WAITING_FOR_PREVIEW`, `BLOCKED` 중 하나인 가장 최근 Wave를 찾는다. 없으면(전부 `COMPLETE`이거나 상태 파일 자체가 없으면) 그렇게 보고하고 종료한다.
2. 찾은 Wave의 `Overall Status`가 `WAITING_FOR_PREVIEW`이면, **사람에게 먼저 "Preview를 확인했습니까?"를 명시적으로 묻는다.** 확인 답변을 받기 전까지 진행하지 않는다(체크포인트를 건너뛰지 않는다).
3. 확인을 받았거나 상태가 `RUNNING`/`BLOCKED`(원인이 이미 해소된 경우)이면, 그 `WAVE_ID`로 위 "`/run-wave WXX` 실행 절차" 2번부터 다시 시작한다.

## `dry-run WXX`

1. `TASKS/WAVE_PLAN.md`(없으면 §"상태 파일"의 제안 초안)와 `TASKS/WAVE_STATE.md`를 읽는다.
2. 이 Wave의 Task를 순서대로 순회하며, 각 Task에 대해 **`/prepare-task` 검사만 수행**한다(`/implement-task`는 호출하지 않는다 — 코드를 만들지 않는다).
3. 각 Task가 지금 시점에 `READY_TO_IMPLEMENT`인지 어떤 `BLOCKED_*`인지 목록으로 보고한다. **`WAVE_STATE.md`를 갱신하지 않는다**(dry-run은 부작용이 없어야 한다).

---

## 공통 규칙

- 한 번의 `/run-wave WXX` 호출 안에서 Task는 **한 번에 하나씩** 처리한다(병렬 처리 금지, DEC-011).
- 검사(`/prepare-task`)나 구현(`/implement-task`)이 실패하면 그 지점에서 멈춘다 — 실패한 Task를 건너뛰고 다음 Task로 넘어가지 않는다(Depends On 순서 보존).
- `PAGE_OWNER` Task 완료 시 항상 `WAITING_FOR_PREVIEW`로 멈춘다(루트 `CLAUDE.md` 규칙 22). 사람의 확인 없이 이 체크포인트를 자동으로 통과시키지 않는다.
- 자동 Branch 생성, 자동 PR 생성, 자동 Merge를 **어떤 상황에서도** 수행하지 않는다(`AUTO_MERGE=false`, DEC-012). Commit 여부는 `/implement-task`의 Commit 규칙을 그대로 따른다(기본 없음, 사용자가 명시 요청한 경우에만 Task 단위 Commit).
- `WAVE_STATE.md` 갱신은 이 커맨드(`/run-wave WXX`, `/run-wave resume`)만 수행한다. `status`와 `dry-run`은 읽기 전용이다.

## 금지

- `TASKS/WAVE_PLAN.md`가 없는데 임의로 Wave 구성을 지어내 실행하지 않는다 — 반드시 제안 초안을 사람에게 먼저 보여주고 승인받는다.
- Depends On 순서를 어기고 임의 순서로 Task를 처리하지 않는다.
- `BLOCKED_*`나 `FAIL`이 발생했는데 다음 Task로 계속 진행하지 않는다.
- `PAGE_OWNER` Task 완료 후 사람의 Preview 확인 없이 다음 Task/Wave로 자동 진행하지 않는다.
- Git Branch 생성, PR 생성, Merge를 이 커맨드가 직접 수행하지 않는다.
- 검증이 실패했거나 실행되지 않은 테스트를 `DONE` 판정 근거로 쓰지 않는다.
