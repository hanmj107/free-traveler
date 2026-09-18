"use client";

import { useState } from "react";
import { aboutProfile } from "@/data/about";

const MIN_GALLERY_PHOTOS = 8;

/**
 * 여행 사진 Gallery(REQ-FUNC-ABOUT-002) — 최소 8장, 각 사진 alt 텍스트+촬영시기+출처
 * 캡션 필수(REQ-NFR-ACC-002). Desktop 4열/Mobile 2열.
 */
export default function PhotoGallery() {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const photos = aboutProfile.gallery;

  if (photos.length < MIN_GALLERY_PHOTOS) {
    return null;
  }

  function markFailed(mediaId: string) {
    setFailedIds((prev) => new Set(prev).add(mediaId));
  }

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12">
      <h2 className="text-2xl font-bold text-[#23262B]">여행 사진 Gallery</h2>
      <p className="mt-2 text-sm text-[#23262B]/60">
        서로 다른 여행지에서 촬영한 사진들을 촬영시기·출처와 함께 소개합니다.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {photos.map((photo) => {
          const failed = failedIds.has(photo.mediaId);
          return (
            <li key={photo.mediaId}>
              <div className="aspect-square overflow-hidden rounded-xl bg-[#F1F1F3]">
                {!failed && (
                  <img
                    src={photo.url}
                    alt={photo.altText}
                    loading="lazy"
                    onError={() => markFailed(photo.mediaId)}
                    className="h-full w-full object-cover"
                  />
                )}
                {failed && <span className="sr-only">{photo.altText}</span>}
              </div>
              <p className="mt-2 text-xs text-[#23262B]/60">{photo.caption}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
