/**
 * 대표 소개 정적 데이터(DATA-REPRESENTATIVE).
 * docs/02_SRS_BASELINE.md §7-5 REPRESENTATIVE_PROFILE을 정적 TypeScript 데이터로 그대로 옮긴 것이다
 * (docs/PROJECT_SCOPE.md §3 — DB 테이블 아님). SCR-001 요약(COMP-SCR001-ABOUT-SUMMARY)과
 * SCR-002 전체 화면(PAGE-SCR002)이 이 파일을 단일 소스로 공유한다(Risk R-07 대응).
 */

export type Region = "아시아" | "유럽" | "북미" | "오세아니아";

export interface VisitedCountry {
  region: Region;
  countryName: string;
  countryCode: string;
}

export interface TimelineEntry {
  year: number;
  destinationName: string;
  description: string;
}

/** §7-4 MEDIA_ASSET(owner_entity_type: REPRESENTATIVE_PROFILE) — Gallery 사진. */
export interface AboutGalleryPhoto {
  mediaId: string;
  url: string;
  sourceUrl: string;
  author: string;
  licenseType: string;
  /** 촬영시기(예: "2023년 가을"). */
  takenAt: string;
  altText: string;
  /** 촬영시기+출처를 함께 표기하는 캡션(design-reference/D-001/DESIGN.md §18). */
  caption: string;
}

export interface MemorableDestination {
  /** src/data/destinations.ts의 destinationId와 동일한 값(느슨한 참조, 타입 의존 없음). */
  destinationId: string;
  name: string;
  description: string;
}

export interface ContactSnsLink {
  label: string;
  url: string;
}

export interface RepresentativeProfile {
  profileId: string;
  name: string;
  tripCountMin: number;
  countryCountMin: number;
  regions: Region[];
  expertiseAreas: string[];
  philosophyText: string;
  contentPrincipleText: string;
  introText: string;
  /** 최소 30개국, 4개 권역(아시아/유럽/북미/오세아니아). */
  visitedCountries: VisitedCountry[];
  /** 최소 6개. */
  timelineEntries: TimelineEntry[];
  /** 정확히 4개(design-reference/D-001/DESIGN.md §18 SCR-002 ⑦). */
  memorableDestinations: MemorableDestination[];
  checklistItems: string[];
  contactSnsLinks: ContactSnsLink[];
  /** 최소 8장. */
  gallery: AboutGalleryPhoto[];
}

export const aboutProfile: RepresentativeProfile = {
  profileId: "profile-free-traveler",
  name: "free_traveler",
  tripCountMin: 50,
  countryCountMin: 30,
  regions: ["아시아", "유럽", "북미", "오세아니아"],
  expertiseAreas: [
    "가성비 항공권·숙소 루트 설계",
    "출국 전 국가별 안전정보 리서치",
    "현지 음식·로컬 시장 탐방",
    "배낭 여행 동선 최적화",
  ],
  philosophyText:
    "여행은 화려한 순간의 나열이 아니라 낯선 곳에서 스스로 판단하고 결정하는 연습이라고 믿는다. 50회가 넘는 여행 동안 예약 대행이나 값비싼 패키지 대신 직접 정보를 찾고 조건을 비교하는 방식을 고수해 왔으며, 그 경험을 바탕으로 free_traveler는 여행자가 스스로 여행을 준비할 수 있도록 돕는 도구를 만든다.",
  contentPrincipleText:
    "이 서비스에 소개되는 모든 여행지·안전정보는 직접 다녀온 경험과 외교부 해외안전여행 등 공식 출처를 명확히 구분해 표기한다. 개인적인 추천과 공식 정보를 섞어 전달하지 않으며, 확인일이 지난 정보는 반드시 갱신하거나 경고 표시를 남긴다.",
  introText:
    "2016년 첫 배낭여행을 시작으로 지금까지 50회 이상의 자유여행과 30개국 이상의 방문 기록을 쌓아 왔다. 국내 소도시 여행부터 유럽 장기 배낭여행까지 다양한 여행 스타일을 경험하며 얻은 노하우를 free_traveler를 통해 다른 여행자들과 나누고자 한다.",
  visitedCountries: [
    { region: "아시아", countryName: "대한민국", countryCode: "KR" },
    { region: "아시아", countryName: "일본", countryCode: "JP" },
    { region: "아시아", countryName: "중국", countryCode: "CN" },
    { region: "아시아", countryName: "대만", countryCode: "TW" },
    { region: "아시아", countryName: "홍콩", countryCode: "HK" },
    { region: "아시아", countryName: "베트남", countryCode: "VN" },
    { region: "아시아", countryName: "태국", countryCode: "TH" },
    { region: "아시아", countryName: "싱가포르", countryCode: "SG" },
    { region: "아시아", countryName: "말레이시아", countryCode: "MY" },
    { region: "아시아", countryName: "인도네시아", countryCode: "ID" },
    { region: "아시아", countryName: "필리핀", countryCode: "PH" },
    { region: "아시아", countryName: "캄보디아", countryCode: "KH" },
    { region: "유럽", countryName: "프랑스", countryCode: "FR" },
    { region: "유럽", countryName: "이탈리아", countryCode: "IT" },
    { region: "유럽", countryName: "스페인", countryCode: "ES" },
    { region: "유럽", countryName: "영국", countryCode: "GB" },
    { region: "유럽", countryName: "독일", countryCode: "DE" },
    { region: "유럽", countryName: "스위스", countryCode: "CH" },
    { region: "유럽", countryName: "오스트리아", countryCode: "AT" },
    { region: "유럽", countryName: "네덜란드", countryCode: "NL" },
    { region: "유럽", countryName: "체코", countryCode: "CZ" },
    { region: "유럽", countryName: "포르투갈", countryCode: "PT" },
    { region: "유럽", countryName: "그리스", countryCode: "GR" },
    { region: "유럽", countryName: "헝가리", countryCode: "HU" },
    { region: "북미", countryName: "미국", countryCode: "US" },
    { region: "북미", countryName: "캐나다", countryCode: "CA" },
    { region: "북미", countryName: "멕시코", countryCode: "MX" },
    { region: "오세아니아", countryName: "호주", countryCode: "AU" },
    { region: "오세아니아", countryName: "뉴질랜드", countryCode: "NZ" },
    { region: "오세아니아", countryName: "피지", countryCode: "FJ" },
  ],
  timelineEntries: [
    {
      year: 2016,
      destinationName: "태국 방콕",
      description:
        "첫 배낭여행지. 왕궁·왓포를 도보로 돌며 자유여행의 재미를 알게 된 여행",
    },
    {
      year: 2017,
      destinationName: "베트남 다낭·호이안",
      description:
        "미케비치와 호이안 고대마을을 종단하며 동남아 휴양 여행의 매력을 익힌 여행",
    },
    {
      year: 2018,
      destinationName: "일본 도쿄·오사카",
      description:
        "간사이·간토를 넘나들며 미식 여행 루트를 처음으로 직접 설계한 여행",
    },
    {
      year: 2019,
      destinationName: "유럽 3개국(프랑스·이탈리아·스페인)",
      description:
        "3주간의 첫 장기 배낭여행, 기차 패스만으로 국경을 넘나든 경험",
    },
    {
      year: 2021,
      destinationName: "국내 일주(강원·전라)",
      description: "이동 제약 속에서도 국내 소도시 여행의 매력을 재발견한 시기",
    },
    {
      year: 2022,
      destinationName: "인도네시아 발리·필리핀 세부",
      description: "휴양과 액티비티를 병행하는 섬 여행 노하우를 정리한 여행",
    },
    {
      year: 2023,
      destinationName: "영국·독일",
      description:
        "대중교통만으로 두 나라를 이동하며 유럽 철도 여행 노하우를 축적한 여행",
    },
    {
      year: 2025,
      destinationName: "홍콩·대만 반복 방문",
      description:
        "그동안의 여행 기록과 안전정보를 정리해 free_traveler 콘텐츠로 구축한 시기",
    },
  ],
  memorableDestinations: [
    {
      destinationId: "jp-tokyo",
      name: "일본 도쿄",
      description: "미식 여행의 즐거움을 처음으로 각인시켜 준 도시",
    },
    {
      destinationId: "fr-paris",
      name: "프랑스 파리",
      description:
        "3주 장기 배낭여행의 출발점이자 유럽 여행의 자신감을 얻은 도시",
    },
    {
      destinationId: "id-denpasar",
      name: "인도네시아 발리",
      description: "여행과 휴식의 균형을 다시 생각하게 해준 섬",
    },
    {
      destinationId: "kr-jeju",
      name: "대한민국 제주",
      description: "국내에서도 충분히 특별한 여행이 가능함을 보여준 여행지",
    },
  ],
  checklistItems: [
    "출발 전 외교부 해외안전여행 홈페이지에서 최신 여행경보를 확인한다",
    "숙소는 예약 전 최근 후기와 실제 위치를 지도로 교차 확인한다",
    "현지 긴급연락처와 대사관 정보를 오프라인으로도 저장해 둔다",
    "방문국의 복장·사진 촬영 관련 문화적 금기를 사전에 조사한다",
  ],
  contactSnsLinks: [
    { label: "Instagram", url: "https://instagram.com/freetraveler.official" },
    { label: "YouTube", url: "https://youtube.com/@freetraveler.official" },
    { label: "블로그", url: "https://blog.naver.com/freetraveler-official" },
  ],
  gallery: [
    {
      mediaId: "about-media-01",
      url: "https://picsum.photos/seed/about-bangkok/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2016년 겨울",
      altText: "방콕 왓포 사원 앞에서 촬영한 배낭여행 사진",
      caption: "2016년 겨울 · 태국 방콕 · 첫 배낭여행",
    },
    {
      mediaId: "about-media-02",
      url: "https://picsum.photos/seed/about-danang/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2017년 여름",
      altText: "다낭 미케비치에서 촬영한 여행 사진",
      caption: "2017년 여름 · 베트남 다낭 · 미케비치",
    },
    {
      mediaId: "about-media-03",
      url: "https://picsum.photos/seed/about-tokyo/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2018년 봄",
      altText: "도쿄 시부야 거리에서 촬영한 여행 사진",
      caption: "2018년 봄 · 일본 도쿄 · 시부야",
    },
    {
      mediaId: "about-media-04",
      url: "https://picsum.photos/seed/about-paris/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2019년 가을",
      altText: "파리 에펠탑을 배경으로 촬영한 여행 사진",
      caption: "2019년 가을 · 프랑스 파리 · 에펠탑",
    },
    {
      mediaId: "about-media-05",
      url: "https://picsum.photos/seed/about-gangwon/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2021년 가을",
      altText: "강원도 해안 도로에서 촬영한 국내 여행 사진",
      caption: "2021년 가을 · 대한민국 강원도 · 해안 도로",
    },
    {
      mediaId: "about-media-06",
      url: "https://picsum.photos/seed/about-bali/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2022년 봄",
      altText: "발리 탄나롯 사원 일몰을 촬영한 여행 사진",
      caption: "2022년 봄 · 인도네시아 발리 · 탄나롯 사원",
    },
    {
      mediaId: "about-media-07",
      url: "https://picsum.photos/seed/about-london/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2023년 여름",
      altText: "런던 타워브릿지 앞에서 촬영한 여행 사진",
      caption: "2023년 여름 · 영국 런던 · 타워브릿지",
    },
    {
      mediaId: "about-media-08",
      url: "https://picsum.photos/seed/about-hongkong/1200/900",
      sourceUrl: "https://picsum.photos/",
      author: "Lorem Picsum",
      licenseType:
        "Picsum Stock Photo License(Unsplash 소스 기반, 상업적 사용 가능)",
      takenAt: "2025년 봄",
      altText: "홍콩 빅토리아 피크에서 촬영한 야경 사진",
      caption: "2025년 봄 · 홍콩 · 빅토리아 피크",
    },
  ],
};

export default aboutProfile;
