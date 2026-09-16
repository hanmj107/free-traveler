---
description: TASKS/00_TASK_LIST.md의 각 Task에 대해 1:1 상세 파일(TASKS/TASK-<ID>.md)을 생성하고 scripts/audit_tasks.py로 검증한다
---

# /gen-task-details

`traveler-project-pipeline` Skill(`.claude/skills/traveler-project-pipeline/SKILL.md`)을 먼저 로드한다. `TASKS/00_TASK_LIST.md`가 없으면 먼저 `/gen-tasklist`를 실행하라고 안내하고 중단한다. **이 커맨드는 실제 애플리케이션 구현 코드(`src/**`, `supabase/**` 등)를 한 줄도 작성하지 않는다** — Task 상세 계획 문서만 만든다.

## 절차

1. **Skill과 `TASKS/00_TASK_LIST.md`를 실제로 읽는다.** 표의 63개(또는 현재 실제 개수) 행 전부를 Seq 순서로 확인한다.
2. 참고 문서를 함께 읽는다: `design-reference/D-001/DESIGN.md`(Section 계약·Empty State·Do/Do Not), `design-reference/UI_CONTRACT.md`(Screen별 상태·이동·금지 기능), `docs/ARCHITECTURE.md`(Server/Client 경계, DB 6테이블, 외부 입력 미전송 원칙), `docs/PROJECT_SCOPE.md`(Requirement 원문·EXCLUDED 근거).
3. **사전 검사**를 먼저 수행하고 결과를 사용자에게 보고한다:
   - 중복 Task ID가 있는지
   - 필수 열(Task ID/제목/Category/Implementation Status/Expected Files/Functional AC/Verify/Priority)이 비어 있는 행이 있는지
   - `Depends On`이 `TASKS/00_TASK_LIST.md`에 존재하지 않는 Task ID를 참조하는지
   - 문제가 있으면 상세 파일 생성을 중단하고 `TASKS/00_TASK_LIST.md`부터 고치라고 안내한다.
4. `TASKS/00_TASK_LIST.md`의 각 행에 대해 **정확히 1개**의 `TASKS/TASK-<TASK_ID>.md`를 생성한다. **이미 같은 Task ID의 파일이 있으면 새로 만들지 않고 그 파일을 최신 내용으로 갱신한다**(중복 파일 생성 금지).
5. 상세 파일은 Skill §10에 정의된 아래 14개 절 구조를 그대로 따른다:

   ```markdown
   # <TASK_ID> — <제목>

   - **Category:** <Category>
   - **Priority:** <Priority>
   - **Implementation Status:** <Implementation Status>

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

6. **Page Owner Task(`PAGE-SCR001`~`PAGE-SCR005`) 필수 반영 사항**(Skill §5):
   - 해당 Screen의 Section 순서·최소 콘텐츠 수(`design-reference/D-001/DESIGN.md` §18)를 Functional AC에 명시한다.
   - 큰 빈 영역·Placeholder 문구 금지, 완성형 Empty State 요구(§17)를 Visual AC에 명시한다.
   - `PAGE-SCR001`: Create Next App 기본 스타터 제거를 Functional AC에 명시한다.
   - `PAGE-SCR003`: 항공편·숙소·동행 구하기 3개 탭 실제 조립(상태 완전 분리)을 Functional AC에 명시한다.
   - `PAGE-SCR005`: Guest·Member·Admin 역할별 상태 실제 조립(역할에 없는 탭 미렌더링)을 Functional AC에 명시한다.
   - **Expected Files는 해당 Page Entry 파일만 포함**하고, Forbidden 절에 "하위 Component·Data·API 파일을 이 Task에서 직접 생성하지 않는다"를 명시한다(원칙 6, 9).
7. **DB Task(`DB-SCHEMA-BASE` 등):** Functional AC 또는 Forbidden 절에 6개 테이블(`profiles`/`mate_posts`/`mate_applications`/`user_blocks`/`reports`/`app_settings`) 밖의 테이블을 추가하지 않는다고 명시한다(Skill §6).
8. **항공/숙소 관련 Component(`COMP-SCR003-FLIGHT-FORM`, `COMP-SCR003-HOTEL-FORM`):** Security/Privacy AC에 입력값을 서버·DB·URL·로그·분석으로 보내지 않는다는 문구를 명시한다(Skill §9, `docs/ARCHITECTURE.md` §4·§5).
9. **E2E Task(`E2E-*`):** Functional AC와 본문에 "Chromium"과 "Smoke" 표현을 반드시 포함하고, Forbidden 절에 Firefox/WebKit 등 다른 브라우저 프로젝트를 추가하지 않는다고 명시한다.
10. EXCLUDED Requirement(`TASKS/00_TASK_LIST.md` §16)에 대해서는 **상세 Task 파일을 만들지 않는다.**
11. 모든 상세 파일 생성/갱신이 끝나면 **예외 없이 다음을 실행한다:**
    ```
    python scripts/audit_tasks.py
    ```
    (`python3`이 있으면 `python3 scripts/audit_tasks.py`를 우선 시도하고, 없으면 `python`으로 재시도한다.)
12. **감사 결과를 있는 그대로 보고한다.** `AUDIT_PASS`가 아니면 이 커맨드를 "완료"로 보고하지 않는다 — 실패한 검사 번호·이름·상세 내용을 전부 사용자에게 전달하고, 해당 Task 상세 파일만 최소 수정한 뒤 11번부터 다시 실행한다. 감사가 통과할 때까지 이 과정을 반복한다.

## 금지

- 실제 애플리케이션 구현 코드(`src/**`, `supabase/**`, `tests/**`의 실제 테스트 구현 코드 등)를 작성하지 않는다 — 이 커맨드는 계획 문서(`TASKS/TASK-*.md`)만 만든다.
- Task 상세 파일에 프롬프트 안내 문장, 작성 과정 설명, "TODO"/"추후 결정" 같은 자리표시자를 남기지 않는다.
- `TASKS/00_TASK_LIST.md`에 없는 Task ID로 상세 파일을 만들지 않는다(1:1 위반).
- **`scripts/audit_tasks.py`를 실행하지 않고, 또는 실행했지만 실패했는데도 완료로 보고하지 않는다.** 감사 실패를 무시하거나 요약해서 축소 보고하지 않는다.
