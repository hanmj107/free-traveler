"use client";

import { useEffect, useState } from "react";

/**
 * SCR-005 관리자 패널 — 신고 목록(상태 변경) + 항공·숙소 외부 URL 설정. 이 Component가
 * 렌더링되는 것 자체를 Page(`PAGE-SCR005`)가 `profiles.role === "ADMIN"`일 때만
 * 허용하고(비관리자 접근 시 탭 자체 미렌더링), `reports`/`app_settings`의 실제 접근은
 * `reports_select_admin_only`/`app_settings_admin_write` RLS Policy가 서버에서
 * 다시 한번 강제한다(PRIV-003, SEC-004). 차트·통계 Dashboard·콘텐츠 CRUD·범용 감사
 * 로그는 만들지 않는다.
 */

interface Report {
  report_id: string;
  receipt_number: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: "RECEIVED" | "IN_REVIEW" | "RESOLVED";
}

const STATUS_OPTIONS: { value: Report["status"]; label: string }[] = [
  { value: "RECEIVED", label: "접수" },
  { value: "IN_REVIEW", label: "검토중" },
  { value: "RESOLVED", label: "처리완료" },
];

const TARGET_TYPE_LABEL: Record<string, string> = {
  USER: "사용자",
  MATE_POST: "동행글",
  MATE_APPLICATION: "참가 요청",
};

type LoadState = "loading" | "loaded" | "error";

/** app_settings 외부 URL 저장 전 형식 검증 — http/https 절대 URL만 허용한다. */
export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 관리자 UI 접근 Guard(REQ-FUNC-ADMIN-003, PRIV-003) — Page가 이 함수로 관리자
 * 탭·AdminPanel 렌더링 여부를 결정한다. RLS(`reports_select_admin_only` 등)가
 * 데이터 접근을 다시 한번 강제하므로, 이 함수는 UI 노출만 막는 1차 방어선이다.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

export default function AdminPanel() {
  const [reportsLoadState, setReportsLoadState] =
    useState<LoadState>("loading");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportStatusState, setReportStatusState] = useState<
    Record<string, "idle" | "saving" | "error" | "success">
  >({});

  const [urlsLoadState, setUrlsLoadState] = useState<LoadState>("loading");
  const [flightUrl, setFlightUrl] = useState("");
  const [hotelUrl, setHotelUrl] = useState("");
  const [flightUrlError, setFlightUrlError] = useState<string | null>(null);
  const [hotelUrlError, setHotelUrlError] = useState<string | null>(null);
  const [urlSaveState, setUrlSaveState] = useState<
    "idle" | "saving" | "error" | "success"
  >("idle");

  useEffect(() => {
    fetch("/api/reports")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then((data: { reports: Report[] }) => {
        setReports(data.reports);
        setReportsLoadState("loaded");
      })
      .catch(() => setReportsLoadState("error"));

    fetch("/api/admin/external-urls")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("fetch_failed")),
      )
      .then(
        (data: {
          flightLandingUrl: string | null;
          hotelLandingUrl: string | null;
        }) => {
          setFlightUrl(data.flightLandingUrl ?? "");
          setHotelUrl(data.hotelLandingUrl ?? "");
          setUrlsLoadState("loaded");
        },
      )
      .catch(() => setUrlsLoadState("error"));
  }, []);

  function changeReportStatus(reportId: string, status: Report["status"]) {
    setReportStatusState((state) => ({ ...state, [reportId]: "saving" }));
    fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("update_failed");
        }
        setReports((current) =>
          current.map((report) =>
            report.report_id === reportId ? { ...report, status } : report,
          ),
        );
        setReportStatusState((state) => ({ ...state, [reportId]: "success" }));
      })
      .catch(() => {
        setReportStatusState((state) => ({ ...state, [reportId]: "error" }));
      });
  }

  function saveExternalUrls() {
    const trimmedFlight = flightUrl.trim();
    const trimmedHotel = hotelUrl.trim();
    const flightValid = isValidHttpUrl(trimmedFlight);
    const hotelValid = isValidHttpUrl(trimmedHotel);

    setFlightUrlError(flightValid ? null : "올바른 URL 형식이 아닙니다.");
    setHotelUrlError(hotelValid ? null : "올바른 URL 형식이 아닙니다.");

    if (!flightValid || !hotelValid) {
      return;
    }

    setUrlSaveState("saving");
    fetch("/api/admin/external-urls", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flightLandingUrl: trimmedFlight,
        hotelLandingUrl: trimmedHotel,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("save_failed");
        }
        setUrlSaveState("success");
      })
      .catch(() => setUrlSaveState("error"));
  }

  return (
    <div className="space-y-10">
      <section aria-label="신고 관리" className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#23262B]">신고 관리</h3>
          <p className="mt-1 text-sm text-[#23262B]/70">
            접수된 신고의 처리 상태를 변경할 수 있습니다.
          </p>
        </div>

        {reportsLoadState === "loading" && (
          <p className="text-sm text-[#23262B]/60">불러오는 중입니다...</p>
        )}
        {reportsLoadState === "error" && (
          <p role="alert" className="text-sm text-red-600">
            신고 목록을 불러오지 못했습니다.
          </p>
        )}
        {reportsLoadState === "loaded" &&
          (reports.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#F1F1F3] p-4 text-sm text-[#23262B]/70">
              접수된 신고가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {reports.map((report) => (
                <li
                  key={report.report_id}
                  className="rounded-xl border border-[#F1F1F3] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-[#23262B]">
                        {report.receipt_number} ·{" "}
                        {TARGET_TYPE_LABEL[report.target_type] ??
                          report.target_type}
                      </p>
                      <p className="mt-1 text-sm text-[#23262B]/70">
                        {report.reason}
                      </p>
                    </div>
                    <select
                      value={report.status}
                      onChange={(event) =>
                        changeReportStatus(
                          report.report_id,
                          event.target.value as Report["status"],
                        )
                      }
                      disabled={
                        reportStatusState[report.report_id] === "saving"
                      }
                      className="rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {reportStatusState[report.report_id] === "success" && (
                    <p role="status" className="mt-2 text-sm text-green-700">
                      상태가 변경되었습니다.
                    </p>
                  )}
                  {reportStatusState[report.report_id] === "error" && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      상태 변경에 실패했습니다. 다시 시도해 주세요.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </section>

      <section aria-label="외부 URL 설정" className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-[#23262B]">
            항공·숙소 외부 URL 설정
          </h3>
          <p className="mt-1 text-sm text-[#23262B]/70">
            여행 준비 화면에서 연결할 외부 검색 사이트 주소를 관리합니다.
          </p>
        </div>

        {urlsLoadState === "loading" && (
          <p className="text-sm text-[#23262B]/60">불러오는 중입니다...</p>
        )}
        {urlsLoadState === "error" && (
          <p role="alert" className="text-sm text-red-600">
            외부 URL 설정을 불러오지 못했습니다.
          </p>
        )}
        {urlsLoadState === "loaded" && (
          <div className="max-w-md space-y-4">
            <div>
              <label
                htmlFor="admin-flight-url"
                className="block text-sm font-medium text-[#23262B]"
              >
                항공 검색 URL
              </label>
              <input
                id="admin-flight-url"
                type="text"
                value={flightUrl}
                onChange={(event) => setFlightUrl(event.target.value)}
                placeholder="https://www.google.com/travel/flights"
                className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
              />
              {flightUrlError && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {flightUrlError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-hotel-url"
                className="block text-sm font-medium text-[#23262B]"
              >
                숙소 검색 URL
              </label>
              <input
                id="admin-hotel-url"
                type="text"
                value={hotelUrl}
                onChange={(event) => setHotelUrl(event.target.value)}
                placeholder="https://www.booking.com"
                className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
              />
              {hotelUrlError && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {hotelUrlError}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={saveExternalUrls}
              disabled={urlSaveState === "saving"}
              className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {urlSaveState === "saving" ? "저장 중..." : "저장"}
            </button>

            {urlSaveState === "success" && (
              <p role="status" className="text-sm text-green-700">
                저장되었습니다.
              </p>
            )}
            {urlSaveState === "error" && (
              <p role="alert" className="text-sm text-red-600">
                저장에 실패했습니다. 관리자 권한을 확인해 주세요.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
