"use client";

import Link from "next/link";
import { useState } from "react";

interface BlockButtonProps {
  blockedUserId: string;
  currentUserId: string | null;
}

/**
 * 차단 UI(REQ-FUNC-MATE-007, REQ-NFR-PRIV-004) — 설정 즉시 이후 목록·상세에서
 * 상대방 콘텐츠가 상호 비노출되도록 서버(RLS)가 강제한다. 이 버튼은 요청만 보낸다.
 */
export default function BlockButton({
  blockedUserId,
  currentUserId,
}: BlockButtonProps) {
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!currentUserId) {
    return (
      <Link
        href="/account"
        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
      >
        로그인 후 차단하기
      </Link>
    );
  }

  if (currentUserId === blockedUserId) {
    return null;
  }

  async function handleClick() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockedUserId }),
      });

      if (!response.ok) {
        setErrorMessage("차단하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      setBlocked(true);
    } catch {
      setErrorMessage("네트워크 오류로 차단하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (blocked) {
    return (
      <p role="status" className="text-sm text-[#23262B]/60">
        이 작성자를 차단했습니다. 이후 목록·상세에 표시되지 않습니다.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "처리 중..." : "작성자 차단하기"}
      </button>
      {errorMessage && (
        <p role="alert" className="mt-1 text-xs text-[#E14E2E]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
