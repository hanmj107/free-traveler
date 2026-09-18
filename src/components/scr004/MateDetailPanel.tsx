"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export interface MatePostDetail {
  post_id: string;
  author_user_id: string;
  country: string;
  region: string;
  start_date: string;
  end_date: string;
  travel_style_tags: string[];
  title: string;
  body_text: string;
  status: "RECRUITING" | "CLOSED";
}

interface MateDetailPanelProps {
  postId: string | null;
  /** 참가 요청/신고/차단 버튼 등 Page가 조립해 넣는 영역(Depends On 경계를 지키기 위한 슬롯). */
  actions?: (detail: MatePostDetail) => ReactNode;
}

/**
 * 상세 패널(REQ-FUNC-MATE-002/008) — 선택한 모집글 전체 내용, 마감 상태는 API가
 * 조회 시점에 계산해 준 값을 그대로 표시, 작성자는 표시하지 않는다(닉네임은 목록/상세
 * 어디에도 없음 — 연락처뿐 아니라 작성자 식별정보도 최소화, PRIV-004/MATE-002).
 */
export default function MateDetailPanel({
  postId,
  actions,
}: MateDetailPanelProps) {
  const [detail, setDetail] = useState<MatePostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedForPostId, setLoadedForPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let active = true;

    fetch(`/api/mates/${postId}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { post: MatePostDetail }) => {
        if (active) {
          setDetail(data.post);
          setError(null);
          setLoadedForPostId(postId);
        }
      })
      .catch(() => {
        if (active) {
          setDetail(null);
          setError("모집글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
          setLoadedForPostId(postId);
        }
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const loading = Boolean(postId) && loadedForPostId !== postId;

  if (!postId) {
    return (
      <div className="rounded-2xl border border-[#F1F1F3] p-6 text-sm text-[#23262B]/60">
        왼쪽 목록에서 모집글을 선택하면 상세 내용을 볼 수 있습니다.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        aria-busy="true"
        className="h-64 animate-pulse rounded-2xl bg-[#F1F1F3]"
        aria-hidden="true"
      />
    );
  }

  if (error || !detail) {
    return (
      <div
        role="alert"
        className="rounded-2xl bg-[#F7F7F8] p-6 text-sm text-[#23262B]/70"
      >
        {error ?? "모집글을 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#F1F1F3] p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#23262B]/60">
          {detail.country} · {detail.region}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            detail.status === "RECRUITING"
              ? "bg-[#FFE4DA] text-[#E14E2E]"
              : "bg-[#F1F1F3] text-[#23262B]/60"
          }`}
        >
          {detail.status === "RECRUITING" ? "모집중" : "마감"}
        </span>
      </div>

      <h2 className="mt-2 text-xl font-bold text-[#23262B]">{detail.title}</h2>
      <p className="mt-1 text-sm text-[#23262B]/60">
        {detail.start_date} ~ {detail.end_date}
      </p>

      {detail.travel_style_tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {detail.travel_style_tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-[#F1F1F3] px-3 py-1 text-xs font-medium text-[#23262B]/70"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#23262B]/80">
        {detail.body_text}
      </p>

      {actions && (
        <div className="mt-6 flex flex-wrap gap-3">{actions(detail)}</div>
      )}
    </div>
  );
}
