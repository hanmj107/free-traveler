import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeMatePostDisplayStatus } from "@/lib/supabase/server";

/** 모집글 상세 조회(REQ-FUNC-MATE-002). 마감 상태는 조회 시점에 계산한다. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mate_posts")
    .select(
      "post_id, author_user_id, country, region, start_date, end_date, travel_style_tags, title, body_text, status",
    )
    .eq("post_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    post: { ...data, status: computeMatePostDisplayStatus(data) },
  });
}

/**
 * 모집글 최소 항목 수정(제목)과 모집 마감 처리(REQ-FUNC-MATE-002/008 연장 —
 * SCR-005 "내가 쓴 동행글" 관리 화면에 필요). 본인 글만 수정할 수 있으며
 * `mate_posts_update_own` RLS Policy가 이를 서버에서 강제한다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const input =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;

  const updates: Record<string, unknown> = {};

  if (input && typeof input.title === "string") {
    if (!input.title.trim()) {
      return NextResponse.json({ error: "invalid_title" }, { status: 400 });
    }
    updates.title = input.title.trim();
  }

  if (input && typeof input.status === "string") {
    if (input.status !== "CLOSED") {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    updates.status = "CLOSED";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no_fields_to_update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mate_posts")
    .update(updates)
    .eq("post_id", id)
    .select("post_id")
    .single();

  if (error || !data) {
    // 작성자가 아닌 요청이거나 대상이 없으면 RLS가 막아 여기로 온다.
    return NextResponse.json({ error: "update_failed" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, postId: data.post_id });
}
