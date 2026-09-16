---
description: 특정 Wave/Task를 구현하기 전에 Working Tree·Wave 소속·의존성·Expected Files·문서 참조·환경변수·Secret·EXCLUDED 범위를 점검하고 READY_TO_IMPLEMENT 또는 BLOCKED_* 상태를 보고한다
---

# /prepare-task

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)과 루트 `CLAUDE.md`를 먼저 로드한다. **이 커맨드는 어떤 코드도 수정하지 않는다.** 오직 "지금 이 Task를 구현해도 되는가?"만 점검하고 상태를 보고한 뒤 끝난다. 구현은 이 커맨드가 끝난 뒤 별도로 진행한다.

## 입력

| 입력 | 설명 | 없을 때 |
|---|---|---|
| `WAVE_ID` | 이번에 진행 중인 Wave 식별자(예: `W01`) | 사용자에게 물어보고 중단 |
| `TASK_ID` | 준비할 Task ID(예: `PAGE-SCR001`) | 사용자에게 물어보고 중단 |
| 선택된 상세 Task 파일 | 기본값 `TASKS/TASK-<TASK_ID>.md`. 사용자가 다른 경로를 명시했으면 그 경로가 기본값과 일치하는지도 확인한다 | 기본값 사용, 파일이 없으면 검사 4에서 `BLOCKED_INPUT` |

세 입력 중 `WAVE_ID`·`TASK_ID`가 없으면 검사를 시작하지 않고 입력을 요청한다.

## 절차

**8개 검사를 전부 실행하고 결과를 모두 기록한 뒤에, 마지막에 최종 상태 하나를 결정한다.** 검사 도중 하나가 실패했다고 뒤 검사를 생략하지 않는다(전체 상황을 사람이 한 번에 볼 수 있어야 한다).

### 검사 1 — Working Tree 상태
`git status --porcelain`을 실행한다. 출력이 하나라도 있으면(스테이지 여부 무관, 추적되지 않는 파일 포함) **더러운 트리(dirty)**로 판정한다. 이전 Task의 변경사항이 커밋되지 않은 채 남아 있으면 이번 Task의 diff 경계(Expected Files 준수 여부)를 신뢰할 수 없기 때문이다.
- 결과: `CLEAN` 또는 `DIRTY`(변경된 파일 목록 포함)

### 검사 2 — Task가 현재 Wave에 포함되는지
1. `TASKS/WAVE_PLAN.md`가 저장소에 존재하는지 실제로 확인한다.
   - 존재하면 그 파일에서 `WAVE_ID`에 대응하는 Task ID 목록을 읽고, `TASK_ID`가 그 목록에 있는지 확인한다.
   - 존재하지 않으면(2026-09-16 기준 아직 이 파일은 없다), 이번 대화에서 사용자가 `WAVE_ID`에 어떤 Task들이 포함된다고 이미 알려줬는지 대화 맥락을 확인한다. 그것도 없으면 **Wave 소속 여부를 판정할 근거가 없다**고 있는 그대로 보고한다(추측으로 통과시키지 않는다).
2. `TASKS/00_TASK_LIST.md`를 읽어 `TASK_ID`가 실제로 존재하는 Task인지 확인한다.
- 결과: `IN_WAVE` / `NOT_IN_WAVE` / `WAVE_MEMBERSHIP_UNKNOWN`(근거 없음) / `TASK_ID_NOT_FOUND`

### 검사 3 — Depends On 완료 여부
1. 선택된 상세 Task 파일에서 `## Depends On` 절을 읽어 의존 Task ID 목록을 얻는다(없으면 "없음"으로 처리하고 통과).
2. 각 의존 Task에 대해:
   - `TASKS/00_TASK_LIST.md`의 `Implementation Status`가 `IMPLEMENTED`로 명시되어 있으면 완료로 간주한다.
   - 그렇지 않으면(현재 관례상 대부분 `IN_SCOPE_PENDING`), 해당 의존 Task의 상세 파일(`TASKS/TASK-<DEP_ID>.md`)의 `Expected Files`에 나열된 파일들이 실제 저장소에 **전부 존재하는지**를 확인해 완료 여부를 추정한다(내용의 정확성까지 검증하지는 않는다 — 이는 휴리스틱이며 한계임을 보고서에 명시한다).
- 결과: 의존 Task별 `DONE`/`NOT_DONE`(어떤 Expected Files가 없는지 포함) 목록

### 검사 4 — Expected Files
1. 선택된 상세 Task 파일이 실제로 존재하는지 확인한다. 없으면 이 검사부터 실패.
2. `## Expected Files` 절과 `TASKS/00_TASK_LIST.md`의 해당 행 `Expected Files` 열이 서로 일치하는지 확인한다.
3. 나열된 각 파일에 대해 "이미 존재함(수정 대상)" 또는 "아직 없음(생성 대상)"을 표시한다.
4. `TASKS/00_TASK_LIST.md`의 **다른** 행(다른 Task)의 `Expected Files`와 겹치는 파일이 있는지 확인한다(겹치면 두 Task가 같은 파일을 동시에 소유한다는 뜻이므로 경고로 기록한다).
- 결과: Expected Files 목록, 생성/수정 구분, 다른 Task와의 충돌 여부

### 검사 5 — SRS·Scope·Design·Screen Ref
선택된 상세 Task 파일의 아래 4개 절이 비어 있지 않고, 실제 문서와 정합한지 확인한다:
- `## Requirement Ref` — 여기 적힌 각 `REQ-FUNC-*`/`REQ-NFR-*` ID가 `docs/06_SRS_UIUX_REVISED.md` 또는 `docs/PROJECT_SCOPE.md`에 실제로 존재하는 ID인지
- `## Project Scope` — `docs/PROJECT_SCOPE.md`의 IMPLEMENT 판정과 모순되지 않는지
- `## Design Ref` — 인용한 절 번호가 `design-reference/D-001/DESIGN.md`에 실제로 존재하는지
- `## Screen / Route / Page Entry` — 여기 적힌 Screen ID/Route/Page Entry가 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 값과 정확히 일치하는지
- 결과: 4개 절 각각 `OK`/`STALE_OR_MISSING`(구체적으로 무엇이 다른지 포함)

### 검사 6 — 필요한 환경변수 이름
1. 선택된 상세 Task 파일의 Expected Files·Functional AC·Security/Privacy AC 내용과 `docs/ARCHITECTURE.md` §16(착수 차단)을 근거로, 이 Task가 필요로 하는 환경변수 **이름만** 나열한다(예: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). 값은 절대 요구하거나 조회하지 않는다.
2. `.env.local`(또는 `.env`)이 저장소에 존재하는지, 존재한다면 위 이름들이 **선언되어 있는지**(변수명이 파일에 `이름=` 형태로 있는지)만 확인한다. **파일 내용(값)을 출력하거나 인용하지 않는다.**
3. Task가 환경변수와 무관하면(예: 순수 정적 데이터 Task) "필요 없음"으로 기록한다.
- 결과: 필요한 환경변수 이름 목록, 각각 선언 여부(`DECLARED`/`MISSING`/`UNKNOWN — .env 파일 없음`)

### 검사 7 — Secret 하드코딩 위험
1. Expected Files 중 이미 저장소에 존재하는 파일과, 현재 Working Tree에 있는 변경/미추적 파일(검사 1에서 발견된 것)을 대상으로 흔한 시크릿 패턴(예: `sk-`, `SUPABASE_SERVICE_ROLE`, `-----BEGIN PRIVATE KEY-----`, 긴 base64/hex 문자열이 대입된 변수, `.env`가 아닌 `.ts`/`.tsx`/`.json` 파일에 직접 박힌 URL+키 조합 등)을 찾는다.
2. 실제 시크릿 **값**을 그대로 보고서에 옮기지 않는다 — 발견된 파일명·줄 번호와 패턴 종류만 보고한다(예: "`src/lib/x.ts:12`에 API Key로 보이는 하드코딩된 문자열 발견").
- 결과: `NO_RISK_FOUND` 또는 발견된 위치 목록(값 비공개)

### 검사 8 — EXCLUDED 범위 침범 여부
1. 선택된 상세 Task 파일의 `Requirement Ref`에 `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`(EXCLUDED) 표에 있는 ID가 하나라도 섞여 있는지 확인한다.
2. Functional AC·Expected Files에 EXCLUDED로 명시된 기능(콘텐츠 CRUD/CMS, 감사 로그, 관리자 Dashboard·통계, 외부 Email 공급자, Monitoring, Prisma/ORM, EC2/AWS, 자동 Merge — `docs/ARCHITECTURE.md` §14·§15, SKILL.md §9)에 해당하는 내용이 있는지 확인한다.
- 결과: `NO_VIOLATION` 또는 위반 항목 목록(관련 EXCLUDED ID·근거 인용)

## 최종 상태 결정 (우선순위 순서로 하나만 선택)

1. 검사 1이 `DIRTY`면 → **`BLOCKED_DIRTY_TREE`**
2. 검사 2·4·5·6 중 하나라도 실패/불명확하면(`NOT_IN_WAVE`, `WAVE_MEMBERSHIP_UNKNOWN`, `TASK_ID_NOT_FOUND`, Expected Files 누락, `STALE_OR_MISSING`, 필요 환경변수 `MISSING`) → **`BLOCKED_INPUT`**
3. 검사 7에서 시크릿 위험이 발견되면 → **`BLOCKED_INPUT`**(안전하지 않은 상태에서 구현을 시작할 수 없다)
4. 검사 3에서 완료되지 않은 의존 Task가 있으면 → **`BLOCKED_DEPENDENCY`**
5. 검사 8에서 EXCLUDED 범위 침범이 발견되면 → **`BLOCKED_SCOPE`**
6. 위 어느 것도 해당하지 않으면 → **`READY_TO_IMPLEMENT`**

## 보고 형식

항상 아래 순서로 보고한다(하나도 생략하지 않는다):

1. 입력 요약(WAVE_ID, TASK_ID, 상세 파일 경로)
2. 검사 1~8 각각의 결과(위 "결과:" 형식 그대로)
3. **최종 상태**(`READY_TO_IMPLEMENT` 또는 `BLOCKED_*` 중 정확히 하나)
4. `BLOCKED_*`인 경우, 무엇을 해결해야 다음 단계로 넘어갈 수 있는지 구체적으로 안내한다(예: "커밋되지 않은 3개 파일을 커밋/스태시한 뒤 다시 실행하세요", "`DB-SCHEMA-BASE`의 Expected Files 중 `supabase/migrations/0001_base_schema.sql`이 아직 없습니다").

## 금지

- **어떤 파일도 생성·수정·삭제하지 않는다.** `git add`, `git commit`, `git stash` 등 Working Tree를 바꾸는 명령도 실행하지 않는다 — 검사 1은 `git status`(읽기 전용)만 사용한다.
- 환경변수나 시크릿의 **값**을 조회·출력·인용하지 않는다. 이름과 존재 여부만 다룬다.
- Wave 소속 여부(검사 2)를 판정할 근거가 없을 때 임의로 "포함된다"고 추측하지 않는다 — `WAVE_MEMBERSHIP_UNKNOWN`으로 있는 그대로 보고한다.
- 8개 검사 중 일부를 생략하거나 결과를 요약·축소해서 보고하지 않는다.
- `BLOCKED_*` 상태인데 `READY_TO_IMPLEMENT`로 보고하지 않는다.
