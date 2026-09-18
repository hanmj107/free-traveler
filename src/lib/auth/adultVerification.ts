import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 성인 확인(자기신고) 로직.
 * docs/PROJECT_SCOPE.md §3 "인증·개인정보" 원칙(REQ-NFR-PRIV-002): 생년월일은 절대
 * 수집·저장하지 않는다. 자기신고 체크박스 제출 시 `profiles.adult_verified`와
 * `profiles.adult_verified_at`(확인 시각)만 갱신한다.
 */

/** SCR-005(계정)의 로그인/성인확인 흐름으로 보내는 경로. */
export const ADULT_VERIFICATION_REDIRECT_PATH = "/account";

/**
 * 자기신고 체크박스 제출 처리 — `adult_verified=true`, `adult_verified_at=현재 시각`만
 * 저장한다. 생년월일 등 다른 개인정보 필드는 절대 함께 저장하지 않는다.
 */
export async function confirmAdultSelfDeclaration(
  client: SupabaseClient,
  userId: string,
) {
  const { error } = await client
    .from("profiles")
    .update({
      adult_verified: true,
      adult_verified_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { error };
}

/** 현재 사용자의 성인확인 여부를 조회한다. */
export async function isAdultVerified(
  client: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("profiles")
    .select("adult_verified")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return Boolean(data.adult_verified);
}

/**
 * 모집글 작성·참가요청 등 성인확인이 필요한 동작 전에 호출한다. 미확인 사용자면
 * SCR-005 리디렉션 경로를 반환하고, 확인된 사용자면 `null`을 반환한다(계속 진행 가능).
 */
export async function requireAdultVerifiedOrRedirectPath(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const verified = await isAdultVerified(client, userId);
  return verified ? null : ADULT_VERIFICATION_REDIRECT_PATH;
}
