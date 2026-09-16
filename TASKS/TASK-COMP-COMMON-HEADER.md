# COMP-COMMON-HEADER — 공통 Header(내비게이션+계정 진입)

- **Category:** COMPONENT (Component — 5개 Screen 공통 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 64

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 64, §2-1)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 5개 Screen(SCR-001~SCR-005) 모두 Section 순서가 공통 Header로 시작하며(`design-reference/UI_CONTRACT.md` 각 Screen 절 "영역 순서"), `design-reference/D-001/DESIGN.md` §9는 "Header(공통, 5개 화면 모두 동일)"로 명시한다. 이 Component는 화면마다 다르게 구현하지 않고 그대로 재사용된다(`design-reference/UI_CONTRACT.md` §"공통 규칙" — "Header·Footer는 D-001 §9를 그대로 따르며 화면마다 다르게 구현하지 않는다"). 2026-09-16 감사에서, 5개 `PAGE-SCR0NN`이 전부 Header를 필요로 하는데도 이를 만드는 Task가 없었던 누락을 발견해 신설했다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-NFR-ACC-003` (검색·폼 입력·모달 닫기 등과 함께 내비게이션의 키보드 조작 가능성)
- `REQ-NFR-ACC-006` (모바일 터치 대상 최소 24×24 CSS px — 모바일 시트 내비 항목 44px 이상)

## Screen / Route / Page Entry

- **Screen:** 공통(SCR-001~SCR-005 전체, 특정 Screen에 귀속되지 않음)
- **Route:** -
- **Page Entry:** N/A(Page Entry 자체가 아니라 5개 Page Entry가 공통으로 import하는 Component)

## Design Ref

- `design-reference/D-001/DESIGN.md` §9(Header·Footer — Desktop/Mobile 규격, 좌/중앙/우 영역 구성)
- `design-reference/D-001/DESIGN.md` §6(Shadow — Header는 flat, 그림자 없음)
- `design-reference/D-001/DESIGN.md` §7(Desktop·Mobile 규칙 — Header 높이 72px/56px sticky)
- `design-reference/UI_CONTRACT.md` "공통 규칙" 및 각 Screen 절 "영역 순서"(Header 공통 진입점), `required_navigation`의 `common_header` 항목(`design-reference/SCREEN_ROUTE_CONTRACT.json`)

## Depends On

- `AUTH-SUPABASE-CLIENT` — 로그인 세션 상태를 읽어 계정 버튼(로그인/닉네임 아바타/관리자 배지)을 표시하기 위한 선행 Task

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/common/Header.tsx`

## Functional AC

- Desktop: 좌측 코랄 점 아이콘 + "Free Traveler" 워드마크(클릭 시 `/`) · 중앙 내비 4개(홈·대표 소개·여행 준비·동행 찾기, 현재 위치는 코랄 밑줄로 표시) · 우측 계정 진입 버튼(비로그인 시 "로그인", 로그인 시 닉네임 이니셜 아바타 + 관리자 배지[관리자인 경우만], 클릭 시 SCR-005(`/account`)로 이동).
- Mobile: 축약 워드마크 + 계정 아이콘 + 햄버거 버튼. 햄버거 시트를 열면 내비 4개가 전체 폭 리스트로 표시되며 항목당 터치 영역 44px 이상.
- 5개 Screen(SCR-001~SCR-005)이 이 Component를 동일하게 재사용하며, Screen별로 다르게 커스터마이징하지 않는다.
- 로그인 세션 상태는 `AUTH-SUPABASE-CLIENT`가 제공하는 클라이언트 세션 구독으로만 읽고, 이 Component 자체는 쓰기 작업(로그인/로그아웃 처리 등)을 수행하지 않는다.

## Visual AC

Desktop 72px · Mobile 56px, 스크롤 시 sticky. 그 외 모든 Header 표면은 flat(그림자 없음) — hover 시에도 `{shadow.tier-1}`을 적용하지 않는다(D-001 §6).

## Security/Privacy AC

계정 버튼은 로그인 세션 상태만 읽는다. Service Role Key 등 서버 전용 키를 이 Client 하위 요소에 포함하지 않는다.

## Test Cases

- **TC-01:** Desktop에서 내비 4개 링크가 각각 올바른 Route로 이동하는지 확인한다.
- **TC-02:** 비로그인 상태에서 계정 버튼이 "로그인"으로 표시되고 클릭 시 SCR-005로 이동하는지 확인한다.
- **TC-03:** 로그인 상태에서 닉네임 이니셜 아바타(관리자는 관리자 배지 포함)가 표시되는지 확인한다.
- **TC-04:** Mobile 뷰에서 햄버거 시트를 열었을 때 내비 4개 항목이 전체 폭으로, 항목당 44px 이상 터치 영역으로 표시되는지 확인한다.
- **TC-05:** 스크롤 시 Header가 sticky로 고정되고 그림자가 추가되지 않는지 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)
- `E2E-TRAVEL-TOOLS` — 여행 준비 Smoke(항공·숙소·Tip)
- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke

## Definition of Done

- [ ] Functional AC 전부 충족
- [ ] Visual AC 전부 충족
- [ ] Security/Privacy AC 전부 충족
- [ ] Verify에 명시된 Task가 통과함
- [ ] Expected Files 목록에 명시된 파일만 추가·수정됨(그 밖의 파일 변경 없음)
- [ ] `design-reference/D-001/DESIGN.md`·`design-reference/UI_CONTRACT.md` 규칙과 상충하지 않음
- [ ] Depends On에 명시된 Task가 모두 완료된 상태에서 작업을 시작함
- [ ] 5개 `PAGE-SCR0NN`이 이 Component를 화면마다 다르게 구현하지 않고 그대로 import해 조립할 수 있음

## Forbidden

- **Expected Files 목록 밖의 파일을 생성·수정하지 않는다.**
- Airbnb 상표 요소(정확한 색상값·서체·워드마크·배지 문구), 구매·예약·결제 UI를 추가하지 않는다.
- Proprietary(독점) 폰트 파일을 추가하지 않는다(Inter + 시스템 한글 폰트 폴백만 사용).
- `design-reference/D-001/DESIGN.md`에 정의되지 않은 임의의 색상·타이포그래피·Radius·Shadow 토큰을 추가하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 등 placeholder 문구를 두지 않는다.
- Header에 hover 이상의 elevation(그림자 tier)을 추가하지 않는다(D-001 §6, flat 유지).
- Screen별로 Header 내용을 다르게 분기하지 않는다(5개 Screen 공통 재사용 원칙).
- Service Role Key 등 서버 전용 키를 Client Component에 포함하지 않는다.
