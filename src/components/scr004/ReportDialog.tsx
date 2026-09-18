"use client";

import Link from "next/link";
import { useState } from "react";

const REASON_OPTIONS = [
  { value: "SPAM", label: "스팸/홍보성 게시물" },
  { value: "INAPPROPRIATE", label: "부적절한 내용" },
  { value: "CONTACT_INFO", label: "연락처 등 개인정보 포함" },
  { value: "OTHER", label: "기타" },
] as const;

interface ReportDialogProps {
  targetType: "MATE_POST" | "USER" | "MATE_APPLICATION";
  targetId: string;
  currentUserId: string | null;
}

/**
 * 신고 UI(REQ-FUNC-MATE-006) — 신고 사유는 Select+짧은 설명만(단순화 범위), 제출
 * 성공 시 접수번호를 화면에 표시한다(이메일 미사용).
 */
export default function ReportDialog({
  targetType,
  targetId,
  currentUserId,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reasonCode, setReasonCode] = useState<
    (typeof REASON_OPTIONS)[number]["value"]
  >(REASON_OPTIONS[0].value);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!currentUserId) {
    return (
      <Link
        href="/account"
        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
      >
        로그인 후 신고하기
      </Link>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const reasonLabel =
        REASON_OPTIONS.find((option) => option.value === reasonCode)?.label ??
        reasonCode;
      const reason = detail.trim()
        ? `${reasonLabel}: ${detail.trim()}`
        : reasonLabel;

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      if (!response.ok) {
        setErrorMessage(
          "신고를 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      const data = await response.json();
      setReceiptNumber(data.receiptNumber as string);
    } catch {
      setErrorMessage("네트워크 오류로 신고를 접수하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
      >
        신고하기
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="신고하기"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            {receiptNumber ? (
              <>
                <p role="status" className="font-semibold text-[#23262B]">
                  신고가 접수되었습니다.
                </p>
                <p className="mt-2 text-sm text-[#23262B]/70">
                  접수번호: {receiptNumber}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setReceiptNumber(null);
                    setDetail("");
                  }}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
                >
                  닫기
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-[#23262B]">
                  신고하기
                </h3>

                <label
                  htmlFor="report-reason"
                  className="text-sm font-medium text-[#23262B]"
                >
                  신고 사유
                </label>
                <select
                  id="report-reason"
                  value={reasonCode}
                  onChange={(event) =>
                    setReasonCode(
                      event.target
                        .value as (typeof REASON_OPTIONS)[number]["value"],
                    )
                  }
                  className="h-11 rounded-lg border border-[#F1F1F3] px-2 text-sm"
                >
                  {REASON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label
                  htmlFor="report-detail"
                  className="text-sm font-medium text-[#23262B]"
                >
                  간단 설명(선택)
                </label>
                <textarea
                  id="report-detail"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  rows={2}
                  className="rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
                />

                {errorMessage && (
                  <p role="alert" className="text-xs text-[#E14E2E]">
                    {errorMessage}
                  </p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="min-h-11 rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B]"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-11 rounded-full bg-[#FF6B4A] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? "접수 중..." : "신고 제출"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
