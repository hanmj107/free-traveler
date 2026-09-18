import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 신고 상태 변경(REQ-FUNC-ADMIN-003). 관리자 role만 상태를 바꿀 수 있으며
 * `reports_update_admin_only` RLS Policy가 이를 서버에서 강제한다.
 */

const VALID_STATUSES = ["RECEIVED", "IN_REVIEW", "RESOLVED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: reportId } = await params;
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

  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
  ) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_at: status !== "RECEIVED" ? new Date().toISOString() : null,
    })
    .eq("report_id", reportId)
    .select("report_id")
    .single();

  if (error || !data) {
    // 관리자가 아닌 요청이거나 대상이 없으면 RLS가 막아 여기로 온다.
    return NextResponse.json({ error: "update_failed" }, { status: 403 });
  }

  return NextResponse.json({ ok: true, reportId: data.report_id });
}
