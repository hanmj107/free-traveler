"use client";

import { useState } from "react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import IntroSteps from "@/components/scr003/IntroSteps";
import TabNav, { type TravelToolsTab } from "@/components/scr003/TabNav";
import FlightForm from "@/components/scr003/FlightForm";
import HotelForm from "@/components/scr003/HotelForm";
import TipCards from "@/components/scr003/TipCards";
import LoginPromptCard from "@/components/scr003/LoginPromptCard";

/**
 * SCR-003 `/travel-tools` 통합 여행 준비 — Header → Intro(3단계) → 탭(항공편/숙소/
 * 동행 구하기) → 탭별 Form(+요약/외부이동 Action Card) → Tip 3개 → Footer 순서로
 * 조립한다(design-reference/UI_CONTRACT.md SCR-003 절).
 *
 * 동행 구하기 탭은 현재 로그인 유도 카드(COMP-SCR003-LOGIN-GUARD)만으로 자리를
 * 확보해 두었다 — 실제 동행 작성 Form(COMP-SCR003-MATE-COMPOSE)과 로그인/성인확인
 * 상태에 따른 분기는 다음 단계에서 이 자리에 추가한다.
 */
export default function TravelToolsPage() {
  const [activeTab, setActiveTab] = useState<TravelToolsTab>("flight");

  return (
    <>
      <Header />
      <main className="flex-1">
        <IntroSteps />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <section className="mx-auto max-w-[1280px] px-5 py-10">
          {activeTab === "flight" && <FlightForm />}
          {activeTab === "hotel" && <HotelForm />}
          {activeTab === "mate" && <LoginPromptCard />}
        </section>

        <TipCards />
      </main>
      <Footer />
    </>
  );
}
