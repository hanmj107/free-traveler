"use client";

import type { AlertLevel, CountrySafety } from "@/data/countrySafety";
import { useDestinationDrawer } from "./DestinationDrawer";

/**
 * SCR-001 국가별 주의사항 카드 6개 — 국기 대신 국가 코드 배지·국가명·경보
 * 배지·최종 확인일을 표시하고, 중대 경보(적색·흑색)는 카드 상단에 우선
 * 배치한다(REQ-FUNC-SAFETY-004/005). 카드 클릭 시 안전정보 패널을 연다.
 */

const ALERT_SEVERITY: Record<AlertLevel, number> = {
  흑색경보: 4,
  적색경보: 3,
  황색경보: 2,
  남색경보: 1,
  해당없음: 0,
};

const ALERT_BADGE_STYLE: Record<AlertLevel, string> = {
  해당없음: "bg-[#F1F1F3] text-[#4B505A]",
  남색경보: "bg-[#E4E6EA] text-[#23262B]",
  황색경보: "bg-[#FEF9C3] text-[#854D0E]",
  적색경보: "bg-[#FEE2E2] text-[#B91C1C]",
  흑색경보: "bg-[#FEE2E2] text-[#B91C1C]",
};

interface SafetyNoticeCardsProps {
  safetyList: CountrySafety[];
}

export default function SafetyNoticeCards({
  safetyList,
}: SafetyNoticeCardsProps) {
  const { openSafety } = useDestinationDrawer();

  const sorted = [...safetyList].sort(
    (a, b) => ALERT_SEVERITY[b.alertLevel] - ALERT_SEVERITY[a.alertLevel],
  );

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:py-24">
      <h2 className="text-2xl font-bold text-[#23262B] md:text-[28px]">
        국가별 주의사항
      </h2>
      <p className="mt-2 max-w-2xl text-base text-[#4B505A]">
        외교부 해외안전여행 공식 자료를 기준으로 확인일과 함께 정리했습니다.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((safety) => (
          <li key={safety.countryCode}>
            <button
              type="button"
              onClick={() => openSafety(safety.countryCode)}
              className="block w-full rounded-md border border-[#E4E6EA] bg-white p-4 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#F1F1F3] px-2 py-0.5 text-xs font-semibold text-[#4B505A]">
                  {safety.countryCode}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ALERT_BADGE_STYLE[safety.alertLevel]}`}
                >
                  {safety.alertLevel}
                </span>
              </div>
              <p className="mt-2 text-base font-semibold text-[#23262B]">
                {safety.countryName}
              </p>
              <p className="mt-1 text-xs text-[#767B85]">
                최종 확인일: {safety.lastVerifiedAt}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
