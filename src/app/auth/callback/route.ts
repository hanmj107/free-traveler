import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseAuth";

/**
 * Supabase Auth 인증 콜백(기술 Route — design-reference/SCREEN_ROUTE_CONTRACT.json의
 * technical_routes 대상, 5개 고정 화면에 포함되지 않는다). 이메일 확인·OAuth 등에서
 * 전달된 code를 세션으로 교환한 뒤 원래 요청했던 경로(next)로 리다이렉트한다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account?auth_error=1`);
}
