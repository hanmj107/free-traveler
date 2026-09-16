# COMP-SCR001-DEST-DRAWER — 여행지 상세 Drawer + 안전정보 패널

- **Category:** COMPONENT (Component — 화면 구성 요소)
- **Priority:** P0
- **Implementation Status:** IN_SCOPE_PENDING
- **TASKS/00_TASK_LIST.md 참조:** Seq 11

## Context

이 Task는 `TASKS/00_TASK_LIST.md`(Seq 11)에 정의된 구현 Task를 실제로 개발 가능한 단위로 상세화한 것이다. 여행지 상세 Drawer + 안전정보 패널은(는) SCR-001(`/`)에서 사용되며, `docs/06_SRS_UIUX_REVISED.md`가 확정한 Screen/Route 배치를 따른다.

## Project Scope

**IMPLEMENT** — `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`에서 이번 범위 구현 대상으로 확정됨.

`docs/PROJECT_SCOPE.md` §3 "안전정보 최신성 경고" 원칙: 별도 배치 없이 렌더링 시점에 `last_verified_at`과 현재일의 차이를 계산해 7일 초과 경고를 표시한다.

## Requirement Ref

- `REQ-FUNC-DEST-003`
- `REQ-FUNC-DEST-005`
- `REQ-FUNC-SAFETY-001`
- `REQ-FUNC-SAFETY-002`
- `REQ-FUNC-SAFETY-003`
- `REQ-NFR-CONTENT-002`
- `REQ-NFR-CONTENT-005`
- `REQ-NFR-SEC-002`
- `REQ-NFR-ACC-002`

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** `/`
- **Page Entry:** N/A

## Design Ref

- `design-reference/D-001/DESIGN.md` §2(Color Token) §3(Typography) §4(Spacing) §5(Radius) §6(Shadow) — 임의 토큰 추가 금지
- `design-reference/D-001/DESIGN.md` §14(Drawer·Modal)
- `design-reference/D-001/DESIGN.md` §11(Destination Card)
- `design-reference/UI_CONTRACT.md` SCR-001 절

## Depends On

- `DATA-DESTINATIONS` — 여행지 정적 데이터
- `DATA-SAFETY` — 국가별 안전정보 정적 데이터

## Expected Files

이 Task가 생성·수정할 수 있는 파일은 아래로 한정한다. **목록 밖의 파일은 수정하지 않는다.**

- `src/components/scr001/DestinationDrawer.tsx`
- `src/components/scr001/SafetyInfoPanel.tsx`

## Functional AC

§3-4 필수 11개 항목(소개 300자+·대표이미지·명소 5개+·추천시기·일정·예산·교통·음식 3개+·에티켓 3개+·안전정보 연결[해외]·출처/수정일) 전부 렌더링. 안전정보 패널 전환 시 6개 카테고리+최종 확인일, 확인일 7일 초과 시 렌더링 시점 계산으로 경고 표시(SAFETY-003). 공식 출처 링크 새 탭 제공(SAFETY-002)

## Visual AC

Desktop 우측 슬라이드 480~560px / Mobile 전체화면 Bottom Sheet, `rounded-lg` 상단 모서리

## Security/Privacy AC

외부 출처 링크 `noopener noreferrer`(SEC-002), 이미지 alt 텍스트 필수(ACC-002)

## Test Cases

- **TC-01:** §3-4 필수 11개 항목(소개 300자+·대표이미지·명소 5개+·추천시기·일정·예산·교통·음식 3개+·에티켓 3개+·안전정보 연결[해외]·출처/수정일) 전부 렌더링 여부를 확인한다.
- **TC-02:** 안전정보 패널 전환 시 6개 카테고리+최종 확인일 여부를 확인한다.
- **TC-03:** 확인일 7일 초과 시 렌더링 시점 계산으로 경고 표시(SAFETY-003) 여부를 확인한다.
- **TC-04:** 공식 출처 링크 새 탭 제공(SAFETY-002) 여부를 확인한다.

## Verify

- `E2E-PUBLIC-SMOKE` — 공개 화면 Smoke(여행지·안전정보·대표소개)

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
