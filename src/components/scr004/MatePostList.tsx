import Link from "next/link";

const MAX_VISIBLE_POSTS = 8;

/** GET /api/mates 응답 항목과 동일한 형태(구조적 타입 — API-MATE-POSTS 참고). */
export interface MatePostSummary {
  post_id: string;
  country: string;
  region: string;
  start_date: string;
  end_date: string;
  travel_style_tags: string[];
  title: string;
  status: "RECRUITING" | "CLOSED";
}

interface MatePostListProps {
  posts: MatePostSummary[];
  loading: boolean;
  error: string | null;
  selectedPostId: string | null;
  onSelect: (postId: string) => void;
  onRetry: () => void;
  onResetFilters: () => void;
}

/**
 * 동행 목록 카드(REQ-FUNC-MATE-002/008) — 최대 8개 우선 노출, 마감 상태는 조회
 * 시점에 계산된 값을 그대로 표시(API-MATE-POSTS가 이미 계산해 전달), 닉네임 대신
 * 게시글 정보만 표시(연락처·작성자 개인정보 비노출).
 */
export default function MatePostList({
  posts,
  loading,
  error,
  selectedPostId,
  onSelect,
  onRetry,
  onResetFilters,
}: MatePostListProps) {
  if (loading) {
    return (
      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
      >
        {Array.from({ length: MAX_VISIBLE_POSTS }).map((_, index) => (
          <li
            key={index}
            className="h-40 animate-pulse rounded-2xl bg-[#F1F1F3]"
            aria-hidden="true"
          />
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl bg-[#F7F7F8] p-6 text-center">
        <p className="text-sm text-[#23262B]/70">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-[#F7F7F8] p-8 text-center">
        <p className="font-medium text-[#23262B]">
          조건에 맞는 동행 모집글이 없습니다.
        </p>
        <p className="mt-1 text-sm text-[#23262B]/60">
          검색 조건을 초기화하거나 기간을 넓혀보세요.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
          >
            필터 초기화
          </button>
          <Link
            href="/travel-tools?tab=mate"
            className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
          >
            동행 모집글 작성하기
          </Link>
        </div>
      </div>
    );
  }

  const visiblePosts = posts.slice(0, MAX_VISIBLE_POSTS);

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visiblePosts.map((post) => {
        const selected = post.post_id === selectedPostId;
        return (
          <li key={post.post_id}>
            <button
              type="button"
              onClick={() => onSelect(post.post_id)}
              aria-current={selected ? "true" : undefined}
              className={`block w-full rounded-2xl border p-4 text-left ${
                selected ? "border-[#FF6B4A]" : "border-[#F1F1F3]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#23262B]/60">
                  {post.country} · {post.region}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    post.status === "RECRUITING"
                      ? "bg-[#FFE4DA] text-[#E14E2E]"
                      : "bg-[#F1F1F3] text-[#23262B]/60"
                  }`}
                >
                  {post.status === "RECRUITING" ? "모집중" : "마감"}
                </span>
              </div>
              <p className="mt-2 font-semibold text-[#23262B]">{post.title}</p>
              <p className="mt-1 text-xs text-[#23262B]/60">
                {post.start_date} ~ {post.end_date}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
