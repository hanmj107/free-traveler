import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 차단 생성/해제(REQ-FUNC-MATE-007, REQ-NFR-PRIV-004). 본인이 만든 차단 관계만
 * 생성·해제할 수 있으며, 이는 `user_blocks` RLS Policy(`_insert_own`/`_delete_own`)가
 * 서버 측에서 강제한다 — 이 Route Handler는 Service Role Key를 쓰지 않는다.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const blockedUserId =
    body && typeof body === "object"
      ? (body as Record<string, unknown>).blockedUserId
      : undefined;

  if (typeof blockedUserId !== "string" || !blockedUserId) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (blockedUserId === user.id) {
    return NextResponse.json({ error: "cannot_block_self" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_blocks")
    .insert({ blocker_user_id: user.id, blocked_user_id: blockedUserId })
    .select("block_id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "block_failed" }, { status: 400 });
  }

  return NextResponse.json({ blockId: data.block_id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const blockedUserId = searchParams.get("blockedUserId");

  if (!blockedUserId) {
    return NextResponse.json(
      { error: "missing_blockedUserId" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_user_id", user.id)
    .eq("blocked_user_id", blockedUserId);

  if (error) {
    return NextResponse.json({ error: "unblock_failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
