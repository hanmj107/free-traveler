import { aboutProfile } from "@/data/about";

/**
 * 여행 지표 숫자 카드 2개(REQ-FUNC-ABOUT-001).
 * "50+ Trips"·"30+ Countries" 수치는 DATA-REPRESENTATIVE 단일 소스에서 가져오며,
 * SCR-001 요약(COMP-SCR001-ABOUT-SUMMARY)과 항상 같은 값을 참조한다(Risk R-07).
 */
export default function MetricCards() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-[#F7F7F8] p-8 text-center">
          <p className="text-5xl font-bold text-[#FF6B4A]">
            {aboutProfile.tripCountMin}+
          </p>
          <p className="mt-2 text-lg font-medium text-[#23262B]">Trips</p>
        </div>
        <div className="rounded-2xl bg-[#F7F7F8] p-8 text-center">
          <p className="text-5xl font-bold text-[#FF6B4A]">
            {aboutProfile.countryCountMin}+
          </p>
          <p className="mt-2 text-lg font-medium text-[#23262B]">Countries</p>
        </div>
      </div>
    </section>
  );
}
