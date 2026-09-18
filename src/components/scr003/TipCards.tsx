const TIPS = [
  "환율은 출발 전 다시 확인하세요",
  "왕복보다 각각 검색하면 더 저렴할 수 있어요",
  "숙소는 위치와 후기를 함께 비교하세요",
] as const;

/**
 * 항공·숙소 찾기 Tip 카드 3개 + 입력값 비전달 고지(REQ-FUNC-FLIGHT-003, HOTEL-003).
 */
export default function TipCards() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10">
      <h2 className="text-2xl font-bold text-[#23262B]">항공·숙소 찾기 Tip</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        입력하신 정보는 저장되지 않습니다.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TIPS.map((tip) => (
          <div
            key={tip}
            className="rounded-2xl bg-[#F7F7F8] p-5 text-sm text-[#23262B]"
          >
            {tip}
          </div>
        ))}
      </div>
    </section>
  );
}
