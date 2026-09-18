"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * SCR-005 프로필 요약+수정 — 닉네임·이메일·성인확인 배지·연령대/여행스타일(선택)을
 * 표시하고 닉네임/연령대/스타일만 수정 가능하게 한다. 이메일은 Supabase Auth가
 * 관리하는 값이라 여기서 변경하지 않는다. age_range/travel_style_tags는 선택
 * 입력이며 생년월일은 어디에도 수집·저장하지 않는다(PRIV-002).
 */

const AGE_RANGE_OPTIONS = ["20대", "30대", "40대", "50대", "60대 이상"];

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "resort", label: "휴양" },
  { value: "city", label: "도시" },
  { value: "gourmet", label: "미식" },
  { value: "nature_hiking", label: "자연·하이킹" },
  { value: "family", label: "가족" },
  { value: "budget", label: "저예산" },
];

interface Profile {
  nickname: string;
  email: string;
  adult_verified: boolean;
  age_range: string | null;
  travel_style_tags: string[];
}

interface ProfileEditProps {
  userId: string;
}

type LoadState = "loading" | "loaded" | "error";
type SaveState = "idle" | "saving" | "error" | "success";

export default function ProfileEdit({ userId }: ProfileEditProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const client = createClient();

    client
      .from("profiles")
      .select("nickname, email, adult_verified, age_range, travel_style_tags")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }
        if (error || !data) {
          setLoadState("error");
          return;
        }
        const loaded = data as Profile;
        setProfile(loaded);
        setNickname(loaded.nickname ?? "");
        setAgeRange(loaded.age_range ?? "");
        setStyleTags(loaded.travel_style_tags ?? []);
        setLoadState("loaded");
      });

    return () => {
      active = false;
    };
  }, [userId]);

  function toggleStyle(value: string) {
    setStyleTags((tags) =>
      tags.includes(value)
        ? tags.filter((tag) => tag !== value)
        : [...tags, value],
    );
  }

  function handleSave() {
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해 주세요.");
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    setErrorMessage(null);
    const client = createClient();

    client
      .from("profiles")
      .update({
        nickname: nickname.trim(),
        age_range: ageRange || null,
        travel_style_tags: styleTags,
      })
      .eq("id", userId)
      .then(({ error }) => {
        if (error) {
          setErrorMessage("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          setSaveState("error");
          return;
        }
        setSaveState("success");
      });
  }

  if (loadState === "loading") {
    return (
      <p className="text-sm text-[#23262B]/60">프로필을 불러오는 중입니다...</p>
    );
  }

  if (loadState === "error" || !profile) {
    return (
      <p role="alert" className="text-sm text-red-600">
        프로필을 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }

  return (
    <section aria-label="프로필" className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-[#23262B]">프로필</h3>
        <p className="mt-1 text-sm text-[#23262B]/70">
          닉네임과 여행 취향을 관리합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[#23262B]/70">이메일</span>
        <span className="text-sm font-medium text-[#23262B]">
          {profile.email}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            profile.adult_verified
              ? "bg-[#E7F6EC] text-[#1F8A4C]"
              : "bg-[#F1F1F3] text-[#23262B]/60"
          }`}
        >
          {profile.adult_verified ? "성인 확인 완료" : "성인 확인 미완료"}
        </span>
      </div>

      <div className="max-w-md space-y-4">
        <div>
          <label
            htmlFor="profile-nickname"
            className="block text-sm font-medium text-[#23262B]"
          >
            닉네임
          </label>
          <input
            id="profile-nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="profile-age-range"
            className="block text-sm font-medium text-[#23262B]"
          >
            연령대 (선택)
          </label>
          <select
            id="profile-age-range"
            value={ageRange}
            onChange={(event) => setAgeRange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#F1F1F3] px-3 py-2 text-sm"
          >
            <option value="">선택 안 함</option>
            {AGE_RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-[#23262B]">
            여행 스타일 (선택)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStyle(option.value)}
                aria-pressed={styleTags.includes(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  styleTags.includes(option.value)
                    ? "border-[#FF6B4A] bg-[#FFF4F1] text-[#E14E2E]"
                    : "border-[#F1F1F3] text-[#23262B]/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saveState === "saving" ? "저장 중..." : "저장"}
        </button>

        {saveState === "error" && errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {saveState === "success" && (
          <p role="status" className="text-sm text-green-700">
            저장되었습니다.
          </p>
        )}
      </div>
    </section>
  );
}
