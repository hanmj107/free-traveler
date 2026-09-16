# Free Traveler — Decision Log v1.0

- **문서 ID:** DECLOG-TRAVEL-001
- **작성일:** 2026-09-16
- **목적:** Free Traveler 프로젝트 진행 중 확정된 결정 14건을 한 곳에 고정한다. 각 결정은 번복하려면 이 문서를 개정(새 DEC 항목 추가 또는 기존 항목에 "번복" 표시)해야 하며, 다른 문서에서 이 결정과 상충하는 서술이 발견되면 이 문서가 우선한다.
- **상태 값:** `CONFIRMED`(확정, 번복 없음) / `SUPERSEDED`(후속 결정으로 대체됨)

## 요약표

| ID | 결정 | 상태 |
|---|---|---|
| DEC-001 | 실제 개발 루트는 `traveler/app` | CONFIRMED |
| DEC-002 | 디자인 Screen은 핵심 4개·보조 1개 | CONFIRMED |
| DEC-003 | `/travel-tools`에 항공·숙소·동행 작성을 통합 | CONFIRMED |
| DEC-004 | 여행지·안전·대표는 정적 TypeScript Data | CONFIRMED |
| DEC-005 | Supabase는 Auth와 동행 기능 중심 | CONFIRMED |
| DEC-006 | DB는 6개 Table로 제한 | CONFIRMED |
| DEC-007 | 항공·숙소 입력은 Browser Memory에만 유지 | CONFIRMED |
| DEC-008 | Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본 | CONFIRMED |
| DEC-009 | Playwright는 Chromium Smoke만 필수 | CONFIRMED |
| DEC-010 | 사용자의 개발 실행 단위는 Wave | CONFIRMED |
| DEC-011 | Single Agent가 Wave 내부 Task를 순차 수행 | CONFIRMED |
| DEC-012 | PR·Merge는 사용자가 수동 수행 | CONFIRMED |
| DEC-013 | EC2·AWS는 사용하지 않음 | CONFIRMED |
| DEC-014 | 제외 기능은 EXCLUDED로 관리 | CONFIRMED |

---

## DEC-001 — 실제 개발 루트는 `traveler/app`

- **결정:** 이 프로젝트의 실제 개발 루트(Git 저장소, `package.json`, `src/`, `node_modules`, `docs/`, `design-reference/`, `TASKS/`, `scripts/`, `.claude/`)는 `C:\AI_SERVICE\traveler\app`이다.
- **배경:** `C:\AI_SERVICE`는 이 프로젝트와 무관한 다수의 프로젝트(`korea-nature`, `notion-mcp-practice`, `pm-skills-lab`, `qaboard` 등)를 함께 담고 있는 공용 작업 공간이며, 최상위에 빈 `package-lock.json`(`"name": "AI_SERVICE"`)이 있어 착각하면 그것을 프로젝트 루트로 오인할 수 있다. 또한 `C:\AI_SERVICE\traveler\docs`(app 밖의 형제 디렉터리)에는 PRD/SRS **원본 초안**(`00_PRD_Travel_v1 (5).md`, `05_SRS_Travel_v1.md`)만 있고, 실제로 유지·개정되는 문서 세트는 `traveler/app/docs`(`01_PRD.md`~`ARCHITECTURE.md`)다.
- **결과:** 모든 명령·경로·CI 설정은 `traveler/app`을 작업 디렉터리로 가정한다. `traveler/docs`의 원본 파일은 참고용 이력으로만 남기고 더 이상 직접 수정하지 않는다.
- **관련 문서:** 없음(작업 환경 자체에 대한 결정)

## DEC-002 — 디자인 Screen은 핵심 4개·보조 1개

- **결정:** 디자인 Screen은 SCR-001(`/`)·SCR-002(`/about`)·SCR-003(`/travel-tools`)·SCR-004(`/mates`) 핵심 4개와 SCR-005(`/account`) 보조 1개, 정확히 5개로 고정한다.
- **배경:** `docs/PROJECT_SCOPE.md` §1·§2가 "핵심 화면 4개와 보조 화면 1개"를 최초로 규정했고, `docs/03_UI_COVERAGE_ANALYSIS.md`가 요구사항 77개 전체를 이 5개 Screen에 배치했다. `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `tier_summary`(core 4, auxiliary 1)가 이를 기계가 읽을 수 있는 형태로 고정한다.
- **결과:** 추가 Screen(예: 별도 로그인 페이지, 별도 마이페이지 하위 페이지)을 만들지 않는다. 기존에 제안됐던 개별 Route(`/destinations`, `/flights`, `/mate/new` 등)는 `docs/05_UIUX_APPROVED.md` §2의 통합 매핑에 따라 이 5개 Screen의 탭·패널·모달로 흡수된다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §1·§2, `docs/03_UI_COVERAGE_ANALYSIS.md` §2, `docs/05_UIUX_APPROVED.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`

## DEC-003 — `/travel-tools`에 항공·숙소·동행 작성을 통합

- **결정:** SCR-003(`/travel-tools`)은 항공·숙소·동행 구하기(작성) 3개 탭을 모두 포함하는 단일 페이지다. 탭별 입력·검증·완료 상태는 완전히 분리하되, Route는 하나만 사용한다.
- **배경:** `docs/PROJECT_SCOPE.md` §2-1이 제안했던 `/flights`, `/hotels`, `/mate/new` 3개 개별 Route를 `docs/04_UIUX_PLAN.md` §7과 `docs/05_UIUX_APPROVED.md` §2가 하나의 화면으로 통합했다. 동행 모집글 "조회"(목록·상세)는 SCR-004(`/mates`)에 남고, "작성"만 SCR-003으로 옮겨졌다.
- **결과:** `TASK-PAGE-SCR003.md`는 Depends On에 `COMP-SCR003-FLIGHT-FORM`·`COMP-SCR003-HOTEL-FORM`·`COMP-SCR003-MATE-COMPOSE` 3개를 모두 포함하며, 이 3개 Component가 각기 다른 tab 아래 조립된다.
- **관련 문서:** `docs/04_UIUX_PLAN.md` §7, `docs/05_UIUX_APPROVED.md` §2, `docs/06_SRS_UIUX_REVISED.md` §2, `TASKS/TASK-PAGE-SCR003.md`

## DEC-004 — 여행지·안전·대표는 정적 TypeScript Data

- **결정:** 여행지(`src/data/destinations.ts`), 국가별 안전정보(`src/data/countrySafety.ts`), 대표 소개(`src/data/about.ts`)는 DB 테이블이 아닌 정적 TypeScript 데이터로만 구현한다.
- **배경:** `docs/PROJECT_SCOPE.md` §3 "콘텐츠 저장 방식" 원칙 — 콘텐츠 관리자 CRUD·게시 워크플로를 구축할 운영 인력이 없다. 이에 따라 REQ-FUNC-ADMIN-001·001-2·002·006은 EXCLUDED로 분류됐다(DEC-014).
- **결과:** 콘텐츠 변경은 코드 변경(PR)으로만 처리한다. Supabase 장애 시에도 이 3종 화면(SCR-001 상당 부분, SCR-002)은 계속 열람 가능하다(REQ-NFR-AVAIL-003).
- **관련 문서:** `docs/PROJECT_SCOPE.md` §3·§4, `docs/ARCHITECTURE.md` §6, `TASKS/TASK-DATA-DESTINATIONS.md`, `TASKS/TASK-DATA-SAFETY.md`, `TASKS/TASK-DATA-REPRESENTATIVE.md`

## DEC-005 — Supabase는 Auth와 동행 기능 중심

- **결정:** Supabase(PostgreSQL, Auth)는 로그인/회원가입/성인확인과 동행(모집글·참가요청·신고·차단·외부 URL 설정) 기능에만 사용한다. 여행지·안전정보·대표 소개는 Supabase를 거치지 않는다(DEC-004).
- **배경:** `docs/PROJECT_SCOPE.md` §1·§3 "인증·개인정보" 원칙, `docs/02_SRS_BASELINE.md` §4-1 시스템 경계 정의.
- **결과:** Supabase 스키마는 동행/인증 관련 6개 테이블로만 구성된다(DEC-006). 콘텐츠 관련 Supabase 테이블·Storage 버킷을 만들지 않는다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §1·§3, `docs/ARCHITECTURE.md` §7

## DEC-006 — DB는 6개 Table로 제한

- **결정:** Supabase에 만드는 테이블은 정확히 `profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings` 6개로 제한한다.
- **배경:** `.claude/skills/traveler-project-pipeline/SKILL.md` §6이 이 6개를 명시적으로 확정했고, `TASK-DB-SCHEMA-BASE.md`가 각 테이블의 목적·제약을 정의한다. `scripts/audit_tasks.py` 검사 12(`db_table_count_within_tolerance`)가 이 범위를 벗어나지 않는지 자동 확인한다.
- **결과:** 콘텐츠·감사 로그·이미지 메타데이터용 테이블을 추가하지 않는다(REQ-FUNC-ADMIN-004·005 등 EXCLUDED와 연동). `profiles`에는 생년월일 컬럼을 두지 않는다(REQ-NFR-PRIV-002).
- **관련 문서:** `.claude/skills/traveler-project-pipeline/SKILL.md` §6, `docs/ARCHITECTURE.md` §8, `TASKS/TASK-DB-SCHEMA-BASE.md`

## DEC-007 — 항공·숙소 입력은 Browser Memory에만 유지

- **결정:** 항공·숙소 조건 입력값(국가·지역·날짜)은 Client Component의 `useState`/`useReducer`(브라우저 메모리)에만 보관한다. 서버 API, DB, URL 쿼리, 쿠키, `localStorage`, 로그 어디에도 전달·저장하지 않는다.
- **배경:** `docs/02_SRS_BASELINE.md` §2-3 원칙3, REQ-FUNC-FLIGHT-006, REQ-FUNC-HOTEL-005·006, REQ-NFR-SEC-003 — 실제 예약을 대행하지 않고 조건 정리만 돕는 서비스 원칙에서 파생됐다.
- **결과:** 페이지 이동·새로고침 시 입력값은 자연 소멸하며 별도 복구 로직을 만들지 않는다. "항공편/항공/숙소 보러 가기" 버튼은 `app_settings`에서 조회한 고정 랜딩 URL만 새 탭으로 연다.
- **관련 문서:** `docs/ARCHITECTURE.md` §4·§5, `TASKS/TASK-COMP-SCR003-FLIGHT-FORM.md`, `TASKS/TASK-COMP-SCR003-HOTEL-FORM.md`

## DEC-008 — Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본

- **결정:** `design-reference/vendor/airbnb/DESIGN-airbnb.md`는 레이아웃 밀도·단일 포인트 컬러·카드 그리드·단일 shadow tier 같은 **구조적 원칙만** 참고하는 vendor 자료이며, 실제 색상값·서체·워드마크·컴포넌트 정의는 사용하지 않는다. Free Traveler의 실제 디자인 토큰·규칙 정본은 `design-reference/D-001/DESIGN.md`이며 `design-reference/DESIGN_MANIFEST.md`에서 `Status: LOCKED`로 고정되어 있다.
- **배경:** `docs/04_UIUX_PLAN.md` 서두가 "Airbnb의 정확한 색상값(#ff385c), 서체(Cereal), 워드마크, 배지 문구 등 상표·브랜드 요소는 사용하지 않는다"고 명시했고, D-001 작성 시 이 원칙을 그대로 반영했다.
- **결과:** 코드에서 Airbnb 고유 색상값·서체·배지 문구를 참조하거나 재현하지 않는다(D-001 §19 Do Not). 디자인 토큰이 필요하면 항상 D-001을 먼저 확인하고, D-001에 없는 토큰은 임의로 추가하지 않는다.
- **관련 문서:** `design-reference/vendor/airbnb/DESIGN-airbnb.md`, `design-reference/D-001/DESIGN.md`, `design-reference/DESIGN_MANIFEST.md`

## DEC-009 — Playwright는 Chromium Smoke만 필수

- **결정:** E2E 테스트는 Playwright의 **Chromium 프로젝트만** 사용하며, 핵심 사용자 흐름에 대한 Smoke Test로 범위를 한정한다. Firefox·WebKit 등 다른 브라우저, 시각적 회귀 테스트, 크로스브라우저 매트릭스는 만들지 않는다.
- **배경:** `docs/PROJECT_SCOPE.md` §7이 Playwright 핵심 Smoke Test 10개 시나리오를 정의했고, `.claude/skills/traveler-project-pipeline/SKILL.md` §9·`scripts/audit_tasks.py` 검사 15(`playwright_chromium_smoke_task_exists`)가 이를 강제한다.
- **결과:** `TASK-E2E-PUBLIC-SMOKE`, `TASK-E2E-TRAVEL-TOOLS`, `TASK-E2E-MATE-AUTH` 3개 Task로 10개 흐름을 묶어 커버한다. `playwright.config.ts`의 `projects`는 Chromium 하나만 정의한다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §7, `docs/ARCHITECTURE.md` §12, `TASKS/TASK-E2E-PUBLIC-SMOKE.md` 등 3개 파일

## DEC-010 — 사용자의 개발 실행 단위는 Wave

- **결정:** 실제 구현은 개별 Task를 하나씩 지시받는 방식이 아니라, 서로 연관된 Task 묶음인 **Wave** 단위로 진행한다.
- **배경:** `TASKS/00_TASK_LIST.md`의 Depends On 그래프가 자연스러운 선후 관계(정적 데이터/DB/Auth 기반 → Component → Page Owner → Test/CI/Release)를 이미 형성하고 있어, 이 의존 순서를 그대로 Wave 경계로 사용할 수 있다. Wave의 정확한 개수·범위(예: Wave 1 = 기반 데이터/DB/Auth, Wave 2 = Screen별 Component, Wave 3 = Page Owner 조립, Wave 4 = 테스트/CI/배포)는 실행 시점에 사용자가 확정한다 — 이 문서는 "Wave가 실행 단위라는 결정" 자체만 고정한다.
- **결과:** 향후 작업 지시는 "Task ID 하나"가 아니라 "Wave 번호"로 주어질 수 있으며, Wave 안의 Task들은 `TASKS/00_TASK_LIST.md`의 Depends On을 어기지 않는 순서로 수행한다.
- **관련 문서:** `TASKS/00_TASK_LIST.md`, `TASKS/TASK_MANIFEST.csv`

## DEC-011 — Single Agent가 Wave 내부 Task를 순차 수행

- **결정:** 하나의 Wave 안에 있는 Task들은 여러 Agent가 병렬로 나눠 맡지 않고, **단일 Agent가 순차적으로** 수행한다.
- **배경:** Task 간 의존관계(Depends On)와 공유 파일 경계(Expected Files)가 세밀하게 얽혀 있어(예: Page Owner가 여러 Component의 결과물을 조립), 병렬 작업 시 충돌·중복 수정 위험이 병렬화로 얻는 속도 이득보다 크다고 판단했다.
- **결과:** Wave 내 Task 순서는 의존관계를 위상정렬한 순서를 따르며, 한 Task의 Definition of Done을 충족한 뒤에만 다음 Task로 넘어간다. 여러 Agent를 동시에 띄워 같은 Wave를 나눠 작업하지 않는다.
- **관련 문서:** `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`(각 Task의 Depends On)

## DEC-012 — PR·Merge는 사용자가 수동 수행

- **결정:** Pull Request 생성과 Merge는 항상 사용자(사람)가 수동으로 수행한다. 자동 Merge 파이프라인(Merge Queue, Auto-merge 봇 등)을 구성하지 않는다.
- **배경:** `docs/PROJECT_SCOPE.md` §4 "무인 자동 Merge Runner"를 제외 항목으로 명시했다 — "코드 변경은 사람이 리뷰·머지하며, 자동 병합 파이프라인은 구축하지 않는다."
- **결과:** `docs/ARCHITECTURE.md` §13의 GitHub Actions CI는 검사(Lint/Typecheck/Test)만 수행하고 Merge 자체를 트리거하지 않는다. Agent는 PR을 열 수는 있어도 Merge 버튼을 대신 누르지 않는다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §4, `docs/ARCHITECTURE.md` §13·§14

## DEC-013 — EC2·AWS는 사용하지 않음

- **결정:** 컴퓨팅·스토리지 인프라로 AWS EC2 또는 그 밖의 AWS 서비스를 사용하지 않는다. 호스팅은 Vercel, DB/Auth는 Supabase만 사용한다.
- **배경:** `docs/PROJECT_SCOPE.md` §4 "EC2·AWS 인프라"를 제외 항목으로 명시했다 — "Vercel 배포로 대체한다."
- **결과:** `package.json`에 AWS SDK류 의존성을 추가하지 않는다. `scripts/validate_inputs.py` 검사 11(`no_active_aws_ec2`)과 `scripts/audit_tasks.py` 검사 16이 이를 자동 확인한다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §4, `docs/ARCHITECTURE.md` §14, `scripts/validate_inputs.py`, `scripts/audit_tasks.py`

## DEC-014 — 제외 기능은 EXCLUDED로 관리

- **결정:** 범위에서 제외하기로 한 요구사항은 삭제하지 않고, 항상 "EXCLUDED" 상태와 제외 사유·후속 방향을 함께 기록해 추적표에 남긴다.
- **배경:** `docs/PROJECT_SCOPE.md` §5가 IMPLEMENT/EXCLUDED 두 상태만 정의했고, 이후 `docs/UIUX_TRACEABILITY.md`·`docs/06_SRS_UIUX_REVISED.md`·`TASKS/00_TASK_LIST.md` §16(NON_IMPLEMENTATION)이 이 규칙을 일관되게 이어받았다. Baseline Requirement 77개(REQ-FUNC 42 + REQ-NFR 35) 중 61개 IMPLEMENT, 16개 EXCLUDED로 전수 분류되어 있다.
- **결과:** EXCLUDED 항목은 구현 Task나 상세 파일을 만들지 않지만, 문서에서 완전히 사라지지도 않는다. 새로운 제외 결정이 생기면 기존 EXCLUDED 표에 행을 추가하고, IMPLEMENT로 되돌리려면 이 Decision Log에 번복 근거를 남긴 뒤 관련 문서를 함께 갱신한다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` §5, `docs/UIUX_TRACEABILITY.md`, `docs/06_SRS_UIUX_REVISED.md` §3, `TASKS/00_TASK_LIST.md` §16, `scripts/audit_tasks.py` 검사 17·18
