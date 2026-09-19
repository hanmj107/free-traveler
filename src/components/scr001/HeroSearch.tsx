"use client";

import { useState, type FormEvent } from "react";

/**
 * SCR-001 검색 Hero — 높이 약 580px(Desktop)/420px(Mobile), 배경 여행 사진.
 * 도시·국가 검색 입력 후 제출하면 여행지 목록 Section으로 스크롤 이동한다
 * (REQ-FUNC-DEST-001/002). 실제 목록 필터링은 아래 여행 동기 Chip이 담당한다.
 */
export default function HeroSearch() {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document
      .getElementById("destinations")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      className="relative flex h-[420px] items-center justify-center overflow-hidden bg-cover bg-center px-5 md:h-[580px]"
      style={{
        backgroundImage:
          "url(https://picsum.photos/seed/free-traveler-hero/1920/1080)",
      }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/45" />
      <div className="relative mx-auto max-w-2xl text-center text-white">
        <h1 className="text-3xl font-bold md:text-[40px]">
          다음 여행지를 찾아보세요
        </h1>
        <p className="mt-3 text-base text-white/90 md:text-lg">
          도시나 국가를 검색하면 아래 인기 여행지 목록으로 바로 이동합니다.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex items-center gap-2 rounded-full bg-white p-2 shadow-lg"
        >
          <label htmlFor="hero-search-input" className="sr-only">
            도시 또는 국가 검색
          </label>
          <input
            id="hero-search-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 도쿄, 태국, 제주"
            className="h-11 flex-1 rounded-full border-0 px-4 text-sm text-[#23262B] outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full bg-[#FF6B4A] px-6 text-sm font-semibold text-white"
          >
            검색
          </button>
        </form>
      </div>
    </section>
  );
}
