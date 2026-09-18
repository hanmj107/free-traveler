"use client";

import { useEffect, useState } from "react";

/**
 * 숙소 조건 입력·검증·요약·외부이동(REQ-FUNC-HOTEL-001~007).
 * 입력값은 브라우저 상태(및 선택적으로 localStorage)에만 머무르며 서버·쿼리·쿠키로
 * 전달하지 않는다(HOTEL-005/006). 외부 이동은 확인 Dialog를 거친 뒤 새 탭으로만 연다.
 */

export interface HotelFormValues {
  country: string;
  region: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface HotelFormErrors {
  country?: string;
  region?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export const HOTEL_FALLBACK_URL = "https://www.booking.com";
const LAST_SEARCH_STORAGE_KEY = "travel-tools:hotel:lastSearch";

/**
 * 국가·지역·체크인·체크아웃 누락과 날짜 역전을 검증한다. 체크아웃은 체크인보다
 * 반드시 이후여야 하며(당일 포함 차단), 항공편의 "당일 귀국 허용"과 다른 경계값이다.
 */
export function validateHotelForm(
  values: HotelFormValues,
  today: Date = new Date(),
): HotelFormErrors {
  const errors: HotelFormErrors = {};
  const todayStr = today.toISOString().slice(0, 10);

  if (!values.country.trim()) {
    errors.country = "국가를 입력하세요.";
  }
  if (!values.region.trim()) {
    errors.region = "지역을 입력하세요.";
  }

  if (!values.checkInDate) {
    errors.checkInDate = "체크인 날짜를 입력하세요.";
  } else if (values.checkInDate < todayStr) {
    errors.checkInDate = "체크인 날짜는 오늘 이후여야 합니다.";
  }

  if (!values.checkOutDate) {
    errors.checkOutDate = "체크아웃 날짜를 입력하세요.";
  } else if (values.checkInDate && values.checkOutDate <= values.checkInDate) {
    errors.checkOutDate = "체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.";
  }

  return errors;
}

/** app_settings에서 읽은 값이 비어 있으면 안전한 기본 URL을 사용한다. */
export function resolveExternalUrl(
  fetchedUrl: string | null | undefined,
  fallbackUrl: string,
): string {
  if (typeof fetchedUrl === "string" && fetchedUrl.trim().length > 0) {
    return fetchedUrl;
  }
  return fallbackUrl;
}

const EMPTY_VALUES: HotelFormValues = {
  country: "",
  region: "",
  checkInDate: "",
  checkOutDate: "",
};

/** localStorage에 저장된 최근 입력 1건을 읽는다(선택 기능, 서버에는 전달되지 않음). */
function readLastSearch(): HotelFormValues {
  if (typeof window === "undefined") {
    return EMPTY_VALUES;
  }
  try {
    const saved = window.localStorage.getItem(LAST_SEARCH_STORAGE_KEY);
    if (saved) {
      return {
        ...EMPTY_VALUES,
        ...(JSON.parse(saved) as Partial<HotelFormValues>),
      };
    }
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 빈 폼으로 시작한다.
  }
  return EMPTY_VALUES;
}

export default function HotelForm() {
  const [values, setValues] = useState<HotelFormValues>(readLastSearch);
  const [dirty, setDirty] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState(HOTEL_FALLBACK_URL);

  const errors = validateHotelForm(values);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    let active = true;

    fetch("/api/admin/external-urls")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { hotelLandingUrl?: string | null }) => {
        if (active) {
          setExternalUrl(
            resolveExternalUrl(data.hotelLandingUrl, HOTEL_FALLBACK_URL),
          );
        }
      })
      .catch(() => {
        if (active) {
          setExternalUrl(HOTEL_FALLBACK_URL);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleFieldChange<K extends keyof HotelFormValues>(
    key: K,
    value: string,
  ) {
    setDirty(true);
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleConfirmNavigate() {
    try {
      window.localStorage.setItem(
        LAST_SEARCH_STORAGE_KEY,
        JSON.stringify(values),
      );
    } catch {
      // 저장 실패는 이동을 막지 않는다(선택 기능).
    }
    window.open(externalUrl, "_blank", "noopener,noreferrer");
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <form
        className="flex-1"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="hotel-country"
              className="text-sm font-medium text-[#23262B]"
            >
              국가
            </label>
            <input
              id="hotel-country"
              type="text"
              value={values.country}
              onChange={(event) =>
                handleFieldChange("country", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.country)}
              aria-describedby={
                dirty && errors.country ? "hotel-country-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.country && (
              <p
                id="hotel-country-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.country}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="hotel-region"
              className="text-sm font-medium text-[#23262B]"
            >
              지역
            </label>
            <input
              id="hotel-region"
              type="text"
              value={values.region}
              onChange={(event) =>
                handleFieldChange("region", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.region)}
              aria-describedby={
                dirty && errors.region ? "hotel-region-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.region && (
              <p
                id="hotel-region-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.region}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="hotel-checkin"
              className="text-sm font-medium text-[#23262B]"
            >
              체크인
            </label>
            <input
              id="hotel-checkin"
              type="date"
              value={values.checkInDate}
              onChange={(event) =>
                handleFieldChange("checkInDate", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.checkInDate)}
              aria-describedby={
                dirty && errors.checkInDate ? "hotel-checkin-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.checkInDate && (
              <p
                id="hotel-checkin-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.checkInDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="hotel-checkout"
              className="text-sm font-medium text-[#23262B]"
            >
              체크아웃
            </label>
            <input
              id="hotel-checkout"
              type="date"
              value={values.checkOutDate}
              onChange={(event) =>
                handleFieldChange("checkOutDate", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.checkOutDate)}
              aria-describedby={
                dirty && errors.checkOutDate
                  ? "hotel-checkout-error"
                  : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.checkOutDate && (
              <p
                id="hotel-checkout-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.checkOutDate}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={() => {
            setDirty(true);
            if (isValid) {
              setDialogOpen(true);
            }
          }}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          숙소 보러 가기
        </button>
      </form>

      <div className="flex-1 rounded-2xl bg-[#F7F7F8] p-6">
        <h3 className="font-semibold text-[#23262B]">입력 요약</h3>
        <dl className="mt-3 flex flex-col gap-2 text-sm text-[#23262B]/80">
          <div className="flex justify-between">
            <dt>국가</dt>
            <dd>{values.country || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>지역</dt>
            <dd>{values.region || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>체크인</dt>
            <dd>{values.checkInDate || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>체크아웃</dt>
            <dd>{values.checkOutDate || "-"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[#23262B]/60">
          입력하신 정보는 서버에 저장되거나 외부 사이트로 전달되지 않습니다.
        </p>
      </div>

      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="숙소 외부 이동 확인"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-[#23262B]">
              외부 사이트로 이동합니다
            </h3>
            <p className="mt-2 text-sm text-[#23262B]/70">
              {values.country} {values.region} · {values.checkInDate} ~{" "}
              {values.checkOutDate}
            </p>
            <p className="mt-2 text-xs text-[#23262B]/60">
              입력하신 정보는 이동하는 외부 사이트로 전달되지 않습니다.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="min-h-11 rounded-full border border-[#23262B]/20 px-4 text-sm font-medium text-[#23262B]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmNavigate}
                className="min-h-11 rounded-full bg-[#FF6B4A] px-4 text-sm font-semibold text-white"
              >
                숙소 보러 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
