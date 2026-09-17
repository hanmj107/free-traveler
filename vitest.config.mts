import { defineConfig } from "vitest/config";

// Traveler Unit Test 범위: src 내부에 있는 Unit Test와 tests/unit만 검색한다.
// tests/e2e(Playwright 전용 디렉터리)는 절대 검색하지 않는다 — Vitest가 Playwright
// 스펙 파일을 잘못 집어 실행하는 것을 방지한다.
//
// 아직 Unit Test 파일이 하나도 없는 단계이므로 passWithNoTests: true로 두어,
// `npm run test:unit`(scripts/audit_tasks.py의 UNIT-TRAVEL-DATES 등 Task가
// 구현되기 전까지)이 실패가 아니라 정상 종료로 처리되게 한다.
export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.ts",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    passWithNoTests: true,
  },
});
