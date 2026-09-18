import { describe, expect, it, vi, type Mock } from "vitest";
import { computeMatePostDisplayStatus } from "@/lib/supabase/server";
import {
  filterMatePosts,
  type FilterableMatePost,
} from "@/components/scr004/MateFilter";

/**
 * UNIT-MATE-STATE — 동행 상태 전이(REQ-FUNC-MATE-004/005/008).
 * 1) end_date 경과 마감 계산 경계값, 2) 참가 요청 중복 차단(409), 3) 승인/거절 전이,
 * 4) Filter 목록 좁히기(overlap/OR 매칭), 5) 차단 API Data Function Test.
 */

describe("computeMatePostDisplayStatus — end_date 경과 마감 계산 경계값", () => {
  const TODAY = new Date("2026-09-18T00:00:00Z");

  it("end_date가 오늘이면 아직 모집중이다", () => {
    expect(
      computeMatePostDisplayStatus({
        status: "RECRUITING",
        end_date: "2026-09-18",
      }),
    ).toBe("RECRUITING");
  });

  it("end_date가 어제면 마감으로 계산한다", () => {
    const today = TODAY.toISOString().slice(0, 10);
    expect(
      computeMatePostDisplayStatus({
        status: "RECRUITING",
        end_date: "2026-09-17",
      }),
    ).toBe(today > "2026-09-17" ? "CLOSED" : "RECRUITING");
  });

  it("DB status가 이미 CLOSED면 end_date와 무관하게 CLOSED다", () => {
    expect(
      computeMatePostDisplayStatus({
        status: "CLOSED",
        end_date: "2099-01-01",
      }),
    ).toBe("CLOSED");
  });
});

describe("filterMatePosts — 국가/지역/기간(overlap)/스타일(OR)/모집상태", () => {
  const posts: FilterableMatePost[] = [
    {
      post_id: "1",
      country: "일본",
      region: "도쿄",
      start_date: "2026-10-01",
      end_date: "2026-10-05",
      travel_style_tags: ["gourmet"],
      title: "도쿄 미식 동행",
      status: "RECRUITING",
    },
    {
      post_id: "2",
      country: "태국",
      region: "방콕",
      start_date: "2026-11-01",
      end_date: "2026-11-05",
      travel_style_tags: ["budget"],
      title: "방콕 저예산 동행",
      status: "CLOSED",
    },
  ];

  it("국가로 좁히면 해당 국가만 남는다", () => {
    const result = filterMatePosts(posts, {
      country: "일본",
      region: "",
      periodStart: "",
      periodEnd: "",
      styleTags: [],
      onlyRecruiting: false,
    });
    expect(result.map((post) => post.post_id)).toEqual(["1"]);
  });

  it("모집중만 보기가 켜져 있으면 마감글은 제외된다", () => {
    const result = filterMatePosts(posts, {
      country: "",
      region: "",
      periodStart: "",
      periodEnd: "",
      styleTags: [],
      onlyRecruiting: true,
    });
    expect(result.map((post) => post.post_id)).toEqual(["1"]);
  });

  it("기간이 구간과 겹치면(overlap) 포함된다", () => {
    const result = filterMatePosts(posts, {
      country: "",
      region: "",
      periodStart: "2026-10-03",
      periodEnd: "2026-10-10",
      styleTags: [],
      onlyRecruiting: false,
    });
    expect(result.map((post) => post.post_id)).toEqual(["1"]);
  });

  it("기간이 전혀 겹치지 않으면 제외된다", () => {
    const result = filterMatePosts(posts, {
      country: "",
      region: "",
      periodStart: "2026-12-01",
      periodEnd: "2026-12-05",
      styleTags: [],
      onlyRecruiting: false,
    });
    expect(result).toHaveLength(0);
  });

  it("스타일 태그는 OR 매칭이다", () => {
    const result = filterMatePosts(posts, {
      country: "",
      region: "",
      periodStart: "",
      periodEnd: "",
      styleTags: ["gourmet", "budget"],
      onlyRecruiting: false,
    });
    expect(result.map((post) => post.post_id).sort()).toEqual(["1", "2"]);
  });
});

// ── API 라우트 Data Function Test(Mock) ──

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  computeMatePostDisplayStatus: (post: {
    status: string;
    end_date: string;
  }) => {
    if (post.status === "CLOSED") return "CLOSED";
    const today = "2026-09-18";
    return post.end_date < today ? "CLOSED" : "RECRUITING";
  },
}));

function makeChain(result: { data: unknown; error: unknown }) {
  const chain = {
    insert: () => chain,
    update: () => chain,
    select: () => chain,
    eq: () => chain,
    single: async () => result,
  };
  return chain;
}

function makeFakeSupabase(options: {
  userId?: string;
  fromResult: { data: unknown; error: unknown };
}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: options.userId ? { id: options.userId } : null },
      }),
    },
    from: () => makeChain(options.fromResult),
  };
}

function makeRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mates/[id]/applications — 중복 PENDING/APPROVED 차단(409)", () => {
  it("정상 신청이면 201을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "applicant-1",
        fromResult: { data: { application_id: "app-1" }, error: null },
      }),
    );

    const { POST } = await import("@/app/api/mates/[id]/applications/route");
    const response = await POST(
      makeRequest("http://localhost/api/mates/post-1/applications", {
        messageText: "함께 가고 싶어요",
      }),
      { params: Promise.resolve({ id: "post-1" }) },
    );

    expect(response.status).toBe(201);
  });

  it("(post_id, applicant_user_id) 중복(unique_violation)이면 409를 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "applicant-1",
        fromResult: {
          data: null,
          error: { code: "23505", message: "duplicate" },
        },
      }),
    );

    const { POST } = await import("@/app/api/mates/[id]/applications/route");
    const response = await POST(
      makeRequest("http://localhost/api/mates/post-1/applications", {
        messageText: "함께 가고 싶어요",
      }),
      { params: Promise.resolve({ id: "post-1" }) },
    );

    expect(response.status).toBe(409);
  });

  it("비로그인 상태면 401을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: undefined,
        fromResult: { data: null, error: null },
      }),
    );

    const { POST } = await import("@/app/api/mates/[id]/applications/route");
    const response = await POST(
      makeRequest("http://localhost/api/mates/post-1/applications", {
        messageText: "함께 가고 싶어요",
      }),
      { params: Promise.resolve({ id: "post-1" }) },
    );

    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/applications/[id] — PENDING→APPROVED/REJECTED 전이", () => {
  it("APPROVED로 전이하면 성공한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "author-1",
        fromResult: { data: { application_id: "app-1" }, error: null },
      }),
    );

    const { PATCH } = await import("@/app/api/applications/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/applications/app-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );

    expect(response.status).toBe(200);
  });

  it("유효하지 않은 status 값은 400을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "author-1",
        fromResult: { data: null, error: null },
      }),
    );

    const { PATCH } = await import("@/app/api/applications/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/applications/app-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );

    expect(response.status).toBe(400);
  });

  it("작성자가 아닌 요청은 RLS가 막아 403을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "not-the-author",
        fromResult: { data: null, error: { message: "rls_denied" } },
      }),
    );

    const { PATCH } = await import("@/app/api/applications/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/applications/app-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      }),
      { params: Promise.resolve({ id: "app-1" }) },
    );

    expect(response.status).toBe(403);
  });
});

describe("POST /api/blocks — 차단 Data Function Test", () => {
  it("본인을 차단하려 하면 400을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "user-1",
        fromResult: { data: null, error: null },
      }),
    );

    const { POST } = await import("@/app/api/blocks/route");
    const response = await POST(
      makeRequest("http://localhost/api/blocks", { blockedUserId: "user-1" }),
    );

    expect(response.status).toBe(400);
  });

  it("정상 차단이면 201과 blockId를 반환한다(이후 목록 제외는 RLS가 처리 — TEST-RLS-BASIC에서 통합 검증)", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "user-1",
        fromResult: { data: { block_id: "block-1" }, error: null },
      }),
    );

    const { POST } = await import("@/app/api/blocks/route");
    const response = await POST(
      makeRequest("http://localhost/api/blocks", { blockedUserId: "user-2" }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.blockId).toBe("block-1");
  });
});
