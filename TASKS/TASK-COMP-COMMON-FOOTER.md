# COMP-COMMON-FOOTER — 공통 Footer(3컬럼+하단 바)

- **Category:** COMPONENT (Component — 5개 Screen 공통 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 65

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 65, §2-1)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 5개 Screen(SCR-001~SCR-005) 모두 Section 순서가 공통 Footer로 끝나며(`design-reference/UI_CONTRACT.md` 각 Screen 절 "영역 순서"), `design-reference/D-001/DESIGN.md` §9는 "Footer(공통, 정확히 3컬럼 + 하단 바)"로 명시한다. 2026-09-16 감사에서, 5개 `PAGE-SCR0NN`이 전부 Footer를 필요로 하는데도 이를 만드는 Task가 없었던 누락을 발견해 신설했다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

(해당 없음 — 특정 Baseline Requirement에 매핑되지 않는 공통 UI 구조 Task. `COMP-SCR003-INTRO-TABS`, `COMP-SCR004-INTRO-CTA`, `DB-SEED-BASE` 등 기존에도 Requirement Ref 없이 등재된 구조적 Task와 동일한 패턴이다.)

## Screen / Route / Page Entry

- **Screen:** 공통(SCR-001~SCR-005 전체, 특정 Screen에 귀속되지 않음)
- **Route:** -
- **Page Entry:** N/A(Page Entry 자체가 아니라 5개 Page Entry가 공통으로 import하는 Component)

## Design Ref

- `design-reference/D-001/DESIGN.md` §9(Header·Footer — Footer 3컬럼 구성·하단 바 문구)
- `design-reference/D-001/DESIGN.md` §6(Shadow — Footer는 flat, 그림자 없음)
- `design-reference/UI_CONTRACT.md` "공통 규칙"(Header·Footer는 D-001 §9를 그대로 따르며 화면마다 다르게 구현하지 않는다) 및 §"금지 기능"(존재하지 않는 페이지로 연결되는 Footer 링크 금지)

## Depends On

없음(선행 Task 없이 착수 가능)

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/common/Footer.tsx`

## Functional AC

정확히 3컬럼 + 하단 바만 구성한다.
1. **Free Traveler 소개** — "50회 이상의 자유여행, 30개국 이상의 경험을 바탕으로 여행 준비를 돕는 서비스입니다." 1문장 + `/about` 링크.
2. **바로가기** — 홈(`/`)·대표 소개(`/about`)·여행 준비(`/travel-tools`)·동행 찾기(`/mates`)·계정(`/account`, 로그인 상태에 따라 라벨 변경) 정확히 5개 링크만.
3. **이용 안내** — "항공·숙소 링크는 외부 사이트로 연결되며 예약을 대행하지 않습니다.", "국가별 안전정보는 외교부 해외안전여행 공식 자료를 기준으로 확인일을 표기합니다." 2문장, **링크를 넣지 않는다.**
4. 하단 바: "© 2026 Free Traveler" 저작권 문구만.

이용약관·개인정보처리방침·고객센터·서비스 가이드 등 실제로 존재하지 않는 페이지로 연결되는 링크나 컬럼을 추가하지 않는다.

## Visual AC

Desktop 3컬럼 그리드 · Mobile 세로 스택(아코디언 없이 순서대로). flat(그림자 없음, D-001 §6).

## Security/Privacy AC

(해당 없음 — 별도 보안/개인정보 취급 요소 없음. 정적 링크·텍스트만 렌더링)

## Test Cases

- **TC-01:** Footer가 정확히 3컬럼(소개/바로가기/이용 안내) + 하단 바로만 구성되는지 확인한다.
- **TC-02:** "바로가기" 컬럼에 정확히 5개 링크만 존재하고, 존재하지 않는 페이지(이용약관 등)로 연결되는 링크가 없는지 확인한다.
- **TC-03:** "이용 안내" 컬럼에 링크가 없는지 확인한다.
- **TC-04:** Mobile 뷰에서 3컬럼이 아코디언 없이 세로 스택으로 표시되는지 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)
- `E2E-TRAVEL-TOOLS` — 여행 준비 Smoke(항공·숙소·Tip)
- `E2E-MATE-AUTH` — 동행·인증·관리자 Smoke

## Definition of Done

- [ ] Functional AC 전부 충족
- [ ] Visual AC 전부 충족
- [ ] Verify에 명시된 Task가 통과함
- [ ] Expected Files 목록에 명시된 파일만 추가·수정됨(그 밖의 파일 변경 없음)
- [ ] `design-reference/D-001/DESIGN.md`·`design-reference/UI_CONTRACT.md` 규칙과 상충하지 않음
- [ ] 5개 `PAGE-SCR0NN`이 이 Component를 화면마다 다르게 구현하지 않고 그대로 import해 조립할 수 있음

## Forbidden

- **Expected Files 목록 밖의 파일을 생성·수정하지 않는다.**
- 존재하지 않는 페이지(이용약관, 개인정보처리방침, 고객센터, 서비스 가이드 등)로 연결되는 링크나 컬럼을 추가하지 않는다.
- 3컬럼 구조를 벗어나는 추가 컬럼을 만들지 않는다.
- "이용 안내" 컬럼에 링크를 추가하지 않는다.
- Airbnb 상표 요소, 구매·예약·결제 UI를 추가하지 않는다.
- `design-reference/D-001/DESIGN.md`에 정의되지 않은 임의의 색상·타이포그래피·Radius·Shadow 토큰을 추가하지 않는다.
- Footer에 hover 이상의 elevation(그림자 tier)을 추가하지 않는다(D-001 §6, flat 유지).
- Screen별로 Footer 내용을 다르게 분기하지 않는다(5개 Screen 공통 재사용 원칙).
