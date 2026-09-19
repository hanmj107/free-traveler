import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import HeroSearch from "@/components/scr001/HeroSearch";
import { ThemeFilterProvider } from "@/components/scr001/ThemeChips";
import ThemeChips from "@/components/scr001/ThemeChips";
import { DestinationDrawerProvider } from "@/components/scr001/DestinationDrawer";
import DomesticDestinations from "@/components/scr001/DomesticDestinations";
import GlobalDestinations from "@/components/scr001/GlobalDestinations";
import SafetyNoticeCards from "@/components/scr001/SafetyNoticeCards";
import RecentMatePosts from "@/components/scr001/RecentMatePosts";
import AboutSummary from "@/components/scr001/AboutSummary";
import { destinations } from "@/data/destinations";
import { countrySafetyList } from "@/data/countrySafety";
import { aboutProfile } from "@/data/about";

export const metadata: Metadata = {
  title: "Free Traveler — 자유여행 준비의 시작",
  description:
    "국내외 인기 여행지, 국가별 안전정보, 동행 모집글을 한 곳에서 확인하고 스스로 여행을 준비하세요.",
};

/**
 * SCR-001 `/` 메인 — Header → Hero(검색) → 국내 여행지 6개+(DATA-DESTINATIONS)
 * → 해외 여행지 6개+(DATA-DESTINATIONS) → 여행 동기 Chip 6개 → 국가별
 * 주의사항 6개+(DATA-SAFETY) → 최근 동행글 3개 또는 완성형 Empty
 * State(API-MATE-POSTS) → free_traveler 소개(DATA-REPRESENTATIVE) → Footer.
 */
export default function HomePage() {
  const domesticDestinations = destinations.filter(
    (destination) => destination.regionType === "domestic",
  );
  const globalDestinations = destinations.filter(
    (destination) => destination.regionType === "global",
  );

  return (
    <DestinationDrawerProvider
      destinations={destinations}
      safetyList={countrySafetyList}
    >
      <Header />
      <main className="flex-1">
        <HeroSearch />

        <ThemeFilterProvider>
          <DomesticDestinations destinations={domesticDestinations} />
          <GlobalDestinations
            destinations={globalDestinations}
            safetyList={countrySafetyList}
          />
          <ThemeChips />
        </ThemeFilterProvider>

        <SafetyNoticeCards safetyList={countrySafetyList} />

        <RecentMatePosts />

        <AboutSummary profile={aboutProfile} />
      </main>
      <Footer />
    </DestinationDrawerProvider>
  );
}
