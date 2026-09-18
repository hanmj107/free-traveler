import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import ProfileHero from "@/components/scr002/ProfileHero";
import MetricCards from "@/components/scr002/MetricCards";
import PhilosophySplit from "@/components/scr002/PhilosophySplit";
import TravelTimeline from "@/components/scr002/TravelTimeline";
import CountryChips from "@/components/scr002/CountryChips";
import PhotoGallery from "@/components/scr002/PhotoGallery";
import MemorableDestinations from "@/components/scr002/MemorableDestinations";

export const metadata: Metadata = {
  title: "대표 소개 | Free Traveler",
  description:
    "free_traveler의 여행 경험과 철학을 소개합니다 — 50회 이상의 여행, 30개국 이상의 방문 기록.",
};

/**
 * SCR-002 `/about` 대표 소개 — Header → Profile Hero → 여행 지표 → 소개·철학 →
 * Timeline → 방문 국가 → Gallery → 기억에 남는 여행지+CTA → Footer 순서로 조립한다
 * (design-reference/D-001/DESIGN.md §18, UI_CONTRACT.md SCR-002 절). 모든 Section은
 * src/data/about.ts(DATA-REPRESENTATIVE) 단일 소스를 참조한다(Risk R-07).
 */
export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ProfileHero />
        <MetricCards />
        <PhilosophySplit />
        <TravelTimeline />
        <CountryChips />
        <PhotoGallery />
        <MemorableDestinations />
      </main>
      <Footer />
    </>
  );
}
