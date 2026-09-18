import { aboutProfile } from "@/data/about";

const MIN_TIMELINE_ENTRIES = 6;

/**
 * 여행 Timeline(REQ-FUNC-ABOUT-001) — 연도별 항목 최소 6개(연도·여행지·한 줄 설명).
 * 6개 미만이면 렌더링하지 않는다(Functional AC "6개 미만 렌더링 금지").
 */
export default function TravelTimeline() {
  const entries = aboutProfile.timelineEntries;

  if (entries.length < MIN_TIMELINE_ENTRIES) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="text-2xl font-bold text-[#23262B]">여행 Timeline</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        지금까지의 여행 기록을 연도순으로 정리했습니다.
      </p>

      <ol className="mt-8 flex flex-col gap-6 border-l-2 border-[#F1F1F3] pl-6">
        {entries.map((entry) => (
          <li
            key={`${entry.year}-${entry.destinationName}`}
            className="relative"
          >
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#FF6B4A]" />
            <p className="text-sm font-semibold text-[#FF6B4A]">{entry.year}</p>
            <p className="mt-1 text-base font-semibold text-[#23262B]">
              {entry.destinationName}
            </p>
            <p className="mt-1 text-sm text-[#23262B]/70">
              {entry.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
