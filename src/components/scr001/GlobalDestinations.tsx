"use client";

import { useState } from "react";
import type { Destination, DurationTag, SeasonTag } from "@/types/destination";
import type { AlertLevel, CountrySafety } from "@/data/countrySafety";
import { useThemeFilter } from "./ThemeChips";
import { useDestinationDrawer } from "./DestinationDrawer";

/**
 * SCR-001 해외 인기 여행지 카드 6개 이상 — 국내 목록과 동일한 계절·테마·기간
 * AND 필터를 적용하고(REQ-FUNC-DEST-001/002/004), 국가·도시명과 함께 안전등급
 * 배지를 색상+텍스트로 병기한다(ACC-004).
 */

const SEASON_OPTIONS: { value: SeasonTag; label: string }[] = [
  { value: "spring", label: "봄" },
  { value: "summer", label: "여름" },
  { value: "autumn", label: "가을" },
  { value: "winter", label: "겨울" },
  { value: "year_round", label: "사계절" },
];

const DURATION_OPTIONS: { value: DurationTag; label: string }[] = [
  { value: "day_trip", label: "당일치기" },
  { value: "one_night", label: "1박 2일" },
  { value: "two_nights", label: "2박 3일" },
  { value: "three_nights_plus", label: "3박 4일 이상" },
];

const ALERT_BADGE_STYLE: Record<AlertLevel, string> = {
  해당없음: "bg-[#F1F1F3] text-[#4B505A]",
  남색경보: "bg-[#E4E6EA] text-[#23262B]",
  황색경보: "bg-[#FEF9C3] text-[#854D0E]",
  적색경보: "bg-[#FEE2E2] text-[#B91C1C]",
  흑색경보: "bg-[#FEE2E2] text-[#B91C1C]",
};

interface GlobalDestinationsProps {
  destinations: Destination[];
  safetyList: CountrySafety[];
}

export default function GlobalDestinations({
  destinations,
  safetyList,
}: GlobalDestinationsProps) {
  const { selectedThemes, resetThemes } = useThemeFilter();
  const { openDestination } = useDestinationDrawer();
  const [season, setSeason] = useState<SeasonTag | "">("");
  const [duration, setDuration] = useState<DurationTag | "">("");

  const filtered = destinations.filter((destination) => {
    if (season && !destination.seasonTags.includes(season)) {
      return false;
    }
    if (duration && !destination.durationTags.includes(duration)) {
      return false;
    }
    if (
      selectedThemes.length > 0 &&
      !selectedThemes.some((theme) => destination.themeTags.includes(theme))
    ) {
      return false;
    }
    return true;
  });

  function handleReset() {
    setSeason("");
    setDuration("");
    resetThemes();
  }

  function safetyFor(countryCode: string | undefined) {
    return countryCode
      ? safetyList.find((entry) => entry.countryCode === countryCode)
      : undefined;
  }

  return (
    <section className="bg-[#F7F7F8] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-2xl font-bold text-[#23262B] md:text-[28px]">
          해외 인기 여행지
        </h2>
        <p className="mt-2 max-w-2xl text-base text-[#4B505A]">
          국가별 안전등급과 함께 해외 인기 여행지를 살펴보세요.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <label className="text-sm text-[#4B505A]">
            계절
            <select
              value={season}
              onChange={(event) =>
                setSeason(event.target.value as SeasonTag | "")
              }
              className="ml-2 h-11 rounded-lg border border-[#F1F1F3] bg-white px-3 text-sm text-[#23262B]"
            >
              <option value="">전체</option>
              {SEASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-[#4B505A]">
            기간
            <select
              value={duration}
              onChange={(event) =>
                setDuration(event.target.value as DurationTag | "")
              }
              className="ml-2 h-11 rounded-lg border border-[#F1F1F3] bg-white px-3 text-sm text-[#23262B]"
            >
              <option value="">전체</option>
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#E4E6EA] bg-white p-8 text-center">
            <p className="text-sm text-[#4B505A]">
              선택한 조건에 맞는 해외 여행지가 없습니다.
            </p>
            <p className="mt-1 text-sm text-[#767B85]">
              계절·기간·테마 조건을 완화하면 더 많은 여행지를 볼 수 있습니다.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
            >
              조건 초기화
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((destination) => {
              const safety = safetyFor(destination.countryCode);
              return (
                <li key={destination.destinationId}>
                  <button
                    type="button"
                    onClick={() => openDestination(destination.destinationId)}
                    className="block w-full overflow-hidden rounded-md border border-[#E4E6EA] bg-white text-left transition-shadow hover:shadow-[0_1px_2px_rgba(16,24,32,.04),0_8px_24px_rgba(16,24,32,.08)]"
                  >
                    <img
                      src={destination.media[0]?.url}
                      alt={destination.media[0]?.altText ?? destination.name}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-semibold text-[#23262B]">
                          {destination.country} · {destination.city}
                        </p>
                        {safety && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ALERT_BADGE_STYLE[safety.alertLevel]}`}
                          >
                            {safety.alertLevel}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#767B85]">
                        {destination.content.bestSeason}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
