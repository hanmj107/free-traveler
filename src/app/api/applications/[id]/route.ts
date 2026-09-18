import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 참가 요청 승인/거절(REQ-FUNC-MATE-005). 대상 모집글의 작성자만 상태를 바꿀 수
 * 있으며, `mate_applications_update_by_post_author` RLS Policy가 이를 서버에서
 * 강제한다. 승인/거절 알림은 이메일이 아닌 Toast/화면 상태로 대체한다(호출한
 * Component의 책임 — 이 Route는 성공 여부만 반환한다).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: applicationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const status =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).status
      : undefined;

  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mate_applications")
    .update({ status, decided_at: new Date().toISOString() })
    .eq("application_id", applicationId)
    .select("application_id")
    .single();

  if (error || !data) {
    // 작성자가 아닌 요청이거나 대상이 없으면 RLS가 막아 여기로 온다.
    return NextResponse.json({ error: "update_failed" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, applicationId: data.application_id });
}
