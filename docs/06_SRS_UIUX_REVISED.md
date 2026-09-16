# Free Traveler — SRS UI/UX Revision Layer v1.0

- **문서 ID:** SRS-UIUX-REVISED-001
- **작성일:** 2026-09-15
- **관계:** 본 문서는 `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001, Baseline)를 **대체하지 않는다.** Baseline의 모든 Requirement ID·Requirement 본문·Priority·Source·Acceptance Criteria·Verification Method는 변경되지 않았다. 본 문서는 승인된 5개 디자인 Screen(SCR-001~SCR-005, `docs/05_UIUX_APPROVED.md`)이 확정됨에 따라, 각 Requirement가 **어느 Screen·Route로 최종 귀속되는지**만 갱신하는 개정 레이어(revision layer)다.
- **참고 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/05_UIUX_APPROVED.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`

---

## 1. Requirement ID 규칙 확인

Baseline SRS(`docs/02_SRS_BASELINE.md` §5·§6)와 `docs/PROJECT_SCOPE.md`가 실제로 사용하는 Requirement ID는 **도메인 접두어 기반**이다.

- 기능 요구사항: `REQ-FUNC-{DEST|FLIGHT|HOTEL|MATE|SAFETY|ABOUT|ADMIN}-{순번}` — **42개**
- 비기능 요구사항: `REQ-NFR-{PERF|AVAIL|SEC|PRIV|ACC|OBS|CONTENT}-{순번}` — **35개**
- 합계 **77개**

본 개정에서 사용하는 ID 체계는 이 도메인 접두어 방식이며, Baseline 문서 밖에서 순번만으로 부르는 표기(예: REQ-FUNC-001~080, REQ-NF-001~034)는 이 프로젝트의 실제 ID와 다르다. **이 문서와 `docs/UIUX_TRACEABILITY.md`는 Baseline의 실제 도메인 접두어 ID 77개 전체를 하나도 빠짐없이 사용한다.** 아래 §4의 총계가 이를 확인한다.

---

## 2. 화면 통합에 따른 배치 변경 사항

`docs/03_UI_COVERAGE_ANALYSIS.md`가 처음 SCR-001~SCR-005 5개 Screen 구조를 확정했고, `docs/05_UIUX_APPROVED.md`가 `docs/PROJECT_SCOPE.md` §2의 개별 제안 Route(`/destinations`, `/flights`, `/hotels`, `/mate`, `/mate/new`, `/mate/[id]`, `/mypage`, `/mypage/admin`, `/login`, `/signup` 등)를 이 5개 Screen의 탭·패널·모달로 최종 통합했다. 이번 개정에서 달라지는 것은 **Route 표기뿐**이며, Requirement 본문·판정(IMPLEMENT/EXCLUDED)·우선순위는 Baseline과 동일하게 유지한다.

- `/travel-tools`(SCR-003)는 항공·숙소·동행 작성 3개 탭을 모두 포함한다.
- `/account`(SCR-005)는 인증(로그인/회원가입/성인확인)·프로필·내 활동·간단 관리자(신고 처리+외부 URL 설정) 4개 역할 기반 구성을 모두 포함한다.
- 여행지 상세·안전정보는 별도 Route가 아니라 SCR-001의 Drawer/Modal이다.
- 동행 모집글 상세는 별도 Route가 아니라 SCR-004의 상세 패널(Desktop)/Drawer(Mobile)다.

---

## 3. 도메인별 Requirement → Screen/Route 매핑 (개정)

> 아래 표의 "Screen(Route)"는 `docs/05_UIUX_APPROVED.md` §1의 확정 Route를 사용한다. "판정"은 `docs/PROJECT_SCOPE.md` §5의 IMPLEMENT/EXCLUDED를 그대로 인용한다. Requirement 본문 전체는 `docs/02_SRS_BASELINE.md`를 참조한다(본 표는 요약이며 상충 시 Baseline 본문이 우선한다).

### 3-1. 여행지 REQ-FUNC-DEST (5개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-DEST-001 | 국내/해외 탭별 게시 여행지 목록 표시 | SCR-001(`/`) |
| REQ-FUNC-DEST-002 | 계절·테마·기간 필터(AND 조건) | SCR-001(`/`) |
| REQ-FUNC-DEST-003 | 상세 필수 콘텐츠 11개 항목 표시 | SCR-001(`/`) 여행지 상세 Drawer |
| REQ-FUNC-DEST-004 | 필터 결과 없음 안내 | SCR-001(`/`) |
| REQ-FUNC-DEST-005 | 해외 여행지 안전정보 연결 | SCR-001(`/`) 안전정보 패널(같은 Drawer 내) |

### 3-2. 항공 REQ-FUNC-FLIGHT (6개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-FLIGHT-001 | 필수값 미입력 시 버튼 비활성화+오류 | SCR-003(`/travel-tools`) 항공편 탭 |
| REQ-FUNC-FLIGHT-002 | 날짜 유효성 검증 | SCR-003(`/travel-tools`) 항공편 탭 |
| REQ-FUNC-FLIGHT-003 | 입력 요약 및 비전달 고지 | SCR-003(`/travel-tools`) 항공편 탭 |
| REQ-FUNC-FLIGHT-004 | 외부 항공 사이트 새 탭 이동 | SCR-003(`/travel-tools`) 항공편 탭 |
| REQ-FUNC-FLIGHT-005 | 외부 링크 오류 처리 | SCR-003(`/travel-tools`) 항공편 탭 |
| REQ-FUNC-FLIGHT-006 | 입력값 서버 미저장 | SCR-003(`/travel-tools`) 항공편 탭(배후 규칙, 비UI) |

### 3-3. 호텔 REQ-FUNC-HOTEL (7개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-HOTEL-001 | 필수값 미입력 시 버튼 비활성화+오류 | SCR-003(`/travel-tools`) 숙소 탭 |
| REQ-FUNC-HOTEL-002 | 날짜 유효성 검증 | SCR-003(`/travel-tools`) 숙소 탭 |
| REQ-FUNC-HOTEL-003 | 입력 요약 및 비전달 고지 | SCR-003(`/travel-tools`) 숙소 탭 |
| REQ-FUNC-HOTEL-004 | 외부 호텔 사이트 새 탭 이동 | SCR-003(`/travel-tools`) 숙소 탭 |
| REQ-FUNC-HOTEL-005 | 입력값 URL·본문·쿠키 미전달 | SCR-003(`/travel-tools`) 숙소 탭(배후 규칙, 비UI) |
| REQ-FUNC-HOTEL-006 | 입력값 서버 미저장 | SCR-003(`/travel-tools`) 숙소 탭(배후 규칙, 비UI) |
| REQ-FUNC-HOTEL-007 | 외부 링크 오류 처리(항공과 대칭) | SCR-003(`/travel-tools`) 숙소 탭 |

### 3-4. 동행 REQ-FUNC-MATE (9개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-MATE-001 | 비회원·미인증 접근 제한 | SCR-003(`/travel-tools`)·SCR-004(`/mates`) 트리거 → SCR-005(`/account`) 도착 |
| REQ-FUNC-MATE-002 | 모집글 필터·조회(비회원 열람 허용) | SCR-004(`/mates`) |
| REQ-FUNC-MATE-003 | 모집글 작성 및 게시 | SCR-003(`/travel-tools`) 동행 구하기 탭 |
| REQ-FUNC-MATE-004 | 참가 요청 제출(중복 방지) | SCR-004(`/mates`) 상세 패널 |
| REQ-FUNC-MATE-005 | 참가 요청 승인·거절 | SCR-005(`/account`) 내 활동 탭, 상태는 SCR-004(`/mates`)에도 반영 |
| REQ-FUNC-MATE-006 | 신고 제출(접수번호 표시) | SCR-004(`/mates`) 신고 진입점, 처리는 SCR-005(`/account`) 관리자 탭 |
| REQ-FUNC-MATE-007 | 차단 설정(상호 비노출) | SCR-004(`/mates`) 차단 버튼, 목록은 SCR-005(`/account`) 내 활동 탭 |
| REQ-FUNC-MATE-008 | 여행 종료일 경과 모집글 자동 마감 | SCR-004(`/mates`) 상세 패널(조회 시 계산) |
| REQ-FUNC-MATE-009 | 공개 연락처 탐지 및 제출 차단 | SCR-003(`/travel-tools`) 동행 구하기 탭 |

### 3-5. 국가별 안전정보 REQ-FUNC-SAFETY (5개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-SAFETY-001 | 필수 안전 카테고리(6개)+최종 확인일 | SCR-001(`/`) 안전정보 패널 |
| REQ-FUNC-SAFETY-002 | 공식 출처 링크 새 탭 제공 | SCR-001(`/`) 안전정보 패널 |
| REQ-FUNC-SAFETY-003 | 확인일 7일 초과 경고 | SCR-001(`/`) 안전정보 패널 |
| REQ-FUNC-SAFETY-004 | 국가·지역 경보 범위 구분 | SCR-001(`/`) 안전정보 패널 |
| REQ-FUNC-SAFETY-005 | 중대 경보 단계 상단 노출 | SCR-001(`/`) 안전정보 패널 |

### 3-6. 대표 소개 REQ-FUNC-ABOUT (3개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-FUNC-ABOUT-001 | 대표 핵심 정보 표시 | SCR-002(`/about`) |
| REQ-FUNC-ABOUT-002 | 여행사진 대체텍스트·출처 표시 | SCR-002(`/about`) |
| REQ-FUNC-ABOUT-003 | 방문 국가 지도/목록 연결 | SCR-002(`/about`) 진입 → SCR-001(`/`) 여행지 상세 도착 |

### 3-7. 관리자·거버넌스 REQ-FUNC-ADMIN (7개, IMPLEMENT 1 / EXCLUDED 6)

| Requirement | 요약 | 판정 | Screen(Route) |
|---|---|---|---|
| REQ-FUNC-ADMIN-001 | 여행지 콘텐츠 CRUD | **EXCLUDED** | 해당 없음 — `src/data` 코드 관리로 대체 |
| REQ-FUNC-ADMIN-001-2 | 국가별 안전정보 CRUD | **EXCLUDED** | 해당 없음 — `src/data` 코드 관리로 대체 |
| REQ-FUNC-ADMIN-002 | 게시 전 완전성 검사 게이트 | **EXCLUDED** | 해당 없음 — 타입검사+코드리뷰로 대체 |
| REQ-FUNC-ADMIN-003 | 신고 처리 및 상태 관리 | IMPLEMENT | SCR-005(`/account`) 관리자 탭 |
| REQ-FUNC-ADMIN-004 | 감사 로그 기록 | **EXCLUDED** | 해당 없음 |
| REQ-FUNC-ADMIN-005 | 이미지 라이선스 메타데이터 관리 | **EXCLUDED** | 해당 없음 |
| REQ-FUNC-ADMIN-006 | 안전정보 갱신 처리(관리자 UI) | **EXCLUDED** | 해당 없음 — `src/data` 코드 수정으로 대체 |

### 3-8. 성능 REQ-NFR-PERF (4개, 전부 IMPLEMENT, 비UI 공통 속성)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-NFR-PERF-001 | LCP p75 2.5초 이하 | 전 화면 공통(CROSS-CUTTING) |
| REQ-NFR-PERF-002 | 필터 결과 p95 1초 이하 | SCR-001(`/`)·SCR-004(`/mates`) 배후 속성 |
| REQ-NFR-PERF-003 | 입력 검증 100ms 이내 | SCR-003(`/travel-tools`) 배후 속성 |
| REQ-NFR-PERF-004 | 신고 접수 응답 p95 3초 이하 | SCR-004(`/mates`) 배후 속성 |

### 3-9. 가용성 REQ-NFR-AVAIL (3개, IMPLEMENT 1 / EXCLUDED 2)

| Requirement | 요약 | 판정 | Screen(Route) |
|---|---|---|---|
| REQ-NFR-AVAIL-001 | 월간 가용성 99.5% 이상 | **EXCLUDED** | 해당 없음 |
| REQ-NFR-AVAIL-002 | 내부 API 5xx 비율 0.5% 이하 | **EXCLUDED** | 해당 없음 |
| REQ-NFR-AVAIL-003 | Supabase 장애 시 읽기 전용 콘텐츠 열람 유지 | IMPLEMENT | SCR-001(`/`)·SCR-002(`/about`) 배후 아키텍처 |

### 3-10. 보안 REQ-NFR-SEC (8개, IMPLEMENT 5 / EXCLUDED 3)

| Requirement | 요약 | 판정 | Screen(Route) |
|---|---|---|---|
| REQ-NFR-SEC-001 | HTTPS·TLS 1.2 이상 | IMPLEMENT | 전 화면 공통(CROSS-CUTTING) |
| REQ-NFR-SEC-002 | 외부 이동 링크 `noopener`/`noreferrer` | IMPLEMENT | SCR-001(`/`)·SCR-003(`/travel-tools`) 배후 속성 |
| REQ-NFR-SEC-003 | 항공·호텔 입력값 서버 비저장 원칙 | IMPLEMENT | SCR-003(`/travel-tools`) 배후 규칙 |
| REQ-NFR-SEC-004 | 외부 랜딩 URL 환경설정화 | IMPLEMENT | SCR-005(`/account`) 관리자 탭 |
| REQ-NFR-SEC-005 | 로그인 시도 제한 | **EXCLUDED** | 해당 없음 |
| REQ-NFR-SEC-006 | 세션·토큰 만료 정책(관리자 차등) | **EXCLUDED** | 해당 없음 |
| REQ-NFR-SEC-007 | 관리자 계정 보호 강화(MFA 등) | **EXCLUDED** | 해당 없음 |
| REQ-NFR-SEC-008 | 사용자 입력 콘텐츠 새니타이제이션 | IMPLEMENT | SCR-003(`/travel-tools`) 동행 구하기 탭 배후 규칙 |

### 3-11. 개인정보 REQ-NFR-PRIV (7개, IMPLEMENT 6 / EXCLUDED 1)

| Requirement | 요약 | 판정 | Screen(Route) |
|---|---|---|---|
| REQ-NFR-PRIV-001 | 동행 프로필 수집 항목 제한 | IMPLEMENT | SCR-005(`/account`) 로그인/회원가입 |
| REQ-NFR-PRIV-002 | 생년월일 미저장, 확인 여부+시각만 저장 | IMPLEMENT | SCR-005(`/account`) 로그인/회원가입 |
| REQ-NFR-PRIV-003 | 신고·피신고 정보 관리자만 접근 | IMPLEMENT | SCR-005(`/account`) 관리자 탭 |
| REQ-NFR-PRIV-004 | 차단 관계 상호 비노출 | IMPLEMENT | SCR-004(`/mates`) |
| REQ-NFR-PRIV-005 | 동행 안전고지 표시 | IMPLEMENT | SCR-005(`/account`) 가입·SCR-003(`/travel-tools`) 작성·SCR-004(`/mates`) 참가요청 |
| REQ-NFR-PRIV-006 | 모집글 공개 연락처 미포함 원칙 | IMPLEMENT | SCR-003(`/travel-tools`) 동행 구하기 탭 |
| REQ-NFR-PRIV-007 | 회원 탈퇴 시 개인정보 파기 | **EXCLUDED** | 해당 없음 |

### 3-12. 접근성 REQ-NFR-ACC (6개, 전부 IMPLEMENT)

| Requirement | 요약 | Screen(Route) |
|---|---|---|
| REQ-NFR-ACC-001 | WCAG 2.2 Level AA 목표 | 전 화면 공통(CROSS-CUTTING) |
| REQ-NFR-ACC-002 | 의미 있는 이미지 대체텍스트 | SCR-001(`/`)·SCR-002(`/about`) |
| REQ-NFR-ACC-003 | 키보드 조작 가능성 | 전 화면 공통(CROSS-CUTTING) |
| REQ-NFR-ACC-004 | 색상 외 텍스트 라벨 병기 | SCR-001(`/`) 경보 배지·SCR-004(`/mates`) 모집 상태 배지 |
| REQ-NFR-ACC-005 | 오류 메시지 필드 프로그램적 연결 | SCR-003(`/travel-tools`) 배후 속성 |
| REQ-NFR-ACC-006 | 모바일 터치 대상 최소 24×24px | 전 화면 공통(CROSS-CUTTING) |

### 3-13. 관측성 REQ-NFR-OBS (2개, 전부 EXCLUDED)

| Requirement | 요약 | 판정 |
|---|---|---|
| REQ-NFR-OBS-001 | KPI 핵심 이벤트 로깅 | **EXCLUDED** |
| REQ-NFR-OBS-002 | 관리자 변경 이력 감사 로그 | **EXCLUDED** |

### 3-14. 콘텐츠·SEO REQ-NFR-CONTENT (5개, IMPLEMENT 3 / EXCLUDED 2)

| Requirement | 요약 | 판정 | Screen(Route) |
|---|---|---|---|
| REQ-NFR-CONTENT-001 | 여행지 상세 SEO 메타데이터 | IMPLEMENT | SCR-001(`/`) 배후 속성 |
| REQ-NFR-CONTENT-002 | 출처·최종 확인일 표시 | IMPLEMENT | SCR-001(`/`) |
| REQ-NFR-CONTENT-003 | 게시 전 완전성 검사 통과 의무 | **EXCLUDED** | 해당 없음 |
| REQ-NFR-CONTENT-004 | 이미지·텍스트 출처 정보 관리자 DB 보존 | **EXCLUDED** | 해당 없음 |
| REQ-NFR-CONTENT-005 | 공식 기관 직접 확인 안내 | IMPLEMENT | SCR-001(`/`) |

---

## 4. 총계 확인 (삭제 없음 검증)

| 구분 | Baseline 총수 | 본 문서 §3 수록 수 | IMPLEMENT | EXCLUDED |
|---|---:|---:|---:|---:|
| REQ-FUNC | 42 | 42 | 36 | 6 |
| REQ-NFR | 35 | 35 | 25 | 10 |
| **합계** | **77** | **77** | **61** | **16** |

`docs/PROJECT_SCOPE.md` §6 총계와 정확히 일치하며, Baseline의 어떤 Requirement ID도 삭제하지 않았다.

---

## 5. UI Route Contract / Release Acceptance Criteria

UI Route Contract(승인된 5개 Screen의 Route·Page Entry·기술 Route·화면 간 이동 계약)와 Release Acceptance Criteria(릴리스 승인 기준 9개 항목과 현재 충족 여부)는 `docs/05_UIUX_APPROVED.md` §3·§4에 상세히 정의되어 있으며, 본 문서는 이를 그대로 인용하고 중복 작성하지 않는다.

---

## 6. 구현 상태 고지

본 문서에 기록된 Screen(Route) 배치는 **설계·범위 확정 사항**이며, 코드 구현 완료를 의미하지 않는다. 2026-09-15 기준 `src/app`에는 Create Next App 기본 스타터만 존재하고 61개 IMPLEMENT 대상 Requirement 중 구현이 완료된 항목은 없다. 개별 Requirement의 구현·테스트 진행 상태는 `docs/UIUX_TRACEABILITY.md`에서 추적한다.
