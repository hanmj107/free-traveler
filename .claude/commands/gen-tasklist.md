---
description: Free Traveler 승인 Screen/SRS 요구사항을 기반으로 구현 Task List(TASKS/00_TASK_LIST.md)를 생성하거나 갱신한다
---

# /gen-tasklist

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)을 먼저 로드하고 그 규칙을 따른다. 이 커맨드는 **Task List만** 생성/갱신한다(상세 Task 파일은 `/gen-task-details`가 담당한다). **이 커맨드는 실제 애플리케이션 구현 코드(`src/**`, `supabase/**` 등)를 한 줄도 작성하지 않는다.**

## 절차

1. **Skill을 읽는다.** `.claude/skills/traveler-project-pipeline/SKILL.md` 전체(특히 §4 Category, §6 DB 6테이블, §7~§9 커버리지/금지 규칙, §10 산출물 형식)를 읽는다.
2. **입력 문서를 실제로 읽는다(추측·기억으로 대체하지 않는다):**
   - `docs/06_SRS_UIUX_REVISED.md`
   - `docs/PROJECT_SCOPE.md`(Requirement 77개 IMPLEMENT/EXCLUDED 판정 정본)
   - `design-reference/D-001/DESIGN.md`
   - `design-reference/UI_CONTRACT.md`
   - `design-reference/SCREEN_ROUTE_CONTRACT.json`(Screen 목록 정본)
   - `docs/ARCHITECTURE.md`(Server/Client 경계, DB 6테이블, 테스트·CI 범위)
3. **먼저 `python scripts/validate_inputs.py`(또는 `python3`)를 실행한다.** 실패하면 Task List를 생성/갱신하지 않고 실패 사유를 사용자에게 보고한 뒤 중단한다.
4. **현재 파일 트리를 실제로 확인한다:** `src/app`, `src/data`, `supabase/`, `tests/`, `.github/`를 Glob/List로 나열한다. 이미 존재하는 파일을 "새로 생성"으로 기록하지 않는다.
5. **`TASKS/00_TASK_LIST.md`가 이미 존재하는지 확인한다.**
   - 존재하면 먼저 읽는다. 사용자가 명시적으로 전면 재생성을 요청한 경우가 아니면, 이미 있는 Task를 함부로 덮어쓰거나 삭제하지 않고 **차이(diff)만 최소 수정**한다(신규 Requirement 추가, Screen 계약 변경 등 실제 사유가 있을 때만).
   - 존재하지 않으면 처음부터 설계한다.
6. Skill §4~§9 규칙에 따라 Task를 설계한다:
   - `PAGE_OWNER` **정확히 5개**(Screen당 1개, Skill §5의 Screen별 고유 규칙 반영)
   - `COMPONENT`(Screen별로 `design-reference/UI_CONTRACT.md`의 주요 Component를 근거로 분해)
   - `DATA` 3개(`DATA-DESTINATIONS`, `DATA-SAFETY`, `DATA-REPRESENTATIVE`)
   - `DB` 4개(`DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE`, Skill §6 6테이블 제한)
   - `AUTH`(Supabase Auth, 성인 확인)
   - `API`(모집글/참가요청/신고/차단/외부URL 저장 등)
   - `UNIT_TEST`(`UNIT-TRAVEL-DATES`, `UNIT-CONTACT-DETECTION`, `UNIT-MATE-STATE`), `INTEGRATION_TEST`(`TEST-RLS-BASIC`)
   - `E2E_TEST`(Playwright **Chromium Smoke만**, `docs/PROJECT_SCOPE.md` §7의 10개 시나리오를 근거로 2~3개 Task로 묶음)
   - `MANUAL_CHECK`/`CI_DEPLOY`(접근성·성능 수동 확인, CI 파이프라인, Vercel/Supabase 배포 확인)
   - 총 개수는 45~65개를 기대치로 삼되, 개수 자체를 목표로 강제하지 않는다(Skill §11).
7. `docs/PROJECT_SCOPE.md`의 Requirement 77개 전체를 순회하며:
   - IMPLEMENT 항목 → 하나 이상의 Task `Requirement Ref`에 배정
   - EXCLUDED 항목 → 어떤 Task에도 배정하지 않고 `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION` 표에 ID+근거+후속 방향으로 기록
8. Page Owner Task의 `Depends On`에 같은 Screen의 Component Task ID를 모두 나열한다(그 외 Task도 실제로 의존하는 Task ID를 정확히 적는다).
9. `Expected Files`는 4단계에서 확인한 실제 파일 트리를 기준으로, 아직 없는 파일만 "생성 대상"으로 적는다. **하나의 Task가 여러 Page Entry를 동시에 소유하지 않게 한다.**
10. `TASKS/00_TASK_LIST.md`를 Skill §10의 16열 형식으로 작성한다(Seq/Task ID/제목/Category/Implementation Status/Requirement Ref/Screen/Route/Page Entry/Depends On/Expected Files/Functional AC/Visual AC/Security-Privacy AC/Verify/Priority). `Implementation Status`는 실제로 코드가 없는 한 `IN_SCOPE_PENDING`만 사용한다.
11. 완료 후 사용자에게 보고한다: 총 Task 수, Category별 개수, Page Owner 5개 목록, EXCLUDED Requirement 수, 다음 단계(`/gen-task-details`)를 안내한다.

## 금지

- 이 단계에서 `TASKS/TASK-*.md` 상세 파일을 만들지 않는다(`/gen-task-details`의 역할).
- `src/**`, `supabase/**` 등 실제 구현 코드를 작성하지 않는다.
- `docs/tasks/TASK_LIST.json` 같은 JSON 산출물을 만들지 않는다 — `TASKS/00_TASK_LIST.md`가 유일한 정본이다.
- 프롬프트 안내 문장, 작성 과정 설명, 자리표시자(TBD 등)를 산출물에 남기지 않는다.
- Skill §9 "금지 Task" 목록에 해당하는 Task를 만들지 않는다.
- 입력 문서를 읽지 않고 이전 대화 기억만으로 내용을 재구성하지 않는다 — 파일이 바뀌었을 수 있으므로 항상 다시 읽는다.
