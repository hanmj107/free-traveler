#!/usr/bin/env node
/**
 * run_release_e2e.mjs — `npm run release:check`가 `ci` 통과 후 호출하는 E2E 실행기.
 *
 * 실제 Supabase Secret(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)이
 * 둘 다 설정돼 있어야 로그인·동행 흐름을 포함한 전체 Playwright Chromium Smoke
 * (`test:e2e`)를 실행한다. 하나라도 없으면(로컬 임시값이 아니라 실제 값이 없는
 * 경우) 로그인 없이 가능한 공개 Smoke(`test:e2e:public`)만 실행한다 — Secret이
 * 없는 CI 환경에서 인증이 필요한 시나리오를 시도하다 실패하는 것을 피하기 위함이다.
 *
 * package.json에는 이 분기 로직을 넣지 않는다(Bash 전용 조건문 등 복잡한 문법을
 * package.json에 두지 않는다는 규칙에 따라, 분기는 여기 순수 Node 코드로 둔다).
 */
import { spawnSync } from "node:child_process";

const hasSupabaseSecrets = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const npmScript = hasSupabaseSecrets ? "test:e2e" : "test:e2e:public";

console.log(
  hasSupabaseSecrets
    ? "[release:check] Supabase Secret 확인됨 -> 전체 Playwright Chromium Smoke(test:e2e) 실행"
    : "[release:check] Supabase Secret 없음(NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정) -> 공개 Smoke만(test:e2e:public) 실행",
);

const result = spawnSync("npm", ["run", npmScript], { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
