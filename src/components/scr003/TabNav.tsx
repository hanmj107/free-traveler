"use client";

export type TravelToolsTab = "flight" | "hotel" | "mate";

const TABS: { id: TravelToolsTab; label: string }[] = [
  { id: "flight", label: "항공편" },
  { id: "hotel", label: "숙소" },
  { id: "mate", label: "동행 구하기" },
];

interface TabNavProps {
  activeTab: TravelToolsTab;
  onTabChange: (tab: TravelToolsTab) => void;
}

/**
 * SCR-003 탭 네비게이션(항공편/숙소/동행 구하기) — pill 형태 `<button>` 3개,
 * 활성 탭은 코랄로 표시한다. 탭별 입력·검증·완료 상태는 완전히 분리된다(부모가 보관).
 */
export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav aria-label="여행 준비 탭" className="mx-auto max-w-[1280px] px-5">
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-11 flex-shrink-0 rounded-full px-5 text-sm font-semibold ${
                isActive
                  ? "bg-[#FF6B4A] text-white"
                  : "bg-[#F1F1F3] text-[#23262B]/70"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
