# Free Traveler

국내외 인기 여행지·국가별 안전정보·여행 준비 도구(항공/숙소 검색 연결)·동행
모집을 한 곳에서 제공하는 자유여행 서비스입니다. Next.js(App Router) +
Supabase(Auth/Postgres/RLS)로 구현합니다.

## 로컬 실행

```bash
npm ci
cp .env.example .env.local   # 실제 Supabase 값으로 채운다(아래 "환경변수" 참고)
npm run dev
```

`http://localhost:3000`에서 확인합니다. `NEXT_PUBLIC_SUPABASE_URL`/
`NEXT_PUBLIC_SUPABASE_ANON_KEY`가 없어도 개발 서버는 뜨지만, 로그인·동행
모집·항공/숙소 외부 URL 설정 등 Supabase를 사용하는 기능은 동작하지 않습니다
(정적 여행지·안전정보·대표 소개 화면은 Supabase 없이도 정상 동작합니다).

## 환경변수

`.env.example`을 참고합니다. 이 프로젝트가 실제로 읽는 환경변수는 다음
2개뿐입니다.

| 변수 | 용도 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(공개) key | RLS로 보호되는 공개 키. **service_role key는 이 프로젝트 어디에서도 사용하지 않는다** |

`NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저 번들에 그대로 노출됩니다. anon
key는 Row Level Security로 보호되므로 노출돼도 안전하지만, 그 이상의 서버
전용 비밀(예: service_role key)은 이 프로젝트에 절대 추가하지 않습니다(root
`CLAUDE.md` 규칙 15).

로컬 Supabase 프로젝트를 처음 준비할 때는 다음 순서로 마이그레이션과 시드
데이터를 적용합니다(실제 프로젝트에 적용하는 예시 — `supabase link` 이후):

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push                              # supabase/migrations/*.sql 순서대로 적용
npx supabase db query --linked -f supabase/seed.sql   # 개발용 시드 데이터(선택)
```

## Test

```bash
npm run lint            # ESLint(eslint-config-next, jsx-a11y 포함)
npm run typecheck       # tsc --noEmit
npm run test:unit       # Vitest(Unit Test) — tests/integration/rls.spec.ts는
                         # Supabase 환경변수가 없으면 자동으로 건너뛴다
npm run test:e2e:public # Playwright Chromium — 로그인 없이 가능한 공개 화면 Smoke
npm run test:e2e        # Playwright Chromium — 로그인 포함 전체 Smoke(Supabase 환경변수 필요)
npm run ci              # lint + typecheck + test:unit + task/screen contract + build
```

RLS(Row Level Security) 정책은 `supabase/tests/rls_basic.sql`(pgTAP)로도
검증합니다. 로컬에 Docker가 있다면 `supabase start` 후 `supabase test db`로
실행하고, 없다면 이미 연결된 프로젝트에 대해 다음처럼 실행할 수 있습니다
(트랜잭션을 열고 마지막에 `rollback`하므로 실제 데이터를 바꾸지 않습니다).

```bash
npx supabase db query --linked -f supabase/tests/rls_basic.sql
```

## 배포 순서 (Vercel)

1. `npm ci && npm run release:check` — Lint·타입체크·Unit Test·Task/Screen
   Contract·Build를 전부 통과하는지 로컬에서 먼저 확인한다.
2. Vercel에서 이 저장소를 새 Project로 Import한다(Framework Preset: Next.js,
   Root Directory는 이 `app` 디렉터리).
3. Vercel Project → Settings → Environment Variables에 `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록한다(Production/Preview 모두).
4. Supabase 프로젝트에 마이그레이션(`supabase/migrations/*.sql`)이 이미
   적용돼 있는지 확인한다 — 적용 전이면 위 "환경변수" 절의 `supabase db push`
   순서를 먼저 실행한다.
5. Vercel이 자동으로 빌드·배포한 Preview URL을 브라우저로 직접 열어 5개
   경로(`/`, `/about`, `/travel-tools`, `/mates`, `/account`)가 모두 HTTPS로
   정상 접근되는지 확인한다(`docs/RELEASE_CHECKLIST.md`, `TASKS/checklists/`
   참고).
6. 문제가 없으면 Production으로 승격(Promote)한다. Merge는 항상 사람이
   수동으로 한다 — 자동 Merge/자동 배포 승인은 사용하지 않는다.

## 프로젝트 구조 참고 문서

- `docs/06_SRS_UIUX_REVISED.md` — 요구사항(SRS) 정본
- `docs/PROJECT_SCOPE.md` — 구현 범위(IMPLEMENT/EXCLUDED) 정본
- `design-reference/D-001/DESIGN.md` — 디자인 토큰·Section 계약 정본
- `design-reference/SCREEN_ROUTE_CONTRACT.json` — Screen/Route/Page Entry 정본
- `docs/RELEASE_CHECKLIST.md` — 배포 전 체크리스트
- `TASKS/00_TASK_LIST.md`, `TASKS/WAVE_PLAN.md`, `TASKS/WAVE_STATE.json` — 구현 Task/Wave 진행 상태
