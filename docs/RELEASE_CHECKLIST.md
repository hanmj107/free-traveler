# Release Checklist

Vercel Preview/Production에 배포하기 전에 확인한다. `docs/PROJECT_SCOPE.md` §8
"배포" 원칙(Vercel만 사용, 별도 EC2/AWS·업타임 모니터링·부하 테스트 없음)을
전제로 한다.

## 1. 로컬 검증(배포 전 필수)

- [ ] `npm ci` — lockfile 그대로 의존성 설치
- [ ] `npm run release:check` — lint·typecheck·test:unit·task/screen contract·
      build·(Supabase Secret이 있으면) 전체 Playwright Smoke까지 한 번에 실행
- [ ] `npm run screen:contract -- --mode=release` — `docs/preview-checks/SCR-001.md`
      ~`SCR-005.md` 5개 전부 CONFIRMED인지 자동 검사
- [ ] `npm run build` — 프로덕션 빌드가 Supabase 환경변수 유무와 무관하게
      성공하는지 재확인

## 2. Secret·환경변수

- [ ] `.env.example`에 실제 값(URL·key)이 없고 변수 이름만 있는지 확인
- [ ] `.env.local`·`.env*.local`이 `.gitignore`에 있고 실제로 커밋되지 않았는지
      확인(`git status`, `git log --all -- .env.local`)
- [ ] Vercel Project → Settings → Environment Variables에
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록
      (Production/Preview 모두)
- [ ] Service Role Key 등 서버 전용 비밀은 이 프로젝트 어디에도 존재하지
      않음을 재확인(`grep -r "service_role" src/`가 빈 결과여야 한다)

## 3. Supabase

- [ ] 대상 Supabase 프로젝트에 `supabase/migrations/*.sql`이 순서대로 전부
      적용됐는지 확인(`npx supabase migration list --linked`)
- [ ] RLS Policy가 6개 테이블 전부에 활성화돼 있는지 확인
- [ ] (선택) `supabase/seed.sql` — 데모/테스트용 시드 데이터, 실제 운영 배포에는
      적용하지 않는다

## 4. Next.js / Vercel 빌드 호환성

- [ ] `next.config.ts`의 `images.remotePatterns`가 실제 사용 중인 이미지
      Host(`picsum.photos`)와 일치하는지 확인
- [ ] Vercel의 실제 Build Command(`next build`)가 Python 스크립트 등 로컬
      전용 도구에 의존하지 않는지 확인(`task:contract`/`screen:contract`는
      `npm run ci`/`release:check`에서만 실행되며 Vercel Build Command에는
      포함되지 않는다)
- [ ] Supabase 환경변수가 전혀 없어도 `next build`가 실패하지 않는지 확인함
      (Supabase Client 생성이 전부 요청 시점 코드에 있고 빌드 시점 모듈
      최상단에는 없다 — 2026-09-19 로컬에서 재확인)

## 5. Screen Contract(5개 화면 Browser Checkpoint)

- [ ] `docs/preview-checks/SCR-001.md` — `/` CONFIRMED
- [ ] `docs/preview-checks/SCR-002.md` — `/about` CONFIRMED
- [ ] `docs/preview-checks/SCR-003.md` — `/travel-tools` CONFIRMED
- [ ] `docs/preview-checks/SCR-004.md` — `/mates` CONFIRMED
- [ ] `docs/preview-checks/SCR-005.md` — `/account` CONFIRMED

## 6. 수동 확인(Manual Check Task)

- [ ] `TASKS/checklists/manual-accessibility.md` — 5개 화면 접근성(스크린리더·
      키보드·터치 영역)
- [ ] `TASKS/checklists/manual-performance.md` — Lighthouse LCP·Filter/입력
      체감 지연·meta 태그
- [ ] `TASKS/checklists/release-vercel-supabase.md` — 배포 URL 5개 Route
      HTTPS 접근, Supabase 연결 차단 시 정적 콘텐츠 열람 가능

## 7. 배포

- [ ] Vercel Project 연결(Root Directory: 이 `app` 디렉터리)
- [ ] Preview 배포 URL로 5장 위 항목을 실제로 다시 확인
- [ ] 문제 없으면 사람이 직접 Production으로 승격(자동 Merge/자동 배포 승인
      사용 안 함, `AUTO_MERGE=false`)

## 8. 알려진 제한사항(배포와 무관하게 남아 있는 것)

- `/travel-tools`·`/mates`·`/account`는 Client Component 페이지라 페이지별
  고유 `metadata`(title/description/OG)를 갖지 못하고 Root layout 기본값을
  공유한다.
- `alternates.canonical`/`openGraph` 태그는 실제 배포 도메인이 확정된 뒤
  추가해야 한다(현재는 도메인이 없어 추가하지 않음).
- `CHECK-MANUAL-ACCESSIBILITY`·`CHECK-MANUAL-PERFORMANCE`는 사람이 실제
  브라우저/Lighthouse로 수행해야 하는 항목이라 자동화하지 않았다.
