import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 참가 요청 생성/조회(REQ-FUNC-MATE-004/005). `(post_id, applicant_user_id)`에
 * PENDING/APPROVED 상태가 이미 있으면 DB의 부분 유일 인덱스가 막고, 여기서는 그
 * unique_violation(23505)을 409로 변환해 응답한다.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const messageText =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).messageText
      : undefined;

  if (typeof messageText !== "string" || !messageText.trim()) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mate_applications")
    .insert({
      post_id: postId,
      applicant_user_id: user.id,
      message_text: messageText,
      status: "PENDING",
    })
    .select("application_id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "duplicate_application" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "application_failed" }, { status: 400 });
  }

  return NextResponse.json(
    { applicationId: data.application_id },
    { status: 201 },
  );
}

/** 본인이 작성자이거나 신청자인 요청만 RLS(`mate_applications_select`)가 반환한다. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mate_applications")
    .select(
      "application_id, applicant_user_id, message_text, status, created_at, decided_at",
    )
    .eq("post_id", postId);

  if (error) {
    return NextResponse.json(
      { error: "applications_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ applications: data ?? [] });
}
