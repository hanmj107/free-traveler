import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Traveler Unit Test 범위: src 내부에 있는 Unit Test, tests/unit, tests/integration을
// 검색한다. tests/e2e(Playwright 전용 디렉터리)는 절대 검색하지 않는다 — Vitest가
// Playwright 스펙 파일을 잘못 집어 실행하는 것을 방지한다.
//
// tests/integration(TEST-RLS-BASIC)은 실제 Supabase 프로젝트에 로그인해 RLS를
// 검증하는 Integration Test다. `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`가 없는
// 환경(CI 등)에서는 파일 내부의 `describe.runIf(hasEnv)` Guard가 조용히 건너뛰므로
// `include`에 함께 둬도 `npm run test:unit`이 오프라인 환경에서 깨지지 않는다.
//
// passWithNoTests: true는 유지한다 — Unit Test Task가 아직 없는 단계에서도
// `npm run test:unit`이 실패가 아니라 정상 종료로 처리되어야 하기 때문이다.
//
// resolve.alias는 tsconfig.json의 "@/*" -> "./src/*"와 동일하게 맞춘다. Vitest는
// tsconfig paths를 자동으로 읽지 않으므로, src 코드를 "@/..."로 import하는 Unit
// Test(예: tests/unit/travelDates.spec.ts)가 실행되려면 이 alias가 반드시 필요하다.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.ts",
      "tests/integration/**/*.{test,spec}.ts",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    passWithNoTests: true,
  },
});
