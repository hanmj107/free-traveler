"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import IntroSteps from "@/components/scr003/IntroSteps";
import TabNav, { type TravelToolsTab } from "@/components/scr003/TabNav";
import FlightForm from "@/components/scr003/FlightForm";
import HotelForm from "@/components/scr003/HotelForm";
import TipCards from "@/components/scr003/TipCards";
import LoginPromptCard from "@/components/scr003/LoginPromptCard";
import MateComposeForm from "@/components/scr003/MateComposeForm";

type MateAccess = "loading" | "guest" | "verified";

/**
 * SCR-003 `/travel-tools` 통합 여행 준비 — Header → Intro(3단계) → 탭(항공편/숙소/
 * 동행 구하기) → 탭별 Form(+요약/외부이동 Action Card) → Tip 3개 → [동행 구하기 탭]
 * 동행 작성 Form 또는 로그인 안내 → Footer 순서로 조립한다(UI_CONTRACT.md SCR-003 절).
 *
 * 동행 구하기 탭은 로그인+성인확인 완료 여부에 따라 MateComposeForm 또는
 * LoginPromptCard 중 하나만 표시한다(비로그인/미확인 상태에서는 작성 폼을 렌더링하지
 * 않는다 — COMP-SCR003-LOGIN-GUARD Functional AC).
 */
export default function TravelToolsPage() {
  const [activeTab, setActiveTab] = useState<TravelToolsTab>("flight");
  const [mateAccess, setMateAccess] = useState<MateAccess>("loading");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function resolveAccess(userId: string | undefined) {
      if (!userId) {
        if (active) {
          setMateAccess("guest");
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("adult_verified")
        .eq("id", userId)
        .single();

      if (active) {
        setMateAccess(data?.adult_verified ? "verified" : "guest");
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      void resolveAccess(data.session?.user?.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void resolveAccess(session?.user?.id);
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <IntroSteps />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <section className="mx-auto max-w-[1280px] px-5 py-10">
          {activeTab === "flight" && <FlightForm />}
          {activeTab === "hotel" && <HotelForm />}
          {activeTab === "mate" && (
            <>
              {mateAccess === "loading" && (
                <p className="text-sm text-[#23262B]/60">
                  로그인 상태를 확인하는 중입니다...
                </p>
              )}
              {mateAccess === "guest" && <LoginPromptCard />}
              {mateAccess === "verified" && <MateComposeForm />}
            </>
          )}
        </section>

        <TipCards />
      </main>
      <Footer />
    </>
  );
}
