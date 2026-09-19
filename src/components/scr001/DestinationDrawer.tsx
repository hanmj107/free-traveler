"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Destination } from "@/types/destination";
import type { CountrySafety } from "@/data/countrySafety";
import SafetyInfoPanel from "./SafetyInfoPanel";

/**
 * SCR-001 여행지 상세 Drawer + 안전정보 패널 — 국내/해외 여행지 카드, 국가별
 * 주의사항 카드가 전부 같은 Drawer를 열어야 해서 이 파일이 Context Provider와
 * 실제 Drawer UI를 함께 소유한다(§14 Drawer·Modal: Desktop 우측 슬라이드
 * 480~560px/Mobile 전체화면 Bottom Sheet).
 */

type DrawerView = "detail" | "safety";

interface DrawerState {
  open: boolean;
  view: DrawerView;
  destinationId: string | null;
  countryCode: string | null;
}

interface DestinationDrawerContextValue {
  openDestination: (destinationId: string) => void;
  openSafety: (countryCode: string) => void;
}

const DestinationDrawerContext =
  createContext<DestinationDrawerContextValue | null>(null);

export function useDestinationDrawer(): DestinationDrawerContextValue {
  const ctx = useContext(DestinationDrawerContext);
  if (!ctx) {
    throw new Error(
      "useDestinationDrawer는 DestinationDrawerProvider 내부에서만 사용할 수 있다",
    );
  }
  return ctx;
}

interface DestinationDrawerProviderProps {
  destinations: Destination[];
  safetyList: CountrySafety[];
  children: ReactNode;
}

export function DestinationDrawerProvider({
  destinations,
  safetyList,
  children,
}: DestinationDrawerProviderProps) {
  const [state, setState] = useState<DrawerState>({
    open: false,
    view: "detail",
    destinationId: null,
    countryCode: null,
  });

  function openDestination(destinationId: string) {
    setState({ open: true, view: "detail", destinationId, countryCode: null });
  }

  function openSafety(countryCode: string) {
    setState({ open: true, view: "safety", destinationId: null, countryCode });
  }

  function close() {
    setState((current) => ({ ...current, open: false }));
  }

  const destination = state.destinationId
    ? (destinations.find((d) => d.destinationId === state.destinationId) ??
      null)
    : null;

  function switchToSafety() {
    if (!destination?.countryCode) {
      return;
    }
    setState((current) => ({
      ...current,
      view: "safety",
      countryCode: destination.countryCode ?? null,
    }));
  }

  function switchToDetail() {
    setState((current) => ({ ...current, view: "detail" }));
  }

  const activeCountryCode = state.view === "safety" ? state.countryCode : null;
  const safety = activeCountryCode
    ? (safetyList.find((entry) => entry.countryCode === activeCountryCode) ??
      null)
    : null;

  return (
    <DestinationDrawerContext.Provider value={{ openDestination, openSafety }}>
      {children}
      <DestinationDrawer
        isOpen={state.open}
        view={state.view}
        destination={destination}
        safety={safety}
        onClose={close}
        onSwitchToSafety={switchToSafety}
        onSwitchToDetail={switchToDetail}
      />
    </DestinationDrawerContext.Provider>
  );
}

interface DestinationDrawerProps {
  isOpen: boolean;
  view: DrawerView;
  destination: Destination | null;
  safety: CountrySafety | null;
  onClose: () => void;
  onSwitchToSafety: () => void;
  onSwitchToDetail: () => void;
}

function DestinationDrawer({
  isOpen,
  view,
  destination,
  safety,
  onClose,
  onSwitchToSafety,
  onSwitchToDetail,
}: DestinationDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          view === "safety" && safety
            ? `${safety.countryName} 안전정보`
            : destination
              ? `${destination.name} 상세 정보`
              : "여행지 상세"
        }
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[20px] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,32,.04),0_8px_24px_rgba(16,24,32,.08)] md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[560px] md:rounded-t-none md:rounded-l-[20px]"
      >
        <button
          type="button"
          onClick={onClose}
          className="mb-4 inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B]"
        >
          닫기
        </button>

        {view === "detail" && destination && (
          <DestinationDetailContent
            destination={destination}
            onOpenSafety={onSwitchToSafety}
          />
        )}

        {view === "safety" && safety && (
          <div>
            {destination && (
              <button
                type="button"
                onClick={onSwitchToDetail}
                className="mb-4 text-sm font-medium text-[#2563EB] underline"
              >
                ← 여행지 상세로 돌아가기
              </button>
            )}
            <SafetyInfoPanel safety={safety} />
          </div>
        )}
      </div>
    </div>
  );
}

function DestinationDetailContent({
  destination,
  onOpenSafety,
}: {
  destination: Destination;
  onOpenSafety: () => void;
}) {
  const image = destination.media[0];

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-semibold text-[#767B85]">
          {destination.country ?? "대한민국"} · {destination.city}
        </span>
        <h3 className="mt-1 text-2xl font-bold text-[#23262B]">
          {destination.name}
        </h3>
      </div>

      {image && (
        <img
          src={image.url}
          alt={image.altText}
          className="h-56 w-full rounded-md object-cover"
        />
      )}

      <p className="text-sm leading-relaxed text-[#4B505A]">
        {destination.content.introText}
      </p>
      <p className="text-sm text-[#767B85]">
        추천 대상: {destination.content.recommendedFor}
      </p>

      <div>
        <h4 className="text-sm font-semibold text-[#23262B]">핵심 명소·체험</h4>
        <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-[#4B505A] sm:grid-cols-2">
          {destination.content.highlights.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">추천 시기</h4>
          <p className="mt-1 text-sm text-[#4B505A]">
            {destination.content.bestSeason}
          </p>
          <p className="mt-1 text-xs text-[#767B85]">
            피해야 할 시기: {destination.content.avoidSeason}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">예상 예산</h4>
          <p className="mt-1 text-sm text-[#4B505A]">
            {destination.content.budgetRange}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">추천 일정</h4>
          <p className="mt-1 text-sm text-[#4B505A]">
            당일: {destination.content.itinerary1Day}
          </p>
          <p className="mt-1 text-sm text-[#4B505A]">
            3일: {destination.content.itinerary3Day}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#23262B]">현지 교통</h4>
          <p className="mt-1 text-sm text-[#4B505A]">
            {destination.content.localTransportInfo}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#23262B]">음식</h4>
        <p className="mt-1 text-sm text-[#4B505A]">
          {destination.content.foodList.join(" · ")}
        </p>
        {destination.content.foodAllergyNote && (
          <p className="mt-1 text-xs text-[#767B85]">
            {destination.content.foodAllergyNote}
          </p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#23262B]">문화·에티켓</h4>
        <ul className="mt-1 space-y-1 text-sm text-[#4B505A]">
          {destination.content.etiquetteList.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </div>

      {destination.countryCode && (
        <button
          type="button"
          onClick={onOpenSafety}
          className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
        >
          국가별 주의사항 보기
        </button>
      )}

      <div className="border-t border-[#F1F1F3] pt-4 text-xs text-[#767B85]">
        <p>최종 확인일: {destination.content.lastVerifiedAt}</p>
        <a
          href={destination.content.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-medium text-[#2563EB] underline"
        >
          출처 보기
        </a>
      </div>
    </div>
  );
}
