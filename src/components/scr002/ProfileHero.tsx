"use client";

import { useState } from "react";
import { aboutProfile } from "@/data/about";

/**
 * 대표 Hero(REQ-FUNC-ABOUT-001). 대표 사진 + 한 문장 소개로만 구성한다.
 * 실제 인물 오인 방지를 위해 특정 인물을 지칭하지 않는 예시 이미지를 사용한다.
 */
export default function ProfileHero() {
  const [imageFailed, setImageFailed] = useState(false);
  const firstSentence = aboutProfile.introText.split(".")[0]?.trim();
  const oneLineIntro = firstSentence
    ? `${firstSentence}.`
    : aboutProfile.introText;
  const heroAlt =
    "free_traveler 대표 이미지(특정 실제 인물을 지칭하지 않는 예시 이미지)";

  return (
    <section className="mx-auto flex min-h-[560px] max-w-[1280px] flex-col items-center justify-center gap-8 px-5 py-12 text-center md:h-[580px] md:flex-row md:justify-between md:text-left">
      <div className="order-2 max-w-xl md:order-1">
        <p className="text-sm font-semibold text-[#FF6B4A]">대표 소개</p>
        <h1 className="mt-2 text-3xl font-bold text-[#23262B] md:text-4xl">
          {aboutProfile.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#23262B]/80">
          {oneLineIntro}
        </p>
      </div>

      <div className="order-1 h-56 w-56 overflow-hidden rounded-full bg-[#F1F1F3] md:order-2 md:h-64 md:w-64">
        {!imageFailed && (
          <img
            src="https://picsum.photos/seed/free-traveler-hero/480/480"
            alt={heroAlt}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
        {imageFailed && <span className="sr-only">{heroAlt}</span>}
      </div>
    </section>
  );
}
