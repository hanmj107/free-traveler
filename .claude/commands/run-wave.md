---
description: Wave 단위로 Task를 순차 실행하는 오케스트레이터. prepare-task로 검사하고 implement-task로 구현하며, WAVE_PLAN.md·WAVE_STATE.json을 근거로 진행 상태를 관리한다. Branch·PR·Merge는 자동으로 만들지 않는다.
---

# /run-wave

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)과 루트 `CLAUDE.md`(특히 규칙 6·7·11·20·21·22)를 먼저 로드한다. 이 커맨드는 `/prepare-task`(검사)와 `/implement-task`(구현)를 Wave 안에서 **하나씩 순차로** 호출하는 오케스트레이터다(DEC-011). 새 코드를 이 커맨드가 직접 작성하지 않는다 — 실제 구현은 매 반복에서 `/implement-task`에게 위임한다.

## 입력

```
/run-wave <WAVE_ID>              (기본 동작 — pending Task를 한 개씩 prepare→implement)
/run-wave <WAVE_ID> --dry-run    (실행할 Task·파일·검증·Checkpoint만 미리보기, 아무것도 수정하지 않음)
/run-wave <WAVE_ID> --resume     (첫 pending 또는 blocked Task부터 다시 시작)
/run-wave <WAVE_ID> --status     (해당 Wave의 현재 상태만 읽기 전용으로 보여줌)
/run-wave --status               (WAVE_ID 생략 시 전체 Wave 개요를 읽기 전용으로 보여줌 — 예외적으로 WAVE_ID 없이 허용)
```

`<WAVE_ID>`는 `TASKS/WAVE_PLAN.md`·`TASKS/WAVE_STATE.json`에 실제로 존재하는 Wave ID(`scripts/build_waves.py`가 생성한 값, 예: `W01`, `W02`, ... — **W00~W10으로 미리 고정돼 있지 않다**)여야 한다. 존재하지 않는 Wave ID가 주어지면 즉시 중단하고 실제 존재하는 Wave ID 목록을 보여준다.

## 상태 파일

이 오케스트레이터는 두 파일을 **읽기 전용 계획**과 **실행 중 갱신하는 상태**로 나눠 사용한다. 둘 다 `python scripts/audit_tasks.py` → `python scripts/build_waves.py` 순서로 실행해야 생성/갱신된다 — 이 커맨드는 Wave 구성을 스스로 계산하지 않는다.

### `TASKS/WAVE_PLAN.md` (계획 — 사람이 한 번 훑어보길 권장)

`scripts/build_waves.py`가 `TASKS/TASK_MANIFEST.csv`의 Depends On을 위상 정렬해 만든 Wave별 Task ID 목록이다(`docs/DECISION_LOG.md` DEC-010: Wave 경계는 사람이 최종 확인한다). 이 파일이 없거나 실행하려는 `<WAVE_ID>`가 이 표에 없으면 **중단**하고 `python scripts/build_waves.py`를 먼저 실행하라고 안내한다 — 이 커맨드가 임의로 Wave 구성을 지어내지 않는다.

### `TASKS/WAVE_STATE.json` (실행 상태 — 이 커맨드가 직접 갱신)

```json
{
  "schema_version": "traveler-wave-state-v1",
  "generated_at": "2026-...T...Z",
  "waves": [
    {
      "wave_id": "W08",
      "title": "SCR-001 메인 Component와 Page Owner",
      "task_ids": ["PAGE-SCR001"],
      "status": "in_progress",
      "checkpoint_required": true,
      "checkpoint_result": null,
      "task_status": { "PAGE-SCR001": "completed" }
    }
  ]
}
```

- `waves[].status` 값: `pending` / `in_progress` / `blocked` / `completed`.
- `waves[].task_status` 값(Task별, **확장 필드** — `scripts/build_waves.py`가 "WAVE_STATE.json 최소 필드" 위에 이 커맨드를 위해 추가했다): `pending` / `in_progress` / `blocked` / `completed`. 같은 Wave 안의 Task들은 `scripts/build_waves.py`가 같은 의존성 Level에 있는 것만 묶으므로(서로 의존하지 않는다) `task_ids` 순서(이미 정렬돼 있음)대로 하나씩 처리하면 된다 — 다만 `/prepare-task`가 매번 Depends On을 다시 확인하므로(2차 방어선) 이 가정이 깨져도 안전하다.
- `waves[].status`는 `task_status`에서 파생한다: 전부 `completed`면 `completed`, 하나라도 `blocked`면 `blocked`, 하나라도 `in_progress`/`completed`가 섞여 있으면 `in_progress`, 그 외에는 `pending`. **단, `checkpoint_required`가 true인 Wave는 Task가 전부 `completed`여도 `checkpoint_result`가 `"CONFIRMED"`가 아니면 `completed`로 올리지 않는다**(사람 확인 전에는 완료로 취급하지 않는다 — 규칙 5).
- `checkpoint_result`는 사람이 실제로 Preview를 확인한 뒤에만 이 커맨드가 `"CONFIRMED"`로 기록한다(추측·사전 채움 금지, `scripts/check_screen_contract.py --mode=release`가 검사하는 `docs/preview-checks/SCR-0NN.md`와 같은 원칙).
- 파일이 없으면: 중단하고 `python scripts/build_waves.py` 실행을 안내한다(임의로 새로 만들지 않는다).

---

## 공통 사전 조건 (규칙 1) — `--status` 제외 모든 모드에 적용

1. `TASKS/WAVE_PLAN.md`와 `TASKS/WAVE_STATE.json`을 실제로 읽는다. `<WAVE_ID>`가 둘 중 하나에 없으면 중단한다.
2. `TASKS/WAVE_STATE.json`의 `waves[]` 배열에서 `<WAVE_ID>`의 인덱스를 찾는다. 인덱스가 0보다 크면(첫 Wave가 아니면) **바로 이전 Wave**(`waves[index-1]`)의 `status`를 확인한다.
   - 이전 Wave가 `completed`가 아니면(`pending`/`in_progress`/`blocked` 무엇이든) **시작하지 않는다.** 이전 Wave ID와 현재 상태를 보여주고, "이전 Wave부터 `/run-wave <이전 Wave ID>`(또는 `--resume`)로 먼저 진행하십시오"라고 안내한 뒤 종료한다.
   - `--dry-run`도 이 조건을 확인하지만 **경고만 하고 미리보기는 계속 보여준다**(dry-run은 아무것도 실행하지 않으므로 막을 필요가 없다 — 대신 "지금은 실행할 수 없는 이유"를 미리보기에 포함한다).
3. `<WAVE_ID>`의 현재 `status`가 `completed`면: 이미 끝난 Wave이므로 기본 모드는 "이미 완료된 Wave입니다"라고 보고하고 아무 것도 하지 않는다. `--resume`도 동일하게 보고한다(재실행할 대상이 없다).
4. `<WAVE_ID>`의 현재 `status`가 `blocked`면: **기본 모드는 시작하지 않는다.** `blocked` 상태는 사람이 원인을 해결했다는 뜻에서 `--resume`으로만 재시도할 수 있다. 기본 모드로 blocked Wave를 실행하려는 시도는 "이 Wave는 blocked 상태입니다 — 원인을 해결한 뒤 `/run-wave <WAVE_ID> --resume`을 사용하십시오"라고 안내하고 종료한다.

---

## `--status` 동작 (읽기 전용)

- `<WAVE_ID>`가 있으면: 해당 Wave의 `status`·`checkpoint_required`·`checkpoint_result`와, `task_status`를 Task ID별로 표(`pending`/`in_progress`/`blocked`/`completed`) 형태로 보여준다.
- `<WAVE_ID>`가 없으면: `TASKS/WAVE_STATE.json`의 모든 Wave를 `wave_id | title | status | 완료 Task 수/전체 Task 수 | checkpoint_required` 요약 표로 보여준다.
- 파일을 만들거나 고치지 않는다.

## `--dry-run` 동작 (읽기 전용)

1. 공통 사전 조건을 확인하고, 문제가 있으면 경고로 표시하되 계속 진행한다.
2. 해당 Wave의 `task_ids`를 순서대로 순회하며, 이미 `completed`인 Task는 건너뛰고, `blocked`/`pending`인 Task부터 **실제로 구현하지 않고 미리보기만** 만든다:
   - 이 Task에 대해 `/prepare-task <WAVE_ID> <TASK_ID>`의 검사 절차를 그대로 수행해 `READY_TO_IMPLEMENT` 또는 `BLOCKED_*`를 판정한다(코드는 작성하지 않는다).
   - `TASKS/TASK-<TASK_ID>.md`의 `Expected Files`(수정될 파일), `Verify`(실행될 최소 검증), `Category`(Page Owner면 Browser Checkpoint 필요)를 그대로 보여준다.
3. **`WAVE_STATE.json`을 갱신하지 않는다**(dry-run은 부작용이 없어야 한다).
4. 마지막에 이 Wave에 Page Owner Task가 있는지, 있다면 완료 후 Browser Checkpoint가 필요하다는 사실을 명시한다.

---

## 기본 동작 — `/run-wave <WAVE_ID>` (pending Task를 한 개씩 prepare→implement)

1. 공통 사전 조건을 통과한 상태에서 시작한다.
2. Wave의 `task_ids`를 순서대로 순회하며 이미 `completed`인 Task는 건너뛴다. **처음 만나는 `pending` Task 하나만** 선택한다(`blocked` Task는 기본 모드에서 건너뛰지 않고 — 애초에 3번 조건에서 이미 Wave 전체가 `blocked`면 시작하지 않으므로, 기본 모드에서 개별 Task가 `blocked`인 상태로 남아 있을 일은 없다).
3. 선택한 Task의 `task_status`를 `in_progress`로 갱신한다.
4. **`/prepare-task <WAVE_ID> <TASK_ID>`의 검사 절차를 그대로 수행**한다.
   - `READY_TO_IMPLEMENT`가 아니면: 이 Task의 `task_status`를 `blocked`로, Wave의 `status`를 `blocked`로 기록하고(규칙 2) **종료**한다(다음 Task로 건너뛰지 않는다).
5. `READY_TO_IMPLEMENT`면 **`/implement-task <WAVE_ID> <TASK_ID>`의 구현 절차를 그대로 수행**한다 — Expected Files 범위 안에서 구현하고, 그 Task에 지정된 최소 검증(관련 Unit Test, Category가 `PAGE_OWNER`/`E2E_TEST`면 Chromium Smoke)을 실행한다(규칙 3).
   - 실행되지 않은 테스트가 `NOT_RUN — 사유`로 정직하게 보고된 경우는 실패로 치지 않는다(아직 구현되지 않은 하위 테스트일 뿐 이 Task의 결함이 아니다). 그 외 실제 `FAIL`이 하나라도 있으면 이 Task의 `task_status`를 `blocked`로, Wave의 `status`를 `blocked`로 기록하고(규칙 2) **종료**한다.
6. 전부 통과(또는 정직한 `NOT_RUN`)면 이 Task의 `task_status`를 `completed`로 기록한다.
7. **Browser Checkpoint 확인(규칙 4·5):** 방금 `completed`가 된 Task의 `Category`가 `PAGE_OWNER`이면(`checkpoint_required: true`인 Wave), 이 자리에서 **멈추고 사람에게 직접 묻는다**: "`<WAVE_ID>`의 화면을 브라우저에서 실제로 확인했습니까?" 확인 답변을 받기 전에는:
   - `checkpoint_result`를 채우지 않는다(추측 금지).
   - Wave의 `status`를 `completed`로 올리지 않는다(Task는 전부 `completed`여도 Wave는 `in_progress`로 남는다).
   - 다음 Wave를 자동으로 시작하지 않는다(규칙 5).
   사람이 확인했다고 답하면 `checkpoint_result`를 `"CONFIRMED"`로 기록하고, 그제서야 Wave의 `status`를 `completed`로 올린다.
8. Browser Checkpoint에 해당하지 않으면(방금 완료한 Task가 `PAGE_OWNER`가 아니면) 2번으로 돌아가 **같은 Wave의 다음 `pending` Task를 계속 처리**한다.
9. Wave의 모든 Task가 `completed`이고(Checkpoint가 필요하면 `checkpoint_result`도 `"CONFIRMED"`이고) 나면 Wave의 `status`를 `completed`로 기록하고 **종료 보고**(아래 형식)를 출력한다.

## `--resume` 동작 — `/run-wave <WAVE_ID> --resume`

기본 동작과 거의 동일하되, 다음 차이만 있다:

1. 공통 사전 조건 4번(“Wave가 blocked면 기본 모드는 시작 안 함”)을 **이 모드에서만 통과시킨다** — `--resume`은 blocked Wave를 재시도하기 위한 명령이다.
2. Task 선택 시 "첫 `pending` **또는 `blocked`** Task"부터 다시 시작한다(기본 동작은 `pending`만 선택). 선택된 Task가 `blocked` 상태였다면, **`/prepare-task`부터 다시 실행**해 그동안 원인이 실제로 해결됐는지 재확인한다(추측하지 않는다 — `/implement-task`도 자체적으로 이 재확인을 한 번 더 한다).
3. 여전히 `BLOCKED_*`면: 이전과 같은 이유든 다른 이유든 있는 그대로 보고하고, Wave `status`를 다시 `blocked`로 남긴 채 **종료**한다(같은 Task에서 다시 멈춘다 — 억지로 다음 Task로 넘어가지 않는다).
4. `READY_TO_IMPLEMENT`로 확인되면 기본 동작의 5번부터 그대로 이어간다.

---

## 종료 보고 (모든 실행 모드 공통 — `--status` 제외)

이번 호출에서 일어난 일을 아래 5개 항목으로 **빠짐없이** 보고한다:

1. **완료 Task** — 이번 호출에서 새로 `completed`가 된 Task ID 목록(없으면 "없음").
2. **변경 파일** — 각 완료 Task의 `/implement-task` 보고에 있던 변경 파일 목록을 Task별로 모아 정리(생성/수정 구분 유지).
3. **통과한 검사** — 각 완료 Task에서 실제로 실행되어 통과한 검증(Lint/타입체크, Unit Test, Playwright Smoke 등)을 Task별로 나열. `NOT_RUN` 항목은 통과로 세지 않고 별도로 그 사유와 함께 남긴다.
4. **남은 수동 Browser 확인** — 이 Wave 또는 다음 Wave에 `checkpoint_required: true`이면서 `checkpoint_result`가 아직 `"CONFIRMED"`가 아닌 Wave가 있으면 그 Wave ID와 어떤 화면을 확인해야 하는지 명시. 없으면 "없음".
5. **다음에 입력할 명령** — 상황별로 정확히 하나를 제시한다:
   - Wave가 `blocked`로 끝났다면: `/run-wave <WAVE_ID> --resume`(원인 해결 후).
   - Checkpoint 확인 대기 중이면: 사람이 확인한 뒤 같은 명령을 다시 실행하거나, 확인 즉시 답하면 이 호출 안에서 바로 `status`를 `completed`로 올린 뒤 다음 Wave ID를 제시.
   - Wave가 완전히 `completed`로 끝났다면: `TASKS/WAVE_STATE.json`에서 바로 다음 Wave ID를 찾아 `/run-wave <다음 Wave ID>`.
   - 더 이상 다음 Wave가 없다면(마지막 Wave까지 `completed`): `/release-check`.

---

## 공통 규칙

- 한 번의 `/run-wave <WAVE_ID>` 호출 안에서 Task는 **한 번에 하나씩** 처리한다(병렬 처리 금지, DEC-011).
- `/prepare-task`나 `/implement-task`가 실패하면 그 지점에서 멈춘다 — 실패한 Task를 건너뛰고 다음 Task로 넘어가지 않는다(규칙 2, Depends On 순서 보존).
- `PAGE_OWNER` Task 완료 시 항상 Browser Checkpoint를 요구한다(규칙 4, 루트 `CLAUDE.md` 규칙 22). 사람의 확인 없이 이 체크포인트를 자동으로 통과시키지 않는다(규칙 5).
- 이 커맨드는 **하나의 Wave ID만** 처리한다 — 한 Wave가 끝났다고 다음 Wave ID로 자동으로 넘어가지 않는다(규칙 5는 커맨드 경계 자체로 지켜진다: 다음 Wave를 시작하려면 사람이 `/run-wave <다음 Wave ID>`를 다시 입력해야 한다).
- 자동 Branch 생성, 자동 PR 생성, 자동 Merge, 자동 Commit·Push를 **어떤 상황에서도** 수행하지 않는다(`AUTO_MERGE=false`, DEC-012, 규칙 6). Commit 여부는 `/implement-task`의 Commit 규칙을 그대로 따른다(기본 없음, 사용자가 명시 요청한 경우에만 Task 단위 Commit).
- `TASKS/WAVE_STATE.json` 갱신은 이 커맨드(기본 동작·`--resume`)만 수행한다. `--status`와 `--dry-run`은 읽기 전용이다.

## 금지

- `TASKS/WAVE_PLAN.md`·`TASKS/WAVE_STATE.json`이 없거나 `<WAVE_ID>`가 그 안에 없는데 임의로 Wave 구성을 지어내 실행하지 않는다 — `python scripts/build_waves.py` 실행을 안내한다.
- 이전 Wave가 `completed`가 아닌데 시작하지 않는다(규칙 1).
- Task 하나가 `blocked`인데 다음 Task로 계속 진행하지 않는다(규칙 2).
- Task에 지정된 최소 검증을 생략하거나, 실행하지 않았거나 실패한 검사를 통과했다고 보고하지 않는다(규칙 3).
- `PAGE_OWNER` Task 완료 후 사람의 Browser Checkpoint 확인 없이 `checkpoint_result`를 채우거나 Wave를 `completed`로 올리지 않는다(규칙 4).
- 사람의 확인 전에 다음 Wave를 자동으로 시작하지 않는다(규칙 5).
- Git Branch 생성, Commit, Push, PR 생성, Merge를 이 커맨드가 직접 수행하지 않는다(규칙 6).
