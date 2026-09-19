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
    // Header 내비·Footer에도 "대표 소개" 링크가 있어 <main> 안의 요약 Section
    // CTA로 범위를 좁힌다(strict mode 다중 매치 방지).
    const aboutCta = page
      .getByRole("main")
      .getByRole("link", { name: /대표\s*소개/ });
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

// 항공/숙소 폼 모두 출발일(또는 체크인)을 내일 날짜로 채워야 "과거 날짜" 검증을 피할 수 있다.
function tomorrowDateInputValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

test.describe("E2E-003 여행 도구 — 항공 외부 이동 안내", () => {
  test("유효한 입력 후 확인 Dialog를 거쳐 새 탭이 열린다", async ({ page }) => {
    await page.goto("/travel-tools");

    // REQ-FUNC-FLIGHT-001~004: 필수 4개 필드를 채우기 전에는 이동 버튼이 비활성화된다.
    const searchButton = page.getByRole("button", {
      name: /항공편\s*보러\s*가기/,
    });
    await expect(searchButton).toBeDisabled();

    const tomorrow = tomorrowDateInputValue();
    await page.getByLabel("국가").fill("일본");
    await page.getByLabel("지역").fill("도쿄");
    await page.getByLabel("출발일").fill(tomorrow);
    await page.getByLabel("귀국일").fill(tomorrow);

    await expect(searchButton).toBeEnabled();
    await searchButton.click();

    // 외부 이동 전 안내 Dialog: 입력값이 외부로 전달되지 않는다는 고지를 포함한다.
    const dialog = page.getByRole("dialog", {
      name: /항공편\s*외부\s*이동\s*확인/,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/전달되지\s*않습니다/)).toBeVisible();

    // 확인 시 새 탭(target=_blank·noopener 상당)이 열린다. 실제 외부 사이트 내용은 검사하지 않는다.
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      dialog.getByRole("button", { name: /항공편\s*보러\s*가기/ }).click(),
    ]);
    expect(popup.url()).toMatch(/^https?:\/\//);
    await popup.close();
  });
});

test.describe("E2E-004 여행 도구 — 숙소 외부 이동 안내", () => {
  test("유효한 입력 후 확인 Dialog를 거쳐 새 탭이 열린다", async ({ page }) => {
    await page.goto("/travel-tools");

    const hotelTab = getTabButton(page, /숙소|호텔/);
    await hotelTab.first().click();

    // REQ-FUNC-HOTEL-001~004: 필수 4개 필드를 채우기 전에는 이동 버튼이 비활성화된다.
    const searchButton = page.getByRole("button", {
      name: /숙소\s*보러\s*가기/,
    });
    await expect(searchButton).toBeDisabled();

    const checkIn = tomorrowDateInputValue();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 2);
    const checkOut = checkOutDate.toISOString().slice(0, 10);

    await page.getByLabel("국가").fill("태국");
    await page.getByLabel("지역").fill("방콕");
    await page.getByLabel("체크인").fill(checkIn);
    await page.getByLabel("체크아웃").fill(checkOut);

    await expect(searchButton).toBeEnabled();
    await searchButton.click();

    const dialog = page.getByRole("dialog", {
      name: /숙소\s*외부\s*이동\s*확인/,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/전달되지\s*않습니다/)).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      dialog.getByRole("button", { name: /숙소\s*보러\s*가기/ }).click(),
    ]);
    expect(popup.url()).toMatch(/^https?:\/\//);
    await popup.close();
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
