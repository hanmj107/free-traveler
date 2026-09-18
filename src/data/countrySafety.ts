/**
 * 국가별 안전정보 정적 데이터(DATA-SAFETY).
 * docs/02_SRS_BASELINE.md §7-3 COUNTRY_SAFETY를 정적 TypeScript 데이터로 그대로 옮긴 것이다
 * (docs/PROJECT_SCOPE.md §3 — DB 테이블 아님). src/data/destinations.ts의 해외 15개국(countryCode)과
 * 1:N으로 연결된다(AC-D05).
 *
 * 각 항목은 외교부 해외안전여행(https://www.0404.go.kr) 공식 자료를 기준으로 정리한 참고용
 * 정적 데이터다. 실제 출국 전에는 반드시 공식 홈페이지에서 최신 경보를 재확인해야 한다
 * (docs/DECISION_LOG.md, SCR-001 안전정보 패널 고지 문구와 동일한 원칙).
 */

/** 외교부 해외안전여행 4단계 경보 체계. */
export type AlertLevel =
  "해당없음" | "남색경보" | "황색경보" | "적색경보" | "흑색경보";

export type AlertScope = "국가전체" | "지역별";

export interface RegionAlert {
  regionName: string;
  alertLevel: AlertLevel;
  description: string;
}

export interface CountrySafety {
  countryCode: string;
  countryName: string;
  /** 치안(Story 5 "치안"). */
  securityInfo: string;
  /** 사기(Story 5 "사기"). */
  scamInfo: string;
  /** 법규(Story 5 "법규"). */
  lawInfo: string;
  /** 재난(Story 5 "재난"). */
  disasterInfo: string;
  /** 보건(Story 5 "보건"). */
  healthInfo: string;
  /** 긴급연락처(Story 5 "긴급연락처"). */
  emergencyContacts: string;
  alertLevel: AlertLevel;
  alertScope: AlertScope;
  regionAlerts?: RegionAlert[];
  officialSourceUrl: string;
  lastVerifiedAt: string;
}

const VERIFIED_AT = "2026-09-01";
const CONSULAR_CALL_CENTER =
  "재외국민 영사콜센터 +82-2-3210-0404(24시간, 국내발신 유료·해외발신 수신자부담 가능)";
const OFFICIAL_SOURCE = "https://www.0404.go.kr";

export const countrySafetyList: CountrySafety[] = [
  {
    countryCode: "JP",
    countryName: "일본",
    securityInfo:
      "전반적으로 치안이 매우 안정적이나, 대도시 번화가·환락가에서는 소매치기와 호객 행위에 주의해야 한다.",
    scamInfo:
      "일부 유흥가에서 바가지 요금을 청구하는 '봇타쿠리' 업소, SNS를 통한 아르바이트 사칭 사기 사례가 보고된다.",
    lawInfo:
      "대마초 등 마약류는 소량 소지도 강력히 처벌되며, 음주 후 자전거 운전도 단속 대상이다.",
    disasterInfo:
      "환태평양 지진대에 위치해 지진·태풍이 잦다. 숙소 도착 시 대피 경로를 미리 확인하는 것이 권장된다.",
    healthInfo:
      "의료 시스템 수준이 높으나 진료비가 비싼 편이라 해외여행자보험 가입이 권장된다.",
    emergencyContacts: `경찰 110 · 구급/화재 119 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "VN",
    countryName: "베트남",
    securityInfo:
      "전반적으로 안전하나 관광지·야시장에서 오토바이를 이용한 날치기 사건이 종종 발생한다.",
    scamInfo:
      "택시 미터기 조작, 환전소 사기, 여행사 대금 선입금 사기 사례가 보고되니 공인 업체 이용이 권장된다.",
    lawInfo: "마약류 소지·유통은 사형까지 가능한 매우 엄격한 처벌 대상이다.",
    disasterInfo:
      "중부·남부 지역은 우기(9~11월)에 홍수·태풍 피해가 발생할 수 있다.",
    healthInfo:
      "뎅기열 등 모기 매개 감염병 예방을 위해 방충제 사용이 권장된다.",
    emergencyContacts: `경찰 113 · 구급 115 · 화재 114 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "TH",
    countryName: "태국",
    securityInfo:
      "관광지 치안은 양호하나 방콕 유흥가에서 시비·폭행 사건이 간헐적으로 발생한다.",
    scamInfo:
      "보석·투어 상품 바가지 씌우기, 툭툭 기사와 결탁한 쇼핑몰 유인 사기가 잘 알려진 유형이다.",
    lawInfo:
      "왕실 모독죄가 매우 엄격히 적용되며, 사원 내 부적절한 복장·행동도 처벌 대상이 될 수 있다.",
    disasterInfo: "남부 해안 지역은 우기(7~10월)에 폭우·산사태 위험이 있다.",
    healthInfo: "뎅기열 예방을 위한 방충 대책과 식수는 생수 이용이 권장된다.",
    emergencyContacts: `관광경찰 1155 · 구급 1669 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "지역별",
    regionAlerts: [
      {
        regionName: "남부 국경 3개주(얄라·나라티왓·빠따니)",
        alertLevel: "황색경보",
        description:
          "분리주의 무장세력 관련 사건이 간헐적으로 발생해 여행자제가 권고된다.",
      },
    ],
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "TW",
    countryName: "대만",
    securityInfo:
      "치안이 매우 안정적인 편으로, 야간에도 대부분 지역에서 안전하게 이동할 수 있다.",
    scamInfo:
      "관광객 대상 렌터카 보험 미고지 사기, 야시장 저울 눈속임 사례가 간혹 보고된다.",
    lawInfo:
      "마약류 소지는 엄격히 처벌되며, 전동킥보드 등 개인 이동수단 관련 규정을 준수해야 한다.",
    disasterInfo:
      "태풍(7~9월)과 지진 발생 빈도가 높아 기상 특보를 수시로 확인해야 한다.",
    healthInfo: "의료 수준이 높고 여행자 대상 진료 인프라도 잘 갖춰져 있다.",
    emergencyContacts: `경찰 110 · 구급/화재 119 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "PH",
    countryName: "필리핀",
    securityInfo:
      "마닐라·세부 등 주요 관광지는 대체로 안전하나 일부 지역은 소매치기·강도 사건이 보고된다.",
    scamInfo:
      "환전 사기, 가짜 여행사 예약, 신용카드 복제 범죄 사례에 주의가 필요하다.",
    lawInfo:
      "마약류 관련 법 집행이 매우 강경하며, 총기 관련 규정도 엄격히 적용된다.",
    disasterInfo:
      "태풍(6~11월) 및 화산·지진 활동 지역이 있어 기상 정보를 수시로 확인해야 한다.",
    healthInfo:
      "뎅기열 등 모기 매개 감염병에 유의하고 식수는 생수 이용이 권장된다.",
    emergencyContacts: `통합신고 911 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "지역별",
    regionAlerts: [
      {
        regionName: "민다나오 서부·술루 군도 일부 지역",
        alertLevel: "적색경보",
        description:
          "무장단체 활동 위험으로 철수권고 수준의 경보가 유지되고 있다.",
      },
    ],
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "MY",
    countryName: "말레이시아",
    securityInfo:
      "전반적으로 치안이 양호하나 대도시 일부 지역에서 소매치기·오토바이 날치기가 발생한다.",
    scamInfo: "가짜 경찰 사칭 사기, 온라인 쇼핑 사기 사례가 보고되어 있다.",
    lawInfo: "마약류 소지는 사형까지 가능한 매우 엄격한 처벌 대상이다.",
    disasterInfo: "우기(11~1월) 동안 동부 해안 지역에서 홍수가 발생할 수 있다.",
    healthInfo: "뎅기열 예방을 위한 방충 대책이 권장된다.",
    emergencyContacts: `경찰/구급/화재 통합 999 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "ID",
    countryName: "인도네시아",
    securityInfo:
      "발리 등 주요 관광지는 대체로 안전하나 소매치기·오토바이 날치기에 주의해야 한다.",
    scamInfo:
      "렌터 오토바이 파손 명목 과다 청구, 환전소 눈속임 사기가 잘 알려진 유형이다.",
    lawInfo:
      "마약류 소지는 사형까지 가능하며, 종교 관련 법규도 엄격히 적용된다.",
    disasterInfo:
      "환태평양 지진대에 위치해 지진·화산 활동이 활발하니 대피 정보를 사전에 확인해야 한다.",
    healthInfo:
      "뎅기열·발리벨리(여행자 설사) 예방을 위해 생수 이용과 위생 관리가 권장된다.",
    emergencyContacts: `경찰 110 · 구급 118/119 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "지역별",
    regionAlerts: [
      {
        regionName: "파푸아 일부 지역",
        alertLevel: "황색경보",
        description:
          "분리주의 무장단체 관련 치안 불안으로 여행자제가 권고된다.",
      },
    ],
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "SG",
    countryName: "싱가포르",
    securityInfo:
      "세계적으로도 치안이 매우 우수한 국가로, 강력범죄 발생률이 낮다.",
    scamInfo: "온라인 쇼핑·투자 사기가 주로 보고되며, 노상 사기는 드문 편이다.",
    lawInfo:
      "공공장소 흡연·껌 반입·쓰레기 투기 등에 매우 엄격한 벌금이 부과된다.",
    disasterInfo:
      "지진·태풍 위험은 낮으나 스콜성 폭우로 인한 일시적 침수에 유의해야 한다.",
    healthInfo: "의료 수준이 매우 높고 위생 관리가 철저하다.",
    emergencyContacts: `경찰 999 · 구급/화재 995 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "HK",
    countryName: "홍콩",
    securityInfo:
      "전반적으로 치안이 우수하나 관광지 밀집 구역에서는 소매치기에 주의해야 한다.",
    scamInfo:
      "고가 시계·전자제품 매장의 바가지 요금, 부동산·투자 사기 사례가 보고된다.",
    lawInfo:
      "마약류 소지는 엄격히 처벌되며, 공공 집회 관련 법규 변화가 있을 수 있어 뉴스 확인이 권장된다.",
    disasterInfo:
      "여름철(6~9월) 태풍 영향권에 들어 항공편 결항이 발생할 수 있다.",
    healthInfo: "의료 수준이 높으며 여행자 대상 진료 인프라도 잘 갖춰져 있다.",
    emergencyContacts: `경찰/구급/화재 통합 999 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "CN",
    countryName: "중국",
    securityInfo:
      "대도시 관광지는 대체로 안전하나 소매치기·환전 사기에 주의해야 한다.",
    scamInfo:
      "찻집·미술관 초대 사기, 가짜 택시 바가지 요금 사례가 잘 알려져 있다.",
    lawInfo:
      "마약류 소지는 사형까지 가능하며, 정치적 민감 사안에 대한 언급·촬영은 매우 신중해야 한다.",
    disasterInfo:
      "여름철 남부 지역은 홍수, 겨울철 북부 지역은 혹한에 대비해야 한다.",
    healthInfo:
      "대도시 의료 수준은 양호하나 지역별 편차가 있어 여행자보험 가입이 권장된다.",
    emergencyContacts: `공안(경찰) 110 · 구급 120 · 화재 119 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "지역별",
    regionAlerts: [
      {
        regionName: "신장 위구르 자치구·티베트 자치구 일부 지역",
        alertLevel: "황색경보",
        description:
          "출입 절차가 까다롭고 치안 통제가 강한 지역으로 여행자제가 권고된다.",
      },
    ],
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "FR",
    countryName: "프랑스",
    securityInfo:
      "전반적으로 안전하나 파리 주요 관광지·대중교통에서 소매치기가 빈번하다.",
    scamInfo:
      "가짜 서명 요청 뒤 소지품을 노리는 수법, 팔찌 강매 사기가 관광지 주변에서 보고된다.",
    lawInfo:
      "공공장소 노상 음주는 지역에 따라 제한될 수 있으며, 시위 지역 접근은 주의해야 한다.",
    disasterInfo: "폭염(7~8월)과 남부 지역의 산불 위험에 유의해야 한다.",
    healthInfo:
      "의료 수준이 높으며 여행자보험으로 대부분의 진료비를 보전받을 수 있다.",
    emergencyContacts: `통합 응급 112 · 경찰 17 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "IT",
    countryName: "이탈리아",
    securityInfo:
      "주요 관광도시 치안은 양호하나 소매치기·집단 소매치기가 매우 빈번하다.",
    scamInfo:
      "가짜 팔찌·장미꽃 강매, 서명부 사기, 택시 바가지 요금이 대표적인 유형이다.",
    lawInfo: "문화재 훼손·낙서 행위에 대해 고액의 벌금이 부과될 수 있다.",
    disasterInfo:
      "남부 화산 지역(베수비오·에트나)과 지진 발생 가능 지역이 있다.",
    healthInfo: "의료 수준이 높으며 응급 상황 시 공공 병원 이용이 가능하다.",
    emergencyContacts: `통합 응급 112 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "ES",
    countryName: "스페인",
    securityInfo:
      "바르셀로나·마드리드 등 대도시에서 소매치기·날치기 범죄가 매우 빈번하다.",
    scamInfo:
      "레스토랑 바가지 요금, 노상 카드 게임 사기, 가짜 경찰 사칭 사기가 보고된다.",
    lawInfo:
      "투우·축제 관련 행사 참여 시 현지 안전 규정을 반드시 준수해야 한다.",
    disasterInfo: "여름철 폭염과 남동부 일부 지역의 산불 위험에 유의해야 한다.",
    healthInfo: "의료 수준이 높으며 여행자보험 가입이 권장된다.",
    emergencyContacts: `통합 응급 112 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "남색경보",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "GB",
    countryName: "영국",
    securityInfo:
      "전반적으로 안전하나 런던 도심·대중교통에서 소매치기가 종종 발생한다.",
    scamInfo:
      "가짜 티켓 판매, 노상 카드 게임 사기, 렌터카 보험 미고지 사기가 보고된다.",
    lawInfo:
      "차량은 좌측통행이며, 공공장소 음주 규정을 지역별로 확인해야 한다.",
    disasterInfo: "자연재해 위험은 낮으나 겨울철 폭설로 교통이 지연될 수 있다.",
    healthInfo:
      "국가보건서비스(NHS) 응급실 이용이 가능하나 비거주자는 진료비가 청구될 수 있다.",
    emergencyContacts: `통합 응급 999(또는 112) · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    countryCode: "DE",
    countryName: "독일",
    securityInfo:
      "전반적으로 매우 안전하나 대도시 중앙역·축제 기간 소매치기에 주의해야 한다.",
    scamInfo:
      "가짜 자선 모금, 노상 카드 게임 사기, 관광지 인근 바가지 요금이 보고된다.",
    lawInfo: "나치 상징물 관련 표현은 법으로 엄격히 금지된다.",
    disasterInfo:
      "자연재해 위험은 낮으나 겨울철 폭설·결빙으로 인한 교통 지연에 유의해야 한다.",
    healthInfo: "의료 수준이 매우 높으며 여행자보험 가입이 권장된다.",
    emergencyContacts: `통합 응급 112 · 경찰 110 · ${CONSULAR_CALL_CENTER}`,
    alertLevel: "해당없음",
    alertScope: "국가전체",
    officialSourceUrl: OFFICIAL_SOURCE,
    lastVerifiedAt: VERIFIED_AT,
  },
];

export default countrySafetyList;
