# Free Traveler — UI/UX Traceability Matrix v1.0

- **문서 ID:** UIUX-TRACE-001
- **작성일:** 2026-09-15
- **참고 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/05_UIUX_APPROVED.md`, `docs/06_SRS_UIUX_REVISED.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`
- **범위:** Baseline SRS의 기능 요구사항(REQ-FUNC) 42개 + 비기능 요구사항(REQ-NFR) 35개, 합계 **77개 전체**를 하나도 삭제하지 않고 추적한다.

## 열 정의 (Column Legend)

| 열 | 의미 |
|---|---|
| **Requirement** | `docs/02_SRS_BASELINE.md` 원본 Requirement ID |
| **Implementation Status** | 코드 구현 여부. `NOT_IMPLEMENTED`(범위 내, 아직 `src/app`에 코드 없음) 또는 `EXCLUDED`(범위 제외). 2026-09-15 기준 `src/app`에는 Create Next App 기본 스타터만 있어 `IMPLEMENTED`인 항목은 없다. |
| **Screen** | 귀속된 승인 Screen ID(SCR-001~005). 여러 화면에 걸치면 콤마로 나열. 비UI 공통 규칙은 `CROSS-CUTTING`, 범위 제외는 `EXCLUDED` |
| **Route** | `design-reference/SCREEN_ROUTE_CONTRACT.json` 기준 Route. 해당 없으면 `N/A` |
| **Page Entry** | Next.js App Router 파일 경로. 해당 없으면 `N/A` |
| **Task** | 작업 티켓/이슈 ID. **Task가 아직 생성되지 않았으므로 전 항목 `PENDING_TASK_GENERATION`** |
| **Test** | 검증 방법(`docs/PROJECT_SCOPE.md` §5 "확인 방법" 인용). 테스트 코드가 아직 없으므로 `PLANNED:` 접두어를 붙인다. 범위 제외 항목은 `N/A (EXCLUDED)` |
| **Status** | 종합 추적 상태. `IN_SCOPE_PENDING`(범위 내, 구현 대기) 또는 `EXCLUDED`(범위 제외) |

---

## 1. REQ-FUNC-DEST (여행지, 5개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-DEST-001 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 탭 전환 시 결과 구분 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-DEST-002 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 필터 조합 적용 후 결과 검증 | IN_SCOPE_PENDING |
| REQ-FUNC-DEST-003 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 타입 검사(빌드 실패로 누락 방지) + Playwright 상세 페이지 렌더링 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-DEST-004 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 결과 없는 필터 조합에서 안내 노출 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-DEST-005 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 해외 상세에서 안전정보 링크 이동 확인 | IN_SCOPE_PENDING |

## 2. REQ-FUNC-FLIGHT (항공, 6개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-FLIGHT-001 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 필드 누락 시 이동 버튼 disabled 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-FLIGHT-002 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 경계값(과거일, 귀국일<출발일) 시나리오 | IN_SCOPE_PENDING |
| REQ-FUNC-FLIGHT-003 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 요약 값과 입력값 일치 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-FLIGHT-004 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 새 탭 오픈 및 URL 파라미터 부재 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-FLIGHT-005 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 잘못된 URL 설정 주입 시나리오 | IN_SCOPE_PENDING |
| REQ-FUNC-FLIGHT-006 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰(서버 저장 API 부재 확인) | IN_SCOPE_PENDING |

## 3. REQ-FUNC-HOTEL (호텔, 7개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-HOTEL-001 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 필드 누락 시 disabled 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-002 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 경계값 시나리오 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-003 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 요약 값 일치 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-004 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 새 탭 오픈 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-005 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰 + 브라우저 개발자 도구 네트워크 점검 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-006 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰 + 서버 로그/DB 감사 | IN_SCOPE_PENDING |
| REQ-FUNC-HOTEL-007 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 동일 오류 시나리오(항공과 대칭) | IN_SCOPE_PENDING |

## 4. REQ-FUNC-MATE (동행, 9개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-MATE-001 | NOT_IMPLEMENTED | SCR-003, SCR-004, SCR-005 | `/travel-tools`, `/mates`, `/account` | `src/app/travel-tools/page.tsx`, `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 미인증 상태 API 직접 호출 시 차단 검증 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-002 | NOT_IMPLEMENTED | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 비회원 상태로 목록/상세 열람 시 개인정보 미노출 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-003 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 필수값/안전수칙 동의 누락 시 제출 차단 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-004 | NOT_IMPLEMENTED | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 중복 참가 요청 제출 차단 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-005 | NOT_IMPLEMENTED | SCR-005, SCR-004 | `/account`, `/mates` | `src/app/account/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 승인/거절 후 상태 반영 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-006 | NOT_IMPLEMENTED | SCR-004, SCR-005 | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 신고 제출 후 접수번호 노출 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-007 | NOT_IMPLEMENTED | SCR-004, SCR-005 | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 차단 후 상대방 게시물 미노출 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-008 | NOT_IMPLEMENTED | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 종료일 경과 글이 마감으로 표시되는지 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-MATE-009 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 연락처 패턴 포함 시 제출 차단 확인 | IN_SCOPE_PENDING |

## 5. REQ-FUNC-SAFETY (국가별 안전정보, 5개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-SAFETY-001 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 카테고리+확인일 렌더링 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-SAFETY-002 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 링크 클릭 시 새 탭 오픈 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-SAFETY-003 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 확인일 mock 데이터로 경고 노출 케이스 검증 | IN_SCOPE_PENDING |
| REQ-FUNC-SAFETY-004 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA | IN_SCOPE_PENDING |
| REQ-FUNC-SAFETY-005 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA | IN_SCOPE_PENDING |

## 6. REQ-FUNC-ABOUT (대표 소개, 3개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-ABOUT-001 | NOT_IMPLEMENTED | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA + Playwright 텍스트 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-ABOUT-002 | NOT_IMPLEMENTED | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA(alt 속성 존재 확인) | IN_SCOPE_PENDING |
| REQ-FUNC-ABOUT-003 | NOT_IMPLEMENTED | SCR-002, SCR-001 | `/about`, `/` | `src/app/about/page.tsx`, `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 국가 선택 후 이동 확인 | IN_SCOPE_PENDING |

## 7. REQ-FUNC-ADMIN (관리자·거버넌스, 7개, IMPLEMENT 1 / EXCLUDED 6)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-ADMIN-001 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-ADMIN-001-2 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-ADMIN-002 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-ADMIN-003 | NOT_IMPLEMENTED | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — 관리자 신고 상태 변경 확인 | IN_SCOPE_PENDING |
| REQ-FUNC-ADMIN-004 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-ADMIN-005 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-ADMIN-006 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |

## 8. REQ-NFR-PERF (성능, 4개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-PERF-001 | NOT_IMPLEMENTED | CROSS-CUTTING | N/A (전 화면 공통) | N/A | PENDING_TASK_GENERATION | PLANNED: Lighthouse 수동 측정 | IN_SCOPE_PENDING |
| REQ-NFR-PERF-002 | NOT_IMPLEMENTED | SCR-001, SCR-004 | `/`, `/mates` | `src/app/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 측정(클라이언트 필터링 응답시간) | IN_SCOPE_PENDING |
| REQ-NFR-PERF-003 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 확인(클라이언트 즉시 검증) | IN_SCOPE_PENDING |
| REQ-NFR-PERF-004 | NOT_IMPLEMENTED | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 측정(부하 테스트 제외) | IN_SCOPE_PENDING |

## 9. REQ-NFR-AVAIL (가용성, 3개, IMPLEMENT 1 / EXCLUDED 2)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-AVAIL-001 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-AVAIL-002 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-AVAIL-003 | NOT_IMPLEMENTED | SCR-001, SCR-002 | `/`, `/about` | `src/app/page.tsx`, `src/app/about/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 확인(Supabase 연결 차단 상태에서 정적 페이지 접근 테스트) | IN_SCOPE_PENDING |

## 10. REQ-NFR-SEC (보안, 8개, IMPLEMENT 5 / EXCLUDED 3)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-SEC-001 | NOT_IMPLEMENTED | CROSS-CUTTING | N/A (전 화면 공통) | N/A | PENDING_TASK_GENERATION | PLANNED: 배포 URL HTTPS 접속 확인 | IN_SCOPE_PENDING |
| REQ-NFR-SEC-002 | NOT_IMPLEMENTED | SCR-001, SCR-003 | `/`, `/travel-tools` | `src/app/page.tsx`, `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰 + Playwright DOM 속성 확인 | IN_SCOPE_PENDING |
| REQ-NFR-SEC-003 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰(관련 API/DB 미생성 확인) | IN_SCOPE_PENDING |
| REQ-NFR-SEC-004 | NOT_IMPLEMENTED | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 관리자 탭에서 URL 변경 후 반영 확인 | IN_SCOPE_PENDING |
| REQ-NFR-SEC-005 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-SEC-006 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-SEC-007 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-SEC-008 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright — `<script>` 등 페이로드 입력 후 저장형 XSS 미발생 확인 | IN_SCOPE_PENDING |

## 11. REQ-NFR-PRIV (개인정보, 7개, IMPLEMENT 6 / EXCLUDED 1)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-PRIV-001 | NOT_IMPLEMENTED | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 스키마 점검 | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-002 | NOT_IMPLEMENTED | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 스키마 점검 | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-003 | NOT_IMPLEMENTED | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | PLANNED: RLS 정책 테스트 | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-004 | NOT_IMPLEMENTED | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright(REQ-FUNC-MATE-007과 동일 시나리오) | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-005 | NOT_IMPLEMENTED | SCR-005, SCR-003, SCR-004 | `/account`, `/travel-tools`, `/mates` | `src/app/account/page.tsx`, `src/app/travel-tools/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA(3단계 안전고지 문구 노출 확인) | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-006 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: REQ-FUNC-MATE-009와 동일 검증 | IN_SCOPE_PENDING |
| REQ-NFR-PRIV-007 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |

## 12. REQ-NFR-ACC (접근성, 6개, 전부 IMPLEMENT)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-ACC-001 | NOT_IMPLEMENTED | CROSS-CUTTING | N/A (전 화면 공통) | N/A | PENDING_TASK_GENERATION | PLANNED: 수동 스크린리더/키보드 점검 | IN_SCOPE_PENDING |
| REQ-NFR-ACC-002 | NOT_IMPLEMENTED | SCR-001, SCR-002 | `/`, `/about` | `src/app/page.tsx`, `src/app/about/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 코드 리뷰(alt 속성 확인) | IN_SCOPE_PENDING |
| REQ-NFR-ACC-003 | NOT_IMPLEMENTED | CROSS-CUTTING | N/A (전 화면 공통) | N/A | PENDING_TASK_GENERATION | PLANNED: 수동 키보드 전용 테스트 | IN_SCOPE_PENDING |
| REQ-NFR-ACC-004 | NOT_IMPLEMENTED | SCR-001, SCR-004 | `/`, `/mates` | `src/app/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA(배지 색상+텍스트 병기 확인) | IN_SCOPE_PENDING |
| REQ-NFR-ACC-005 | NOT_IMPLEMENTED | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 스크린리더 테스트(`aria-describedby`) | IN_SCOPE_PENDING |
| REQ-NFR-ACC-006 | NOT_IMPLEMENTED | CROSS-CUTTING | N/A (전 화면 공통) | N/A | PENDING_TASK_GENERATION | PLANNED: 디자인 QA(터치 영역 치수 검사) | IN_SCOPE_PENDING |

## 13. REQ-NFR-OBS (관측성·로그, 2개, 전부 EXCLUDED)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-OBS-001 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-OBS-002 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |

## 14. REQ-NFR-CONTENT (콘텐츠·SEO·저작권, 5개, IMPLEMENT 3 / EXCLUDED 2)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NFR-CONTENT-001 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: Playwright/수동 meta 태그 확인 | IN_SCOPE_PENDING |
| REQ-NFR-CONTENT-002 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA | IN_SCOPE_PENDING |
| REQ-NFR-CONTENT-003 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-CONTENT-004 | EXCLUDED | EXCLUDED | N/A | N/A | PENDING_TASK_GENERATION | N/A (EXCLUDED) | EXCLUDED |
| REQ-NFR-CONTENT-005 | NOT_IMPLEMENTED | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | PLANNED: 수동 QA(공식 기관 확인 안내 문구 노출) | IN_SCOPE_PENDING |

---

## 15. 집계 (Baseline과 대조)

| 구분 | 총수 | IN_SCOPE_PENDING | EXCLUDED |
|---|---:|---:|---:|
| REQ-FUNC | 42 | 36 | 6 |
| REQ-NFR | 35 | 25 | 10 |
| **합계** | **77** | **61** | **16** |

`docs/PROJECT_SCOPE.md` §6, `docs/06_SRS_UIUX_REVISED.md` §4와 정확히 일치한다. 본 표에 등재된 77개 행 중 `IMPLEMENTED` 상태인 행은 없다(2026-09-15 기준 `src/app`은 Create Next App 기본 스타터만 보유). Task는 전 행 `PENDING_TASK_GENERATION`이며, Task 생성 시 이 문서의 해당 행만 갱신하고 다른 열은 그대로 유지한다.
