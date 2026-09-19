import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * E2E-TRAVEL-TOOLS — 여행 준비 Smoke(항공·숙소·Tip, E2E-004~005 흐름).
 *
 * public-smoke.spec.ts(E2E-003/004)가 "정상 입력 → 외부 이동"만 다루는 것과 달리,
 * 이 파일은 Functional AC가 명시한 전체 흐름을 다룬다: 조건 입력 → 검증 오류 →
 * 정상 입력 → 요약(확인 Dialog) → 외부 사이트 새 탭 이동. Chromium 프로젝트에서만
 * 실행한다(docs/PROJECT_SCOPE.md §7).
 */

function getTabButton(page: Page, name: RegExp): Locator {
  return page.getByRole("tab", { name }).or(page.getByRole("button", { name }));
}

function pastDateInputValue(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().slice(0, 10);
}

function tomorrowDateInputValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

test.describe("E2E-TRAVEL-TOOLS (4) 항공 — 조건입력→검증오류→정상입력→요약→외부이동", () => {
  test("과거 출발일은 오류를 보여주고, 고친 뒤에는 요약 확인 후 새 탭이 열린다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const searchButton = page.getByRole("button", {
      name: /항공편\s*보러\s*가기/,
    });
    await expect(searchButton).toBeDisabled();

    // 조건 입력(1차) — 출발일을 과거로 채워 검증 오류를 유도한다.
    await page.getByLabel("국가").fill("일본");
    await page.getByLabel("지역").fill("도쿄");
    await page.getByLabel("출발일").fill(pastDateInputValue());
    await page.getByLabel("귀국일").fill(tomorrowDateInputValue());

    // 검증 오류: 출발일이 과거이면 오류 문구가 보이고 버튼은 계속 비활성 상태다.
    await expect(
      page.getByText(/출발일은\s*오늘\s*이후여야\s*합니다/),
    ).toBeVisible();
    await expect(searchButton).toBeDisabled();

    // 정상 입력으로 고친다.
    const tomorrow = tomorrowDateInputValue();
    await page.getByLabel("출발일").fill(tomorrow);
    await page.getByLabel("귀국일").fill(tomorrow);
    await expect(
      page.getByText(/출발일은\s*오늘\s*이후여야\s*합니다/),
    ).toHaveCount(0);
    await expect(searchButton).toBeEnabled();

    await searchButton.click();

    // 요약: 확인 Dialog에 입력값이 외부로 전달되지 않는다는 고지를 포함한다.
    const dialog = page.getByRole("dialog", {
      name: /항공편\s*외부\s*이동\s*확인/,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/전달되지\s*않습니다/)).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      dialog.getByRole("button", { name: /항공편\s*보러\s*가기/ }).click(),
    ]);
    expect(popup.url()).toMatch(/^https?:\/\//);
    await popup.close();
  });
});

test.describe("E2E-TRAVEL-TOOLS (5) 숙소 — 조건입력→검증오류→정상입력→요약→외부이동", () => {
  test("체크아웃이 체크인보다 빠르면 오류를 보여주고, 고친 뒤에는 요약 확인 후 새 탭이 열린다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const hotelTab = getTabButton(page, /숙소|호텔/);
    await hotelTab.first().click();

    const searchButton = page.getByRole("button", {
      name: /숙소\s*보러\s*가기/,
    });
    await expect(searchButton).toBeDisabled();

    const checkIn = tomorrowDateInputValue();
    const invalidCheckOut = checkIn; // 당일 체크아웃은 HotelForm 규칙상 무효(체크인보다 이후여야 함).

    await page.getByLabel("국가").fill("태국");
    await page.getByLabel("지역").fill("방콕");
    await page.getByLabel("체크인").fill(checkIn);
    await page.getByLabel("체크아웃").fill(invalidCheckOut);

    await expect(
      page.getByText(
        /체크아웃\s*날짜는\s*체크인\s*날짜보다\s*이후여야\s*합니다/,
      ),
    ).toBeVisible();
    await expect(searchButton).toBeDisabled();

    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 2);
    const checkOut = checkOutDate.toISOString().slice(0, 10);
    await page.getByLabel("체크아웃").fill(checkOut);

    await expect(
      page.getByText(
        /체크아웃\s*날짜는\s*체크인\s*날짜보다\s*이후여야\s*합니다/,
      ),
    ).toHaveCount(0);
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
