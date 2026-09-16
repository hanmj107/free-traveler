# Free Traveler — UI/UX Approved Screens & Route Consolidation v1.0

- **문서 ID:** UIUX-APPROVED-001
- **작성일:** 2026-09-15
- **참고 문서:** `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001, Baseline), `docs/PROJECT_SCOPE.md`(SCOPE-TRAVEL-001), `docs/03_UI_COVERAGE_ANALYSIS.md`(UICOV-TRAVEL-001), `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `docs/STITCH_VALIDATION_REPORT.md`
- **목적:** `docs/PROJECT_SCOPE.md` §2에서 제안했던 여러 개별 Route(핵심 화면 4개 + 보조 화면 1개, 세부적으로는 12개 이상의 URL 패턴)를, 승인된 5개 디자인 Screen(SCR-001~SCR-005)의 탭·패널·모달 구조로 최종 통합·확정한다. 이 문서는 요구사항을 새로 만들거나 삭제하지 않으며, Baseline SRS의 요구사항 ID·내용은 `docs/02_SRS_BASELINE.md`를 그대로 따른다.

> **구현 상태 고지:** 이 문서가 확정하는 것은 **화면/Route 구조의 승인**이며, **코드 구현 완료를 의미하지 않는다.** 2026-09-15 기준 `src/app`에는 Create Next App 기본 스타터(`layout.tsx`, `page.tsx`, `globals.css`)만 존재하고 SCR-001~005에 해당하는 실제 페이지 코드는 아직 없다. Stitch 디자인 산출물 상태는 `docs/STITCH_VALIDATION_REPORT.md` 기준 SCR-001·SCR-002는 NEEDS_REVISION(Footer 수정 반영 확인 대기), SCR-003은 BLOCKED(캔버스 미배치), SCR-004·SCR-005·Mobile 변형 2개는 BLOCKED(미생성)이다.

---

## 1. 승인된 5개 Screen

| Screen ID | Route | Page Entry | 구분 |
|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | 핵심 |
| SCR-002 | `/about` | `src/app/about/page.tsx` | 핵심 |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | 핵심 |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | 핵심 |
| SCR-005 | `/account` | `src/app/account/page.tsx` | 보조 |

(출처: `design-reference/SCREEN_ROUTE_CONTRACT.json`)

---

## 2. Route 통합 매핑 (기존 제안 Route → 승인된 Screen)

`docs/PROJECT_SCOPE.md` §2가 제안했던 개별 Route들은 아래와 같이 5개 Screen의 탭·패널·모달로 통합되었다. **어떤 기능도 삭제되지 않았으며**, 화면 수만 축소되었다.

| 기존 제안 Route (PROJECT_SCOPE §2) | 통합된 위치 | 통합 방식 |
|---|---|---|
| `/destinations` | SCR-001 Section 2·3(국내/해외 인기 여행지) | 국내/해외 구분을 탭 대신 Section 순서(국내 → 해외)로 표현 |
| `/destinations/[id]` | SCR-001 여행지 상세 Drawer/Modal | 별도 페이지가 아닌 같은 화면 위 Drawer(Desktop 우측 슬라이드 480~560px / Mobile Bottom Sheet)로 통합 |
| (여행지 상세 내 안전정보) | SCR-001 안전정보 패널 | 여행지 상세 Drawer 내부에서 같은 Drawer 안의 별도 패널로 전환(페이지 이동 없음) |
| `/flights` | SCR-003 "항공편" 탭 | `/travel-tools` 페이지의 첫 번째 탭 |
| `/hotels` | SCR-003 "숙소" 탭 | `/travel-tools` 페이지의 두 번째 탭 |
| `/mate/new` (모집글 작성) | SCR-003 "동행 구하기" 탭 | `/travel-tools` 페이지의 세 번째 탭(작성 전용) |
| `/mate` (모집글 목록) | SCR-004 Section 2·3(Filter+목록) | `/mates` 페이지 목록 영역 |
| `/mate/[id]` (모집글 상세) | SCR-004 목록-상세 좌우 분할(Desktop) / 상세 Drawer(Mobile) | 별도 페이지가 아닌 같은 화면의 상세 패널/Drawer |
| `/about` | SCR-002 (경로 변경 없음) | 그대로 유지 |
| `/login`, `/signup` | SCR-005 Guest 계정 Card(로그인/회원가입/재설정) | `/account` 페이지의 비로그인 상태 화면 |
| `/mypage` | SCR-005 Member 탭 "내 활동" | `/account` 페이지의 로그인 상태 탭 |
| `/mypage/admin` | SCR-005 Admin 탭 "관리자" | `/account` 페이지의 관리자 role 전용 탭(신고 처리 + 외부 URL 설정만) |

**통합 원칙:** `/travel-tools`는 항공·숙소·동행 작성 3개 탭을 반드시 포함한다. `/account`는 인증(로그인/회원가입/성인확인)·프로필·내 활동·간단 관리자(신고 처리+외부 URL 설정만, Dashboard 없음) 4개 역할 기반 구성을 반드시 포함한다.

---

## 3. UI Route Contract

### 3-1. 디자인 Screen (5개, `SCREEN_ROUTE_CONTRACT.json` 발췌)

```json
{
  "schema_version": "traveler-screen-route-v1",
  "framework": "nextjs-app-router",
  "screen_count": 5,
  "tier_summary": { "core": ["SCR-001", "SCR-002", "SCR-003", "SCR-004"], "auxiliary": ["SCR-005"] }
}
```

전체 스키마와 각 Screen의 section_order·primary_components·states·forbidden_features 등 상세 계약은 `design-reference/SCREEN_ROUTE_CONTRACT.json` 원본을 따른다(이 문서는 그 요약이며, 두 문서가 상충하면 JSON 원본이 우선한다).

### 3-2. 기술 Route (디자인 Screen 수에 포함하지 않음)

| 유형 | Route | 파일 | 비고 |
|---|---|---|---|
| Supabase 인증 콜백 | `/auth/callback` | `src/app/auth/callback/route.ts` | 로그인/회원가입 완료 후 콜백 처리 |
| API Route | `/api/*` | `src/app/api/**/route.ts` | 모집글/참가요청/신고/외부 URL 설정 등 서버 처리(개별 엔드포인트는 구현 단계에서 세분화) |
| 404 처리 | `*` | `src/app/not-found.tsx` | 전역 오류 처리, Screen으로 계수하지 않음 |

### 3-3. 화면 간 이동 계약

`design-reference/SCREEN_ROUTE_CONTRACT.json`의 `required_navigation` 17건(외부 링크 2건, 화면 간 이동 14건, 공통 Header 내비 1건)을 그대로 따른다. 상세는 `design-reference/UI_CONTRACT.md`의 "다른 화면으로의 이동" 열 및 JSON 원본을 참조한다.

---

## 4. Release Acceptance Criteria

아래 기준을 **모두** 충족해야 SCR-001~SCR-005를 "릴리스 가능"으로 판단한다. 2026-09-15 기준 아래 항목은 전부 **미충족(미착수)** 상태이며, 이 문서는 기준을 정의할 뿐 충족 여부를 사실과 다르게 기록하지 않는다.

| # | 기준 | 현재 상태 |
|---|---|---|
| RAC-01 | `src/app`의 5개 Page Entry(§1 표)가 모두 존재하고, `src/app/page.tsx`에 Create Next App 스타터 콘텐츠가 남아있지 않다 | 미충족 — 스타터 상태 |
| RAC-02 | `docs/UIUX_TRACEABILITY.md`의 IMPLEMENT 대상 요구사항 61건이 모두 `IMPLEMENTED` 또는 명시적 사유와 함께 `DEFERRED`로 표시된다(`NOT_IMPLEMENTED` 잔존 0건) | 미충족 — 전부 `NOT_IMPLEMENTED` |
| RAC-03 | `docs/PROJECT_SCOPE.md` §7의 Playwright Smoke Test 시나리오 10개가 모두 작성되어 통과한다 | 미충족 — 테스트 파일 없음 |
| RAC-04 | `design-reference/D-001/DESIGN.md` §19 Do Not 항목(Airbnb 상표, 예약/결제 UI, Proprietary 폰트, 임의 색상, 존재하지 않는 페이지 링크, 별점/실시간 가격/광고, placeholder 문구, 관리자 Dashboard) 위반이 코드에 없다 | 미충족 — 코드 자체가 없음(검증 대상 없음) |
| RAC-05 | 5개 Screen 모두 Desktop 1440px·Mobile 390px에서 `design-reference/D-001/DESIGN.md` §7 규칙(Hero 높이, Section 여백, Drawer/Bottom Sheet 전환 등)대로 렌더링된다 | 미충족 — 미구현. Stitch 디자인 단계에서도 SCR-004·SCR-005와 Mobile 변형 2개가 아직 생성되지 않음(`docs/STITCH_VALIDATION_REPORT.md`) |
| RAC-06 | EXCLUDED로 분류된 16개 요구사항에 대응하는 화면 요소(콘텐츠 CRUD, 감사 로그, 관리자 Dashboard 등)가 어떤 화면에도 존재하지 않는다 | 해당 없음(코드 없음이므로 위반도 없음) — 구현 착수 시 지속 확인 필요 |
| RAC-07 | 외부 이동 링크 전부에 `target="_blank" rel="noopener noreferrer"`가 적용된다(REQ-NFR-SEC-002) | 미충족 — 미구현 |
| RAC-08 | 항공·호텔·동행 입력값이 서버 DB에 저장되지 않음을 코드 리뷰로 확인한다(REQ-FUNC-FLIGHT-006, HOTEL-005/006) | 미충족 — 미구현 |
| RAC-09 | Vercel 배포 URL에서 5개 Route가 모두 HTTPS로 접근 가능하다 | 미충족 — 배포 없음 |

이 기준표는 향후 구현이 진행됨에 따라 상태 열만 갱신하며, 기준 항목 자체를 완화하거나 삭제하지 않는다.

---

## 5. 참고 — 화면 미생성/미검증 항목

`docs/STITCH_VALIDATION_REPORT.md` 기준으로 아직 확정 디자인이 없는 항목(SCR-004, SCR-005, SCR-001/003 Mobile 변형)도 이 문서의 §1·§2 Route 통합 계약과 §4 Release Acceptance Criteria의 적용 대상에서 제외하지 않는다. 디자인이 완성되는 대로 동일한 Route·Page Entry 계약을 적용한다.
