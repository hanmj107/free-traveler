import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * E2E-PUBLIC-SMOKE — 로그인 없이 확인 가능한 공개 화면 Smoke(E2E-001~005).
 *
 * design-reference/SCREEN_ROUTE_CONTRACT.json·design-reference/UI_CONTRACT.md·
 * docs/02_SRS_BASELINE.md(REQ-FUNC-FLIGHT-004/HOTEL-004 등)에 명시된 계약을 기준으로 작성했다.
 * PAGE-SCR001~003이 아직 구현되지 않은 단계에서는 이 파일이 실패하는 것이 정상이다
 * — 구현 완료 후 실제로 PASS하는지가 이 Smoke의 목적이며, 통과를 미리 조작하지 않는다.
 *
 * Selector 우선순위: role/accessible name(getByRole) > label(getByLabel) > test id
 * (getByTestId). CSS 구조·텍스트 위치에 의존하지 않는다.
 * 외부 사이트(항공/숙소)는 실제 새 탭으로 이동해 내용을 검사하지 않는다 — href·target·rel
 * 속성만 확인한다. 이미지 출처 URL의 응답 상태는 검사하지 않는다.
 */

// SCR-003 탭은 <button> 요소로 구현되며(D-001 §12), 실제 role이 "tab"/"button" 중 무엇이든
// 이름으로 안정적으로 찾을 수 있게 두 role을 함께 시도한다.
function getTabButton(page: Page, name: RegExp): Locator {
  return page.getByRole("tab", { name }).or(page.getByRole("button", { name }));
}

test.describe("E2E-001 메인 페이지의 추천 여행지와 주요 CTA", () => {
  test("추천 여행지 카드와 대표 소개 CTA가 보인다", async ({ page }) => {
    await page.goto("/");

    // 추천 여행지(국내/해외 인기 여행지) 카드는 이미지+대체텍스트로 렌더링된다(REQ-NFR-ACC-002).
    await expect(page.getByRole("img").first()).toBeVisible();

    // 주요 CTA: "대표 소개 보기" -> SCR-002(/about).
    // (design-reference/SCREEN_ROUTE_CONTRACT.json required_navigation: SCR-001 free_traveler
    //  요약 Section -> SCR-002, trigger "대표 소개 보기" 버튼)
    const aboutCta = page.getByRole("link", { name: /대표\s*소개/ });
    await expect(aboutCta).toBeVisible();
    await expect(aboutCta).toHaveAttribute("href", "/about");
  });
});

test.describe("E2E-002 대표 소개 핵심 정보", () => {
  test("free_traveler·50회 이상·30개국 이상 정보가 보인다", async ({
    page,
  }) => {
    await page.goto("/about");

    // docs/01_PRD.md §6-1·§6-3: 대표명 free_traveler, "50+ Trips"/"50회 이상",
    // "30+ Countries"/"30개국 이상" 수치는 고정 문구다.
    await expect(page.getByText(/free_traveler/i).first()).toBeVisible();
    await expect(page.getByText(/50\s*\+|50회\s*이상/).first()).toBeVisible();
    await expect(page.getByText(/30\s*\+|30개국\s*이상/).first()).toBeVisible();
  });
});

test.describe("E2E-003 여행 도구 — 항공 외부 이동 안내", () => {
  test("항공편 보러 가기 링크가 새 탭·href를 갖는다", async ({ page }) => {
    await page.goto("/travel-tools");

    const flightTab = getTabButton(page, /항공/);
    if ((await flightTab.count()) > 0) {
      await flightTab.first().click();
    }

    // REQ-FUNC-FLIGHT-004: "항공편 보러 가기" 선택 시 외부 항공 사이트를 새 탭(target=_blank,
    // rel=noopener noreferrer)으로 연다. 실제 외부 사이트 이동·내용 검사는 하지 않는다.
    const flightCta = page.getByRole("link", { name: /항공편\s*보러\s*가기/ });
    await expect(flightCta).toBeVisible();
    await expect(flightCta).toHaveAttribute("target", "_blank");
    await expect(flightCta).toHaveAttribute("rel", /noopener/);
    await expect(flightCta).toHaveAttribute("href", /.+/);
  });
});

test.describe("E2E-004 여행 도구 — 숙소 외부 이동 안내", () => {
  test("호텔 보러 가기 링크가 새 탭·href를 갖는다", async ({ page }) => {
    await page.goto("/travel-tools");

    const hotelTab = getTabButton(page, /숙소|호텔/);
    if ((await hotelTab.count()) > 0) {
      await hotelTab.first().click();
    }

    // REQ-FUNC-HOTEL-004: "호텔 보러 가기" 선택 시 외부 호텔 사이트를 새 탭으로 연다.
    const hotelCta = page.getByRole("link", { name: /호텔\s*보러\s*가기/ });
    await expect(hotelCta).toBeVisible();
    await expect(hotelCta).toHaveAttribute("target", "_blank");
    await expect(hotelCta).toHaveAttribute("rel", /noopener/);
    await expect(hotelCta).toHaveAttribute("href", /.+/);
  });
});

test.describe("E2E-005 비로그인 동행글 작성 — 로그인 안내", () => {
  test("동행 구하기 탭에서 로그인 안내가 표시되고 작성 폼은 보이지 않는다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const mateTab = getTabButton(page, /동행/);
    if ((await mateTab.count()) > 0) {
      await mateTab.first().click();
    }

    // REQ-FUNC-MATE-001·COMP-SCR003-LOGIN-GUARD: 비로그인 상태에서는 작성 폼 대신
    // 로그인 유도 안내(링크 또는 버튼)가 표시된다.
    const loginPrompt = page
      .getByRole("link", { name: /로그인/ })
      .or(page.getByRole("button", { name: /로그인/ }));
    await expect(loginPrompt.first()).toBeVisible();

    // 작성 폼의 필수 입력(제목)은 비로그인 상태에서 노출되지 않아야 한다.
    await expect(page.getByLabel(/제목/)).toHaveCount(0);
  });
});
