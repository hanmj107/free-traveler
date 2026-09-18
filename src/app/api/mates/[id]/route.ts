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
