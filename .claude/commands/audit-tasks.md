---
description: scripts/audit_tasks.py를 실행해 TASKS/00_TASK_LIST.md와 TASKS/TASK-*.md가 traveler-project-pipeline Skill의 18개 감사 규칙을 지키는지 검사한다
---

# /audit-tasks

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md` §12)의 감사 단계만 독립적으로 재실행한다. Task를 새로 만들거나 실제 구현 코드를 작성하지 않는다.

## 절차

1. `TASKS/00_TASK_LIST.md`와 `TASKS/TASK-*.md`가 존재하는지 실제로 확인한다. 없으면 `/gen-tasklist`, `/gen-task-details`를 먼저 실행하라고 안내하고 중단한다.
2. 다음을 실행한다(`python3`을 먼저 시도하고 없으면 `python`으로 재시도한다):
   ```
   python scripts/audit_tasks.py
   ```
3. **표준 출력 전체를 요약하지 말고 그대로 사용자에게 전달한다.** 18개 검사 각각의 PASS/FAIL과 상세 메시지, 마지막 줄의 `AUDIT_PASS (N/N)` 또는 `AUDIT_FAIL (...)`, 종료 코드를 빠짐없이 보고한다.
4. 실패 항목이 있으면(exit code 1):
   - **절대로 "완료"·"통과"라고 보고하지 않는다.** Task Audit 실패를 무시하지 않는다.
   - 실패한 검사 번호(1~18)와 이름, 관련된 Task ID를 사용자에게 구체적으로 짚어준다.
   - 원인이 `TASKS/TASK-<ID>.md`(상세 파일) 쪽이면 해당 파일만 최소 수정한다.
   - 원인이 `TASKS/00_TASK_LIST.md`(Task List 자체, 예: 의존성 순환·중복 ID) 쪽이면 그 표만 최소 수정하고, 영향받는 상세 파일이 있으면 함께 갱신한다.
   - 수정 후 2번부터 다시 실행한다. 통과할 때까지 반복한다.
5. 모든 검사를 통과하면(`AUDIT_PASS`, exit 0) 통과했다고 명확히 보고한다. `TASKS/TASK_MANIFEST.csv`와 `TASKS/TASK_AUDIT_REPORT.md`는 `scripts/audit_tasks.py`가 자동으로 생성/갱신하므로, 그 경로와 생성 시각을 사용자에게 함께 안내한다.

## 금지

- 감사 스크립트(`scripts/audit_tasks.py`)를 수정해서 검사를 통과시키거나 우회하지 않는다. 스크립트 자체의 버그(오탐)로 확인된 경우에만 스크립트를 고치되, 그 사실과 근거(어떤 오탐을 어떻게 확인했는지)를 사용자에게 명시적으로 알린 뒤 고친다.
- Task 개수가 45~65 범위를 벗어난다는 이유만으로 실패 처리하지 않는다(Skill §11 — 개수는 완료 조건이 아니다).
- 실제 애플리케이션 구현 코드를 작성해서 감사를 통과시키려 하지 않는다 — 이 커맨드는 계획 문서 감사만 수행한다.
- 실패한 검사가 하나라도 있는 상태에서 "AUDIT_PASS" 또는 이에 준하는 성공 표현을 사용하지 않는다.
