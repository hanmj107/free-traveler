"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * SCR-005 내 활동 — ①내가 쓴 동행글(제목 수정+모집 마감) ②참가 요청 관리(내가 보낸
 * 요청 상태 + 내 글에 받은 요청 승인/거절) ③차단 목록(해제) ④새 동행글 작성 CTA.
 * 조회는 RLS로 이미 안전한 값만 오는 `mate_posts`/`mate_applications`/`user_blocks`를
 * 직접 읽고(REQ-NFR-PRIV-004 — 차단 목록은 본인만 조회), 쓰기(모집 마감/승인·거절/
 * 차단 해제)는 기존 API Route(API-MATE-POSTS/API-MATE-APPLICATIONS/API-BLOCKS)를
 * 호출한다.
 */

interface MyPost {
  post_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "RECRUITING" | "CLOSED";
}

interface SentApplication {
  application_id: string;
  post_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  postTitle: string;
}

interface ReceivedApplication {
  application_id: string;
  post_id: string;
  postTitle: string;
  message_text: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface BlockedUser {
  block_id: string;
  blocked_user_id: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  APPROVED: "승인됨",
  REJECTED: "거절됨",
};

interface MyActivityProps {
  userId: string;
}

type LoadState = "loading" | "loaded" | "error";

export default function MyActivity({ userId }: MyActivityProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [sentApplications, setSentApplications] = useState<SentApplication[]>(
    [],
  );
  const [receivedApplications, setReceivedApplications] = useState<
    ReceivedApplication[]
  >([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [postActionState, setPostActionState] = useState<
    Record<string, "idle" | "saving" | "error">
  >({});
  const [applicationActionState, setApplicationActionState] = useState<
    Record<string, "idle" | "saving" | "error">
  >({});
  const [blockActionState, setBlockActionState] = useState<
    Record<string, "idle" | "saving" | "error">
  >({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    let active = true;
    const client = createClient();

    async function load() {
      const [postsRes, sentRes, blocksRes] = await Promise.all([
        client
          .from("mate_posts")
          .select("post_id, title, start_date, end_date, status")
          .eq("author_user_id", userId)
          .order("created_at", { ascending: false }),
        client
          .from("mate_applications")
          .select("application_id, post_id, status, mate_posts(title)")
          .eq("applicant_user_id", userId)
          .order("created_at", { ascending: false }),
        client
          .from("user_blocks")
          .select("block_id, blocked_user_id")
          .eq("blocker_user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (postsRes.error || sentRes.error || blocksRes.error) {
        if (active) {
          setLoadState("error");
        }
        return;
      }

      const posts = (postsRes.data ?? []) as MyPost[];
      const postIds = posts.map((post) => post.post_id);

      let received: ReceivedApplication[] = [];
      if (postIds.length > 0) {
        const receivedRes = await client
          .from("mate_applications")
          .select(
            "application_id, post_id, message_text, status, mate_posts(title)",
          )
          .in("post_id", postIds)
          .order("created_at", { ascending: false });

        if (receivedRes.error) {
          if (active) {
            setLoadState("error");
          }
          return;
        }

        received = (receivedRes.data ?? []).map((row) => {
          const joined = row as unknown as {
            application_id: string;
            post_id: string;
            message_text: string;
            status: "PENDING" | "APPROVED" | "REJECTED";
            mate_posts: { title: string } | { title: string }[] | null;
          };
          const postTitle = Array.isArray(joined.mate_posts)
            ? (joined.mate_posts[0]?.title ?? "")
            : (joined.mate_posts?.title ?? "");
          return {
            application_id: joined.application_id,
            post_id: joined.post_id,
            postTitle,
            message_text: joined.message_text,
            status: joined.status,
          };
        });
      }

      const sent = (sentRes.data ?? []).map((row) => {
        const joined = row as unknown as {
          application_id: string;
          post_id: string;
          status: "PENDING" | "APPROVED" | "REJECTED";
          mate_posts: { title: string } | { title: string }[] | null;
        };
        const postTitle = Array.isArray(joined.mate_posts)
          ? (joined.mate_posts[0]?.title ?? "")
          : (joined.mate_posts?.title ?? "");
        return {
          application_id: joined.application_id,
          post_id: joined.post_id,
          postTitle,
          status: joined.status,
        };
      });

      if (active) {
        setMyPosts(posts);
        setSentApplications(sent);
        setReceivedApplications(received);
        setBlockedUsers((blocksRes.data ?? []) as BlockedUser[]);
        setLoadState("loaded");
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [userId, refreshToken]);

  function refresh() {
    setLoadState("loading");
    setRefreshToken((count) => count + 1);
  }

  function startEditing(post: MyPost) {
    setEditingPostId(post.post_id);
    setEditingTitle(post.title);
  }

  function saveTitle(postId: string) {
    if (!editingTitle.trim()) {
      return;
    }
    setPostActionState((state) => ({ ...state, [postId]: "saving" }));
    fetch(`/api/mates/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingTitle.trim() }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("update_failed");
        }
        setPostActionState((state) => ({ ...state, [postId]: "idle" }));
        setEditingPostId(null);
        refresh();
      })
      .catch(() => {
        setPostActionState((state) => ({ ...state, [postId]: "error" }));
      });
  }

  function closeRecruiting(postId: string) {
    setPostActionState((state) => ({ ...state, [postId]: "saving" }));
    fetch(`/api/mates/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("update_failed");
        }
        setPostActionState((state) => ({ ...state, [postId]: "idle" }));
        refresh();
      })
      .catch(() => {
        setPostActionState((state) => ({ ...state, [postId]: "error" }));
      });
  }

  function decideApplication(
    applicationId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    setApplicationActionState((state) => ({
      ...state,
      [applicationId]: "saving",
    }));
    fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("decide_failed");
        }
        setApplicationActionState((state) => ({
          ...state,
          [applicationId]: "idle",
        }));
        refresh();
      })
      .catch(() => {
        setApplicationActionState((state) => ({
          ...state,
          [applicationId]: "error",
        }));
      });
  }

  function unblock(blockedUserId: string) {
    setBlockActionState((state) => ({ ...state, [blockedUserId]: "saving" }));
    fetch(`/api/blocks?blockedUserId=${encodeURIComponent(blockedUserId)}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("unblock_failed");
        }
        setBlockActionState((state) => ({
          ...state,
          [blockedUserId]: "idle",
        }));
        refresh();
      })
      .catch(() => {
        setBlockActionState((state) => ({
          ...state,
          [blockedUserId]: "error",
        }));
      });
  }

  if (loadState === "loading") {
    return (
      <p className="text-sm text-[#23262B]/60">
        내 활동을 불러오는 중입니다...
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <p role="alert" className="text-sm text-red-600">
        내 활동을 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <section aria-label="내가 쓴 동행글" className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#23262B]">
            내가 쓴 동행글
          </h3>
          <p className="mt-1 text-sm text-[#23262B]/70">
            제목 수정과 모집 마감을 관리할 수 있습니다.
          </p>
        </div>

        {myPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#F1F1F3] p-6 text-center">
            <p className="text-sm text-[#23262B]/70">
              아직 작성한 동행글이 없습니다.
            </p>
            <Link
              href="/travel-tools?tab=mate"
              className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
            >
              동행글 작성하러 가기
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {myPosts.map((post) => (
              <li
                key={post.post_id}
                className="rounded-2xl border border-[#F1F1F3] p-4"
              >
                {editingPostId === post.post_id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => saveTitle(post.post_id)}
                      disabled={postActionState[post.post_id] === "saving"}
                      className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-4 text-sm font-medium text-white disabled:opacity-50"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPostId(null)}
                      className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B]"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#23262B]">{post.title}</p>
                      <p className="mt-1 text-xs text-[#23262B]/60">
                        {post.start_date} ~ {post.end_date} ·{" "}
                        {post.status === "RECRUITING" ? "모집중" : "마감"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(post)}
                        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B]"
                      >
                        제목 수정
                      </button>
                      {post.status === "RECRUITING" && (
                        <button
                          type="button"
                          onClick={() => closeRecruiting(post.post_id)}
                          disabled={postActionState[post.post_id] === "saving"}
                          className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B] disabled:opacity-50"
                        >
                          모집 마감
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {postActionState[post.post_id] === "error" && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    처리에 실패했습니다. 다시 시도해 주세요.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="참가 요청 관리" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#23262B]">
            참가 요청 관리
          </h3>
          <p className="mt-1 text-sm text-[#23262B]/70">
            내가 보낸 요청 상태와 내 글에 받은 요청을 관리합니다.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">보낸 요청</h4>
          {sentApplications.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-dashed border-[#F1F1F3] p-4 text-sm text-[#23262B]/70">
              아직 보낸 참가 요청이 없습니다. 동행 찾기에서 원하는 모집글에 참가
              요청을 보내보세요.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {sentApplications.map((application) => (
                <li
                  key={application.application_id}
                  className="flex items-center justify-between rounded-xl border border-[#F1F1F3] px-4 py-3 text-sm"
                >
                  <span className="text-[#23262B]">
                    {application.postTitle}
                  </span>
                  <span className="font-medium text-[#23262B]/70">
                    {STATUS_LABEL[application.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">받은 요청</h4>
          {receivedApplications.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-dashed border-[#F1F1F3] p-4 text-sm text-[#23262B]/70">
              아직 내 동행글에 받은 참가 요청이 없습니다.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {receivedApplications.map((application) => (
                <li
                  key={application.application_id}
                  className="rounded-xl border border-[#F1F1F3] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[#23262B]">
                    {application.postTitle}
                  </p>
                  <p className="mt-1 text-sm text-[#23262B]/70">
                    {application.message_text}
                  </p>
                  {application.status === "PENDING" ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          decideApplication(
                            application.application_id,
                            "APPROVED",
                          )
                        }
                        disabled={
                          applicationActionState[application.application_id] ===
                          "saving"
                        }
                        className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-4 text-sm font-medium text-white disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          decideApplication(
                            application.application_id,
                            "REJECTED",
                          )
                        }
                        disabled={
                          applicationActionState[application.application_id] ===
                          "saving"
                        }
                        className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B] disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-medium text-[#23262B]/70">
                      {STATUS_LABEL[application.status]}
                    </p>
                  )}
                  {applicationActionState[application.application_id] ===
                    "error" && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      처리에 실패했습니다. 다시 시도해 주세요.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-label="차단 목록" className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#23262B]">차단 목록</h3>
          <p className="mt-1 text-sm text-[#23262B]/70">
            차단한 사용자를 관리합니다. 본인만 조회할 수 있습니다.
          </p>
        </div>

        {blockedUsers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#F1F1F3] p-4 text-sm text-[#23262B]/70">
            차단한 사용자가 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {blockedUsers.map((block) => (
              <li
                key={block.block_id}
                className="flex items-center justify-between rounded-xl border border-[#F1F1F3] px-4 py-3 text-sm"
              >
                <span className="text-[#23262B]/70">차단된 사용자</span>
                <button
                  type="button"
                  onClick={() => unblock(block.blocked_user_id)}
                  disabled={
                    blockActionState[block.blocked_user_id] === "saving"
                  }
                  className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B] disabled:opacity-50"
                >
                  해제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-2xl bg-[#FFF4F1] p-5 text-center">
        <p className="text-sm text-[#23262B]/70">
          새로운 여행 동행을 찾고 있나요?
        </p>
        <Link
          href="/travel-tools?tab=mate"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
        >
          새 동행글 작성하기
        </Link>
      </div>
    </div>
  );
}
