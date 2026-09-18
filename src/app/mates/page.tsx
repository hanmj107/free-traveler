"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import IntroCtaBanner from "@/components/scr004/IntroCtaBanner";
import MateFilter, {
  type FilterableMatePost,
} from "@/components/scr004/MateFilter";
import MatePostList from "@/components/scr004/MatePostList";
import MateDetailPanel from "@/components/scr004/MateDetailPanel";
import JoinRequestButton from "@/components/scr004/JoinRequestButton";
import ReportDialog from "@/components/scr004/ReportDialog";
import BlockButton from "@/components/scr004/BlockButton";
import JoinGuideSafety from "@/components/scr004/JoinGuideSafety";

/**
 * SCR-004 `/mates` 동행 조회 — Header → Intro(CTA) → Filter+결과 요약 → 목록(최대
 * 8개)+상세(Desktop 좌우 분할/Mobile Drawer) → 참가 방법+안전 안내 → Footer 순서로
 * 조립한다(UI_CONTRACT.md SCR-004 절). 목록·상세는 API-MATE-POSTS 단일 소스를
 * 공유하고, 참가 요청/신고/차단은 각 Component가 자체 API를 직접 호출한다.
 */
export default function MatesPage() {
  const [allPosts, setAllPosts] = useState<FilterableMatePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<FilterableMatePost[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [fetchToken, setFetchToken] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [filterResetCount, setFilterResetCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/mates")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { posts: FilterableMatePost[] }) => {
        if (active) {
          setAllPosts(data.posts);
          setListError(null);
          setListLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setListError(
            "모집글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          setListLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchToken]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setCurrentUserId(data.session?.user?.id ?? null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setCurrentUserId(session?.user?.id ?? null);
        }
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  function handleRetry() {
    setListLoading(true);
    setListError(null);
    setFetchToken((count) => count + 1);
  }

  function handleResetFilters() {
    setFilterResetCount((count) => count + 1);
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <IntroCtaBanner />

        <MateFilter
          key={filterResetCount}
          posts={allPosts}
          onFilterChange={setFilteredPosts}
        />

        <section className="mx-auto max-w-[1280px] px-5 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <MatePostList
              posts={filteredPosts}
              loading={listLoading}
              error={listError}
              selectedPostId={selectedPostId}
              onSelect={setSelectedPostId}
              onRetry={handleRetry}
              onResetFilters={handleResetFilters}
            />

            <div
              className={`${
                selectedPostId
                  ? "fixed inset-0 z-40 overflow-y-auto bg-white p-5"
                  : "hidden"
              } lg:static lg:z-auto lg:block lg:bg-transparent lg:p-0`}
            >
              {selectedPostId && (
                <button
                  type="button"
                  onClick={() => setSelectedPostId(null)}
                  className="mb-4 inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B] lg:hidden"
                >
                  닫기
                </button>
              )}
              <MateDetailPanel
                postId={selectedPostId}
                actions={(detail) => (
                  <>
                    <JoinRequestButton
                      postId={detail.post_id}
                      authorUserId={detail.author_user_id}
                      currentUserId={currentUserId}
                    />
                    <ReportDialog
                      targetType="MATE_POST"
                      targetId={detail.post_id}
                      currentUserId={currentUserId}
                    />
                    <BlockButton
                      blockedUserId={detail.author_user_id}
                      currentUserId={currentUserId}
                    />
                  </>
                )}
              />
            </div>
          </div>
        </section>

        <JoinGuideSafety />
      </main>
      <Footer />
    </>
  );
}
