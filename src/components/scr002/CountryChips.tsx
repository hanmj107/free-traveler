import Link from "next/link";
import { aboutProfile, type Region } from "@/data/about";

const REGION_ORDER: Region[] = ["아시아", "유럽", "북미", "오세아니아"];

/**
 * 방문 국가 Chip(REQ-FUNC-ABOUT-003) — 아시아/유럽/북미/오세아니아 4권역,
 * 최소 30개국. 선택 시 관련 여행지 탐색(SCR-001)으로 이동한다.
 */
export default function CountryChips() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="text-2xl font-bold text-[#23262B]">방문 국가</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        지금까지 {aboutProfile.visitedCountries.length}개국을 방문했습니다.
        국가를 선택하면 관련 여행지를 확인할 수 있습니다.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {REGION_ORDER.map((region) => {
          const countries = aboutProfile.visitedCountries.filter(
            (c) => c.region === region,
          );
          if (countries.length === 0) {
            return null;
          }
          return (
            <div key={region}>
              <h3 className="text-sm font-semibold text-[#23262B]/70">
                {region}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {countries.map((country) => (
                  <li key={country.countryCode}>
                    <Link
                      href={`/?country=${encodeURIComponent(country.countryName)}`}
                      className="inline-flex min-h-11 items-center rounded-full bg-[#F1F1F3] px-4 text-sm font-medium text-[#23262B] hover:bg-[#FFE4DA] hover:text-[#E14E2E]"
                    >
                      {country.countryName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
