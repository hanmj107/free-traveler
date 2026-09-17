import { defineConfig, devices } from "@playwright/test";

// design-reference/D-001/DESIGN.md·docs/ARCHITECTURE.md §12 원칙: projects는 Chromium
// 하나만 정의한다. Firefox·WebKit 프로젝트나 시각적 회귀 테스트를 추가하지 않는다
// (루트 CLAUDE.md 규칙 18).
const previewBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = previewBaseURL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // PLAYWRIGHT_BASE_URL(예: Vercel Preview URL)이 설정된 경우 그 배포본을 그대로 검사한다
  // — 로컬 dev 서버를 새로 띄우지 않는다. 설정이 없을 때만(로컬 실행) `npm run dev`를
  // webServer로 사용한다.
  webServer: previewBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
