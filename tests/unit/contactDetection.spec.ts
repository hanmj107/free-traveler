import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import {
  detectContactInfo,
  validateMateComposeForm,
  type MateComposeValues,
} from "@/components/scr003/MateComposeForm";

/**
 * UNIT-CONTACT-DETECTION — 연락처 탐지(REQ-FUNC-MATE-009, REQ-NFR-PRIV-006) +
 * Form Validation + 비로그인 Guard + 저장 Action Mock Test.
 * COMP-SCR003-MATE-COMPOSE·API-MATE-POSTS를 대상으로 한다.
 */

describe("detectContactInfo — 연락처 패턴 탐지", () => {
  it("전화번호(010-1234-5678)가 있으면 탐지한다", () => {
    expect(detectContactInfo("연락은 010-1234-5678로 주세요")).toBe(true);
  });

  it("공백 구분 전화번호도 탐지한다", () => {
    expect(detectContactInfo("010 1234 5678")).toBe(true);
  });

  it("카카오톡 언급이 있으면 탐지한다", () => {
    expect(detectContactInfo("카카오톡 아이디로 연락주세요")).toBe(true);
  });

  it("이메일 주소가 있으면 탐지한다", () => {
    expect(detectContactInfo("연락처: traveler@example.com")).toBe(true);
  });

  it("인스타그램 핸들(@handle)이 있으면 탐지한다", () => {
    expect(detectContactInfo("제 인스타는 @my_travel_account 입니다")).toBe(
      true,
    );
  });

  it("연락처가 없는 일반 소개글은 통과한다", () => {
    expect(
      detectContactInfo(
        "함께 도쿄 여행을 계획하고 있습니다. 미식 위주로 3박 4일 일정을 생각 중이에요.",
      ),
    ).toBe(false);
  });
});

const baseValues: MateComposeValues = {
  title: "도쿄 미식 동행 구해요",
  country: "일본",
  region: "도쿄",
  startDate: "2026-12-01",
  endDate: "2026-12-04",
  travelStyleTags: ["gourmet"],
  bodyText: "함께 도쿄에서 미식 여행을 즐길 동행을 구합니다.",
  safetyRuleAgreed: true,
};
const TODAY = new Date("2026-09-18T00:00:00Z");

describe("validateMateComposeForm — 필수값·연락처·안전수칙 검증", () => {
  it("모든 값이 유효하면 오류가 없다", () => {
    expect(validateMateComposeForm(baseValues, TODAY)).toEqual({});
  });

  it("제목이 비어 있으면 오류를 반환한다", () => {
    const errors = validateMateComposeForm({ ...baseValues, title: "" }, TODAY);
    expect(errors.title).toBeDefined();
  });

  it("여행 스타일을 선택하지 않으면 오류를 반환한다", () => {
    const errors = validateMateComposeForm(
      { ...baseValues, travelStyleTags: [] },
      TODAY,
    );
    expect(errors.travelStyleTags).toBeDefined();
  });

  it("종료일이 시작일보다 이전이면 오류를 반환한다", () => {
    const errors = validateMateComposeForm(
      { ...baseValues, startDate: "2026-12-04", endDate: "2026-12-01" },
      TODAY,
    );
    expect(errors.endDate).toBeDefined();
  });

  it("본문에 연락처가 있으면 오류를 반환한다", () => {
    const errors = validateMateComposeForm(
      { ...baseValues, bodyText: "카톡 아이디 알려주세요" },
      TODAY,
    );
    expect(errors.bodyText).toBeDefined();
  });

  it("안전수칙에 동의하지 않으면 오류를 반환한다", () => {
    const errors = validateMateComposeForm(
      { ...baseValues, safetyRuleAgreed: false },
      TODAY,
    );
    expect(errors.safetyRuleAgreed).toBeDefined();
  });
});

// ── API-MATE-POSTS POST /api/mates — 비로그인 Guard + 저장 Action Mock Test ──

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  computeMatePostDisplayStatus: (post: { status: string }) => post.status,
}));

function makeFakeSupabase(options: {
  userId?: string;
  adultVerified?: boolean;
  insertData?: { post_id: string } | null;
  insertError?: unknown;
}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: options.userId ? { id: options.userId } : null },
      }),
    },
    from(table: string) {
      if (table === "profiles") {
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: async () => ({
            data: { adult_verified: options.adultVerified ?? false },
            error: null,
          }),
        };
        return chain;
      }
      if (table === "mate_posts") {
        const chain = {
          insert: () => chain,
          select: () => chain,
          single: async () => ({
            data: options.insertData ?? null,
            error: options.insertError ?? null,
          }),
        };
        return chain;
      }
      throw new Error(`unexpected table: ${table}`);
    },
  };
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/mates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  country: "일본",
  region: "도쿄",
  startDate: "2026-12-01",
  endDate: "2026-12-04",
  travelStyleTags: ["gourmet"],
  title: "도쿄 미식 동행 구해요",
  bodyText: "함께 도쿄에서 미식 여행을 즐길 동행을 구합니다.",
  safetyRuleAgreed: true,
};

describe("POST /api/mates — 비로그인 Guard Test", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("로그인하지 않은 경우 401을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({ userId: undefined }),
    );

    const { POST } = await import("@/app/api/mates/route");
    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(401);
  });

  it("성인확인이 안 된 경우 403을 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({ userId: "user-1", adultVerified: false }),
    );

    const { POST } = await import("@/app/api/mates/route");
    const response = await POST(makeRequest(validPayload));

    expect(response.status).toBe(403);
  });
});

describe("POST /api/mates — 저장 Action Mock Test", () => {
  it("유효한 입력이면 201과 postId를 반환한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({
        userId: "user-1",
        adultVerified: true,
        insertData: { post_id: "post-123" },
      }),
    );

    const { POST } = await import("@/app/api/mates/route");
    const response = await POST(makeRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.postId).toBe("post-123");
  });

  it("본문에 연락처가 있으면 400으로 차단한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({ userId: "user-1", adultVerified: true }),
    );

    const { POST } = await import("@/app/api/mates/route");
    const response = await POST(
      makeRequest({ ...validPayload, bodyText: "카톡 아이디로 연락주세요" }),
    );

    expect(response.status).toBe(400);
  });

  it("안전수칙 동의가 없으면 400으로 차단한다", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    (createClient as unknown as Mock).mockResolvedValue(
      makeFakeSupabase({ userId: "user-1", adultVerified: true }),
    );

    const { POST } = await import("@/app/api/mates/route");
    const response = await POST(
      makeRequest({ ...validPayload, safetyRuleAgreed: false }),
    );

    expect(response.status).toBe(400);
  });
});
