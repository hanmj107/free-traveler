import type { CountrySafety } from "@/data/countrySafety";

/**
 * SCR-001 안전정보 패널 — 여행지 상세 Drawer 안에서 전환되는 화면(§14 Drawer·
 * Modal 규칙 재사용). 치안·사기·법규·재난·보건·긴급연락처 6개 카테고리와
 * 최종 확인일을 표시하고(REQ-FUNC-SAFETY-001/002), 확인일이 7일을 넘으면
 * 렌더링 시점에 계산해 경고를 보여준다(REQ-FUNC-SAFETY-003). 공식 출처 링크는
 * 새 탭으로만 연다(REQ-NFR-SEC-002).
 */

const ALERT_STYLE: Record<CountrySafety["alertLevel"], string> = {
  해당없음: "bg-[#F1F1F3] text-[#4B505A]",
  남색경보: "bg-[#E4E6EA] text-[#23262B]",
  황색경보: "bg-[#FEF9C3] text-[#854D0E]",
  적색경보: "bg-[#FEE2E2] text-[#B91C1C]",
  흑색경보: "bg-[#FEE2E2] text-[#B91C1C]",
};

function daysSince(dateString: string): number {
  const diffMs = Date.now() - new Date(dateString).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

interface SafetyInfoPanelProps {
  safety: CountrySafety;
}

export default function SafetyInfoPanel({ safety }: SafetyInfoPanelProps) {
  const staleDays = daysSince(safety.lastVerifiedAt);
  const isStale = staleDays > 7;

  const categories: { label: string; value: string }[] = [
    { label: "치안", value: safety.securityInfo },
    { label: "사기", value: safety.scamInfo },
    { label: "법규", value: safety.lawInfo },
    { label: "재난", value: safety.disasterInfo },
    { label: "보건", value: safety.healthInfo },
    { label: "긴급연락처", value: safety.emergencyContacts },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold text-[#23262B]">
          {safety.countryName} 국가별 주의사항
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${ALERT_STYLE[safety.alertLevel]}`}
        >
          {safety.alertLevel} · {safety.alertScope}
        </span>
      </div>

      {safety.regionAlerts && safety.regionAlerts.length > 0 && (
        <ul className="space-y-2">
          {safety.regionAlerts.map((region) => (
            <li
              key={region.regionName}
              className={`rounded-lg p-3 text-sm ${ALERT_STYLE[region.alertLevel]}`}
            >
              <p className="font-semibold">
                {region.regionName} · {region.alertLevel}
              </p>
              <p className="mt-1">{region.description}</p>
            </li>
          ))}
        </ul>
      )}

      {isStale && (
        <div
          role="alert"
          className="rounded-lg bg-[#FEF9C3] p-3 text-sm text-[#854D0E]"
        >
          ⚠ 이 정보는 최종 확인일로부터 {staleDays}일이 지났습니다. 출국 전 공식
          출처에서 최신 정보를 다시 확인해 주세요.
        </div>
      )}

      <dl className="space-y-4">
        {categories.map((category) => (
          <div key={category.label}>
            <dt className="text-sm font-semibold text-[#23262B]">
              {category.label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-[#4B505A]">
              {category.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-[#F1F1F3] pt-4 text-sm text-[#767B85]">
        <p>최종 확인일: {safety.lastVerifiedAt}</p>
        <a
          href={safety.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-medium text-[#2563EB] underline"
        >
          외교부 해외안전여행 공식 자료 보기
        </a>
      </div>
    </div>
  );
}
