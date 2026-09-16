# Free Traveler Design Manifest

- **Active Design Version:** D-001
- **Status:** LOCKED
- **Active File:** `design-reference/D-001/DESIGN.md`
- **Vendor Reference:** `design-reference/vendor/airbnb/DESIGN-airbnb.md` (구조적 원칙만 참고, 상표·색상·서체·예약 UI 미차용)
- **작성 근거 문서:** `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`
- **Stitch Project:** `projects/15949217418208964102` ("Free Traveler")
- **최종 갱신일:** 2026-09-15

이 문서는 D-001을 **현재 유효한 유일한 디자인 정본**으로 고정(LOCK)한다. 이후 모든 화면 작업, Stitch 재생성, 코드 구현은 `design-reference/D-001/DESIGN.md`의 토큰과 규칙을 따라야 하며, 이 문서와 충돌하는 새 디자인 결정은 D-001을 개정(버전 상향, 예: D-002)한 뒤에만 반영한다.

> **범위에 대한 주석:** 아래 "Approved Screens"·"Mobile Variants"는 `docs/04_UIUX_PLAN.md`가 정의한 **디자인 적용 대상 목표 범위**(5개 Screen + 2개 Mobile 변형)를 의미한다. D-001의 토큰·Section 계약(§18)은 이 5개 화면 전체를 대상으로 작성되었다. 다만 `docs/STITCH_VALIDATION_REPORT.md`(2026-09-15) 기준으로 **일부 화면은 Stitch 산출물이 아직 존재하지 않거나 검증이 완료되지 않았다** — 화면별 실제 상태는 아래 표를 따른다. "목표 범위에 포함"과 "Stitch에서 생성·검증 완료"는 별개이며, 미생성 화면에 실제로 구현/생성 작업을 할 때도 D-001의 규칙을 그대로 적용해야 한다.

---

## Approved Screens (디자인 적용 목표 범위: SCR-001~SCR-005)

| Screen | 경로 | 목표 범위 포함 | Stitch 생성 상태 | 검증 판정 | Screen ID |
|---|---|---|---|---|---|
| SCR-001 | `/` | 예 | 생성됨, 캔버스 배치됨 | NEEDS_REVISION (Footer 수정 반영 미확인) | `projects/15949217418208964102/screens/f72a6aac65f54d7dbf5834e9afef6280` |
| SCR-002 | `/about` | 예 | 생성됨, 캔버스 배치됨 | NEEDS_REVISION (Footer 수정 반영 미확인) | `projects/15949217418208964102/screens/ef9bd6af97fd4fc6bcec021f9f53e576` |
| SCR-003 | `/travel-tools` | 예 | 생성됨(콘텐츠 완성), **캔버스 미배치** | BLOCKED | 원본: `.../screens/28f39b90aad64b86bb79bcafd0c3f1b5` (Footer 미수정) / 편집본: `.../screens/d76e0683946149679fe25a5314000b20` (Footer 수정 확인됨, 대표 버전) |
| SCR-004 | `/mates` | 예 | **미생성**(Stitch 서비스 반복 타임아웃) | BLOCKED | 없음 |
| SCR-005 | `/account` | 예 | **미생성** | BLOCKED | 없음 |

## Mobile Variants (디자인 적용 목표 범위: SCR-001, SCR-003)

| Screen | Breakpoint | 목표 범위 포함 | Stitch 생성 상태 | Screen ID |
|---|---|---|---|---|
| SCR-001 Mobile | 390px | 예 | **미생성** | 없음 |
| SCR-003 Mobile | 390px | 예 | **미생성** | 없음 |

---

## 상태 정의

- **생성됨 + 캔버스 배치됨:** Stitch 프로젝트 캔버스(`screenInstances`)에 포함되어 Stitch 편집기에서 정상적으로 열람 가능
- **생성됨 + 캔버스 미배치:** 화면 콘텐츠(HTML)는 존재하고 `get_screen`으로 개별 조회는 가능하나, 캔버스에 표시되지 않아 Stitch 편집기 UI에서 다른 화면과 함께 노출되지 않을 수 있음
- **미생성:** Stitch에 해당 화면 리소스 자체가 존재하지 않음

## 다음 조치 (사람 확인 필요)

1. SCR-001·SCR-002: Stitch 웹 UI에서 Footer 수정(§9 Header·Footer 규칙 반영)이 실제로 적용되었는지 확인
2. SCR-003: 중복 리소스(`28f39b90...` vs `d76e0683...`) 중 `d76e0683...`(Footer 수정 완료본)를 대표 버전으로 채택하고 캔버스에 배치, 원본은 정리
3. SCR-004, SCR-005, Mobile 변형 2개: Stitch 서비스가 안정된 이후 D-001 §18 Section 계약 기준으로 재생성
4. 신규 생성·재생성 시 반드시 D-001의 Design System(`assets/13684534912569787626`)을 적용하고, 본 Manifest의 상태 표를 갱신할 것

---

## 금지 사항 (D-001과 동일, 재확인)

- Airbnb 상표 요소(정확한 색상값, Cereal/Circular 서체, 워드마크, "Guest favorite" 류 배지) 재현 금지
- 구매·예약·결제 UI 추가 금지(외부 사이트 연결만 허용)
- Proprietary 폰트 파일 추가 금지(Inter + 시스템 한글 폰트 폴백만 사용)
- D-001에 정의되지 않은 임의 색상 토큰 추가 금지
