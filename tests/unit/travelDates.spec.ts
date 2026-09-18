import { describe, expect, it } from "vitest";
import {
  validateFlightForm,
  resolveExternalUrl,
} from "@/components/scr003/FlightForm";
import { validateHotelForm } from "@/components/scr003/HotelForm";

/**
 * UNIT-TRAVEL-DATES — 날짜 검증(REQ-FUNC-FLIGHT-002/HOTEL-002) + 외부 URL 선택 Unit Test.
 * COMP-SCR003-FLIGHT-FORM/COMP-SCR003-HOTEL-FORM이 내보내는 순수 함수를 그대로 검증한다.
 */

const TODAY = new Date("2026-09-18T00:00:00Z");
const YESTERDAY = "2026-09-17";
const TODAY_STR = "2026-09-18";
const TOMORROW = "2026-09-19";
const DAY_AFTER_TOMORROW = "2026-09-20";

describe("validateFlightForm — 과거 출발일 차단", () => {
  it("출발일이 과거이면 오류를 반환한다", () => {
    const errors = validateFlightForm(
      {
        country: "일본",
        region: "도쿄",
        startDate: YESTERDAY,
        endDate: TOMORROW,
      },
      TODAY,
    );
    expect(errors.startDate).toBeDefined();
  });

  it("출발일이 오늘이면 통과한다", () => {
    const errors = validateFlightForm(
      {
        country: "일본",
        region: "도쿄",
        startDate: TODAY_STR,
        endDate: TODAY_STR,
      },
      TODAY,
    );
    expect(errors.startDate).toBeUndefined();
  });
});

describe("validateFlightForm — 귀국일 역전 차단(당일 귀국 허용)", () => {
  it("귀국일이 출발일보다 이전이면 오류를 반환한다", () => {
    const errors = validateFlightForm(
      {
        country: "일본",
        region: "도쿄",
        startDate: TOMORROW,
        endDate: TODAY_STR,
      },
      TODAY,
    );
    expect(errors.endDate).toBeDefined();
  });

  it("귀국일이 출발일과 같으면(당일 귀국) 통과한다", () => {
    const errors = validateFlightForm(
      {
        country: "일본",
        region: "도쿄",
        startDate: TOMORROW,
        endDate: TOMORROW,
      },
      TODAY,
    );
    expect(errors.endDate).toBeUndefined();
  });
});

describe("validateFlightForm — 필수값 누락", () => {
  it("국가·지역·출발일·귀국일이 모두 비어 있으면 4개 오류를 반환한다", () => {
    const errors = validateFlightForm(
      { country: "", region: "", startDate: "", endDate: "" },
      TODAY,
    );
    expect(Object.keys(errors)).toHaveLength(4);
  });
});

describe("validateHotelForm — 과거 체크인 차단", () => {
  it("체크인이 과거이면 오류를 반환한다", () => {
    const errors = validateHotelForm(
      {
        country: "태국",
        region: "방콕",
        checkInDate: YESTERDAY,
        checkOutDate: TOMORROW,
      },
      TODAY,
    );
    expect(errors.checkInDate).toBeDefined();
  });
});

describe("validateHotelForm — 체크아웃≤체크인 차단(당일 포함)", () => {
  it("체크아웃이 체크인과 같은 날(당일)이면 오류를 반환한다", () => {
    const errors = validateHotelForm(
      {
        country: "태국",
        region: "방콕",
        checkInDate: TOMORROW,
        checkOutDate: TOMORROW,
      },
      TODAY,
    );
    expect(errors.checkOutDate).toBeDefined();
  });

  it("체크아웃이 체크인보다 이전이면 오류를 반환한다", () => {
    const errors = validateHotelForm(
      {
        country: "태국",
        region: "방콕",
        checkInDate: DAY_AFTER_TOMORROW,
        checkOutDate: TOMORROW,
      },
      TODAY,
    );
    expect(errors.checkOutDate).toBeDefined();
  });

  it("체크아웃이 체크인 다음 날이면 통과한다", () => {
    const errors = validateHotelForm(
      {
        country: "태국",
        region: "방콕",
        checkInDate: TOMORROW,
        checkOutDate: DAY_AFTER_TOMORROW,
      },
      TODAY,
    );
    expect(errors.checkOutDate).toBeUndefined();
  });
});

describe("resolveExternalUrl — 외부 URL 선택(app_settings 실패 시 안전한 기본값)", () => {
  it("정상적으로 받은 URL이 있으면 그 값을 사용한다", () => {
    expect(
      resolveExternalUrl(
        "https://real-flight-site.example",
        "https://fallback.example",
      ),
    ).toBe("https://real-flight-site.example");
  });

  it("null이면 기본 URL을 사용한다", () => {
    expect(resolveExternalUrl(null, "https://fallback.example")).toBe(
      "https://fallback.example",
    );
  });

  it("빈 문자열이면 기본 URL을 사용한다", () => {
    expect(resolveExternalUrl("", "https://fallback.example")).toBe(
      "https://fallback.example",
    );
  });

  it("undefined이면 기본 URL을 사용한다", () => {
    expect(resolveExternalUrl(undefined, "https://fallback.example")).toBe(
      "https://fallback.example",
    );
  });
});
