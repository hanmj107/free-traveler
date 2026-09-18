import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * DB 접근 계층(서버) — Server Component/Route Handler에서 사용하는 범용 Supabase
 * Client. Service Role Key는 이 파일에 절대 포함하지 않는다(Security/Privacy AC) — anon
 * key + 쿠키 세션만 사용하며, RLS는 항상 적용된 상태로 조회한다(root CLAUDE.md 규칙 14).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component에서 호출되면 쿠키 쓰기가 불가능하다 — 세션 갱신은
            // middleware/Route Handler에서 처리되므로 여기서는 무시해도 안전하다.
          }
        },
      },
    },
  );
}

export interface MatePostClosureFields {
  status: string;
  end_date: string;
}

/**
 * mate_posts 마감 상태를 "조회 시점"에 계산한다(REQ-FUNC-MATE-008) — 별도 배치(cron) 없이
 * 목록·상세를 읽는 시점에 end_date와 오늘 날짜를 비교해 화면 표시용 상태를 도출한다.
 * DB의 status 컬럼 값 자체를 갱신하지는 않는다(순수 계산 함수).
 */
export function computeMatePostDisplayStatus(
  post: MatePostClosureFields,
): "RECRUITING" | "CLOSED" {
  if (post.status === "CLOSED") {
    return "CLOSED";
  }

  const today = new Date().toISOString().slice(0, 10);
  return post.end_date < today ? "CLOSED" : "RECRUITING";
}
