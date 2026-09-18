import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Auth(이메일) 클라이언트 생성 + 회원가입/로그인/로그아웃/세션 조회.
 * docs/PROJECT_SCOPE.md §3 "인증·개인정보" 원칙: 비밀번호는 Supabase Auth에 위임하며
 * 이 프로젝트는 비밀번호를 직접 저장·처리하지 않는다(REQ-NFR-SEC-001, HTTPS 전제).
 */

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} 환경변수가 설정되지 않았습니다. .env.local을 확인하세요.`,
    );
  }
  return value;
}

/** Client Component에서 사용하는 브라우저 Supabase Client. */
export function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

/** Server Component/Route Handler에서 사용하는 서버 Supabase Client(쿠키 세션 연동). */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
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

export interface SignUpParams {
  email: string;
  password: string;
  nickname: string;
}

/**
 * 이메일 회원가입. 성공 시 profiles 테이블에 프로필 행을 생성한다.
 * adult_verified는 기본 false로 시작하며, 실제 성인확인 자기신고 흐름은
 * AUTH-ADULT-VERIFICATION Task가 별도로 처리한다.
 *
 * 주의: profiles 테이블은 DB-SCHEMA-BASE에서 RLS를 활성화했지만 Policy는
 * DB-RLS-BASE(같은 Wave의 다음 Task)에서 추가한다 — 그 전까지는 이 upsert가
 * 실제 Supabase 프로젝트에서 RLS에 의해 거부될 수 있다.
 */
export async function signUpWithEmail(
  client: SupabaseClient,
  params: SignUpParams,
) {
  const { data, error } = await client.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: { nickname: params.nickname } },
  });

  if (error || !data.user) {
    return { user: null, error };
  }

  const { error: profileError } = await client.from("profiles").upsert({
    id: data.user.id,
    email: params.email,
    nickname: params.nickname,
    adult_verified: false,
  });

  return { user: data.user, error: profileError ?? null };
}

export interface SignInParams {
  email: string;
  password: string;
}

/** 이메일 로그인. */
export async function signInWithEmail(
  client: SupabaseClient,
  params: SignInParams,
) {
  return client.auth.signInWithPassword(params);
}

/** 로그아웃. */
export async function signOut(client: SupabaseClient) {
  return client.auth.signOut();
}

/** 현재 세션 조회(로그인 상태 판별용). */
export async function getCurrentSession(client: SupabaseClient) {
  const { data } = await client.auth.getSession();
  return data.session;
}
