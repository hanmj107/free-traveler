# RELEASE-CHECK-VERCEL-SUPABASE — Vercel/Supabase 배포 확인

- **상태:** `console_setup_required` — Vercel Project가 아직 없어 실제 배포 URL로는
  확인하지 못했다. 아래 두 항목 중 (1)은 로컬에서 broken Supabase 자격증명으로
  대체 검증했고, (2)는 실제 Vercel Preview/Production URL이 생기면 그 자리에서
  마저 확인해야 한다.

## TC-01 — 배포 URL 5개 Route 전부 HTTPS 접근 확인(SEC-001)

- **상태:** PENDING(Vercel Project 없음)
- Vercel Project를 만들고 이 저장소를 연결하면 자동으로 발급되는 Preview URL이
  `https://`로 시작하는지, 아래 5개 경로가 전부 정상 응답(200)하는지 브라우저로
  확인한다.
  - `/`
  - `/about`
  - `/travel-tools`
  - `/mates`
  - `/account`
- Vercel은 모든 배포에 기본적으로 HTTPS(자동 TLS 인증서)를 적용하므로, 프로젝트를
  생성하고 배포만 하면 이 항목은 대부분 자동으로 충족된다 — 사람이 URL을 열어
  주소창의 자물쇠 아이콘과 `https://` 접두사만 육안으로 확인하면 된다.

## TC-02 — Supabase 연결 차단 시 SCR-001/SCR-002 정적 콘텐츠 열람 가능(AVAIL-003)

- **상태:** CONFIRMED(로컬 대체 검증, 2026-09-19)
- 로컬 dev 서버에서 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`를
  존재하지 않는 프로젝트 값으로 일시적으로 바꾼 뒤 5개 경로를 전부 확인했다.
  - `/`, `/about`은 Supabase를 전혀 호출하지 않는 완전 정적 데이터(DATA-DESTINATIONS/
    DATA-SAFETY/DATA-REPRESENTATIVE)만 사용해 정상 200 응답 + 실제 콘텐츠
    렌더링을 확인했다("국내 인기 여행지", "국가별 주의사항", "여행 Timeline" 등
    텍스트 확인).
  - `/travel-tools`, `/mates`, `/account`도 200 응답은 유지했다(Supabase 호출은
    Client Component의 `useEffect`/이벤트 핸들러 안에서만 일어나 서버 렌더링
    자체는 깨지지 않는다) — 다만 이 3개 화면의 로그인·동행글·외부 URL 설정 등
    Supabase 의존 기능은 이 상태에서는 당연히 동작하지 않는다(설계된 동작).
  - `npm run build`도 Supabase 환경변수가 아예 없는 상태에서 정상 종료됨을
    확인했다(빌드 타임에 Supabase Client를 생성하는 코드가 없다).
  - 확인 후 원래 자격증명으로 복구하고 `GET /api/mates`가 다시 정상 데이터를
    반환하는 것까지 확인했다.
  - 실제 Vercel 배포에서도 같은 원리(정적 데이터는 Supabase 없이 렌더링)로
    동작해야 하지만, Vercel 자체의 네트워크·런타임 환경에서 최종 확인은
    Vercel Project 생성 후 진행한다.

## 다음에 할 일

1. Vercel Project를 만들고 이 저장소를 연결한다(Root Directory: 이 `app` 디렉터리).
2. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 Vercel
   Environment Variables에 등록한다.
3. 발급된 Preview URL로 TC-01을 직접 확인한다.
4. 확인이 끝나면 이 파일의 TC-01 상태를 CONFIRMED로 바꾸고 날짜를 기록한다.
