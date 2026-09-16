---
description: prepare-task가 READY_TO_IMPLEMENT로 확인한 Task 하나를 Expected Files 범위 안에서 실제로 구현하고, 관련 포맷·Unit Test·(해당 시) Playwright Smoke를 실행한 뒤 결과를 보고한다. 기본적으로 Commit/Push/PR을 수행하지 않는다.
---

# /implement-task

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)과 루트 `CLAUDE.md`의 23개 규칙을 먼저 로드한다. 이 커맨드는 **`WAVE_ID`·`TASK_ID`로 지정된 Task 딱 하나만** 구현한다(DEC-011 — Wave 내부 Task는 Single Agent가 순차 수행).

## 입력

`WAVE_ID`, `TASK_ID`(`/prepare-task`와 동일한 두 값).

## 절차

### 0. READY_TO_IMPLEMENT 재확인 (규칙 1)

이전에 `/prepare-task`를 실행한 적이 있어도 **지금 다시 실행**한다(그 사이 Working Tree나 의존 Task 상태가 바뀔 수 있다). 최종 상태가 `READY_TO_IMPLEMENT`가 아니면:
- 코드를 한 줄도 작성하지 않는다.
- 어떤 `BLOCKED_*` 상태였는지, 무엇을 해결해야 하는지 그대로 보고하고 중단한다.

`READY_TO_IMPLEMENT`일 때만 아래로 진행한다.

### 1. Task 상세를 다시 읽는다

`TASKS/TASK-<TASK_ID>.md`의 `Context`·`Design Ref`·`Depends On`·`Expected Files`·`Functional AC`·`Visual AC`·`Security/Privacy AC`·`Forbidden`을 전부 다시 읽는다.

### 2. 의존 Task의 실제 산출물을 확인한다

`Depends On`에 있는 각 Task의 실제 파일(이미 만들어진 Component/Data/API의 실제 export·Props·타입 시그니처)을 열어서 확인한다. 문서 설명만 믿고 인터페이스를 추측하지 않는다.

### 3. Expected Files 범위 안에서만 구현한다 (규칙 2)

- `TASKS/TASK-<TASK_ID>.md`의 `Expected Files`에 나열된 파일만 생성·수정한다. 목록에 없는 파일은 절대 만들지 않는다.
- **Page Owner Task(Category `PAGE_OWNER`)**: 자신의 Page Entry(`src/app/**/page.tsx`)에서 `Depends On`의 Component/Data/API를 **실제로 import해 조립**한다(규칙 4). 이 자리에서 새 Component·Data·API 파일을 만들지 않는다 — 그런 파일이 아직 없다면 그건 별도 Task이며, 이 Task는 그 Task가 먼저 끝난 뒤에 진행해야 한다(0단계에서 `BLOCKED_DEPENDENCY`로 이미 걸러졌어야 한다).
- `PAGE-SCR001`을 구현하는 경우, Create Next App 기본 스타터 콘텐츠를 완전히 제거한다.
- `PAGE-SCR003`을 구현하는 경우, 항공편·숙소·동행 구하기 3개 탭을 실제로 조립하고 탭별 상태를 완전히 분리한다.
- `PAGE-SCR005`를 구현하는 경우, Guest·Member·Admin 역할별 상태를 실제로 조립하고 역할에 없는 영역은 렌더링하지 않는다.

### 4. Functional·Visual·Security/Privacy AC를 따른다 (규칙 3)

구현을 마치면 `Functional AC`·`Visual AC`·`Security/Privacy AC`의 각 항목을 하나씩 대조해 자체 점검한다. 특히:
- 항공·숙소 입력 폼 관련 Task는 입력값을 서버 API·DB·URL·쿼리·쿠키·로그·분석 도구 어디로도 보내지 않는지 반드시 확인한다(규칙 7과 별개로 매 Task마다 재확인).
- 외부 이동 링크는 `target="_blank" rel="noopener noreferrer"`를 갖는지 확인한다.
- 색상만으로 상태를 구분하지 않고 텍스트 라벨을 병기했는지 확인한다.

### 5. 관련 Unit Test를 실행한다 (규칙 5)

이 Task 또는 그 의존 Task와 연관된 Vitest 테스트가 **이미 저장소에 존재하면** 실행한다(`npx vitest run <경로>`). 예: 항공/숙소 Form → `tests/unit/travelDates.spec.ts`(`UNIT-TRAVEL-DATES`), 동행 작성 Form → `tests/unit/contactDetection.spec.ts`(`UNIT-CONTACT-DETECTION`), 참가 요청/상태 전이 관련 API → `tests/unit/mateState.spec.ts`(`UNIT-MATE-STATE`).

해당 테스트 파일이 **아직 구현되지 않았다면**(그 Unit Test Task가 아직 진행되지 않은 경우) 실행할 수 없다는 사실을 있는 그대로 보고한다 — 통과했다고 지어내지 않는다.

### 6. Page Owner 또는 E2E Task일 때만 Playwright Smoke를 실행한다 (규칙 6)

- `Category`가 `PAGE_OWNER`이거나 `E2E_TEST`인 경우에만 해당 Screen과 연결된 Chromium Smoke Test를 실행한다(`npx playwright test <경로> --project=chromium`): SCR-001/002 → `E2E-PUBLIC-SMOKE`, SCR-003 → `E2E-TRAVEL-TOOLS`, SCR-004/005 → `E2E-MATE-AUTH`.
- 그 외 Category(`COMPONENT`, `DATA`, `DB`, `AUTH`, `API`, `UNIT_TEST` 등)는 Playwright를 실행하지 않는다.
- 해당 E2E 테스트 파일이 아직 없으면 "실행 불가(E2E 테스트 미구현)"로 보고한다.

### 7. 금지 기술 재확인 (규칙 7)

구현 중 다음을 추가하지 않았는지 diff를 보며 스스로 확인한다: AWS/EC2 SDK나 설정, Prisma·Drizzle·TypeORM 등 ORM, GitHub Actions의 자동 Merge/Merge Queue 설정, Firefox/WebKit Playwright 프로젝트.

### 8. Diff 확인

`git status`/`git diff`로 실제 변경된 파일 목록을 확인하고, `Expected Files`와 정확히 일치하는지 대조한다. 벗어난 파일이 있으면:
- 의도치 않은 변경이면 되돌린다.
- 정말 필요한 변경이면(예: import 경로 추가로 인접 파일 한 줄 수정) 왜 필요한지 설명하고 사용자에게 확인을 구한다 — 조용히 넘어가지 않는다.

### 9. 완료 보고 (규칙 8)

다음을 빠짐없이 보고한다:
- **변경 파일 목록**(생성/수정 구분)
- **검증 결과**: lint/타입체크, 관련 Unit Test(5단계), 관련 Playwright Smoke(6단계) 각각의 결과(`PASS`/`FAIL`/`NOT_RUN — 사유`)
- **남은 제약사항**: 아직 구현되지 않은 의존 기능, 실행하지 못한 테스트, 부재한 환경변수(`docs/ARCHITECTURE.md` §16), 사람이 확인해야 할 Preview 필요 여부(루트 `CLAUDE.md` 규칙 22)

## Commit 규칙

- **기본값: Commit·Push·PR을 자동으로 수행하지 않는다.** 구현과 검증까지만 하고 멈춘다.
- 사용자가 **명시적으로 커밋을 요청한 경우에만**, 이번 Task의 `Expected Files` 변경사항만 정확히 스테이징해 **Task 단위로 커밋 하나**를 만든다. 커밋 메시지에 `TASK_ID`와 Task 제목을 포함한다.
- 사용자가 커밋을 요청했더라도 **Push와 PR 생성은 이 커맨드에서 수행하지 않는다**(`docs/DECISION_LOG.md` DEC-012 — 사람이 수동으로 한다). 사용자가 Push/PR을 원하면 별도로 명시적으로 요청해야 한다.

## 금지

- `/prepare-task` 재확인 결과가 `READY_TO_IMPLEMENT`가 아닌데 코드를 작성하지 않는다.
- `Expected Files` 목록 밖의 파일을 만들거나 고치지 않는다.
- Page Owner Task 안에서 새 Component·Data·API 파일을 만들지 않는다.
- AWS·EC2, Prisma·Drizzle·TypeORM 등 ORM, 자동 Merge/Merge Queue 기능을 추가하지 않는다.
- Firefox·WebKit Playwright 프로젝트나 Smoke 범위를 벗어난 테스트를 추가하지 않는다.
- 실행하지 않았거나 실패한 테스트를 통과했다고 보고하지 않는다.
- 사용자의 명시적 요청 없이 `git commit`을 실행하지 않는다. 요청이 있어도 `git push`나 PR 생성을 실행하지 않는다.
