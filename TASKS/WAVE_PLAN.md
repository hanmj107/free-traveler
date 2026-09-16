# Free Traveler — Wave Plan

- **생성 시각(UTC):** 2026-09-16T12:36:24.678477+00:00
- **생성 스크립트:** `scripts/build_waves.py`(자동 생성) — `TASKS/TASK_MANIFEST.csv`의 Depends On을 기준으로
  계산한 제안이다. `/run-wave`로 실행을 시작하기 전에 사람이 한 번 훑어보길 권장한다
  (`docs/DECISION_LOG.md` DEC-010: Wave 경계는 사람이 최종 확인한다).
- **Wave 수:** 21개 (Wave ID는 W00~W10으로 고정하지 않고 실제 생성된 순서대로 W01부터 순차 부여했다)

이 파일이 `.claude/commands/run-wave.md`가 읽는 `TASKS/WAVE_PLAN.md` 정본이다. 이후 `/run-wave`는
여기 적힌 실제 Wave ID를 기준으로 동작해야 한다(W00~W10 같은 고정 번호를 가정하지 않는다).

---

| Wave | Task IDs (실행 순서) | 설명 |
|---|---|---|
| W01 | COMP-COMMON-FOOTER, DATA-DESTINATIONS, DATA-REPRESENTATIVE, DATA-SAFETY | Airbnb 스타일 공통 UI, 정적 데이터, Layout (/, /about) |
| W02 | DB-SCHEMA-BASE | Supabase Auth, 6개 Table, 기본 RLS |
| W03 | AUTH-SUPABASE-CLIENT, DB-RLS-BASE, DB-SEED-BASE | Supabase Auth, 6개 Table, 기본 RLS |
| W04 | AUTH-ADULT-VERIFICATION, COMP-COMMON-HEADER, DB-ACCESS | Supabase Auth, 6개 Table, 기본 RLS |
| W05 | API-BLOCKS, API-EXTERNAL-URLS, API-MATE-APPLICATIONS, API-MATE-POSTS, API-REPORTS | Supabase Auth, 6개 Table, 기본 RLS |
| W06 | COMP-SCR001-ABOUT-SUMMARY, COMP-SCR001-DEST-DOMESTIC, COMP-SCR001-DEST-DRAWER, COMP-SCR001-DEST-GLOBAL | SCR-001 메인 Component와 Page Owner (/) |
| W07 | COMP-SCR001-HERO-SEARCH, COMP-SCR001-MATE-SUMMARY, COMP-SCR001-SAFETY-CARDS, COMP-SCR001-THEME-CHIPS | SCR-001 메인 Component와 Page Owner (/) |
| W08 | PAGE-SCR001 | SCR-001 메인 Component와 Page Owner (/) — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요 |
| W09 | COMP-SCR002-COUNTRY-CHIPS, COMP-SCR002-GALLERY, COMP-SCR002-MEMORABLE-CTA, COMP-SCR002-METRICS, COMP-SCR002-PHILOSOPHY, COMP-SCR002-PROFILE-HERO, COMP-SCR002-TIMELINE | SCR-002 대표 소개 Component와 Page Owner (/about) |
| W10 | PAGE-SCR002 | SCR-002 대표 소개 Component와 Page Owner (/about) — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요 |
| W11 | COMP-SCR003-FLIGHT-FORM, COMP-SCR003-HOTEL-FORM, COMP-SCR003-INTRO-TABS, COMP-SCR003-LOGIN-GUARD, COMP-SCR003-MATE-COMPOSE, COMP-SCR003-TIPS | SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner (/travel-tools) |
| W12 | PAGE-SCR003 | SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner (/travel-tools) — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요 |
| W13 | COMP-SCR004-BLOCK, COMP-SCR004-DETAIL, COMP-SCR004-FILTER, COMP-SCR004-GUIDE-SAFETY | SCR-004 동행 목록·상세·신청 Component와 Page Owner (/mates) |
| W14 | COMP-SCR004-INTRO-CTA, COMP-SCR004-JOIN-REQUEST, COMP-SCR004-LIST, COMP-SCR004-REPORT | SCR-004 동행 목록·상세·신청 Component와 Page Owner (/mates) |
| W15 | PAGE-SCR004 | SCR-004 동행 목록·상세·신청 Component와 Page Owner (/mates) — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요 |
| W16 | COMP-SCR005-ADMIN, COMP-SCR005-AUTH, COMP-SCR005-MY-ACTIVITY, COMP-SCR005-PROFILE | SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner (/account) |
| W17 | PAGE-SCR005 | SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner (/account) — Page Owner 통합 Wave, 완료 후 사람 Preview 확인 필요 |
| W18 | CHECK-MANUAL-ACCESSIBILITY, E2E-MATE-AUTH, E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS | Unit·Playwright·접근성·CI (/, /about, /account, /mates, /travel-tools) |
| W19 | TEST-RLS-BASIC, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE, UNIT-TRAVEL-DATES | Unit·Playwright·접근성·CI (/account, /mates, /travel-tools) |
| W20 | CI-PIPELINE-SETUP | Unit·Playwright·접근성·CI |
| W21 | CHECK-MANUAL-PERFORMANCE, RELEASE-CHECK-VERCEL-SUPABASE | Vercel Preview와 Release 확인 (/, /about, /account, /mates, /travel-tools) |

---

## Preview Checkpoint가 필요한 Wave

아래 Wave는 `Category: PAGE_OWNER` Task로 끝나므로, 완료 후 사람이 실제 화면을 Preview로
확인하기 전까지 다음 Wave로 자동 진행하지 않는다(루트 `CLAUDE.md` 규칙 22).

W08, W10, W12, W15, W17

