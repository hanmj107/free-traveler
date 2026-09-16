# Free Traveler — Project Scope v1.0

- **문서 ID:** SCOPE-TRAVEL-001
- **작성일:** 2026-09-10
- **참고 문서:** `docs/01_PRD.md`(PRD-TRAVEL-001), `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001, Baseline), 현재 `package.json` / `src/app` 구조
- **요구사항 ID 기준:** 본 문서의 Requirement ID는 `docs/02_SRS_BASELINE.md` §5·§6에서 확정된 표기를 그대로 사용한다. 도메인 접두어를 가진 **기능 요구사항 42개**(`REQ-FUNC-DEST/FLIGHT/HOTEL/MATE/SAFETY/ABOUT/ADMIN-*`)와 **비기능 요구사항 35개**(`REQ-NFR-PERF/AVAIL/SEC/PRIV/ACC/OBS/CONTENT-*`), 합계 77개 전체를 빠짐없이 기록한다.
- **상태 정의**
  - **IMPLEMENT** — 이번 범위에서 구현하고 테스트한다.
  - **EXCLUDED** — 이번 범위에서 만들지 않으며, 표에 제외 이유를 함께 기록한다.

---

## 1. 반드시 직접 구현할 범위

1. 핵심 화면 4개와 보조 화면 1개
2. 여행지 검색·필터와 상세 패널
3. 국가 안전정보 패널
4. `free_traveler` 대표 소개
5. 항공·숙소 입력·검증·요약·외부 이동
6. Supabase 이메일 인증과 성인 확인
7. 동행글 작성·조회·수정·마감
8. 참가 요청·승인·거절
9. 간단한 차단·신고
10. 내 활동과 간단한 관리자 탭
11. Playwright 핵심 Smoke Test
12. Vercel 배포

---

## 2. 화면 구성

### 2-1. 핵심 화면 4개

| # | 화면 | 제안 경로 | 포함 기능 |
|---|---|---|---|
| 1 | 여행지 | `/destinations`, `/destinations/[id]` | 국내·해외 탭, 계절·테마·기간 필터, 상세 필수 콘텐츠, 상세 내 국가 안전정보 패널(해외 한정) |
| 2 | 항공·숙소 조건 입력 | `/flights`, `/hotels` | 국가·지역·기간 입력, 검증, 요약, 비전달 고지, 외부 사이트 새 탭 이동 |
| 3 | 동행 찾기 | `/mate`, `/mate/new`, `/mate/[id]` | 모집글 목록·필터(비회원 열람 허용), 작성·수정·마감, 참가 요청, 신고·차단 |
| 4 | 대표 소개 | `/about` | 대표 프로필, 방문 국가, 추천 여행지 연결 |

### 2-2. 보조 화면 1개

| 화면 | 제안 경로 | 포함 기능 |
|---|---|---|
| 마이페이지 | `/mypage`(내 활동: 즐겨찾기, 참가 요청 관리, 차단 관리), `/mypage/admin`(관리자 탭: 신고 상태 처리, 외부 URL 설정) | 개인 활동 관리 + 최소 관리자 기능 |

### 2-3. 공통 인증 플로우 (화면 수에 포함하지 않음)

로그인·회원가입·성인 확인(`/login`, `/signup`)은 위 5개 화면에 진입하기 위한 공통 플로우로 구현하며, 별도의 "핵심/보조 화면"으로 계수하지 않는다. Supabase Auth(이메일 인증) 세션과 성인 확인(만 19세 이상 자기신고 체크박스 + 확인 시각 저장)을 사용한다.

---

## 3. 구현 방식 원칙

| 원칙 | 내용 |
|---|---|
| 콘텐츠 저장 방식 | 여행지·국가 안전정보·대표 소개 콘텐츠는 `src/data`의 정적 TypeScript 데이터로 관리한다. 관리자 CRUD·게시 워크플로는 만들지 않고, 콘텐츠 변경은 코드 변경(PR)으로 처리한다. |
| 즐겨찾기 | 서버 저장 없이 `localStorage`에 보관한다. |
| 알림 | 실제 이메일 발송 대신 Toast 또는 화면 내 상태 표시로 대체한다(참가 요청 알림, 신고 접수 등). |
| 모집글 자동 마감 | 별도 배치 작업(cron) 없이, 목록·상세 조회 시점에 `end_date`와 현재일을 비교해 마감 상태를 계산해 표시한다. |
| 안전정보 최신성 경고 | 별도 배치 없이, 렌더링 시점에 `last_verified_at`과 현재일의 차이를 계산해 7일 초과 경고를 표시한다. |
| 이미지 | 일반 인터넷 이미지 URL과 `alt` 텍스트만 사용한다. 출처·작가·라이선스 승인 워크플로는 구현하지 않는다. |
| 관리자 범위 | 관리자는 신고 처리 상태 변경과 외부 이동 URL(항공·호텔 랜딩 URL) 설정만 다룬다. 콘텐츠·미디어·감사 로그 관리 기능은 없다. |
| 인증·개인정보 | Supabase Auth(이메일)로 로그인·회원가입을 구현하고, 성인 확인은 생년월일을 저장하지 않는 자기신고 체크박스 + 확인 시각 저장 방식으로 구현한다. |
| 테스트 | Playwright로 핵심 사용자 흐름(여행지 탐색, 항공/호텔 외부 이동, 동행 작성/참가/신고/차단, 로그인/성인 확인, 관리자 신고 처리)에 대한 Smoke Test를 작성한다. |
| 배포 | Vercel에 배포한다. 별도 EC2/AWS 인프라, 업타임 모니터링, 부하 테스트 체계는 구축하지 않는다. |

---

## 4. 제외 기능과 사유

| 제외 기능 | 사유 | 관련 Requirement |
|---|---|---|
| 전체 콘텐츠 CMS | 콘텐츠는 `src/data` 정적 데이터로 충분히 관리 가능하며, 게시 승인 워크플로를 구축할 운영 인력이 없다 | REQ-FUNC-ADMIN-001, -001-2, -002, -006, REQ-NFR-CONTENT-003 |
| 미디어 업로드·라이선스 승인 워크플로 | 이미지는 URL+alt만 사용하는 방식으로 대체하며, 별도 업로드·검수 파이프라인은 MVP 범위 밖이다 | REQ-FUNC-ADMIN-005, REQ-NFR-CONTENT-004 |
| 범용 감사 로그 | 변경 이력 추적 인프라 구축 비용 대비 이번 범위의 운영 가치가 낮다(관리자 액션이 신고 처리·URL 설정으로 한정됨) | REQ-FUNC-ADMIN-004, REQ-NFR-OBS-002 |
| 자동 백업·장애 알림·부하 테스트 | 운영 모니터링·재해 복구 체계는 Vercel/Supabase 기본 제공 수준에 의존하고 별도로 구축하지 않는다 | REQ-NFR-AVAIL-001, -002 |
| 외부 이메일 사업자 연동 | 실제 이메일 발송 대신 Toast/화면 상태로 대체한다(§3 구현 방식 참조) | PRD Should 기능(동행 요청 알림 이메일), Constraint C-09 — REQ-FUNC 변환 대상 아님(§2-5) |
| EC2·AWS 인프라 | Vercel 배포로 대체한다 | 배포 방식 결정 사항(REQ 미해당) |
| 무인 자동 Merge Runner | 코드 변경은 사람이 리뷰·머지하며, 자동 병합 파이프라인은 구축하지 않는다 | 개발 프로세스 결정 사항(REQ 미해당) |

위 6개 원칙에서 직접 파생되지 않지만, "12개 필수 구현 범위"에 포함되지 않아 함께 제외한 항목은 아래와 같다(§5 표에 사유 명시):

- 로그인 시도 제한, 세션 만료 차등 정책, 관리자 계정 강화 보호(MFA 등) — `REQ-NFR-SEC-005~007`: Supabase Auth 기본 보호에 의존
- 회원 탈퇴 시 개인정보 파기 플로우 — `REQ-NFR-PRIV-007`: 탈퇴 기능 자체가 12개 필수 범위에 없음
- KPI 이벤트 로깅/행동 분석 — `REQ-NFR-OBS-001`: 별도 분석 도구 연동이 필요해 이번 범위에서 제외

---

## 5. 요구사항 매핑

### 5-1. 기능 요구사항 (REQ-FUNC, 42개)

#### 여행지 (REQ-FUNC-DEST)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-DEST-001 | 국내/해외 탭별 게시 여행지 목록 표시 | IMPLEMENT | `src/data`의 `region_type` 필드로 클라이언트 필터링 | Playwright: 탭 전환 시 결과 구분 확인 |
| REQ-FUNC-DEST-002 | 계절·테마·기간 필터(AND 조건) | IMPLEMENT | 정적 데이터 배열을 클라이언트에서 AND 조건으로 필터링 | Playwright: 필터 조합 적용 후 결과 검증 |
| REQ-FUNC-DEST-003 | 상세 필수 콘텐츠 11개 항목 표시 | IMPLEMENT | 콘텐츠 스키마를 TypeScript 타입으로 강제하고 상세 페이지에서 전부 렌더링. 런타임 "게시 전 자동 완전성 검사 게이트"는 정적 데이터 구조상 불필요해 코드 리뷰로 대체 | 타입 검사(빌드 실패로 누락 방지) + Playwright 상세 페이지 렌더링 확인 |
| REQ-FUNC-DEST-004 | 필터 결과 없음 안내 | IMPLEMENT | 결과 0건 시 조건 완화 안내 + 초기화 버튼 컴포넌트 | Playwright: 결과 없는 필터 조합에서 안내 노출 확인 |
| REQ-FUNC-DEST-005 | 해외 여행지 안전정보 연결 | IMPLEMENT | `country_code`로 `src/data` 내 안전정보 데이터를 매핑해 라우팅 | Playwright: 해외 상세에서 안전정보 링크 이동 확인 |

#### 항공 (REQ-FUNC-FLIGHT)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-FLIGHT-001 | 필수값 미입력 시 버튼 비활성화+오류 표시 | IMPLEMENT | 클라이언트 폼 상태로 즉시 검증 | Playwright: 필드 누락 시 이동 버튼 disabled 확인 |
| REQ-FUNC-FLIGHT-002 | 날짜 유효성 검증(과거 출발일, 귀국일<출발일 차단) | IMPLEMENT | 클라이언트 날짜 비교 로직 | Playwright: 경계값(과거일, 귀국일<출발일) 시나리오 |
| REQ-FUNC-FLIGHT-003 | 입력 요약 및 비전달 고지 | IMPLEMENT | 요약 컴포넌트 + 고정 고지 문구 | Playwright: 요약 값과 입력값 일치 확인 |
| REQ-FUNC-FLIGHT-004 | 외부 항공 사이트 새 탭 이동 | IMPLEMENT | 관리자 설정 URL을 `target="_blank" rel="noopener noreferrer"`로 오픈, 입력값 미포함 | Playwright: 새 탭 오픈 및 URL에 입력값 없음 확인 |
| REQ-FUNC-FLIGHT-005 | 외부 링크 오류 처리 | IMPLEMENT | URL 미설정/형식 오류 시 안내 + 재시도 UI, 동일 탭 이동 차단 | Playwright: 잘못된 URL 설정 시나리오 |
| REQ-FUNC-FLIGHT-006 | 입력값 서버 미저장 | IMPLEMENT | 서버 API 호출 없이 컴포넌트/세션 상태만 사용 | 코드 리뷰(서버 저장 API 부재 확인) |

#### 호텔 (REQ-FUNC-HOTEL)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-HOTEL-001 | 필수값 미입력 시 버튼 비활성화+오류 표시 | IMPLEMENT | FLIGHT-001과 동일 패턴 | Playwright: 필드 누락 시 disabled 확인 |
| REQ-FUNC-HOTEL-002 | 날짜 유효성 검증(과거 체크인, 체크아웃≤체크인 차단) | IMPLEMENT | 클라이언트 날짜 비교 로직 | Playwright: 경계값 시나리오 |
| REQ-FUNC-HOTEL-003 | 입력 요약 및 비전달 고지 | IMPLEMENT | FLIGHT-003과 동일 패턴 | Playwright: 요약 값 일치 확인 |
| REQ-FUNC-HOTEL-004 | 외부 호텔 사이트 새 탭 이동 | IMPLEMENT | FLIGHT-004와 동일 패턴 | Playwright: 새 탭 오픈 확인 |
| REQ-FUNC-HOTEL-005 | 입력값 URL·본문·쿠키 미전달 | IMPLEMENT | 외부 링크에 쿼리 파라미터 미포함, 요청 본문·쿠키 미사용 | 코드 리뷰 + 브라우저 개발자 도구 네트워크 점검 |
| REQ-FUNC-HOTEL-006 | 입력값 서버 미저장 | IMPLEMENT | FLIGHT-006과 동일 패턴 | 코드 리뷰 |
| REQ-FUNC-HOTEL-007 | 외부 링크 오류 처리(항공과 대칭) | IMPLEMENT | FLIGHT-005 컴포넌트 재사용 | Playwright: 동일 오류 시나리오 |

#### 동행 (REQ-FUNC-MATE)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-MATE-001 | 비회원·미인증 사용자의 작성/요청 접근 제한 | IMPLEMENT | Supabase Auth 세션 + `adult_verified` 플래그 확인 후 라우트 가드, 미충족 시 로그인/성인확인 화면으로 이동 | Playwright: 미인증 상태로 작성·요청 시도 시 리다이렉트 확인 |
| REQ-FUNC-MATE-002 | 모집글 필터·조회(비회원 열람 허용, 연락처 비노출) | IMPLEMENT | Supabase 공개 read 조회, 목록·상세에서 연락처 필드 미노출 | Playwright: 비회원 상태로 목록/상세 열람 시 개인정보 미노출 확인 |
| REQ-FUNC-MATE-003 | 모집글 작성 및 게시(안전수칙 동의, 연락처 비공개) | IMPLEMENT | 필수 필드 + 안전수칙 동의 체크 검증 후 Supabase insert | Playwright: 필수값/동의 누락 시 제출 차단 확인 |
| REQ-FUNC-MATE-004 | 참가 요청 제출(중복 방지) | IMPLEMENT | `(post_id, applicant_user_id)` 조합에 PENDING/APPROVED 중복 체크 후 insert | Playwright: 중복 제출 시 차단 확인 |
| REQ-FUNC-MATE-005 | 참가 요청 승인·거절 | IMPLEMENT | 작성자 권한 확인 후 상태 변경 + Toast 알림 | Playwright: 승인/거절 후 상태 반영 확인 |
| REQ-FUNC-MATE-006 | 신고 제출(접수번호 표시) | IMPLEMENT | 간단한 신고 폼 → Supabase insert, 생성된 ID를 접수번호로 표시 | Playwright: 신고 제출 후 접수번호 노출 확인 |
| REQ-FUNC-MATE-007 | 차단 설정(상호 콘텐츠 노출 제한) | IMPLEMENT | `USER_BLOCK` 테이블 저장, 목록/상세 조회 시 차단 관계 필터링 | Playwright: 차단 후 상대방 게시물 미노출 확인 |
| REQ-FUNC-MATE-008 | 여행 종료일 경과 모집글 자동 마감 | IMPLEMENT(단순화) | 배치 작업 대신 조회 시점에 `end_date`와 현재일을 비교해 마감 상태로 계산·표시 | Playwright: 종료일 경과 글이 마감으로 표시되는지 확인 |
| REQ-FUNC-MATE-009 | 공개 연락처 탐지 및 제출 차단 | IMPLEMENT(단순화) | 전화번호·메신저 ID 기본 정규식으로 제출 전 클라이언트 검사(패턴 범위는 최소 수준, OQ-03 상세 확정은 범위 밖) | Playwright: 연락처 패턴 포함 시 제출 차단 확인 |

#### 국가별 안전정보 (REQ-FUNC-SAFETY)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-SAFETY-001 | 필수 안전 카테고리(6개) 및 최종 확인일 표시 | IMPLEMENT | `src/data` 정적 안전정보에 6개 카테고리 필드 정의 | Playwright: 카테고리+확인일 렌더링 확인 |
| REQ-FUNC-SAFETY-002 | 공식 출처(외교부) 링크 새 탭 제공 | IMPLEMENT | 등록된 URL을 `noopener noreferrer` 새 탭으로 오픈 | Playwright: 링크 클릭 시 새 탭 오픈 확인 |
| REQ-FUNC-SAFETY-003 | 확인일 7일 초과 시 재확인 경고 | IMPLEMENT | 렌더링 시점에 `(오늘 - last_verified_at)` 계산 | Playwright: 확인일 mock 데이터로 경고 노출 케이스 검증 |
| REQ-FUNC-SAFETY-004 | 국가·지역 경보 범위 구분 표시 | IMPLEMENT | 데이터의 `alert_scope`/`region_alerts` 필드로 조건부 렌더링 | 수동 QA |
| REQ-FUNC-SAFETY-005 | 중대 경보 단계 상단 노출 | IMPLEMENT | `alert_level` 값에 따라 배너를 최상단에 우선 렌더링 | 수동 QA |

#### 대표 소개 (REQ-FUNC-ABOUT)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-ABOUT-001 | 대표 핵심 정보(대표명, 50+회, 30개국+) 표시 | IMPLEMENT | 단일 정적 데이터 소스에서 수치를 가져와 표시(Risk R-07 대응) | 수동 QA + Playwright 텍스트 확인 |
| REQ-FUNC-ABOUT-002 | 여행사진 메타데이터(대체텍스트·출처·라이선스) 표시 | IMPLEMENT(단순화) | 이미지 URL + `alt` 텍스트만 필수로 관리하고, 출처·라이선스는 선택적 캡션 텍스트로 대체(업로드·승인 워크플로 없음) | 수동 QA(alt 속성 존재 확인) |
| REQ-FUNC-ABOUT-003 | 방문 국가 지도·목록에서 관련 콘텐츠로 이동 | IMPLEMENT | `visited_countries` 정적 배열, 선택 시 관련 여행지/기록으로 라우팅 | Playwright: 국가 선택 후 이동 확인 |

#### 관리자·거버넌스 (REQ-FUNC-ADMIN)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-FUNC-ADMIN-001 | 여행지 콘텐츠 CRUD | EXCLUDED | 콘텐츠는 `src/data` 코드로 관리(PR로 수정). "전체 콘텐츠 CMS" 제외 범위 | — |
| REQ-FUNC-ADMIN-001-2 | 국가별 안전정보 CRUD | EXCLUDED | 위와 동일(코드 관리). "전체 콘텐츠 CMS" 제외 범위 | — |
| REQ-FUNC-ADMIN-002 | 게시 전 완전성 검사 게이트 | EXCLUDED | 정적 데이터 구조라 런타임 게이트 불필요, 타입 검사+코드 리뷰로 대체. CMS 제외 범위 | — |
| REQ-FUNC-ADMIN-003 | 신고 처리 및 상태 관리 | IMPLEMENT | 관리자 탭(`/mypage/admin`)에서 신고 목록 조회, 상태(RECEIVED/IN_REVIEW/RESOLVED) 변경 | Playwright: 관리자 신고 상태 변경 확인 |
| REQ-FUNC-ADMIN-004 | 감사 로그 기록 | EXCLUDED | "범용 감사 로그" 제외 범위(관리자 액션이 신고 처리·URL 설정으로 한정되어 별도 이력 추적 불필요) | — |
| REQ-FUNC-ADMIN-005 | 이미지 라이선스 메타데이터 관리 | EXCLUDED | "미디어 업로드·라이선스 승인 워크플로" 제외 범위, 이미지는 URL+alt만 사용 | — |
| REQ-FUNC-ADMIN-006 | 안전정보 갱신 처리(관리자 UI) | EXCLUDED | 안전정보는 `src/data` 코드 수정 후 배포로 갱신. CMS 제외 범위 | — |

### 5-2. 비기능 요구사항 (REQ-NFR, 35개)

#### 성능 (REQ-NFR-PERF)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-PERF-001 | 홈·목록·상세 LCP p75 2.5초 이하 | IMPLEMENT | Next.js 정적 생성·이미지 최적화 기본 기능 활용(참고 목표로 운용) | Lighthouse 수동 측정(RUM 미구축) |
| REQ-NFR-PERF-002 | 여행지·동행 필터 결과 p95 1초 이하 | IMPLEMENT | 정적 데이터 클라이언트 필터링으로 네트워크 왕복 없이 목표 충족 | 수동 측정 |
| REQ-NFR-PERF-003 | 항공·호텔 입력 검증 100ms 이내 | IMPLEMENT | 클라이언트 즉시 검증(네트워크 호출 없음) | 수동 확인 |
| REQ-NFR-PERF-004 | 신고 접수 응답 p95 3초 이하 | IMPLEMENT | Supabase 단건 insert 호출 | 수동 측정(부하 테스트는 제외 범위) |

#### 가용성 (REQ-NFR-AVAIL)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-AVAIL-001 | 월간 가용성 99.5% 이상 | EXCLUDED | 업타임 모니터링·SLA 운영 체계 구축은 "자동 백업·장애 알림" 제외 범위, Vercel/Supabase 기본 가용성에 의존 | — |
| REQ-NFR-AVAIL-002 | 내부 API 5xx 비율 0.5% 이하 | EXCLUDED | 별도 에러율 모니터링 대시보드 미구축. "자동 백업·장애 알림" 제외 범위 | — |
| REQ-NFR-AVAIL-003 | Supabase 장애 시 읽기 전용 콘텐츠 열람 유지 | IMPLEMENT(구조적 충족) | 여행지·안전정보·대표소개가 `src/data` 정적 데이터이므로 Supabase 장애와 무관하게 항상 열람 가능 | 수동 확인(Supabase 연결 차단 상태에서 정적 페이지 접근 테스트) |

#### 보안 (REQ-NFR-SEC)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-SEC-001 | HTTPS·TLS 1.2 이상 적용 | IMPLEMENT | Vercel 배포 시 기본 HTTPS 적용 | 배포 URL HTTPS 접속 확인 |
| REQ-NFR-SEC-002 | 외부 이동 링크에 `noopener`/`noreferrer` 적용 | IMPLEMENT | 모든 외부 링크 공통 컴포넌트에 속성 적용 | 코드 리뷰 + Playwright DOM 속성 확인 |
| REQ-NFR-SEC-003 | 항공·호텔 입력값 서버 비저장 원칙 | IMPLEMENT | 관련 API 라우트·DB 테이블을 만들지 않음 | 코드 리뷰 |
| REQ-NFR-SEC-004 | 외부 랜딩 URL 환경설정화 | IMPLEMENT | 관리자 탭에서 항공·호텔 외부 URL 값을 설정(Supabase 테이블 저장), 하드코딩 금지 | 관리자 탭에서 URL 변경 후 반영 확인 |
| REQ-NFR-SEC-005 | 로그인 시도 제한(브루트포스 방지) | EXCLUDED | Supabase Auth 기본 보호에 의존, 커스텀 잠금 로직은 12개 필수 범위 밖 | — |
| REQ-NFR-SEC-006 | 세션·토큰 만료 정책(관리자 차등 적용) | EXCLUDED | Supabase Auth 기본 세션 만료만 사용, 관리자 전용 차등 정책은 미구현 | — |
| REQ-NFR-SEC-007 | 관리자 계정 보호 강화(MFA 등) | EXCLUDED | MFA 등 추가 보호 조치는 12개 필수 범위 밖 | — |
| REQ-NFR-SEC-008 | 사용자 입력 콘텐츠 새니타이제이션(XSS 방지) | IMPLEMENT | 모집글 본문 등 UGC는 React 기본 이스케이프만 사용하고 `dangerouslySetInnerHTML` 사용 금지 | Playwright: `<script>` 등 페이로드 입력 후 저장형 XSS 미발생 확인 |

#### 개인정보 (REQ-NFR-PRIV)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-PRIV-001 | 동행 프로필 수집 항목 제한 | IMPLEMENT | Supabase 사용자 테이블에 이메일·닉네임·성인확인·선택형 필드만 정의 | 스키마 점검 |
| REQ-NFR-PRIV-002 | 생년월일 미저장, 성인 확인 여부+시각만 저장 | IMPLEMENT | 자기신고(self-declaration) 체크박스 + 확인 시각 저장 | 스키마 점검 |
| REQ-NFR-PRIV-003 | 신고·피신고 상세 정보는 관리자만 접근 | IMPLEMENT | Supabase RLS로 관리자 role만 조회 허용 | RLS 정책 테스트 |
| REQ-NFR-PRIV-004 | 차단 관계 상호 비노출 원칙 | IMPLEMENT | REQ-FUNC-MATE-007과 동일 로직 | Playwright 동일 시나리오 |
| REQ-NFR-PRIV-005 | 동행 안전고지 표시(가입·작성·요청 단계) | IMPLEMENT | 3단계 각각에 고정 안전고지 문구 컴포넌트 배치 | 수동 QA |
| REQ-NFR-PRIV-006 | 모집글 공개 연락처 미포함 원칙 | IMPLEMENT | REQ-FUNC-MATE-009와 동일 로직 | 동일 검증 방법 |
| REQ-NFR-PRIV-007 | 회원 탈퇴 시 개인정보 파기 | EXCLUDED | 회원 탈퇴 플로우 자체가 12개 필수 구현 범위에 없음(추후 별도 검토) | — |

#### 접근성 (REQ-NFR-ACC)

| Requirement | 요약 | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-ACC-001 | WCAG 2.2 Level AA 목표 | IMPLEMENT(모범사례 수준) | 시맨틱 HTML과 접근성 우선 컴포넌트 설계 적용 | 수동 스크린리더/키보드 점검(자동 axe 검사 CI 구축은 범위 밖) |
| REQ-NFR-ACC-002 | 의미 있는 이미지에 대체텍스트 제공 | IMPLEMENT | 모든 이미지에 `alt` 속성 필수 | 코드 리뷰 |
| REQ-NFR-ACC-003 | 검색·폼 입력·모달·신고 제출의 키보드 조작 가능성 | IMPLEMENT | 네이티브 `form`/`dialog` 요소 사용 | 수동 키보드 전용 테스트 |
| REQ-NFR-ACC-004 | 색상만이 아닌 텍스트 라벨 병기 | IMPLEMENT | 상태·경보 배지에 색상+텍스트 라벨 함께 표시 | 수동 QA |
| REQ-NFR-ACC-005 | 오류 메시지의 필드 프로그램적 연결 | IMPLEMENT | `aria-describedby`로 오류 메시지와 필드 연결 | 수동 스크린리더 테스트 |
| REQ-NFR-ACC-006 | 모바일 터치 대상 최소 24×24 CSS px | IMPLEMENT | Tailwind 최소 크기 유틸리티 클래스 적용 | 디자인 QA(치수 검사) |

#### 관측성·로그 (REQ-NFR-OBS)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-OBS-001 | North Star·보조 KPI 핵심 이벤트 로깅 | EXCLUDED | 별도 분석 도구 연동이 필요해 12개 필수 구현 범위 밖 | — |
| REQ-NFR-OBS-002 | 관리자 변경 이력 감사 로그 보존 | EXCLUDED | "범용 감사 로그" 제외 범위(REQ-FUNC-ADMIN-004와 동일 사유) | — |

#### 콘텐츠·SEO·저작권 (REQ-NFR-CONTENT)

| Requirement | 요약 | 분류 | 처리 방법 / 제외 사유 | 확인 방법 |
|---|---|---|---|---|
| REQ-NFR-CONTENT-001 | 여행지 상세 SEO 메타데이터(title/description/canonical/OG) | IMPLEMENT | Next.js Metadata API로 페이지별 생성 | Playwright/수동 meta 태그 확인 |
| REQ-NFR-CONTENT-002 | 안전정보·변동 정보의 출처·최종 확인일 표시 | IMPLEMENT | 정적 데이터 필드를 페이지에 렌더링 | 수동 QA |
| REQ-NFR-CONTENT-003 | 게시 전 완전성 검사 통과 의무 | EXCLUDED | REQ-FUNC-ADMIN-002와 동일 사유(CMS 제외, 코드 리뷰로 대체) | — |
| REQ-NFR-CONTENT-004 | 이미지·텍스트 출처 정보 관리자 DB 보존 | EXCLUDED | REQ-FUNC-ADMIN-005와 동일 사유(미디어 워크플로 제외) | — |
| REQ-NFR-CONTENT-005 | 여행경보·비자·검역·보건 콘텐츠의 공식 기관 직접 확인 안내 | IMPLEMENT | 해당 콘텐츠 영역에 고정 안내 문구 컴포넌트 배치 | 수동 QA |

---

## 6. 요구사항 요약 집계

| 구분 | 전체 | IMPLEMENT | EXCLUDED |
|---|---:|---:|---:|
| 기능 요구사항 (REQ-FUNC) | 42 | 36 | 6 |
| 비기능 요구사항 (REQ-NFR) | 35 | 25 | 10 |
| 합계 | 77 | 61 | 16 |

EXCLUDED 16건은 모두 §4 "제외 기능과 사유"의 6개 원칙(전체 콘텐츠 CMS, 미디어 업로드·라이선스 워크플로, 범용 감사 로그, 자동 백업·장애 알림·부하 테스트, 외부 이메일 사업자 연동, 그리고 12개 필수 구현 범위 밖 보안/개인정보/관측성 항목)으로 설명된다.

---

## 7. Playwright 핵심 Smoke Test 범위

| # | 시나리오 | 관련 Requirement |
|---|---|---|
| 1 | 여행지 국내/해외 탭 전환 및 필터 적용 후 결과 확인 | REQ-FUNC-DEST-001, -002, -004 |
| 2 | 여행지 상세 진입 → 해외 여행지의 국가 안전정보 패널 이동 | REQ-FUNC-DEST-003, -005, REQ-FUNC-SAFETY-001~005 |
| 3 | 항공 조건 입력 → 검증 오류 → 정상 입력 → 요약 확인 → 외부 사이트 새 탭 이동 | REQ-FUNC-FLIGHT-001~006 |
| 4 | 호텔 조건 입력 → 검증 오류 → 정상 입력 → 요약 확인 → 외부 사이트 새 탭 이동 | REQ-FUNC-HOTEL-001~007 |
| 5 | 회원가입/로그인 → 성인 확인 → 동행 모집글 작성(안전수칙 동의, 연락처 탐지 차단 포함) | REQ-FUNC-MATE-001, -003, -009 |
| 6 | 비회원으로 동행 목록·상세 열람(연락처 비노출 확인) | REQ-FUNC-MATE-002 |
| 7 | 참가 요청 제출 → 중복 제출 차단 → 작성자 승인/거절 | REQ-FUNC-MATE-004, -005 |
| 8 | 신고 제출(접수번호 확인) 및 차단 설정(상호 비노출 확인) | REQ-FUNC-MATE-006, -007 |
| 9 | 대표 소개 페이지 핵심 정보·방문 국가 연결 확인 | REQ-FUNC-ABOUT-001~003 |
| 10 | 마이페이지에서 즐겨찾기·참가 요청·차단 목록 확인, 관리자 탭에서 신고 상태 변경·외부 URL 설정 변경 | REQ-FUNC-ADMIN-003, REQ-NFR-SEC-004 |

---

## 8. 배포

Vercel에 배포한다. 환경변수로 Supabase 프로젝트 URL/키를 관리하며, 항공·호텔 외부 랜딩 URL은 관리자 탭(REQ-NFR-SEC-004)을 통해 배포 없이 교체 가능하도록 한다. 별도 인프라(EC2/AWS), 업타임 모니터링, 부하 테스트, 자동 백업 체계는 이번 범위에 포함하지 않는다.
