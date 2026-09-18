"use client";

import { useEffect, useState } from "react";

/** GET /api/mates 응답 항목과 동일한 형태(구조적 타입 — API-MATE-POSTS 참고). */
export interface FilterableMatePost {
  post_id: string;
  country: string;
  region: string;
  start_date: string;
  end_date: string;
  travel_style_tags: string[];
  title: string;
  status: "RECRUITING" | "CLOSED";
}

export interface MateFilterCriteria {
  country: string;
  region: string;
  periodStart: string;
  periodEnd: string;
  styleTags: string[];
  onlyRecruiting: boolean;
}

const STYLE_TAG_OPTIONS = [
  { value: "resort", label: "휴양" },
  { value: "city", label: "도시 탐방" },
  { value: "gourmet", label: "미식" },
  { value: "nature_hiking", label: "자연·하이킹" },
  { value: "family", label: "가족여행" },
  { value: "budget", label: "저예산" },
] as const;

const EMPTY_CRITERIA: MateFilterCriteria = {
  country: "",
  region: "",
  periodStart: "",
  periodEnd: "",
  styleTags: [],
  onlyRecruiting: true,
};

/**
 * 검색 Filter(REQ-FUNC-MATE-002) — 국가/지역/기간/여행스타일/모집상태.
 * 기간은 구간 중첩(overlap) 매칭, 스타일은 OR 매칭으로 필터링한다.
 */
export function filterMatePosts(
  posts: FilterableMatePost[],
  criteria: MateFilterCriteria,
): FilterableMatePost[] {
  return posts.filter((post) => {
    if (criteria.onlyRecruiting && post.status !== "RECRUITING") {
      return false;
    }
    if (criteria.country && post.country !== criteria.country) {
      return false;
    }
    if (criteria.region && post.region !== criteria.region) {
      return false;
    }
    if (criteria.periodStart && post.end_date < criteria.periodStart) {
      return false;
    }
    if (criteria.periodEnd && post.start_date > criteria.periodEnd) {
      return false;
    }
    if (
      criteria.styleTags.length > 0 &&
      !criteria.styleTags.some((tag) => post.travel_style_tags.includes(tag))
    ) {
      return false;
    }
    return true;
  });
}

interface MateFilterProps {
  posts: FilterableMatePost[];
  onFilterChange: (filtered: FilterableMatePost[]) => void;
}

export default function MateFilter({ posts, onFilterChange }: MateFilterProps) {
  const [criteria, setCriteria] = useState<MateFilterCriteria>(EMPTY_CRITERIA);

  const countries = Array.from(
    new Set(posts.map((post) => post.country)),
  ).sort();
  const regions = Array.from(new Set(posts.map((post) => post.region))).sort();
  const filtered = filterMatePosts(posts, criteria);

  useEffect(() => {
    onFilterChange(filtered);
    // filtered는 posts/criteria로부터 매 렌더 다시 계산되는 파생값이라 의존성 배열에는
    // posts와 criteria만 두면 충분하다(무한 루프 방지).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, criteria]);

  function toggleStyleTag(tag: string) {
    setCriteria((prev) => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag)
        ? prev.styleTags.filter((t) => t !== tag)
        : [...prev.styleTags, tag],
    }));
  }

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-6">
      <h2 className="text-xl font-bold text-[#23262B]">모집글 찾기</h2>
      <p className="mt-1 text-sm text-[#23262B]/60">
        조건을 선택하면 목록이 바로 좁혀집니다.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="mate-filter-country"
            className="text-xs font-medium text-[#23262B]/70"
          >
            국가
          </label>
          <select
            id="mate-filter-country"
            value={criteria.country}
            onChange={(event) =>
              setCriteria((prev) => ({ ...prev, country: event.target.value }))
            }
            className="mt-1 block h-11 min-w-32 rounded-lg border border-[#F1F1F3] px-2 text-sm"
          >
            <option value="">전체 국가</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mate-filter-region"
            className="text-xs font-medium text-[#23262B]/70"
          >
            지역
          </label>
          <select
            id="mate-filter-region"
            value={criteria.region}
            onChange={(event) =>
              setCriteria((prev) => ({ ...prev, region: event.target.value }))
            }
            className="mt-1 block h-11 min-w-32 rounded-lg border border-[#F1F1F3] px-2 text-sm"
          >
            <option value="">전체 지역</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mate-filter-period-start"
            className="text-xs font-medium text-[#23262B]/70"
          >
            여행 기간
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="mate-filter-period-start"
              type="date"
              value={criteria.periodStart}
              onChange={(event) =>
                setCriteria((prev) => ({
                  ...prev,
                  periodStart: event.target.value,
                }))
              }
              className="h-11 rounded-lg border border-[#F1F1F3] px-2 text-sm"
            />
            <span className="text-sm text-[#23262B]/50">~</span>
            <input
              aria-label="여행 기간 종료"
              type="date"
              value={criteria.periodEnd}
              onChange={(event) =>
                setCriteria((prev) => ({
                  ...prev,
                  periodEnd: event.target.value,
                }))
              }
              className="h-11 rounded-lg border border-[#F1F1F3] px-2 text-sm"
            />
          </div>
        </div>

        <label className="flex h-11 items-center gap-2 text-sm text-[#23262B]">
          <input
            type="checkbox"
            checked={criteria.onlyRecruiting}
            onChange={(event) =>
              setCriteria((prev) => ({
                ...prev,
                onlyRecruiting: event.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          모집중만 보기
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {STYLE_TAG_OPTIONS.map((tag) => {
          const selected = criteria.styleTags.includes(tag.value);
          return (
            <button
              key={tag.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleStyleTag(tag.value)}
              className={`min-h-11 rounded-full px-4 text-sm font-medium ${
                selected
                  ? "bg-[#FF6B4A] text-white"
                  : "bg-[#F1F1F3] text-[#23262B]/70"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-medium text-[#23262B]">
        조건에 맞는 모집글 {filtered.length}건
      </p>
    </section>
  );
}
