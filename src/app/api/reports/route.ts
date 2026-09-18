import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 신고 생성/조회(REQ-FUNC-MATE-006, REQ-FUNC-ADMIN-003, REQ-NFR-PERF-004).
 * 조회는 관리자만 결과를 받는다(`reports_select_admin_only` RLS Policy — 비관리자는
 * 빈 배열을 받는다, 데이터 유출 없음). 생성은 로그인 사용자면 누구나 가능하고,
 * 접수번호(receipt_number)를 즉시 응답으로 돌려준다(이후 재조회 SELECT 권한은
 * 부여하지 않는다 — COMP-SCR004-REPORT는 이 응답값을 그대로 화면에 표시한다).
 */

const VALID_TARGET_TYPES = ["USER", "MATE_POST", "MATE_APPLICATION"] as const;

function generateReceiptNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RPT-${datePart}-${randomPart}`;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      "report_id, receipt_number, target_type, target_id, reason, status, received_at, reviewed_at",
    )
    .order("received_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "reports_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ reports: data ?? [] });
}

export async function POST(request: Request) {
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
  const targetType = input?.targetType;
  const targetId = input?.targetId;
  const reason = input?.reason;

  if (
    typeof targetType !== "string" ||
    !VALID_TARGET_TYPES.includes(
      targetType as (typeof VALID_TARGET_TYPES)[number],
    )
  ) {
    return NextResponse.json({ error: "invalid_target_type" }, { status: 400 });
  }
  if (typeof targetId !== "string" || !targetId) {
    return NextResponse.json({ error: "invalid_target_id" }, { status: 400 });
  }
  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "invalid_reason" }, { status: 400 });
  }

  const receiptNumber = generateReceiptNumber();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      receipt_number: receiptNumber,
      reporter_user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      status: "RECEIVED",
    })
    .select("report_id, receipt_number")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "report_failed" }, { status: 400 });
  }

  return NextResponse.json(
    { reportId: data.report_id, receiptNumber: data.receipt_number },
    { status: 201 },
  );
}
