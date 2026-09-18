const STEPS = [
  { title: "① 조건 입력", description: "국가·지역과 날짜를 입력합니다." },
  {
    title: "② 요약 확인",
    description: "입력한 조건과 비전달 고지를 확인합니다.",
  },
  {
    title: "③ 외부 이동",
    description: "확인 후 새 탭에서 항공·숙소 사이트로 이동합니다.",
  },
] as const;

/**
 * SCR-003 Intro(3단계 안내) — Page 제목·설명 + 이용 순서 3단계.
 */
export default function IntroSteps() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10">
      <h1 className="text-3xl font-bold text-[#23262B]">여행 준비</h1>
      <p className="mt-2 max-w-2xl text-base text-[#23262B]/70">
        항공·숙소 조건을 정리해 외부 사이트로 편리하게 이동하거나, 함께 떠날
        동행을 모집할 수 있습니다. 입력한 조건은 저장되거나 외부로 전달되지
        않습니다.
      </p>

      <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-2xl bg-[#F7F7F8] p-5">
            <p className="font-semibold text-[#23262B]">{step.title}</p>
            <p className="mt-1 text-sm text-[#23262B]/70">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
