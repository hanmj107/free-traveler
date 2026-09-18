"use client";

import Link from "next/link";
import { useState } from "react";

type RequestState = "idle" | "submitting" | "sent" | "error";

interface JoinRequestButtonProps {
  postId: string;
  authorUserId: string;
  currentUserId: string | null;
}

/**
 * 참가 요청 UI(REQ-FUNC-MATE-004/005) — 비인증 시 SCR-005로 유도(MATE-001), 본인
 * 글에는 신청 버튼 대신 관리 안내, 중복 신청(409)은 안내 문구로 표시한다.
 */
export default function JoinRequestButton({
  postId,
  authorUserId,
  currentUserId,
}: JoinRequestButtonProps) {
  const [messageText, setMessageText] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!currentUserId) {
    return (
      <Link
        href="/account"
        className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
      >
        로그인 후 참가 요청 보내기
      </Link>
    );
  }

  if (currentUserId === authorUserId) {
    return (
      <p className="text-sm text-[#23262B]/60">
        본인이 작성한 모집글입니다. 참가 요청은 계정의 내 활동에서 관리할 수
        있습니다.
      </p>
    );
  }

  if (state === "sent") {
    return (
      <p role="status" className="text-sm font-medium text-[#23262B]">
        참가 요청을 보냈습니다. 작성자의 승인을 기다려 주세요.
      </p>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") {
      return;
    }

    setState("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/mates/${postId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText }),
      });

      if (response.status === 409) {
        setErrorMessage("이미 참가 요청을 보낸 모집글입니다.");
        setState("error");
        return;
      }
      if (!response.ok) {
        setErrorMessage(
          "참가 요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        setState("error");
        return;
      }

      setState("sent");
    } catch {
      setErrorMessage("네트워크 오류로 요청을 보내지 못했습니다.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <label
        htmlFor="join-request-message"
        className="text-sm font-medium text-[#23262B]"
      >
        간단 메시지
      </label>
      <textarea
        id="join-request-message"
        value={messageText}
        onChange={(event) => setMessageText(event.target.value)}
        rows={2}
        className="w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
      />
      {state === "error" && errorMessage && (
        <p role="alert" className="text-xs text-[#E14E2E]">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === "submitting" ? "보내는 중..." : "참가 요청 보내기"}
      </button>
    </form>
  );
}
