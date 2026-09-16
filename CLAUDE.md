# Free Traveler — Root Agent Rules

이 문서는 `traveler/app`(실제 개발 루트, `docs/DECISION_LOG.md` DEC-001)에서 작업하는 모든 Agent가 지켜야 할 규칙을 직접 기록한다. 다른 Agent 규칙 파일을 가져오거나(import) 위임하지 않는다 — 필요한 규칙은 전부 이 파일 안에 있다.

`AGENTS.md`는 `next dev`가 자동으로 재생성하는 Next.js 버전 경고 블록(BEGIN/END 마커)만 담고 있으며, 이 문서와 별개로 그대로 둔다. 이 문서가 이 프로젝트의 유일한 Agent 규칙 정본이다.

---

## Harness Marker

```
HARNESS_SCHEMA=traveler-screen-route-v1
DESIGN_PATH=design-reference/D-001/DESIGN.md
SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json
PROJECT_SCOPE=docs/PROJECT_SCOPE.md
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_SCOPE=chromium-smoke
AUTO_MERGE=false
AWS_ENABLED=false
```

---

## 필수 규칙

1. 작업 전 `package.json`과 현재 설치된 Next.js 버전의 문서(`node_modules/next/dist/docs/`)를 확인한다. 학습 데이터의 Next.js 지식과 실제 설치 버전이 다를 수 있다.
2. SRS 정본은 `docs/06_SRS_UIUX_REVISED.md`다. Requirement 내용·Screen 배치가 다른 문서와 상충하면 이 문서를 따른다.
3. Scope 분류(IMPLEMENT/EXCLUDED) 정본은 `docs/PROJECT_SCOPE.md`(`$PROJECT_SCOPE`)다.
4. 디자인 토큰·Section 계약 정본은 `design-reference/D-001/DESIGN.md`(`$DESIGN_PATH`)다. Airbnb vendor 참고본(`design-reference/vendor/airbnb/DESIGN-airbnb.md`)은 구조적 원칙만 참고 대상이며 정본이 아니다.
5. Screen/Route/Page Entry 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`(`$SCREEN_CONTRACT`)이다. 다른 문서의 Route 서술과 상충하면 이 JSON이 우선한다.
6. `/run-wave WXX`를 표준 개발 명령으로 사용한다. Wave 단위가 아닌 임의 순서로 여러 화면·기능을 동시에 손대지 않는다.
7. Wave 내부 Task는 `TASKS/00_TASK_LIST.md`의 Depends On 순서를 따라 **한 번에 하나만** 구현한다. 여러 Task를 병렬로 동시에 진행하지 않는다.
8. 현재 진행 중인 Task의 `Expected Files` 목록 밖에 있는 파일은 수정하지 않는다.
9. Page Owner Task는 자신의 Page Entry(`src/app/**/page.tsx`)에서 이미 만들어진 Component를 실제로 조립하는 것만 수행한다. Page Owner Task 안에서 새 Component 파일을 만들지 않는다.
10. SCR-001(`/`) 완료 시 Create Next App 기본 스타터(로고, "To get started" 문구, Deploy Now/Documentation 링크)를 완전히 제거한다.
11. SCR-003(`/travel-tools`)은 항공·숙소·동행 구하기(작성) 3개 탭을 모두 실제로 조립한다. 탭별 입력·검증·완료 상태는 서로 완전히 분리한다.
12. 항공·숙소 입력값은 서버 API, DB, URL(쿼리·경로), 로그, 분석 도구 어디로도 보내지 않는다. Client Component의 일시 상태(`useState`/`useReducer`)에만 둔다.
13. Supabase 쓰기(insert/update/delete)는 Auth·동행(모집글·참가요청)·신고·외부 URL 설정(`app_settings`) 범위로만 제한한다. 여행지·안전정보·대표 소개는 Supabase에 쓰지 않는다(정적 데이터, 규칙 16).
14. RLS를 우회하는 Client 코드를 작성하지 않는다(예: RLS가 막아야 할 조회를 서비스 role 키나 별도 우회 경로로 무력화하는 코드).
15. Service Role Key(또는 그에 준하는 서버 전용 키)를 Client Component·브라우저 번들에 절대 포함하지 않는다. 서버 전용 모듈에서만 사용한다.
16. 여행지·국가별 안전정보·대표 소개는 `src/data`의 정적 TypeScript 데이터를 사용한다. 이 3종에 대한 DB 테이블이나 관리자 CRUD를 만들지 않는다.
17. Prisma·Drizzle·TypeORM 등 ORM, AWS, EC2를 추가하지 않는다(`AWS_ENABLED=false`). DB 접근은 `@supabase/supabase-js`와 원시 SQL 마이그레이션만 사용한다.
18. Playwright는 핵심 흐름에 대한 **Chromium Smoke Test만**(`PLAYWRIGHT_SCOPE=chromium-smoke`) 작성한다. Firefox·WebKit 프로젝트나 시각적 회귀 테스트를 추가하지 않는다.
19. `docs/PROJECT_SCOPE.md`·`TASKS/00_TASK_LIST.md` §16(NON_IMPLEMENTATION)에서 EXCLUDED로 분류된 기능을 임의로 구현하지 않는다. 구현이 필요하다고 판단되면 먼저 사람에게 확인한다.
20. `git reset --hard`, `git push --force`, `git clean -f`, `git checkout .`/`git restore .` 같은 destructive Git 명령을 사용자의 명시적 지시 없이 임의로 사용하지 않는다.
21. 자동 PR 생성이나 자동 Merge를 실행하지 않는다(`AUTO_MERGE=false`). PR 생성은 사용자가 요청했을 때만 하고, Merge는 항상 사람이 수동으로 한다.
22. 화면 단위 Wave를 완료하면 사람이 Preview(실행 결과)를 직접 확인한 뒤에만 다음 화면 Wave로 진행한다. 확인 없이 다음 Wave로 넘어가지 않는다.
23. 작업 완료 시 변경한 파일 목록, 검증 결과(테스트/빌드/린트 등), 남은 제한사항(미해결 의존성·환경변수 부재 등)을 함께 보고한다.

---

## Task 완료 순서

1. **Task 읽기** — 진행할 `TASKS/TASK-<ID>.md`의 Context·Depends On·Expected Files·Acceptance Criteria를 전부 읽는다.
2. **입력 확인** — Depends On에 명시된 선행 Task가 완료되어 있는지, 필요한 파일·환경변수가 존재하는지 확인한다(`docs/ARCHITECTURE.md` §16 착수 차단 목록 참고).
3. **구현** — Expected Files 목록 안에서만 코드를 작성·수정한다.
4. **관련 포맷·Unit Test** — 해당 코드에 필요한 포맷(lint/타입체크)과 관련 Unit Test를 실행하고 통과시킨다.
5. **필요 시 Playwright** — 해당 Task가 E2E Smoke 대상이면 Chromium Smoke Test를 실행한다.
6. **Diff 확인** — 변경 사항이 Expected Files 범위를 벗어나지 않았는지, 의도하지 않은 파일 변경이 없는지 diff로 확인한다.
7. **완료 보고** — 변경 파일·검증 결과·남은 제한사항을 보고한다(규칙 23).
