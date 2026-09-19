import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdultVerified } from "@/lib/auth/adultVerification";
import { computeMatePostDisplayStatus } from "@/lib/supabase/server";

/**
 * 모집글 생성/조회(REQ-FUNC-MATE-002/003/008/009). 공개 글은 비회원에게도 노출하며,
 * 모집중/마감 상태는 저장된 status가 아니라 조회 시점에 end_date와 비교해 계산한다
 * (MATE-008, 배치 없음). SCR-004의 "모집 상태" Filter가 마감 글도 함께 보여줄 수
 * 있어야 하므로 목록 API 자체는 모든 글을 반환하고, 모집중만 보이게 좁히는 것은
 * 클라이언트(COMP-SCR004-FILTER)의 역할로 둔다. 생성은 로그인+성인확인 완료
 * 사용자만 가능하며 안전수칙 동의와 연락처 미포함(SEC-008/MATE-009)을 서버에서
 * 재검증한다. SCR-001의 "최근 동행글"(COMP-SCR001-MATE-SUMMARY)이 작성 시점 기준
 * 최신 3개를 골라야 해서 created_at도 함께 반환한다.
 */

const REQUIRED_FIELDS = [
  "country",
  "region",
  "startDate",
  "endDate",
  "title",
  "bodyText",
] as const;

const PHONE_PATTERN = /(01[0-9])[-.\s]?\d{3,4}[-.\s]?\d{4}/;
const GENERIC_PHONE_PATTERN = /\d{2,4}[-.\s]\d{3,4}[-.\s]\d{4}/;
const MESSENGER_KEYWORD_PATTERN =
  /(카카오톡|카톡|kakao\s*talk|kakaotalk|line\s*id|라인\s*아이디|telegram|텔레그램|wechat|위챗|instagram|인스타(그램)?|@[a-zA-Z0-9_]{3,})/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/** 본문에 전화번호·메신저 ID·이메일 등 연락처로 보이는 패턴이 있는지 탐지한다. */
export function detectContactInfo(text: string): boolean {
  if (!text) {
    return false;
  }
  return (
    PHONE_PATTERN.test(text) ||
    GENERIC_PHONE_PATTERN.test(text) ||
    MESSENGER_KEYWORD_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text)
  );
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mate_posts")
    .select(
      "post_id, country, region, start_date, end_date, travel_style_tags, title, status, created_at",
    )
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "mate_posts_unavailable" },
      { status: 503 },
    );
  }

  const posts = (data ?? []).map((post) => ({
    ...post,
    status: computeMatePostDisplayStatus(post),
  }));

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const verified = await isAdultVerified(supabase, user.id);
  if (!verified) {
    return NextResponse.json(
      { error: "adult_verification_required" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (typeof input[field] !== "string" || !(input[field] as string).trim()) {
      return NextResponse.json(
        { error: `missing_field:${field}` },
        { status: 400 },
      );
    }
  }

  if (input.safetyRuleAgreed !== true) {
    return NextResponse.json(
      { error: "safety_rule_not_agreed" },
      { status: 400 },
    );
  }

  const title = input.title as string;
  const bodyText = input.bodyText as string;
  if (detectContactInfo(title) || detectContactInfo(bodyText)) {
    return NextResponse.json(
      { error: "contact_info_detected" },
      { status: 400 },
    );
  }

  const travelStyleTags = Array.isArray(input.travelStyleTags)
    ? (input.travelStyleTags as unknown[]).filter(
        (tag): tag is string => typeof tag === "string",
      )
    : [];

  const { data, error } = await supabase
    .from("mate_posts")
    .insert({
      author_user_id: user.id,
      country: input.country as string,
      region: input.region as string,
      start_date: input.startDate as string,
      end_date: input.endDate as string,
      travel_style_tags: travelStyleTags,
      title,
      body_text: bodyText,
      safety_rule_agreed: true,
      status: "RECRUITING",
    })
    .select("post_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  return NextResponse.json({ postId: data.post_id }, { status: 201 });
}
