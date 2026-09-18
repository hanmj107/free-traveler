"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 동행 작성 Form(REQ-FUNC-MATE-003/009, REQ-NFR-PRIV-005/006, REQ-NFR-SEC-008).
 * 로그인+성인확인이 완료된 사용자에게만 노출된다(부모 Page가 조건부 렌더링으로 보장).
 *
 * 참고: docs/02_SRS_BASELINE.md §7-7 MATE_POST에는 모집 인원(정원) 필드가 없다
 * (2026-09-03 결정 — "정원" 개념은 PRD·데이터 모델 어디에도 근거가 없어 제거됨,
 * 정원 관리가 필요해지면 별도 Should 요구사항으로 스키마부터 추가해야 한다). 이
 * Form도 같은 이유로 모집 인원 입력 필드를 두지 않는다.
 */

const STYLE_TAG_OPTIONS = [
  { value: "resort", label: "휴양" },
  { value: "city", label: "도시 탐방" },
  { value: "gourmet", label: "미식" },
  { value: "nature_hiking", label: "자연·하이킹" },
  { value: "family", label: "가족여행" },
  { value: "budget", label: "저예산" },
] as const;

export interface MateComposeValues {
  title: string;
  country: string;
  region: string;
  startDate: string;
  endDate: string;
  travelStyleTags: string[];
  bodyText: string;
  safetyRuleAgreed: boolean;
}

export interface MateComposeErrors {
  title?: string;
  country?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  travelStyleTags?: string;
  bodyText?: string;
  safetyRuleAgreed?: string;
}

const PHONE_PATTERN = /(01[0-9])[-.\s]?\d{3,4}[-.\s]?\d{4}/;
const GENERIC_PHONE_PATTERN = /\d{2,4}[-.\s]\d{3,4}[-.\s]\d{4}/;
const MESSENGER_KEYWORD_PATTERN =
  /(카카오톡|카톡|kakao\s*talk|kakaotalk|line\s*id|라인\s*아이디|telegram|텔레그램|wechat|위챗|instagram|인스타(그램)?|@[a-zA-Z0-9_]{3,})/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/** 전화번호·메신저 ID·이메일 등 연락처로 보이는 패턴이 있는지 탐지한다(MATE-009). */
export function detectContactInfo(text: string): boolean {
  if (!text) {
    return false;
  }
  return (
    PHONE_PATTERN.test(text) ||
    GENERIC_PHONE_PATTERN.test(text) ||
    MESSENGER_KEYWORD_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text)
  );
}

const EMPTY_VALUES: MateComposeValues = {
  title: "",
  country: "",
  region: "",
  startDate: "",
  endDate: "",
  travelStyleTags: [],
  bodyText: "",
  safetyRuleAgreed: false,
};

/** 국가·지역·기간·스타일·소개글 필수값과 연락처 미포함, 안전수칙 동의를 검증한다. */
export function validateMateComposeForm(
  values: MateComposeValues,
  today: Date = new Date(),
): MateComposeErrors {
  const errors: MateComposeErrors = {};
  const todayStr = today.toISOString().slice(0, 10);

  if (!values.title.trim()) {
    errors.title = "제목을 입력하세요.";
  } else if (detectContactInfo(values.title)) {
    errors.title = "제목에 연락처로 보이는 정보를 포함할 수 없습니다.";
  }

  if (!values.country.trim()) {
    errors.country = "국가를 입력하세요.";
  }
  if (!values.region.trim()) {
    errors.region = "지역을 입력하세요.";
  }

  if (!values.startDate) {
    errors.startDate = "여행 시작일을 입력하세요.";
  } else if (values.startDate < todayStr) {
    errors.startDate = "여행 시작일은 오늘 이후여야 합니다.";
  }

  if (!values.endDate) {
    errors.endDate = "여행 종료일을 입력하세요.";
  } else if (values.startDate && values.endDate < values.startDate) {
    errors.endDate = "여행 종료일은 시작일과 같거나 이후여야 합니다.";
  }

  if (values.travelStyleTags.length === 0) {
    errors.travelStyleTags = "여행 스타일을 1개 이상 선택하세요.";
  }

  if (!values.bodyText.trim()) {
    errors.bodyText = "상세 소개를 입력하세요.";
  } else if (detectContactInfo(values.bodyText)) {
    errors.bodyText =
      "본문에 전화번호·메신저 ID 등 연락처를 포함할 수 없습니다.";
  }

  if (!values.safetyRuleAgreed) {
    errors.safetyRuleAgreed = "안전수칙 동의가 필요합니다.";
  }

  return errors;
}

function mapServerError(code: string | undefined): string {
  switch (code) {
    case "contact_info_detected":
      return "본문에 연락처로 보이는 정보가 포함되어 있어 등록할 수 없습니다.";
    case "safety_rule_not_agreed":
      return "안전수칙 동의가 필요합니다.";
    case "adult_verification_required":
      return "성인 확인이 필요합니다. 계정 화면에서 확인해 주세요.";
    case "unauthorized":
      return "로그인이 필요합니다.";
    default:
      return "등록에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function MateComposeForm() {
  const [values, setValues] = useState<MateComposeValues>(EMPTY_VALUES);
  const [dirty, setDirty] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = validateMateComposeForm(values);
  const isValid = Object.keys(errors).length === 0;

  function handleFieldChange<K extends keyof MateComposeValues>(
    key: K,
    value: MateComposeValues[K],
  ) {
    setDirty(true);
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStyleTag(tag: string) {
    setDirty(true);
    setValues((prev) => ({
      ...prev,
      travelStyleTags: prev.travelStyleTags.includes(tag)
        ? prev.travelStyleTags.filter((t) => t !== tag)
        : [...prev.travelStyleTags, tag],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDirty(true);

    if (!isValid || submitState === "submitting") {
      return;
    }

    setSubmitState("submitting");
    setServerError(null);

    try {
      const response = await fetch("/api/mates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          country: values.country,
          region: values.region,
          startDate: values.startDate,
          endDate: values.endDate,
          travelStyleTags: values.travelStyleTags,
          bodyText: values.bodyText,
          safetyRuleAgreed: values.safetyRuleAgreed,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setServerError(mapServerError(data?.error));
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
    } catch {
      setServerError(
        "네트워크 오류로 등록하지 못했습니다. 다시 시도해 주세요.",
      );
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <div role="status" className="rounded-2xl bg-[#F7F7F8] p-6">
        <p className="font-semibold text-[#23262B]">
          동행 모집글이 등록되었습니다.
        </p>
        <p className="mt-1 text-sm text-[#23262B]/70">
          다른 여행자들이 참가 요청을 보낼 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/mates"
            className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
          >
            동행 찾기로 이동
          </Link>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY_VALUES);
              setDirty(false);
              setSubmitState("idle");
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-[#23262B]/20 px-5 text-sm font-medium text-[#23262B]"
          >
            새 모집글 작성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="mate-title"
          className="text-sm font-medium text-[#23262B]"
        >
          제목
        </label>
        <input
          id="mate-title"
          type="text"
          value={values.title}
          onChange={(event) => handleFieldChange("title", event.target.value)}
          aria-invalid={dirty && Boolean(errors.title)}
          aria-describedby={
            dirty && errors.title ? "mate-title-error" : undefined
          }
          className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
        />
        {dirty && errors.title && (
          <p id="mate-title-error" className="mt-1 text-xs text-[#E14E2E]">
            {errors.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="mate-country"
            className="text-sm font-medium text-[#23262B]"
          >
            국가
          </label>
          <input
            id="mate-country"
            type="text"
            value={values.country}
            onChange={(event) =>
              handleFieldChange("country", event.target.value)
            }
            aria-invalid={dirty && Boolean(errors.country)}
            aria-describedby={
              dirty && errors.country ? "mate-country-error" : undefined
            }
            className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
          />
          {dirty && errors.country && (
            <p id="mate-country-error" className="mt-1 text-xs text-[#E14E2E]">
              {errors.country}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="mate-region"
            className="text-sm font-medium text-[#23262B]"
          >
            지역
          </label>
          <input
            id="mate-region"
            type="text"
            value={values.region}
            onChange={(event) =>
              handleFieldChange("region", event.target.value)
            }
            aria-invalid={dirty && Boolean(errors.region)}
            aria-describedby={
              dirty && errors.region ? "mate-region-error" : undefined
            }
            className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
          />
          {dirty && errors.region && (
            <p id="mate-region-error" className="mt-1 text-xs text-[#E14E2E]">
              {errors.region}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="mate-start-date"
            className="text-sm font-medium text-[#23262B]"
          >
            여행 시작일
          </label>
          <input
            id="mate-start-date"
            type="date"
            value={values.startDate}
            onChange={(event) =>
              handleFieldChange("startDate", event.target.value)
            }
            aria-invalid={dirty && Boolean(errors.startDate)}
            aria-describedby={
              dirty && errors.startDate ? "mate-start-date-error" : undefined
            }
            className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
          />
          {dirty && errors.startDate && (
            <p
              id="mate-start-date-error"
              className="mt-1 text-xs text-[#E14E2E]"
            >
              {errors.startDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="mate-end-date"
            className="text-sm font-medium text-[#23262B]"
          >
            여행 종료일
          </label>
          <input
            id="mate-end-date"
            type="date"
            value={values.endDate}
            onChange={(event) =>
              handleFieldChange("endDate", event.target.value)
            }
            aria-invalid={dirty && Boolean(errors.endDate)}
            aria-describedby={
              dirty && errors.endDate ? "mate-end-date-error" : undefined
            }
            className="mt-1 h-11 w-full rounded-lg border border-[#F1F1F3] px-3 text-sm"
          />
          {dirty && errors.endDate && (
            <p id="mate-end-date-error" className="mt-1 text-xs text-[#E14E2E]">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[#23262B]">
          여행 스타일
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STYLE_TAG_OPTIONS.map((tag) => {
            const selected = values.travelStyleTags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleStyleTag(tag.value)}
                className={`min-h-11 rounded-full px-4 text-sm font-medium ${
                  selected
                    ? "bg-[#FF6B4A] text-white"
                    : "bg-[#F1F1F3] text-[#23262B]/70"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
        {dirty && errors.travelStyleTags && (
          <p className="mt-1 text-xs text-[#E14E2E]">
            {errors.travelStyleTags}
          </p>
        )}
      </fieldset>

      <div>
        <label
          htmlFor="mate-body"
          className="text-sm font-medium text-[#23262B]"
        >
          상세 소개
        </label>
        <textarea
          id="mate-body"
          value={values.bodyText}
          onChange={(event) =>
            handleFieldChange("bodyText", event.target.value)
          }
          aria-invalid={dirty && Boolean(errors.bodyText)}
          aria-describedby={
            dirty && errors.bodyText ? "mate-body-error" : undefined
          }
          rows={5}
          className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
        />
        {dirty && errors.bodyText && (
          <p id="mate-body-error" className="mt-1 text-xs text-[#E14E2E]">
            {errors.bodyText}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-[#23262B]/80">
        <input
          type="checkbox"
          checked={values.safetyRuleAgreed}
          onChange={(event) =>
            handleFieldChange("safetyRuleAgreed", event.target.checked)
          }
          className="mt-1 h-4 w-4"
        />
        <span>
          동행 모집글에 연락처 등 개인정보를 포함하지 않으며, Free Traveler는
          동행자의 신원이나 안전을 보증하지 않는다는 점에 동의합니다.
        </span>
      </label>
      {dirty && errors.safetyRuleAgreed && (
        <p className="text-xs text-[#E14E2E]">{errors.safetyRuleAgreed}</p>
      )}

      {submitState === "error" && serverError && (
        <p role="alert" className="text-sm text-[#E14E2E]">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitState === "submitting"}
        onClick={() => setDirty(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF6B4A] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitState === "submitting" ? "등록 중..." : "동행 모집글 등록하기"}
      </button>
    </form>
  );
}
