import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 외부 URL 설정 저장/조회(REQ-NFR-SEC-004). 일반 사용자는 조회만 가능하고, 저장(PUT)은
 * `app_settings` RLS Policy(`app_settings_admin_write`/`_admin_update`)가 관리자 role만
 * 허용하도록 이미 강제한다 — 이 Route Handler는 Service Role Key를 쓰지 않고 요청자의
 * 세션 그대로(anon key + 쿠키) Supabase를 호출해 RLS가 실제로 적용되게 한다.
 */

const FLIGHT_KEY = "flight_landing_url";
const HOTEL_KEY = "hotel_landing_url";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [FLIGHT_KEY, HOTEL_KEY]);

  if (error) {
    return NextResponse.json(
      { error: "external_urls_unavailable" },
      { status: 503 },
    );
  }

  const settings = Object.fromEntries(
    (data ?? []).map((row) => [row.key, row.value]),
  );

  return NextResponse.json({
    flightLandingUrl: (settings[FLIGHT_KEY] as string | undefined) ?? null,
    hotelLandingUrl: (settings[HOTEL_KEY] as string | undefined) ?? null,
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const updates: { key: string; value: string }[] = [];
  if (typeof (body as Record<string, unknown>).flightLandingUrl === "string") {
    updates.push({
      key: FLIGHT_KEY,
      value: (body as Record<string, string>).flightLandingUrl,
    });
  }
  if (typeof (body as Record<string, unknown>).hotelLandingUrl === "string") {
    updates.push({
      key: HOTEL_KEY,
      value: (body as Record<string, string>).hotelLandingUrl,
    });
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "no_fields_to_update" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert(updates, { onConflict: "key" });

  if (error) {
    // 관리자가 아닌 요청은 RLS가 여기서 차단한다(app_settings_admin_write/_admin_update).
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
