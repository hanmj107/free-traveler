# Free Traveler — Architecture v1.0

- **문서 ID:** ARCH-TRAVEL-001
- **작성일:** 2026-09-16
- **참고 문서:** `package.json`, `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `TASKS/TASK_MANIFEST.csv`
- **목적:** Free Traveler 구현이 지켜야 할 기술적 경계(무엇을 어디에 두는지, 무엇을 쓰지 않는지)를 하나의 문서로 고정한다. 화면 콘텐츠·Requirement 매핑은 `docs/06_SRS_UIUX_REVISED.md`·`docs/UIUX_TRACEABILITY.md`를, Task 단위 작업 지시는 `TASKS/00_TASK_LIST.md`·`TASKS/TASK-*.md`를 따른다.

> **구현 상태 고지:** 2026-09-16 기준 `src/app`에는 Create Next App 기본 스타터만 있고, `src/data`는 빈 디렉터리이며, Supabase 프로젝트·마이그레이션·테스트 러너·CI 워크플로는 아직 하나도 만들어지지 않았다. 이 문서는 **앞으로 지켜야 할 경계**를 정의하는 것이며 현재 구현 완료 상태를 의미하지 않는다.

---

## 1. 기술 스택

| 구성 요소 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | **Next.js 16.3.4, App Router** | `package.json` 기존 의존성. Pages Router 병행 사용 안 함 |
| 언어 | **TypeScript(strict)** | `tsconfig.json` `"strict": true` 유지, `.js` 신규 파일 추가 금지 |
| UI 런타임 | React 19.2.8 / React DOM 19.2.8 | `package.json` 기존 의존성 |
| 스타일 | Tailwind CSS 4 (`@tailwindcss/postcss`) | 기존 구성 유지, `design-reference/D-001/DESIGN.md`의 토큰만 사용(§19 Do Not) |
| 경로 별칭 | `@/*` → `./src/*` | `tsconfig.json` `paths` 기존 설정 |
| 데이터베이스/인증 | **Supabase**(PostgreSQL, Auth) | §7 참조 |
| ORM | **사용하지 않음** | §11 참조 |
| 단위 테스트 | **Vitest** | §12 참조 |
| E2E 테스트 | **Playwright — Chromium 프로젝트만** | §12 참조 |
| CI | **GitHub Actions** | §13 참조 |
| 배포 | **Vercel(+ Preview 배포)** | §13 참조 |

---

## 2. 화면 구조 — 핵심 4개 · 보조 1개

`design-reference/SCREEN_ROUTE_CONTRACT.json`이 정본이며, 아래 5개 Route 외의 디자인 Screen을 추가하지 않는다.

| Screen | 구분 | Route | Page Entry | Server/Client 기본값(§3) |
|---|---|---|---|---|
| SCR-001 | 핵심 | `/` | `src/app/page.tsx` | Server Component(조립) + 하위 Client Component |
| SCR-002 | 핵심 | `/about` | `src/app/about/page.tsx` | Server Component(대부분 정적) |
| SCR-003 | 핵심 | `/travel-tools` | `src/app/travel-tools/page.tsx` | Server Component(조립) + Client Component(탭·폼) |
| SCR-004 | 핵심 | `/mates` | `src/app/mates/page.tsx` | Server Component(초기 목록) + Client Component(필터·상세 상호작용) |
| SCR-005 | 보조 | `/account` | `src/app/account/page.tsx` | Server Component(역할 분기) + Client Component(폼·탭) |

기술 Route(디자인 Screen 수에 미포함): `src/app/auth/callback/route.ts`(Supabase 인증 콜백), `src/app/api/**/route.ts`(API), `src/app/not-found.tsx`(404). 각 Page Entry의 Section 순서·최소 콘텐츠 수·Empty State 규칙은 `design-reference/D-001/DESIGN.md` §18과 해당 `TASKS/TASK-PAGE-SCR0NN.md`를 따른다.

---

## 3. Server Component와 Client Component 경계

**기본값은 Server Component다.** 파일 최상단에 `"use client"`가 없는 모든 `.tsx`는 Server Component로 취급한다.

| 구분 | 사용 조건 | 예시 |
|---|---|---|
| **Server Component** | 상태(state)나 브라우저 이벤트 핸들러가 필요 없는 조립/표시 전용 컴포넌트. `src/data` 정적 데이터 직접 import, 또는 Server Supabase Client(§9)로 초기 데이터 조회 | 5개 Page Entry 자체, `CtaBanner`, `ThemeChips`의 정적 목록 부분, `TravelTimeline`, `PhotoGallery`, `SafetyNoticeCards` |
| **Client Component**(`"use client"`) | `useState`/`useEffect`/이벤트 핸들러/브라우저 API가 필요한 상호작용 요소 | 검색 Hero 입력창, 항공·숙소 Form(§4), 동행 작성 Form, 여행지 상세 Drawer(열림/닫힘 상태), 필터·탭 전환, 로그인/회원가입 Form, 참가 요청·신고·차단 버튼 |

**원칙:**
- Client Component는 상호작용에 필요한 최소 서브트리로 좁힌다(페이지 전체를 `"use client"`로 선언하지 않는다).
- Server Component에서 Supabase를 조회할 때는 Server Supabase Client만 사용한다(§9). Client Component에서 Supabase를 직접 호출하는 것은 인증 세션 구독 등 §9에 명시한 용도로 한정하고, 쓰기 작업(모집글 생성, 참가 요청, 신고, 차단, 외부 URL 저장)은 전부 Route Handler(`src/app/api/**/route.ts`)를 거친다.

---

## 4. 항공·숙소 입력 폼 — Client Component의 일시 상태만 사용

`COMP-SCR003-FLIGHT-FORM`, `COMP-SCR003-HOTEL-FORM`(REQ-FUNC-FLIGHT-001~006, REQ-FUNC-HOTEL-001~007)은 다음 원칙을 예외 없이 지킨다.

- 입력값(국가·지역·출발일/귀국일 또는 체크인/체크아웃)은 **Client Component 내부의 `useState`/`useReducer`에만** 보관한다.
- 전역 상태 관리 라이브러리(Context 전역 Provider, Zustand, Redux 등)로 승격하지 않는다.
- `localStorage`/`sessionStorage`/쿠키에 저장하지 않는다.
- 페이지 이동·새로고침·컴포넌트 언마운트 시 값은 자연 소멸한다(별도 복구 로직을 만들지 않는다).

---

## 5. 항공·숙소 입력값 미전송 원칙

REQ-FUNC-FLIGHT-006, REQ-FUNC-HOTEL-005/006, REQ-NFR-SEC-003을 코드 수준에서 다음과 같이 강제한다.

- **API로 보내지 않는다:** 입력값을 담아 `fetch`/`axios` 등으로 어떤 `/api/*`도 호출하지 않는다. "항공편/숙소 보러 가기" 버튼은 `app_settings`에서 조회한 **고정 랜딩 URL**만 새 탭으로 연다(`target="_blank" rel="noopener noreferrer"`, REQ-NFR-SEC-002).
- **DB로 보내지 않는다:** 입력값을 Supabase 테이블에 insert/update하지 않는다(6개 테이블 중 이 값을 저장할 테이블 자체가 없다 — §8).
- **URL로 보내지 않는다:** 외부 랜딩 URL에 쿼리 파라미터·경로 세그먼트로 입력값을 이어붙이지 않는다.
- **로그로 보내지 않는다:** `console.log`, 에러 리포팅, 분석 이벤트(그런 도구를 두지도 않는다 — §14) 등 어디에도 입력값을 기록하지 않는다.

---

## 6. 정적 데이터 — 여행지 · 안전정보 · 대표 소개

`docs/PROJECT_SCOPE.md` §3 "콘텐츠 저장 방식" 원칙에 따라 아래 3종은 **DB 테이블이 아닌 `src/data`의 정적 TypeScript 데이터**로만 구현한다(REQ-FUNC-ADMIN-001/001-2/006은 EXCLUDED).

| 파일 | 내용 | 최소 규모 |
|---|---|---|
| `src/data/destinations.ts` | 여행지(국내/해외) | 국내 10개 이상, 해외 15개국 30개 도시 이상, §3-4 필수 11개 항목을 타입으로 강제 |
| `src/data/countrySafety.ts` | 국가별 안전정보 | 해외 15개국 전체, 6개 안전 카테고리 + `last_verified_at` + `alert_level`/`alert_scope` |
| `src/data/about.ts` | 대표 소개 | Timeline 6개 이상, 방문국가 30개국, Gallery 8장 이상, 수치(50+/30+) 단일 소스 |

관리자 CRUD·게시 워크플로는 만들지 않는다. 콘텐츠 변경은 코드 변경(PR)으로만 처리한다.

---

## 7. Supabase — Auth와 동행 기능 중심

Supabase는 **인증(Auth)과 동행(Mate) 관련 기능에만** 사용한다. 여행지·안전정보·대표 소개(§6)는 Supabase를 거치지 않는다.

| Supabase 사용 영역 | 대응 Requirement |
|---|---|
| 이메일 로그인/회원가입, 세션 관리 | REQ-FUNC-MATE-001, REQ-NFR-PRIV-001 |
| 성인 확인(자기신고 체크박스 + 확인 시각 저장, 생년월일 미저장) | REQ-NFR-PRIV-002 |
| 동행 모집글 작성/조회/마감 | REQ-FUNC-MATE-002·003·008·009 |
| 참가 요청 생성/승인/거절(중복 방지) | REQ-FUNC-MATE-004·005 |
| 신고 생성/상태 관리 | REQ-FUNC-MATE-006, REQ-FUNC-ADMIN-003 |
| 차단 생성/해제 | REQ-FUNC-MATE-007 |
| 외부 항공/호텔 랜딩 URL 환경설정 | REQ-NFR-SEC-004 |

---

## 8. DB — 6개 테이블

`TASK-DB-SCHEMA-BASE.md`가 정의하는 테이블은 **정확히 아래 6개로 제한**하며, 그 이상 추가하지 않는다(`.claude/skills/traveler-project-pipeline/SKILL.md` §6).

| 테이블 | 목적 | 핵심 제약 |
|---|---|---|
| `profiles` | 이메일·닉네임·성인확인여부·확인시각 | **생년월일 컬럼을 두지 않는다**(REQ-NFR-PRIV-002) |
| `mate_posts` | 동행 모집글(국가·지역·기간·스타일·본문·상태) | 본문은 저장·렌더링 전 새니타이즈(REQ-NFR-SEC-008) |
| `mate_applications` | 참가 요청 | `(post_id, applicant_user_id)` UNIQUE 제약으로 중복 차단 |
| `user_blocks` | 차단 관계 | RLS로 상호 콘텐츠 비노출(§10) |
| `reports` | 신고(접수번호=PK, 상태) | 상태값: `RECEIVED`/`IN_REVIEW`/`RESOLVED` |
| `app_settings` | 항공/호텔 외부 랜딩 URL | 하드코딩 금지, 관리자만 쓰기(REQ-NFR-SEC-004) |

콘텐츠(여행지·안전정보)·감사 로그·이미지 메타데이터용 테이블은 만들지 않는다(§6, §15 EXCLUDED).

---

## 9. Browser · Server Supabase Client

`src/lib/supabase/client.ts`(브라우저)와 `src/lib/supabase/server.ts`(서버)로 인스턴스를 분리한다(`@supabase/ssr` 기준 패턴).

| 클라이언트 | 실행 위치 | 용도 | 금지 사항 |
|---|---|---|---|
| Browser Client | Client Component | 클라이언트 세션 상태 구독(로그인 여부 UI 반영), Supabase Auth UI 헬퍼 호출 | 서비스 role 키 사용 금지, 민감 쓰기(신고 상태 변경·외부 URL 저장) 직접 호출 금지 — 반드시 API Route를 거친다 |
| Server Client | Server Component, Route Handler(`src/app/api/**/route.ts`), `src/app/auth/callback/route.ts` | 초기 SSR 데이터 조회(모집글 목록 등), 모든 쓰기 작업, RLS 컨텍스트를 태운 인증된 조회 | 브라우저 번들에 노출되지 않도록 서버 전용 모듈 경계(`server-only` 등)를 지킨다 |

서비스 role 키(있다면)는 서버 환경변수로만 보관하고 클라이언트 번들에 절대 포함하지 않는다.

---

## 10. 간단한 RLS 원칙

`TASK-DB-RLS-BASE.md` 기준, 복잡한 다단계 정책 대신 아래 3가지만 강제한다.

1. `reports`는 **관리자 role만 SELECT** 가능하다(REQ-NFR-PRIV-003).
2. `user_blocks`가 존재하는 두 사용자 사이에서는 서로의 `mate_posts`가 목록·상세 조회 결과에 나타나지 않는다(REQ-NFR-PRIV-004).
3. `mate_applications`는 **신청자 본인 또는 해당 모집글 작성자만** 조회할 수 있다.

그 외 테이블(`profiles`, `mate_posts` 본문, `app_settings` 읽기)은 공개 열람을 허용하는 단순 정책으로 시작하고, 필요 이상으로 세분화된 정책을 먼저 설계하지 않는다.

---

## 11. Prisma·ORM 미사용

DB 접근은 `@supabase/supabase-js`의 쿼리 빌더(`.from().select()/.insert()/...`)와 `supabase/migrations/*.sql` 원시 SQL 마이그레이션만으로 수행한다. Prisma, Drizzle, TypeORM 등 어떤 ORM/쿼리 빌더 계층도 추가하지 않는다 — 테이블이 6개로 고정되어 스키마 추상화 계층의 이득이 적고, 마이그레이션 이중 관리(ORM 스키마 파일 + SQL)를 피하기 위함이다.

---

## 12. 테스트 — Vitest + Playwright Chromium Smoke

| 계층 | 도구 | 범위 | 대응 Task |
|---|---|---|---|
| Unit | **Vitest** | 날짜 검증(과거 출발일/체크인, 역순 구간), 연락처 탐지 정규식, 참가 요청 상태 전이·중복 방지·마감 계산 | `TASK-UNIT-TRAVEL-DATES`, `TASK-UNIT-CONTACT-DETECTION`, `TASK-UNIT-MATE-STATE` |
| Integration | Vitest 또는 SQL 스크립트 | RLS 기본 정책 3가지(§10) 실제 쿼리 검증 | `TASK-TEST-RLS-BASIC` |
| E2E | **Playwright — Chromium 프로젝트만** | 공개 화면 Smoke, 여행 준비 Smoke, 동행·인증·관리자 Smoke(총 10개 사용자 흐름을 3개 Task로 묶음) | `TASK-E2E-PUBLIC-SMOKE`, `TASK-E2E-TRAVEL-TOOLS`, `TASK-E2E-MATE-AUTH` |

**Playwright 설정 원칙:** `playwright.config.ts`의 `projects`는 Chromium 하나만 정의한다. Firefox·WebKit 프로젝트, 시각적 회귀 테스트, 크로스브라우저 매트릭스를 추가하지 않는다.

---

## 13. CI/CD — GitHub Actions + Vercel Preview

- **GitHub Actions**(`.github/workflows/ci.yml`, `TASK-CI-PIPELINE-SETUP`): PR마다 `next lint`, `tsc --noEmit`, Vitest(Unit+RLS Integration) 자동 실행. Playwright E2E는 최소 main 브랜치 병합 전 1회 이상 실행(러너 비용을 고려해 PR마다 전량 실행할지 여부는 팀 판단에 맡기되, 실행 자체를 생략하지 않는다).
- **Vercel Preview:** PR을 열면 Vercel의 GitHub 연동이 자동으로 Preview 배포를 생성한다. 별도 커스텀 배포 스크립트나 인프라를 구축하지 않고 Vercel 기본 기능만 사용한다.
- **Production 배포:** `main` 브랜치 병합 시 Vercel이 자동으로 Production 배포를 실행한다.
- 사람이 PR을 리뷰하고 머지한다(§15).

---

## 14. 명시적으로 사용하지 않는 인프라

- **AWS·EC2:** 사용하지 않는다. 컴퓨팅·스토리지는 Vercel(호스팅)과 Supabase(DB/Auth)만 사용한다.
- **자동 Merge:** 사용하지 않는다. 모든 PR은 사람이 리뷰 후 수동으로 머지한다. 자동 병합 파이프라인(Merge Queue, Auto-merge 봇 등)을 구성하지 않는다.

---

## 15. 프로젝트 범위 제외 (착수 시점부터 만들지 않음)

아래 3가지는 이번 프로젝트 범위에서 **명시적으로 제외**한다. 관련 코드·서비스 연동·환경변수를 준비하지 않는다.

| 제외 항목 | 대체 방식 | 근거 |
|---|---|---|
| **CMS(콘텐츠 관리 시스템)** | 여행지·안전정보·대표 소개는 `src/data` 정적 데이터(§6)로 관리, 변경은 PR로 처리 | `docs/PROJECT_SCOPE.md` §4, REQ-FUNC-ADMIN-001/001-2/002/006 EXCLUDED |
| **외부 Email 공급자**(SendGrid 등) | 참가 요청 알림·신고 접수 확인은 Toast/화면 내 상태 표시로 대체, 실제 이메일 발송 없음 | `docs/PROJECT_SCOPE.md` §3 "알림" 원칙, PRD Should 우선순위 기능(이메일 알림)은 REQ-FUNC로 변환되지 않음(SRS §2-5) |
| **Monitoring(업타임/에러율/APM 등)** | Vercel/Supabase 기본 제공 수준에 의존, 별도 대시보드·알림 체계 없음 | `docs/PROJECT_SCOPE.md` §4, REQ-NFR-AVAIL-001/002, REQ-NFR-OBS-001/002 EXCLUDED |

---

## 16. 착수 차단(Blocking) — 실제로 없는 파일·환경변수

아래 항목은 2026-09-16 기준 저장소에 **실제로 존재하지 않으며**, 해당 항목에 의존하는 Task(§8~§13)에 착수하기 전에 준비되어야 한다. 존재 여부를 확인할 수 없는 추정 항목은 기록하지 않았다.

| # | 항목 | 현재 상태 | 필요한 이유 | 의존하는 Task |
|---|---|---|---|---|
| 1 | `.env.local`(또는 배포 환경변수)의 `NEXT_PUBLIC_SUPABASE_URL` | 파일 자체가 저장소에 없음(`.gitignore`에 `.env*` 등록만 되어 있음) | Browser/Server Supabase Client 초기화(§9) | `DB-ACCESS`, `AUTH-SUPABASE-CLIENT`, 모든 `API-*` |
| 2 | `.env.local`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 없음 | 위와 동일 | 위와 동일 |
| 3 | Supabase 프로젝트 자체(URL/키의 발급 대상) | 생성 여부 확인 불가 — 로컬에 `supabase/config.toml`·`supabase/migrations/` 없음 | `DB-SCHEMA-BASE`가 적용될 대상이 없으면 마이그레이션을 실행할 수 없음 | `DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE` |
| 4 | `package.json`의 `@supabase/supabase-js`, `@supabase/ssr` 의존성 | 미설치(현재 의존성 목록에 없음) | §9 Browser/Server Client 구현에 필수 | `DB-ACCESS`, `AUTH-SUPABASE-CLIENT`, 모든 `API-*` |
| 5 | `package.json`의 `vitest` 의존성 및 `vitest.config.ts` | 미설치/미생성 | §12 Unit/Integration 테스트 실행 | `UNIT-TRAVEL-DATES`, `UNIT-CONTACT-DETECTION`, `UNIT-MATE-STATE`, `TEST-RLS-BASIC` |
| 6 | `package.json`의 `@playwright/test` 의존성 및 `playwright.config.ts`(Chromium 전용 설정) | 미설치/미생성 | §12 E2E Smoke 실행 | `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH` |
| 7 | `.github/workflows/ci.yml` | 없음(`.github` 디렉터리 자체가 없음) | §13 CI 자동 실행 | `CI-PIPELINE-SETUP` |
| 8 | Vercel 프로젝트 연결 및 Vercel 대시보드의 Supabase 환경변수 등록 | 저장소 내에서 연결 여부 확인 불가 | §13 Preview/Production 배포 | `RELEASE-CHECK-VERCEL-SUPABASE` |

위 8개 항목이 해소되기 전까지 `PAGE-SCR003`(외부 URL 조회)·`PAGE-SCR004`·`PAGE-SCR005`·모든 `API-*`·`AUTH-*`·`DB-*`·테스트/CI 관련 Task는 실제 동작을 확인할 수 없다. 다만 `PAGE-SCR001`·`PAGE-SCR002`와 정적 데이터 Task(`DATA-DESTINATIONS`·`DATA-SAFETY`·`DATA-REPRESENTATIVE`)는 위 항목과 무관하게 착수 가능하다.
