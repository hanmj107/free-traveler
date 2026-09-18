"use client";

import { useEffect, useState } from "react";

/**
 * 항공 조건 입력·검증·요약·외부이동(REQ-FUNC-FLIGHT-001~006).
 * 입력값은 브라우저 상태(및 선택적으로 localStorage)에만 머무르며 서버·쿼리·쿠키로
 * 전달하지 않는다(FLIGHT-006). 외부 이동은 확인 Dialog를 거친 뒤 새 탭으로만 연다.
 */

export interface FlightFormValues {
  country: string;
  region: string;
  startDate: string;
  endDate: string;
}

export interface FlightFormErrors {
  country?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

export const FLIGHT_FALLBACK_URL = "https://www.google.com/travel/flights";
const LAST_SEARCH_STORAGE_KEY = "travel-tools:flight:lastSearch";

/** 국가·지역·출발일·귀국일 누락과 귀국일 역전을 검증한다(당일 귀국은 허용). */
export function validateFlightForm(
  values: FlightFormValues,
  today: Date = new Date(),
): FlightFormErrors {
  const errors: FlightFormErrors = {};
  const todayStr = today.toISOString().slice(0, 10);

  if (!values.country.trim()) {
    errors.country = "국가를 입력하세요.";
  }
  if (!values.region.trim()) {
    errors.region = "지역을 입력하세요.";
  }

  if (!values.startDate) {
    errors.startDate = "출발일을 입력하세요.";
  } else if (values.startDate < todayStr) {
    errors.startDate = "출발일은 오늘 이후여야 합니다.";
  }

  if (!values.endDate) {
    errors.endDate = "귀국일을 입력하세요.";
  } else if (values.startDate && values.endDate < values.startDate) {
    errors.endDate = "귀국일은 출발일과 같거나 이후여야 합니다.";
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

const EMPTY_VALUES: FlightFormValues = {
  country: "",
  region: "",
  startDate: "",
  endDate: "",
};

/** localStorage에 저장된 최근 입력 1건을 읽는다(선택 기능, 서버에는 전달되지 않음). */
function readLastSearch(): FlightFormValues {
  if (typeof window === "undefined") {
    return EMPTY_VALUES;
  }
  try {
    const saved = window.localStorage.getItem(LAST_SEARCH_STORAGE_KEY);
    if (saved) {
      return {
        ...EMPTY_VALUES,
        ...(JSON.parse(saved) as Partial<FlightFormValues>),
      };
    }
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 빈 폼으로 시작한다.
  }
  return EMPTY_VALUES;
}

export default function FlightForm() {
  const [values, setValues] = useState<FlightFormValues>(readLastSearch);
  const [dirty, setDirty] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState(FLIGHT_FALLBACK_URL);

  const errors = validateFlightForm(values);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    let active = true;

    fetch("/api/admin/external-urls")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { flightLandingUrl?: string | null }) => {
        if (active) {
          setExternalUrl(
            resolveExternalUrl(data.flightLandingUrl, FLIGHT_FALLBACK_URL),
          );
        }
      })
      .catch(() => {
        if (active) {
          setExternalUrl(FLIGHT_FALLBACK_URL);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleFieldChange<K extends keyof FlightFormValues>(
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
              htmlFor="flight-country"
              className="text-sm font-medium text-[#23262B]"
            >
              국가
            </label>
            <input
              id="flight-country"
              type="text"
              value={values.country}
              onChange={(event) =>
                handleFieldChange("country", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.country)}
              aria-describedby={
                dirty && errors.country ? "flight-country-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.country && (
              <p
                id="flight-country-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.country}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="flight-region"
              className="text-sm font-medium text-[#23262B]"
            >
              지역
            </label>
            <input
              id="flight-region"
              type="text"
              value={values.region}
              onChange={(event) =>
                handleFieldChange("region", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.region)}
              aria-describedby={
                dirty && errors.region ? "flight-region-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.region && (
              <p
                id="flight-region-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.region}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="flight-start-date"
              className="text-sm font-medium text-[#23262B]"
            >
              출발일
            </label>
            <input
              id="flight-start-date"
              type="date"
              value={values.startDate}
              onChange={(event) =>
                handleFieldChange("startDate", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.startDate)}
              aria-describedby={
                dirty && errors.startDate
                  ? "flight-start-date-error"
                  : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.startDate && (
              <p
                id="flight-start-date-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="flight-end-date"
              className="text-sm font-medium text-[#23262B]"
            >
              귀국일
            </label>
            <input
              id="flight-end-date"
              type="date"
              value={values.endDate}
              onChange={(event) =>
                handleFieldChange("endDate", event.target.value)
              }
              aria-invalid={dirty && Boolean(errors.endDate)}
              aria-describedby={
                dirty && errors.endDate ? "flight-end-date-error" : undefined
              }
              className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
            />
            {dirty && errors.endDate && (
              <p
                id="flight-end-date-error"
                className="mt-1 text-xs text-[#E14E2E]"
              >
                {errors.endDate}
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
          항공편 보러 가기
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
            <dt>출발일</dt>
            <dd>{values.startDate || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>귀국일</dt>
            <dd>{values.endDate || "-"}</dd>
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
          aria-label="항공편 외부 이동 확인"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-[#23262B]">
              외부 사이트로 이동합니다
            </h3>
            <p className="mt-2 text-sm text-[#23262B]/70">
              {values.country} {values.region} · {values.startDate} ~{" "}
              {values.endDate}
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
                항공편 보러 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
