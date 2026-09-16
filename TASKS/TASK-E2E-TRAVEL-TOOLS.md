# E2E-TRAVEL-TOOLS — 여행 준비 Smoke(항공·숙소·Tip)

- **Category:** E2E_TEST (E2E Test(Playwright Chromium))
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 58

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 58)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 여행 준비 Smoke(항공·숙소·Tip)은(는) SCR-003(`/travel-tools`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

`docs/PROJECT_SCOPE.md` §3 "테스트" 원칙 및 §7 Playwright 핵심 Smoke Test 범위: Chromium 프로젝트에서만 실행하는 핵심 사용자 흐름 Smoke Test다. Firefox/WebKit 등 다른 브라우저 프로젝트나 시각적 회귀 테스트를 추가하지 않는다.

## Requirement Ref

- `REQ-FUNC-FLIGHT-001`
- `REQ-FUNC-FLIGHT-002`
- `REQ-FUNC-FLIGHT-003`
- `REQ-FUNC-FLIGHT-004`
- `REQ-FUNC-FLIGHT-005`
- `REQ-FUNC-FLIGHT-006`
- `REQ-FUNC-HOTEL-001`
- `REQ-FUNC-HOTEL-002`
- `REQ-FUNC-HOTEL-003`
- `REQ-FUNC-HOTEL-004`
- `REQ-FUNC-HOTEL-005`
- `REQ-FUNC-HOTEL-006`
- `REQ-FUNC-HOTEL-007`
- `REQ-NFR-SEC-002`
- `REQ-NFR-SEC-003`

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** `/travel-tools`
- **Page Entry:** N/A

## Design Ref

- 해당 없음(비UI, Playwright 테스트). `docs/PROJECT_SCOPE.md` §7 Playwright 핵심 Smoke Test 범위

## Depends On

- `PAGE-SCR003` — `/travel-tools` 통합 여행 준비 조립
- `API-EXTERNAL-URLS` — 외부 URL 설정 저장/조회 API

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `tests/e2e/travel-tools.spec.ts`

## Functional AC

Chromium만. 흐름: (4)항공 조건입력→검증오류→정상입력→요약→외부사이트 새 탭 이동 (5)호텔 동일 흐름

## Visual AC

(해당 없음 — 비UI Task)

## Security/Privacy AC

(해당 없음 — 별도 보안/개인정보 취급 요소 없음)

## Test Cases

- **TC-01:** Chromium만 여부를 확인한다.
- **TC-02:** 흐름: (4)항공 조건입력→검증오류→정상입력→요약→외부사이트 새 탭 이동 (5)호텔 동일 흐름 여부를 확인한다.
- **TC-03:** 위 시나리오가 실패(회귀)할 경우 CI에서 실패로 표시되는지 확인한다.

## Verify

- 자체(Playwright assertion)

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
- Chromium 외 브라우저(Firefox/WebKit) 테스트 프로젝트를 추가하지 않는다. Smoke 목적을 벗어나는 시각적 회귀·크로스브라우저 테스트를 추가하지 않는다.
