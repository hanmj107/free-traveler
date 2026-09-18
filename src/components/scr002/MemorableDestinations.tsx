"use client";

import Link from "next/link";
import { useState } from "react";
import { aboutProfile } from "@/data/about";

const EXPECTED_CARD_COUNT = 4;

/**
 * 기억에 남는 여행지 4개 + CTA Banner(REQ-FUNC-ABOUT-003).
 * 카드 선택 시 SCR-001 여행지 상세 확인으로 이동하고, CTA 버튼으로 여행 준비/동행 찾기로
 * 이어진다.
 */
export default function MemorableDestinations() {
  const destinations = aboutProfile.memorableDestinations;
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  if (destinations.length !== EXPECTED_CARD_COUNT) {
    return null;
  }

  function markFailed(id: string) {
    setFailedIds((prev) => new Set(prev).add(id));
  }

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="text-2xl font-bold text-[#23262B]">기억에 남는 여행지</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        지금까지의 여행 중 가장 기억에 남는 4곳을 소개합니다.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {destinations.map((destination) => {
          const failed = failedIds.has(destination.destinationId);
          const alt = `${destination.name}(특정 실제 인물을 지칭하지 않는 예시 이미지)`;
          return (
            <li key={destination.destinationId}>
              <Link
                href={`/?destination=${encodeURIComponent(destination.destinationId)}`}
                className="block overflow-hidden rounded-2xl border border-[#F1F1F3]"
              >
                <div className="aspect-[4/3] bg-[#F1F1F3]">
                  {!failed && (
                    <img
                      src={`https://picsum.photos/seed/${destination.destinationId}/480/360`}
                      alt={alt}
                      loading="lazy"
                      onError={() => markFailed(destination.destinationId)}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {failed && <span className="sr-only">{alt}</span>}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#23262B]">
                    {destination.name}
                  </p>
                  <p className="mt-1 text-sm text-[#23262B]/70">
                    {destination.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#F7F7F8] p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-medium text-[#23262B]">
          다음 여행을 계획하거나, 함께할 동행을 찾아보세요.
        </p>
        <div className="flex flex-shrink-0 gap-3">
          <Link
            href="/travel-tools"
            className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
          >
            여행 조건 정리하기
          </Link>
          <Link
            href="/mates"
            className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-semibold text-[#23262B]"
          >
            동행 찾아보기
          </Link>
        </div>
      </div>
    </section>
  );
}
