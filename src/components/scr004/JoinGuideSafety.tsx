import Link from "next/link";

const STEPS = [
  {
    title: "① 참가 요청",
    description: "관심 있는 모집글에 간단한 메시지와 함께 참가를 요청합니다.",
  },
  {
    title: "② 작성자 승인 대기",
    description: "모집글 작성자가 요청을 검토하고 승인 또는 거절합니다.",
  },
  {
    title: "③ 승인 시 알림 확인",
    description: "승인되면 계정의 내 활동에서 결과를 확인할 수 있습니다.",
  },
] as const;

/**
 * 참가 방법 3단계 + 안전 안내 CTA(REQ-FUNC-MATE 지원 Task) — 신원·안전 미보증 고지와
 * 신고/차단 진입점 안내를 상시 노출한다.
 */
export default function JoinGuideSafety() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10">
      <h2 className="text-2xl font-bold text-[#23262B]">참가 방법</h2>

      <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-2xl bg-[#F7F7F8] p-5">
            <p className="font-semibold text-[#23262B]">{step.title}</p>
            <p className="mt-1 text-sm text-[#23262B]/70">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-[#F1F1F3] p-6">
        <p className="text-sm font-medium text-[#23262B]">
          Free Traveler는 동행자의 신원이나 안전을 보증하지 않습니다.
        </p>
        <p className="mt-2 text-sm text-[#23262B]/70">
          부적절한 모집글이나 사용자는 상세 화면의 신고·차단 기능을 이용해
          주세요.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F7F7F8] p-6">
        <p className="text-base font-medium text-[#23262B]">
          여행 조건도 함께 정리해 보세요.
        </p>
        <Link
          href="/travel-tools"
          className="inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
        >
          여행 조건 정리하기
        </Link>
      </div>
    </section>
  );
}
