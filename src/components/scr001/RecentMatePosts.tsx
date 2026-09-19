"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * SCR-001 최근 동행글 요약 3개 또는 Empty State — 공개·모집중 모집글 중 작성
 * 시점 기준 최신 3개만 보여주고 연락처는 절대 노출하지 않는다
 * (REQ-FUNC-MATE-002). 0건이면 완성형 Empty State(§17), 조회 실패 시 재시도
 * 안내를 보여준다.
 */

interface MatePostSummary {
  post_id: string;
  country: string;
  region: string;
  start_date: string;
  end_date: string;
  travel_style_tags: string[];
  title: string;
  status: "RECRUITING" | "CLOSED";
  created_at: string;
}

type LoadState = "loading" | "success" | "error";

export default function RecentMatePosts() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [posts, setPosts] = useState<MatePostSummary[]>([]);

  useEffect(() => {
    let active = true;

    fetch("/api/mates")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { posts: MatePostSummary[] }) => {
        if (!active) {
          return;
        }
        const recent = data.posts
          .filter((post) => post.status === "RECRUITING")
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(0, 3);
        setPosts(recent);
        setLoadState("success");
      })
      .catch(() => {
        if (active) {
          setLoadState("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-[#F7F7F8] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#23262B] md:text-[28px]">
              최근 동행글
            </h2>
            <p className="mt-2 max-w-2xl text-base text-[#4B505A]">
              다른 여행자들이 최근에 등록한 동행 모집글입니다.
            </p>
          </div>
          {loadState === "success" && posts.length > 0 && (
            <Link
              href="/mates"
              className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
            >
              동행 전체 보기
            </Link>
          )}
        </div>

        {loadState === "loading" && (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="h-40 animate-pulse rounded-md bg-[#E4E6EA]"
                aria-hidden="true"
              />
            ))}
          </ul>
        )}

        {loadState === "error" && (
          <div role="alert" className="mt-8 rounded-2xl bg-white p-6 text-sm">
            <p className="text-[#4B505A]">
              동행글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
            >
              새로고침
            </button>
          </div>
        )}

        {loadState === "success" && posts.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center">
            <p className="text-base font-semibold text-[#23262B]">
              아직 등록된 동행 모집글이 없습니다.
            </p>
            <p className="mt-2 text-sm text-[#4B505A]">
              동행 모집은 로그인 후 국가·기간·여행 스타일을 입력해 작성할 수
              있습니다.
            </p>
            <Link
              href="/travel-tools?tab=mate"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
            >
              동행 모집글 작성하기
            </Link>
          </div>
        )}

        {loadState === "success" && posts.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {posts.map((post) => (
              <li key={post.post_id}>
                <Link
                  href="/mates"
                  className="block h-full rounded-md border border-[#E4E6EA] bg-white p-5"
                >
                  <p className="text-xs font-semibold text-[#767B85]">
                    {post.country} · {post.region}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[#23262B]">
                    {post.title}
                  </p>
                  <p className="mt-2 text-xs text-[#767B85]">
                    {post.start_date} ~ {post.end_date}
                  </p>
                  {post.travel_style_tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.travel_style_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#F1F1F3] px-2 py-0.5 text-xs text-[#4B505A]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="mt-3 inline-block rounded-full bg-[#FFE4DA] px-2 py-0.5 text-xs font-semibold text-[#E14E2E]">
                    모집중
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
