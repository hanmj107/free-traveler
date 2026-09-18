/**
 * 여행지 정적 데이터 타입(DATA-DESTINATIONS).
 * docs/02_SRS_BASELINE.md §7-1 DESTINATION·§7-2 DESTINATION_CONTENT·§7-4 MEDIA_ASSET을
 * 정적 TypeScript 타입으로 그대로 옮긴 것이다(docs/PROJECT_SCOPE.md §3 — DB 테이블 아님).
 */

/** COMP-SCR001-THEME-CHIPS 6개 테마와 1:1 대응한다. */
export type ThemeTag =
  "resort" | "city" | "gourmet" | "nature_hiking" | "family" | "budget";

export type SeasonTag =
  "spring" | "summer" | "autumn" | "winter" | "year_round";

export type DurationTag =
  "day_trip" | "one_night" | "two_nights" | "three_nights_plus";

export type RegionType = "domestic" | "global";

/** DESTINATION.publish_status — 정적 데이터는 게시된 항목만 포함하므로 PUBLISHED 고정. */
export type PublishStatus = "PUBLISHED";

/** §7-4 MEDIA_ASSET — 대표 이미지 메타데이터 5개 필드(§6-4) 전부 필수. */
export interface MediaAsset {
  mediaId: string;
  ownerEntityType: "DESTINATION";
  ownerEntityId: string;
  url: string;
  sourceUrl: string;
  author: string;
  licenseType: string;
  downloadedAt: string;
  altText: string;
}

/**
 * §7-2 DESTINATION_CONTENT — §3-4의 11개 필수 콘텐츠 항목과 1:1 대응한다.
 * 01 소개(introText+recommendedFor), 02 대표 이미지(Destination.media), 03 핵심 명소·체험(highlights),
 * 04 추천 시기(bestSeason/avoidSeason), 05 추천 일정(itinerary1Day/3Day), 06 예상 예산(budgetRange),
 * 07 현지 교통(localTransportInfo), 08 음식(foodList), 09 문화·에티켓(etiquetteList),
 * 10 안전정보 연결(Destination.countryCode, 해외 한정), 11 출처·수정일(sourceUrl/lastVerifiedAt).
 */
export interface DestinationContent {
  /** 300자 이상. */
  introText: string;
  recommendedFor: string;
  /** 5개 이상. */
  highlights: string[];
  bestSeason: string;
  avoidSeason: string;
  itinerary1Day: string;
  itinerary3Day: string;
  budgetRange: string;
  localTransportInfo: string;
  /** 3개 이상. */
  foodList: string[];
  foodAllergyNote?: string;
  /** 3개 이상. */
  etiquetteList: string[];
  sourceUrl: string;
  lastVerifiedAt: string;
}

/** §7-1 DESTINATION. */
export interface Destination {
  destinationId: string;
  regionType: RegionType;
  /** 해외 여행지 필수(§7-1). */
  country?: string;
  /** 해외 여행지 필수 — COUNTRY_SAFETY.countryCode FK(AC-D05). */
  countryCode?: string;
  city: string;
  name: string;
  seasonTags: SeasonTag[];
  themeTags: ThemeTag[];
  durationTags: DurationTag[];
  publishStatus: PublishStatus;
  sourceUrl: string;
  lastVerifiedAt: string;
  content: DestinationContent;
  /** 1개 이상(대표 이미지). */
  media: MediaAsset[];
}
