"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ThemeTag } from "@/types/destination";

/**
 * SCR-001 여행 동기·테마 Chip 6개 — 선택 시 국내·해외 인기 여행지 목록(위 두
 * Section)에 즉시 필터가 적용된다(REQ-FUNC-DEST-002/004). 세 Section이 같은
 * 선택 상태를 공유해야 해서, 이 파일이 Context Provider까지 함께 소유한다.
 */

interface ThemeFilterContextValue {
  selectedThemes: ThemeTag[];
  toggleTheme: (theme: ThemeTag) => void;
  resetThemes: () => void;
}

const ThemeFilterContext = createContext<ThemeFilterContextValue | null>(null);

export function ThemeFilterProvider({ children }: { children: ReactNode }) {
  const [selectedThemes, setSelectedThemes] = useState<ThemeTag[]>([]);

  function toggleTheme(theme: ThemeTag) {
    setSelectedThemes((current) =>
      current.includes(theme)
        ? current.filter((tag) => tag !== theme)
        : [...current, theme],
    );
  }

  function resetThemes() {
    setSelectedThemes([]);
  }

  return (
    <ThemeFilterContext.Provider
      value={{ selectedThemes, toggleTheme, resetThemes }}
    >
      {children}
    </ThemeFilterContext.Provider>
  );
}

export function useThemeFilter(): ThemeFilterContextValue {
  const ctx = useContext(ThemeFilterContext);
  if (!ctx) {
    throw new Error(
      "useThemeFilter는 ThemeFilterProvider 내부에서만 사용할 수 있다",
    );
  }
  return ctx;
}

export const THEME_OPTIONS: { value: ThemeTag; label: string }[] = [
  { value: "resort", label: "휴양" },
  { value: "city", label: "도시 탐방" },
  { value: "gourmet", label: "미식" },
  { value: "nature_hiking", label: "자연·하이킹" },
  { value: "family", label: "가족여행" },
  { value: "budget", label: "저예산" },
];

export default function ThemeChips() {
  const { selectedThemes, toggleTheme } = useThemeFilter();

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:py-24">
      <h2 className="text-2xl font-bold text-[#23262B] md:text-[28px]">
        여행 동기·테마로 찾기
      </h2>
      <p className="mt-2 max-w-2xl text-base text-[#4B505A]">
        관심 있는 테마를 선택하면 위 국내·해외 인기 여행지 목록이 바로
        좁혀집니다.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {THEME_OPTIONS.map((option) => {
          const selected = selectedThemes.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleTheme(option.value)}
              aria-pressed={selected}
              className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${
                selected
                  ? "bg-[#FF6B4A] text-white"
                  : "bg-[#F1F1F3] text-[#4B505A]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
