# PAGE-SCR002 — `/about` 대표 소개 조립

- **Category:** PAGE_OWNER (Page Owner — Route Page 조립)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 2

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 2)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. `/about` 대표 소개 조립은(는) SCR-002(`/about`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

## Requirement Ref

- `REQ-FUNC-ABOUT-001`
- `REQ-FUNC-ABOUT-002`
- `REQ-FUNC-ABOUT-003`

## Screen / Route / Page Entry

- **Screen:** SCR-002
- **Route:** `/about`
- **Page Entry:** `src/app/about/page.tsx`

## Design Ref

- `design-reference/D-001/DESIGN.md` §18(화면별 Section 순서·최소 콘텐츠 수), §7(Desktop·Mobile 규칙), §17(완성형 Empty State)
- `design-reference/UI_CONTRACT.md` SCR-002 절(영역 순서·주요 Component·상태·이동·금지 기능)
- `design-reference/SCREEN_ROUTE_CONTRACT.json` screens[] 중 SCR-002 항목(route/page_entry 정본)

## Depends On

- `COMP-COMMON-HEADER` — 공통 Header(내비게이션+계정 진입)
- `COMP-COMMON-FOOTER` — 공통 Footer(3컬럼+하단 바)
- `COMP-SCR002-PROFILE-HERO` — 대표 Hero
- `COMP-SCR002-METRICS` — 여행 지표 숫자 카드 2개
- `COMP-SCR002-PHILOSOPHY` — 소개·철학 좌우 분할
- `COMP-SCR002-TIMELINE` — 여행 Timeline 6개 이상
- `COMP-SCR002-COUNTRY-CHIPS` — 방문 국가 Chip(30개국, 4권역)
- `COMP-SCR002-GALLERY` — 여행 사진 Gallery 8장 이상
- `COMP-SCR002-MEMORABLE-CTA` — 기억에 남는 여행지 4개 + CTA Banner
- `DATA-REPRESENTATIVE` — 대표 소개 정적 데이터

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/app/about/page.tsx`

## Functional AC

Section 순서: Header→Profile Hero(DATA-REPRESENTATIVE)→여행 지표(50+ Trips/30+ Countries)→소개·철학(좌우 분할)→Timeline 6개 이상→방문 국가 30개국(4권역 Chip)→Gallery 8개 이상→기억에 남는 여행지 4개+CTA→Footer. 모든 Section 데이터는 DATA-REPRESENTATIVE 단일 소스에서 조회(수치 불일치 금지, Risk R-07 대응)

## Visual AC

Desktop(Gallery 4열, 좌우 분할 유지)·Mobile(Gallery 2열, 좌우 분할→세로 스택) 반응형 밀도. Lorem ipsum·"준비 중"·내용 없는 Card 금지(전체 정적 콘텐츠이므로 Empty State 해당 없음, 이미지 로드 실패 시 대체 배경+alt만 허용)

## Security/Privacy AC

이미지 대체텍스트 필수(ACC-002), 실제 인물 얼굴 특정 오인 방지 표현

## Test Cases

- **TC-01:** Section 순서: Header→Profile Hero(DATA-REPRESENTATIVE)→여행 지표(50+ Trips/30+ Countries)→소개·철학(좌우 분할)→Timeline 6개 이상→방문 국가 30개국(4권역 Chip)→Gallery 8개 이상→기억에 남는 여행지 4개+CTA→Footer 여부를 확인한다.
- **TC-02:** 모든 Section 데이터는 DATA-REPRESENTATIVE 단일 소스에서 조회(수치 불일치 금지, Risk R-07 대응) 여부를 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)
- `CHECK-MANUAL-ACCESSIBILITY` — 접근성 수동 확인(브라우저)

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
- **하위 Component·Data·API 파일을 이 Task에서 직접 생성하지 않는다.** Depends On에 명시된 Task들이 이미 제공하는 결과물을 Route Page에서 조립하는 것만 이 Task의 범위다.
