# COMP-SCR003-HOTEL-FORM — 숙소 조건 입력·검증·요약·외부이동

- **Category:** COMPONENT (Component — 화면 구성 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 23

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 23)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 숙소 조건 입력·검증·요약·외부이동은(는) SCR-003(`/travel-tools`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-HOTEL-001`
- `REQ-FUNC-HOTEL-002`
- `REQ-FUNC-HOTEL-003`
- `REQ-FUNC-HOTEL-004`
- `REQ-FUNC-HOTEL-005`
- `REQ-FUNC-HOTEL-006`
- `REQ-FUNC-HOTEL-007`
- `REQ-NFR-SEC-002`
- `REQ-NFR-SEC-003`
- `REQ-NFR-ACC-005`

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** `/travel-tools`
- **Page Entry:** N/A

## Design Ref

- `design-reference/D-001/DESIGN.md` §2(Color Token) §3(Typography) §4(Spacing) §5(Radius) §6(Shadow) — 임의 토큰 추가 금지
- `design-reference/D-001/DESIGN.md` §12(Form·Tabs)
- `design-reference/UI_CONTRACT.md` SCR-003 절

## Depends On

- `API-EXTERNAL-URLS` — 외부 URL 설정 저장/조회 API

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/scr003/HotelForm.tsx`

## Functional AC

국가·지역·체크인·체크아웃 필수값 검증(HOTEL-001), 과거 체크인/체크아웃≤체크인 차단(HOTEL-002), 요약+비전달 고지(HOTEL-003), "숙소 보러 가기" 새 탭 이동(HOTEL-004), URL 오류 시 재시도 UI(HOTEL-007)

## Visual AC

FlightForm과 동일 좌우 분할/스택 패턴

## Security/Privacy AC

입력값 URL·본문·쿠키·서버 미전송(HOTEL-005,006), `noopener noreferrer`(SEC-002)

## Test Cases

- **TC-01:** 국가·지역·체크인·체크아웃 필수값 검증(HOTEL-001) 여부를 확인한다.
- **TC-02:** 과거 체크인/체크아웃≤체크인 차단(HOTEL-002) 여부를 확인한다.
- **TC-03:** 요약+비전달 고지(HOTEL-003) 여부를 확인한다.
- **TC-04:** "숙소 보러 가기" 새 탭 이동(HOTEL-004) 여부를 확인한다.
- **TC-05:** URL 오류 시 재시도 UI(HOTEL-007) 여부를 확인한다.

## Verify

- `UNIT-TRAVEL-DATES` — 날짜 검증 Unit Test
- `E2E-TRAVEL-TOOLS` — 여행 준비 Smoke(항공·숙소·Tip)

## Definition of Done

- [ ] Functional AC 전부 충족
- [ ] Visual AC 전부 충족(해당 사항이 있는 경우)
- [ ] Security/Privacy AC 전부 충족(해당 사항이 있는 경우)
- [ ] Verify에 명시된 Task가 통과함
- [ ] Expected Files 목록에 명시된 파일만 추가·수정됨(그 밖의 파일 변경 없음)
- [ ] `design-reference/D-001/DESIGN.md`·`design-reference/UI_CONTRACT.md` 규칙과 상충하지 않음
- [ ] Depends On에 명시된 Task가 모두 완료된 상태에서 작업을 시작함
- [ ] Requirement Ref로 연결된 모든 Requirement의 관련 동작이 구현·검증됨

## Forbidden

- **Expected Files 목록 밖의 파일을 생성·수정하지 않는다.**
- Airbnb 상표 요소(정확한 색상값·서체·워드마크·배지 문구), 구매·예약·결제 UI를 추가하지 않는다.
- Proprietary(독점) 폰트 파일을 추가하지 않는다(Inter + 시스템 한글 폰트 폴백만 사용).
- `design-reference/D-001/DESIGN.md`에 정의되지 않은 임의의 색상·타이포그래피·Radius·Shadow 토큰을 추가하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 등 placeholder 문구나 내용 없는 빈 Card를 두지 않는다.
- `TASKS/00_TASK_LIST.md` §16 `NON_IMPLEMENTATION`에 등재된 EXCLUDED Requirement에 대응하는 기능(콘텐츠 CRUD, 감사 로그, 관리자 Dashboard·통계, MFA, 이메일 발송 연동 등)을 구현하지 않는다.
- 항공·숙소 입력값을 서버 DB, URL 쿼리, 쿠키, 요청 본문 등 어떤 형태로도 외부에 전달하지 않는다. 실제 항공/호텔 검색 API, 가격 비교, 예약 UI를 구현하지 않는다.
