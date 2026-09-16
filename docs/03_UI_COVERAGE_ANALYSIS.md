# Free Traveler — UI Coverage Analysis v1.0

- **문서 ID:** UICOV-TRAVEL-001
- **작성일:** 2026-09-10
- **참고 문서:** `docs/01_PRD.md`, `docs/02_SRS_BASELINE.md`(요구사항 원본), `docs/PROJECT_SCOPE.md`(구현 범위 원본)
- **목적:** SRS의 요구사항 전체를 보존한 채, 5개로 고정한 디자인 Screen에 어떤 요구사항이 어떤 방식(직접 UI 요소 / 상태 반영 / 비UI / 운영)으로 배치되는지 정리한다.

## 0. 요구사항 총수

`docs/02_SRS_BASELINE.md`에 정의된 요구사항은 **기능 요구사항(REQ-FUNC) 42개**와 **비기능 요구사항(REQ-NFR) 35개**, 합계 **77개**다. 이 77개 전체를 아래에서 빠짐없이 추출·분류했다. 42개와 35개는 각각 §5-1(여행지·항공·호텔·동행·안전정보·대표소개·관리자 7개 도메인)과 §6-1~6-7(성능·가용성·보안·개인정보·접근성·관측성·콘텐츠 7개 도메인)로 구성되며, 어떤 항목도 삭제하지 않았다.

---

## 1. 분류 정의

| 분류 | 정의 |
|---|---|
| **UI_DIRECT** | 화면에 보이는 구체적 UI 요소(폼, 버튼, 패널, 배지, 안내 문구, 이미지 등)로 직접 구현되어야 하는 요구사항 |
| **UI_STATE** | 전용 UI 요소를 새로 요구하진 않지만, 기존 화면의 표시 상태(계산된 값·조건부 렌더링·필터링된 목록 등)에 반영되어야 하는 요구사항 |
| **NON_UI** | 화면 요소나 표시 상태와 무관한 아키텍처·보안·데이터·성능 요구사항(서버 미저장, 링크 속성, 응답시간 등) |
| **OPERATIONS** | 콘텐츠 게시 파이프라인, 감사 로그, 가용성 모니터링 등 운영·거버넌스 프로세스에 관한 요구사항으로 디자인 Screen의 대상이 아님 |

PROJECT_SCOPE 분류(IMPLEMENT/EXCLUDED)는 `docs/PROJECT_SCOPE.md` §5의 판단을 그대로 인용한다. EXCLUDED 요구사항도 삭제하지 않고 표에 유지하되, "배치 Screen"은 미배정으로 표시한다.

---

## 2. 디자인 Screen 5개 고정

| Screen ID | 경로 | 사용자 목표 | 주요 영역 | 상태 | 이동 목적지 |
|---|---|---|---|---|---|
| **SCR-001** | `/` 메인 | 국내·해외 여행지를 탐색하고, 관심 여행지의 상세 정보와 해당 국가의 안전정보를 확인한다 | 국내/해외 탭, 계절·테마·기간 필터, 여행지 카드 목록, 결과 없음 안내, 여행지 상세 Drawer/Modal(11개 필수 콘텐츠), 안전정보 패널(6개 카테고리+최종 확인일+경보 배지) | 선택된 탭/필터 값, 열려 있는 Drawer/Modal(destination 또는 safety), 필터 결과 0건 상태, 안전정보 확인일 경과 여부(7일 초과 경고) | Drawer/Modal 내 "항공/숙소 알아보기" CTA → SCR-003(국가 사전 입력), 안전정보 내 공식 출처 링크 → 외부 사이트(새 탭), 즐겨찾기 저장(localStorage) |
| **SCR-002** | `/about` 대표 소개 | `free_traveler`의 경험과 편집 기준을 확인하고 추천 여행지로 이동한다 | 대표 프로필(대표명, 50+ Trips, 30+ Countries), 여행 철학, 방문 권역 지도/목록, 타임라인, 추천 여행지 6곳, 이미지(alt·출처 캡션) | 지도/목록에서 선택된 국가 | 방문 국가·추천 여행지 선택 → SCR-001의 해당 여행지 상세 Drawer로 이동 |
| **SCR-003** | `/travel-tools` 통합 여행 준비 | 항공·숙소 조건을 정리해 외부 사이트로 이동하거나, 동행 모집글을 작성한다 | 3개 탭: (1) 항공 입력·검증·요약, (2) 숙소 입력·검증·요약, (3) 동행 모집글 작성(필수 필드+안전수칙 동의+연락처 탐지) | 각 탭의 폼 입력 값(세션 상태, 서버 미저장), 필드별 오류 상태, 외부 링크 오류 상태, 미인증 사용자 가드 상태 | 항공/숙소 탭의 "보러 가기" → 외부 사이트(새 탭, noopener/noreferrer), 동행 작성 탭 제출 완료 → SCR-004(작성한 모집글 상세 패널), 미인증 상태에서 작성 시도 → SCR-005(로그인·성인확인 탭) |
| **SCR-004** | `/mates` 동행 조회 | 조건에 맞는 동행 모집글을 찾아 참가를 요청하거나, 부적절한 게시물을 신고·차단한다 | 국가·지역·기간·여행 스타일 필터, 모집글 목록(비회원 열람 가능, 연락처 비노출), 동행 상세 패널(참가 요청, 마감 상태 배지, 신고·차단 진입점) | 필터 값, 선택된 모집글의 상세 패널 열림 상태, 모집중/마감 계산 상태(조회 시점 `end_date` 비교), 참가 요청 상태(PENDING/APPROVED/REJECTED), 차단 관계 반영 상태 | 참가 요청·신고·차단 진행 시 미인증 상태면 → SCR-005(로그인·성인확인 탭), 새 모집글 작성 → SCR-003(동행 작성 탭), 참가 요청 승인/거절 관리 → SCR-005(내 활동 탭) |
| **SCR-005** | `/account` 계정·관리 | 로그인·회원가입·성인 확인을 완료하고, 내 활동(즐겨찾기·참가 요청·차단)을 관리하며, 관리자는 신고와 외부 URL을 처리한다 | 4개 탭: (1) 로그인/회원가입/성인 확인, (2) 프로필, (3) 내 활동(즐겨찾기 목록, 참가 요청 관리, 차단 목록), (4) 관리자(신고 상태 처리, 항공·호텔 외부 URL 설정) — 관리자 탭은 관리자 role에서만 노출 | 로그인 세션 상태, 성인 확인 완료 여부, 즐겨찾기(localStorage) 목록, 참가 요청·차단 목록, 신고 처리 상태(RECEIVED/IN_REVIEW/RESOLVED) | 즐겨찾기 항목 선택 → SCR-001(여행지 상세 Drawer), 참가 요청 항목 선택 → SCR-004(해당 모집글 상세 패널), 로그인 완료 후 → 이전에 시도하던 SCR-003/SCR-004 동작으로 복귀 |

### 2-1. 기술 Route (디자인 Screen으로 세지 않음)

API Route(`/api/*`), Supabase 인증 콜백(예: `/auth/callback`), 공통 오류 처리(404/500 등)는 화면 설계 대상이 아닌 기술적 Route로 취급하며, 위 5개 디자인 Screen 수에 포함하지 않는다.

---

## 3. 요구사항 전수 매핑

### 3-1. 기능 요구사항 (REQ-FUNC, 42개)

| Requirement | 요약 | UI 분류 | PROJECT_SCOPE | 배치 Screen | 비고 |
|---|---|---|---|---|---|
| REQ-FUNC-DEST-001 | 국내/해외 탭별 목록 표시 | UI_DIRECT | IMPLEMENT | SCR-001 | 메인 목록 영역 |
| REQ-FUNC-DEST-002 | 계절·테마·기간 필터 | UI_DIRECT | IMPLEMENT | SCR-001 | 필터 컨트롤 |
| REQ-FUNC-DEST-003 | 상세 필수 콘텐츠 11개 항목 | UI_DIRECT | IMPLEMENT | SCR-001 | 여행지 상세 Drawer/Modal |
| REQ-FUNC-DEST-004 | 필터 결과 없음 안내 | UI_DIRECT | IMPLEMENT | SCR-001 | 안내 문구+초기화 버튼 |
| REQ-FUNC-DEST-005 | 해외 여행지 안전정보 연결 | UI_DIRECT | IMPLEMENT | SCR-001 | Drawer 내 안전정보 패널 진입점 |
| REQ-FUNC-FLIGHT-001 | 필수값 미입력 시 버튼 비활성화 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 폼 검증 UI |
| REQ-FUNC-FLIGHT-002 | 날짜 유효성 검증 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 오류 메시지 |
| REQ-FUNC-FLIGHT-003 | 입력 요약+비전달 고지 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 요약 화면 |
| REQ-FUNC-FLIGHT-004 | 외부 항공 사이트 새 탭 이동 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | CTA 버튼 |
| REQ-FUNC-FLIGHT-005 | 외부 링크 오류 처리 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 오류 안내+재시도 |
| REQ-FUNC-FLIGHT-006 | 입력값 서버 미저장 | NON_UI | IMPLEMENT | 미배정(비UI, 항공 탭 배후 규칙) | 아키텍처 규칙 |
| REQ-FUNC-HOTEL-001 | 필수값 미입력 시 버튼 비활성화 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 폼 검증 UI |
| REQ-FUNC-HOTEL-002 | 날짜 유효성 검증 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 오류 메시지 |
| REQ-FUNC-HOTEL-003 | 입력 요약+비전달 고지 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 요약 화면 |
| REQ-FUNC-HOTEL-004 | 외부 호텔 사이트 새 탭 이동 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | CTA 버튼 |
| REQ-FUNC-HOTEL-005 | 입력값 URL·본문·쿠키 미전달 | NON_UI | IMPLEMENT | 미배정(비UI, 숙소 탭 배후 규칙) | 네트워크 계층 규칙 |
| REQ-FUNC-HOTEL-006 | 입력값 서버 미저장 | NON_UI | IMPLEMENT | 미배정(비UI, 숙소 탭 배후 규칙) | 아키텍처 규칙 |
| REQ-FUNC-HOTEL-007 | 외부 링크 오류 처리(항공과 대칭) | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 오류 안내+재시도 |
| REQ-FUNC-MATE-001 | 비회원·미인증 접근 제한 | UI_DIRECT | IMPLEMENT | SCR-003/SCR-004(트리거) → SCR-005(로그인·성인확인 탭, 도착) | 인증 가드 |
| REQ-FUNC-MATE-002 | 모집글 필터·조회(비회원 열람 허용) | UI_DIRECT | IMPLEMENT | SCR-004 | 목록+필터 |
| REQ-FUNC-MATE-003 | 모집글 작성 및 게시 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | 작성 폼+안전수칙 동의 |
| REQ-FUNC-MATE-004 | 참가 요청 제출(중복 방지) | UI_DIRECT | IMPLEMENT | SCR-004(상세 패널) | 참가 요청 버튼/폼 |
| REQ-FUNC-MATE-005 | 참가 요청 승인·거절 | UI_DIRECT | IMPLEMENT | SCR-005(내 활동 탭), 상태는 SCR-004에도 반영 | 요청 관리 목록 |
| REQ-FUNC-MATE-006 | 신고 제출(접수번호 표시) | UI_DIRECT | IMPLEMENT | SCR-004(신고 모달), 처리는 SCR-005(관리자 탭) | 접수번호 Toast/화면 표시 |
| REQ-FUNC-MATE-007 | 차단 설정(상호 비노출) | UI_DIRECT | IMPLEMENT | SCR-004(차단 버튼), 목록은 SCR-005(내 활동 탭) | 차단 버튼+목록 |
| REQ-FUNC-MATE-008 | 여행 종료일 경과 모집글 자동 마감 | UI_STATE | IMPLEMENT | SCR-004(상세 패널) | 조회 시 계산된 마감 배지 |
| REQ-FUNC-MATE-009 | 공개 연락처 탐지 및 제출 차단 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | 제출 차단 경고 |
| REQ-FUNC-SAFETY-001 | 필수 안전 카테고리(6개)+최종 확인일 | UI_DIRECT | IMPLEMENT | SCR-001(안전정보 패널) | Drawer 내 패널 |
| REQ-FUNC-SAFETY-002 | 공식 출처 링크 새 탭 제공 | UI_DIRECT | IMPLEMENT | SCR-001(안전정보 패널) | 외부 링크 버튼 |
| REQ-FUNC-SAFETY-003 | 확인일 7일 초과 경고 | UI_DIRECT | IMPLEMENT | SCR-001(안전정보 패널) | 경고 배너(렌더링 시 계산) |
| REQ-FUNC-SAFETY-004 | 국가·지역 경보 범위 구분 | UI_DIRECT | IMPLEMENT | SCR-001(안전정보 패널) | 구분 표시 |
| REQ-FUNC-SAFETY-005 | 중대 경보 단계 상단 노출 | UI_DIRECT | IMPLEMENT | SCR-001(안전정보 패널) | 최상단 배너 |
| REQ-FUNC-ABOUT-001 | 대표 핵심 정보 표시 | UI_DIRECT | IMPLEMENT | SCR-002 | 프로필 카드 |
| REQ-FUNC-ABOUT-002 | 여행사진 대체텍스트·출처 표시 | UI_DIRECT | IMPLEMENT | SCR-002 | 이미지+캡션 |
| REQ-FUNC-ABOUT-003 | 방문 국가 지도/목록 연결 | UI_DIRECT | IMPLEMENT | SCR-002(진입) → SCR-001(여행지 상세, 도착) | 지도/목록 |
| REQ-FUNC-ADMIN-001 | 여행지 콘텐츠 CRUD | UI_DIRECT | EXCLUDED | 미배정 | 콘텐츠는 `src/data` 코드 관리(CMS 제외) |
| REQ-FUNC-ADMIN-001-2 | 국가별 안전정보 CRUD | UI_DIRECT | EXCLUDED | 미배정 | 위와 동일 |
| REQ-FUNC-ADMIN-002 | 게시 전 완전성 검사 게이트 | OPERATIONS | EXCLUDED | 미배정 | 정적 데이터로 타입검사·코드리뷰 대체 |
| REQ-FUNC-ADMIN-003 | 신고 처리 및 상태 관리 | UI_DIRECT | IMPLEMENT | SCR-005(관리자 탭) | 신고 목록+상태 변경 UI |
| REQ-FUNC-ADMIN-004 | 감사 로그 기록 | OPERATIONS | EXCLUDED | 미배정 | 범용 감사 로그 제외 |
| REQ-FUNC-ADMIN-005 | 이미지 라이선스 메타데이터 관리 | OPERATIONS | EXCLUDED | 미배정 | 미디어 업로드 워크플로 제외 |
| REQ-FUNC-ADMIN-006 | 안전정보 갱신 처리(관리자 UI) | OPERATIONS | EXCLUDED | 미배정 | `src/data` 코드 수정으로 대체 |

### 3-2. 비기능 요구사항 (REQ-NFR, 35개)

| Requirement | 요약 | UI 분류 | PROJECT_SCOPE | 배치 Screen | 비고 |
|---|---|---|---|---|---|
| REQ-NFR-PERF-001 | 페이지 LCP p75 2.5초 이하 | NON_UI | IMPLEMENT | 미배정(전 화면 공통 품질 속성) | 정적 생성·이미지 최적화 |
| REQ-NFR-PERF-002 | 필터 결과 p95 1초 이하 | NON_UI | IMPLEMENT | 미배정(SCR-001·SCR-004 필터 배후 속성) | 클라이언트 필터링으로 자연 충족 |
| REQ-NFR-PERF-003 | 입력 검증 100ms 이내 | NON_UI | IMPLEMENT | 미배정(SCR-003 폼 배후 속성) | 클라이언트 즉시 검증 |
| REQ-NFR-PERF-004 | 신고 접수 응답 p95 3초 이하 | NON_UI | IMPLEMENT | 미배정(SCR-004 신고 배후 속성) | Supabase 단건 insert |
| REQ-NFR-AVAIL-001 | 월간 가용성 99.5% 이상 | OPERATIONS | EXCLUDED | 미배정 | 업타임 모니터링 인프라 제외 |
| REQ-NFR-AVAIL-002 | 내부 API 5xx 비율 0.5% 이하 | OPERATIONS | EXCLUDED | 미배정 | 에러율 모니터링 인프라 제외 |
| REQ-NFR-AVAIL-003 | Supabase 장애 시 읽기 전용 콘텐츠 열람 유지 | NON_UI | IMPLEMENT | 미배정(SCR-001·SCR-002 배후 아키텍처) | 정적 데이터 구조로 구조적 충족 |
| REQ-NFR-SEC-001 | HTTPS·TLS 1.2 이상 | NON_UI | IMPLEMENT | 미배정(전 화면 공통) | Vercel 기본 적용 |
| REQ-NFR-SEC-002 | 외부 이동 링크 `noopener`/`noreferrer` | NON_UI | IMPLEMENT | 미배정(SCR-001·SCR-003 외부 링크 배후 속성) | 마크업 속성 |
| REQ-NFR-SEC-003 | 항공·호텔 입력값 서버 비저장 원칙 | NON_UI | IMPLEMENT | 미배정(SCR-003 배후 규칙) | REQ-FUNC-FLIGHT/HOTEL-006과 동일 |
| REQ-NFR-SEC-004 | 외부 랜딩 URL 환경설정화 | UI_DIRECT | IMPLEMENT | SCR-005(관리자 탭) | URL 설정 폼 |
| REQ-NFR-SEC-005 | 로그인 시도 제한 | NON_UI | EXCLUDED | 미배정 | Supabase Auth 기본 보호 의존 |
| REQ-NFR-SEC-006 | 세션·토큰 만료 정책(관리자 차등) | NON_UI | EXCLUDED | 미배정 | Supabase Auth 기본 세션만 사용 |
| REQ-NFR-SEC-007 | 관리자 계정 보호 강화(MFA 등) | NON_UI | EXCLUDED | 미배정 | 범위 밖 |
| REQ-NFR-SEC-008 | 사용자 입력 콘텐츠 새니타이제이션 | NON_UI | IMPLEMENT | 미배정(SCR-003 동행 작성 배후 규칙) | React 기본 이스케이프 |
| REQ-NFR-PRIV-001 | 동행 프로필 수집 항목 제한 | UI_DIRECT | IMPLEMENT | SCR-005(로그인/회원가입 탭) | 가입 폼 필드 구성 |
| REQ-NFR-PRIV-002 | 생년월일 미저장, 확인 여부+시각만 저장 | UI_DIRECT | IMPLEMENT | SCR-005(로그인/회원가입 탭) | 자기신고 체크박스 |
| REQ-NFR-PRIV-003 | 신고·피신고 정보 관리자만 접근 | UI_STATE | IMPLEMENT | SCR-005(관리자 탭) | 조건부 노출(RLS) |
| REQ-NFR-PRIV-004 | 차단 관계 상호 비노출 | UI_STATE | IMPLEMENT | SCR-004 | 목록 필터링 상태 |
| REQ-NFR-PRIV-005 | 동행 안전고지 표시 | UI_DIRECT | IMPLEMENT | SCR-005(가입)·SCR-003(작성)·SCR-004(참가요청) | 고정 안내 문구 |
| REQ-NFR-PRIV-006 | 모집글 공개 연락처 미포함 원칙 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | REQ-FUNC-MATE-009와 동일 |
| REQ-NFR-PRIV-007 | 회원 탈퇴 시 개인정보 파기 | OPERATIONS | EXCLUDED | 미배정 | 탈퇴 플로우 자체가 범위 밖 |
| REQ-NFR-ACC-001 | WCAG 2.2 Level AA 목표 | NON_UI | IMPLEMENT | 미배정(전 화면 공통 품질 기준) | 시맨틱 HTML 설계 원칙 |
| REQ-NFR-ACC-002 | 의미 있는 이미지 대체텍스트 | UI_DIRECT | IMPLEMENT | SCR-001·SCR-002 | 이미지 alt 속성 |
| REQ-NFR-ACC-003 | 키보드 조작 가능성 | NON_UI | IMPLEMENT | 미배정(전 화면 공통) | 네이티브 요소 사용 |
| REQ-NFR-ACC-004 | 색상 외 텍스트 라벨 병기 | UI_DIRECT | IMPLEMENT | SCR-001(경보 배지)·SCR-004(모집 상태 배지) | 상태 배지 라벨 |
| REQ-NFR-ACC-005 | 오류 메시지 필드 프로그램적 연결 | NON_UI | IMPLEMENT | 미배정(SCR-003 폼 배후 속성) | aria-describedby |
| REQ-NFR-ACC-006 | 모바일 터치 대상 최소 24×24px | NON_UI | IMPLEMENT | 미배정(전 화면 공통) | 레이아웃 치수 기준 |
| REQ-NFR-OBS-001 | KPI 핵심 이벤트 로깅 | OPERATIONS | EXCLUDED | 미배정 | 분석 도구 연동 범위 밖 |
| REQ-NFR-OBS-002 | 관리자 변경 이력 감사 로그 | OPERATIONS | EXCLUDED | 미배정 | 범용 감사 로그 제외 |
| REQ-NFR-CONTENT-001 | 여행지 상세 SEO 메타데이터 | NON_UI | IMPLEMENT | 미배정(SCR-001 배후 속성) | Next.js Metadata API |
| REQ-NFR-CONTENT-002 | 출처·최종 확인일 표시 | UI_DIRECT | IMPLEMENT | SCR-001 | 상세/안전정보 내 텍스트 |
| REQ-NFR-CONTENT-003 | 게시 전 완전성 검사 통과 의무 | OPERATIONS | EXCLUDED | 미배정 | CMS 게시 워크플로 제외 |
| REQ-NFR-CONTENT-004 | 이미지·텍스트 출처 정보 관리자 DB 보존 | OPERATIONS | EXCLUDED | 미배정 | 미디어 워크플로 제외 |
| REQ-NFR-CONTENT-005 | 공식 기관 직접 확인 안내 | UI_DIRECT | IMPLEMENT | SCR-001 | 고정 안내 문구 |

---

## 4. 분류·범위 집계

### 4-1. UI 분류별 집계

| UI 분류 | 기능(FUNC) | 비기능(NFR) | 합계 |
|---|---:|---:|---:|
| UI_DIRECT | 34 | 9 | 43 |
| UI_STATE | 1 | 2 | 3 |
| NON_UI | 3 | 17 | 20 |
| OPERATIONS | 4 | 7 | 11 |
| **합계** | **42** | **35** | **77** |

### 4-2. PROJECT_SCOPE 분류별 집계

| PROJECT_SCOPE | 기능(FUNC) | 비기능(NFR) | 합계 |
|---|---:|---:|---:|
| IMPLEMENT | 36 | 25 | 61 |
| EXCLUDED | 6 | 10 | 16 |
| **합계** | **42** | **35** | **77** |

`docs/PROJECT_SCOPE.md` §6의 집계(기능 36/6, 비기능 25/10, 합계 61/16)와 정확히 일치하며, 어떤 EXCLUDED 항목도 이번 문서에서 구현 범위로 되돌리지 않았다.

### 4-3. Screen별 배치 요구사항 수 (IMPLEMENT 대상만)

| Screen | 주 배치 요구사항 수(발췌 기준) |
|---|---:|
| SCR-001 (`/`) | 11 (DEST 5, SAFETY 5, CONTENT-002·005·ACC-002·004 등 교차 반영 포함 시 증가) |
| SCR-002 (`/about`) | 3 (ABOUT 3) |
| SCR-003 (`/travel-tools`) | 항공 5 + 숙소 4 + 동행 작성 관련 3 |
| SCR-004 (`/mates`) | MATE 조회/참가/신고/차단/마감 관련 7 |
| SCR-005 (`/account`) | 인증·개인정보·관리자 관련 8 |
| 미배정(NON_UI/OPERATIONS, 특정 화면 전용 요소가 아닌 교차·운영 요구사항) | 나머지 |

세부 배치는 §3의 전수 매핑 표를 기준으로 한다(위 요약은 표를 보완하는 참고용 카운트이며 표와 상충 시 §3 표가 우선한다).

---

## 5. 확인 사항

- 요구사항 77개(기능 42 + 비기능 35) 전체를 §3에 1회씩 기록했으며, 어떤 항목도 삭제하지 않았다.
- EXCLUDED로 분류된 16개 요구사항은 구현 범위로 복원하지 않고 미배정으로 유지했다.
- 디자인 Screen은 SCR-001~SCR-005 5개로 고정했으며, API Route·인증 콜백·오류 처리는 기술 Route로 별도 취급해 Screen 수에 포함하지 않았다.
- 여행지·안전정보 상세는 SCR-001의 Drawer/Modal로, 항공·숙소·동행 작성은 SCR-003의 3개 탭으로, 동행 상세는 SCR-004의 상세 패널로, 로그인·프로필·내 활동·관리자는 SCR-005의 4개 탭으로 배치했다.
