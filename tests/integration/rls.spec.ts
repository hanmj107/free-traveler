import { existsSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * TEST-RLS-BASIC — RLS 기본 정책 Integration Test(클라이언트 레벨, REQ-NFR-PRIV-003/004).
 *
 * `supabase/tests/rls_basic.sql`이 DB 세션 role을 직접 바꿔가며 SQL 레벨에서
 * 검증한 것과 같은 2개 Functional AC를, 이 파일은 실제 `@supabase/supabase-js`
 * 클라이언트로 로그인해 애플리케이션이 실제로 겪는 경로 그대로 다시 검증한다:
 *   (1) 비관리자가 reports를 조회하면 RLS가 결과를 차단한다.
 *   (2) 차단된 상대방(seed_member_a)의 mate_posts가 차단한 사람(seed_member_b)의
 *       목록/상세 조회에 노출되지 않는다.
 *
 * `supabase/seed.sql`이 이미 적용된 프로젝트(seed_admin/seed_member_a/
 * seed_member_b 3계정, seed_member_b가 seed_member_a를 차단)를 전제로 한다.
 * 이 seed가 적용되지 않은 환경(NEXT_PUBLIC_SUPABASE_URL 등 환경변수 부재)에서는
 * `describe.skip`으로 건너뛴다 — CI는 `.env.local` 또는 동일한 환경변수를 주입해야
 * 이 파일을 실제로 실행한다.
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

/**
 * `process.loadEnvFile`은 dotenv/Next.js와 달리 값을 감싼 큰따옴표를 벗겨내지
 * 않는다(`.env.local`은 `KEY="value"` 형식이라 벗기지 않으면 URL 문자열 안에
 * 따옴표가 그대로 남아 Supabase 클라이언트가 "Invalid API key"로 실패한다).
 */
function stripQuotes(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  return value.replace(/^"(.*)"$/, "$1");
}

const SUPABASE_URL = stripQuotes(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = stripQuotes(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const hasEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const SEED_MEMBER_A_ID = "22222222-2222-2222-2222-222222222222";
const SEED_ADMIN = {
  email: "seed.admin@example.invalid",
  password: "seed-not-a-real-password-1",
};
const SEED_MEMBER_A = {
  email: "seed.member-a@example.invalid",
  password: "seed-not-a-real-password-2",
};
const SEED_MEMBER_B = {
  email: "seed.member-b@example.invalid",
  password: "seed-not-a-real-password-3",
};

async function signInAs(credentials: { email: string; password: string }) {
  const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) {
    throw new Error(
      `시드 계정 로그인 실패(${credentials.email}): ${error.message}`,
    );
  }
  return client;
}

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

describe.runIf(hasEnv)("TEST-RLS-BASIC — 클라이언트 레벨 RLS 통합 검증", () => {
  let adminClient: SupabaseClient;
  let memberAClient: SupabaseClient;
  let memberBClient: SupabaseClient;

  beforeAll(async () => {
    adminClient = await signInAs(SEED_ADMIN);
    memberAClient = await signInAs(SEED_MEMBER_A);
    memberBClient = await signInAs(SEED_MEMBER_B);
  }, 30000);

  it("비관리자(seed_member_a)는 reports를 조회해도 결과를 받지 못한다", async () => {
    const { data, error } = await memberAClient
      .from("reports")
      .select("report_id");
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("관리자(seed_admin)는 reports를 1건 이상 조회할 수 있다(대조군)", async () => {
    const { data, error } = await adminClient
      .from("reports")
      .select("report_id");
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("차단한 사람(seed_member_b)에게는 차단당한 작성자(seed_member_a)의 mate_posts 목록이 보이지 않는다", async () => {
    const { data, error } = await memberBClient
      .from("mate_posts")
      .select("post_id")
      .eq("author_user_id", SEED_MEMBER_A_ID);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("차단한 사람(seed_member_b)에게는 차단당한 작성자의 게시글 상세도 보이지 않는다", async () => {
    const { data, error } = await memberBClient
      .from("mate_posts")
      .select("post_id")
      .eq("post_id", "aaaaaaaa-0000-0000-0000-000000000001")
      .maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("차단 관계가 없는 관리자에게는 seed_member_a의 mate_posts가 모두 보인다(대조군)", async () => {
    const { data, error } = await adminClient
      .from("mate_posts")
      .select("post_id")
      .eq("author_user_id", SEED_MEMBER_A_ID);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it("비로그인 사용자는 차단 여부와 무관하게 mate_posts를 조회할 수 있다", async () => {
    const { data, error } = await anonClient()
      .from("mate_posts")
      .select("post_id")
      .eq("author_user_id", SEED_MEMBER_A_ID);
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThanOrEqual(8);
  });
});

describe.skipIf(hasEnv)("TEST-RLS-BASIC — 환경변수 없음", () => {
  it("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY가 없어 이 통합 테스트를 건너뛴다", () => {
    expect(hasEnv).toBe(false);
  });
});
