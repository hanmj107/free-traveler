import Link from "next/link";
import type { RepresentativeProfile } from "@/data/about";

/**
 * SCR-001 free_traveler 요약(좌우 분할+CTA) — "50+ Trips"·"30+ Countries"
 * 수치는 DATA-REPRESENTATIVE 단일 소스를 그대로 인용한다(REQ-FUNC-ABOUT-001).
 */
interface AboutSummaryProps {
  profile: RepresentativeProfile;
}

export default function AboutSummary({ profile }: AboutSummaryProps) {
  const photo = profile.gallery[0];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:py-24">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-[#23262B] md:text-[28px]">
            {profile.name}를 소개합니다
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B505A]">
            {profile.introText}
          </p>
          <div className="mt-6 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-[#FF6B4A]">
                {profile.tripCountMin}+ Trips
              </p>
              <p className="text-sm text-[#767B85]">누적 자유여행</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#FF6B4A]">
                {profile.countryCountMin}+ Countries
              </p>
              <p className="text-sm text-[#767B85]">방문 국가</p>
            </div>
          </div>
          <Link
            href="/about"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-6 text-sm font-semibold text-white"
          >
            대표 소개 보기
          </Link>
        </div>

        {photo && (
          <img
            src={photo.url}
            alt={photo.altText}
            className="h-72 w-full rounded-lg object-cover md:h-96"
          />
        )}
      </div>
    </section>
  );
}
