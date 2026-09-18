"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
} from "@/lib/auth/supabaseAuth";
import { confirmAdultSelfDeclaration } from "@/lib/auth/adultVerification";

/**
 * SCR-005 계정 인증 — 비로그인: 로그인/회원가입/재설정 3개 카드, 로그인 후: 이용 가능
 * 기능 Chip 3개 + 로그아웃. 비밀번호는 Supabase Auth에 위임한다(REQ-NFR-SEC-001).
 * 회원가입 시 이메일·닉네임·성인확인 자기신고 체크박스만 수집하고 생년월일은 절대
 * 수집·저장하지 않는다(PRIV-001/PRIV-002).
 */

export type Mode = "login" | "signup" | "reset";
type SubmitState = "idle" | "submitting" | "error" | "success";

export interface AuthFormValues {
  email: string;
  password: string;
  nickname: string;
}

/**
 * 제출 전 필수 입력 검증(Auth 상태 전이의 진입 조건). `login`/`signup`은 이메일+
 * 비밀번호가 필요하고, `signup`은 닉네임도 필요하다. `reset`은 이메일만 있으면 된다.
 * 통과하면 `null`, 아니면 사용자에게 보여줄 오류 문구를 반환한다.
 */
export function validateAuthForm(
  mode: Mode,
  values: AuthFormValues,
): string | null {
  if (!values.email.trim() || (mode !== "reset" && !values.password)) {
    return "이메일과 비밀번호를 입력해 주세요.";
  }
  if (mode === "signup" && !values.nickname.trim()) {
    return "닉네임을 입력해 주세요.";
  }
  return null;
}

const MODE_CARDS: { mode: Mode; title: string; description: string }[] = [
  {
    mode: "login",
    title: "로그인",
    description: "이메일과 비밀번호로 로그인합니다.",
  },
  {
    mode: "signup",
    title: "회원가입",
    description: "이메일·닉네임으로 새 계정을 만듭니다.",
  },
  {
    mode: "reset",
    title: "비밀번호 재설정",
    description: "가입한 이메일로 재설정 안내를 받습니다.",
  },
];

interface AuthFormsProps {
  isAuthenticated: boolean;
}

export default function AuthForms({ isAuthenticated }: AuthFormsProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [adultAgreed, setAdultAgreed] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoutState, setLogoutState] = useState<SubmitState>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateAuthForm(mode, {
      email,
      password,
      nickname,
    });
    if (validationError) {
      setErrorMessage(validationError);
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage(null);
    setSuccessMessage(null);

    const client = createClient();

    if (mode === "login") {
      signInWithEmail(client, { email, password })
        .then(({ error }) => {
          if (error) {
            setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
            setSubmitState("error");
            return;
          }
          setSuccessMessage("로그인되었습니다.");
          setSubmitState("success");
        })
        .catch(() => {
          setErrorMessage(
            "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          );
          setSubmitState("error");
        });
      return;
    }

    if (mode === "signup") {
      signUpWithEmail(client, { email, password, nickname })
        .then(async ({ user, error }) => {
          if (error || !user) {
            setErrorMessage(
              "회원가입에 실패했습니다. 이메일 형식과 비밀번호(8자 이상)를 확인해 주세요.",
            );
            setSubmitState("error");
            return;
          }
          if (adultAgreed) {
            await confirmAdultSelfDeclaration(client, user.id);
          }
          setSuccessMessage(
            "회원가입이 완료되었습니다. 이메일 확인이 필요할 수 있습니다.",
          );
          setSubmitState("success");
        })
        .catch(() => {
          setErrorMessage(
            "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          );
          setSubmitState("error");
        });
      return;
    }

    client.auth
      .resetPasswordForEmail(email)
      .then(({ error }) => {
        if (error) {
          setErrorMessage("재설정 메일 발송에 실패했습니다.");
          setSubmitState("error");
          return;
        }
        setSuccessMessage(
          "비밀번호 재설정 메일을 보냈습니다. 받은 편지함을 확인해 주세요.",
        );
        setSubmitState("success");
      })
      .catch(() => {
        setErrorMessage(
          "재설정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
        setSubmitState("error");
      });
  }

  function handleLogout() {
    setLogoutState("submitting");
    const client = createClient();
    signOut(client)
      .then(({ error }) => {
        setLogoutState(error ? "error" : "success");
      })
      .catch(() => setLogoutState("error"));
  }

  return (
    <section aria-label="계정 인증" className="space-y-6">
      {!isAuthenticated && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-[#23262B]">계정</h3>
            <p className="mt-1 text-sm text-[#23262B]/70">
              로그인하면 동행 모집글 작성, 참가 요청 등을 이용할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MODE_CARDS.map((card) => (
              <button
                key={card.mode}
                type="button"
                onClick={() => {
                  setMode(card.mode);
                  setSubmitState("idle");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                aria-pressed={mode === card.mode}
                className={`rounded-2xl border p-4 text-left ${
                  mode === card.mode
                    ? "border-[#FF6B4A] bg-[#FFF4F1]"
                    : "border-[#F1F1F3] bg-white"
                }`}
              >
                <p className="font-semibold text-[#23262B]">{card.title}</p>
                <p className="mt-1 text-sm text-[#23262B]/70">
                  {card.description}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-[#23262B]"
              >
                이메일
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-[#23262B]"
                >
                  비밀번호
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
                />
              </div>
            )}

            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="auth-nickname"
                    className="block text-sm font-medium text-[#23262B]"
                  >
                    닉네임
                  </label>
                  <input
                    id="auth-nickname"
                    type="text"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-start gap-2 text-sm text-[#23262B]">
                  <input
                    type="checkbox"
                    checked={adultAgreed}
                    onChange={(event) => setAdultAgreed(event.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    만 19세 이상 성인입니다. (자기신고, 생년월일은 저장하지
                    않습니다)
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitState === "submitting"
                ? "처리 중..."
                : mode === "login"
                  ? "로그인"
                  : mode === "signup"
                    ? "회원가입"
                    : "재설정 메일 보내기"}
            </button>

            {submitState === "error" && errorMessage && (
              <p role="alert" className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            {submitState === "success" && successMessage && (
              <p role="status" className="text-sm text-green-700">
                {successMessage}
              </p>
            )}
          </form>
        </>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#23262B]">
          {isAuthenticated
            ? "이용 가능한 기능"
            : "로그인하면 이용할 수 있는 기능"}
        </h3>
        <ul className="flex flex-wrap gap-2">
          <li className="rounded-full bg-[#FFE4DA] px-4 py-2 text-sm font-medium text-[#E14E2E]">
            동행 모집글 작성
          </li>
          <li className="rounded-full bg-[#FFE4DA] px-4 py-2 text-sm font-medium text-[#E14E2E]">
            참가 요청 보내기
          </li>
          <li className="rounded-full bg-[#FFE4DA] px-4 py-2 text-sm font-medium text-[#E14E2E]">
            내 활동 관리
          </li>
        </ul>
      </div>

      {isAuthenticated && (
        <div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutState === "submitting"}
            className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B] disabled:opacity-50"
          >
            {logoutState === "submitting" ? "로그아웃 중..." : "로그아웃"}
          </button>
          {logoutState === "error" && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              로그아웃에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl bg-[#F7F7F9] p-4 text-sm text-[#23262B]/70">
        <p className="font-medium text-[#23262B]">보안 안내</p>
        <p className="mt-1">
          비밀번호는 Supabase Auth가 안전하게 관리하며, 이 서비스는 비밀번호
          원문을 저장하지 않습니다.
        </p>
      </div>
    </section>
  );
}
