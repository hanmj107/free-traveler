"use client";

import { useState } from "react";
import { aboutProfile } from "@/data/about";

/**
 * 소개·철학 좌우 분할(REQ-FUNC-ABOUT-001).
 * 자기소개·여행을 시작한 이유·여행 철학·서비스를 만든 목적을 2~4개 문단으로 구성한다.
 */
export default function PhilosophySplit() {
  const [imageFailed, setImageFailed] = useState(false);
  const alt =
    "free_traveler의 여행 노트와 지도(특정 실제 인물을 지칭하지 않는 예시 이미지)";
  const paragraphs = [
    aboutProfile.introText,
    aboutProfile.philosophyText,
    aboutProfile.contentPrincipleText,
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="text-2xl font-bold text-[#23262B]">소개와 철학</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        free_traveler가 여행을 시작한 이유와 이 서비스를 만든 목적을 소개합니다.
      </p>

      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <div className="h-64 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-[#F1F1F3] md:h-auto md:w-80">
          {!imageFailed && (
            <img
              src="https://picsum.photos/seed/free-traveler-philosophy/640/480"
              alt={alt}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          )}
          {imageFailed && <span className="sr-only">{alt}</span>}
        </div>

        <div className="flex flex-col gap-4">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-relaxed text-[#23262B]/80"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
