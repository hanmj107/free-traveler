import { createBrowserClient } from "@supabase/ssr";

/**
 * DB 접근 계층(클라이언트) — 브라우저(Client Component)에서 사용하는 범용 Supabase
 * Client. Service Role Key는 이 파일에 절대 포함하지 않는다(Security/Privacy AC).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
