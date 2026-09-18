import Link from "next/link";

/**
 * SCR-004 Intro CTA Banner — 동행 찾기 설명 + 모집글 작성 CTA.
 * `/travel-tools?tab=mate`로 이동해 동행 구하기 탭이 바로 선택되게 한다.
 */
export default function IntroCtaBanner() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-10">
      <h1 className="text-3xl font-bold text-[#23262B]">동행 찾기</h1>
      <p className="mt-2 max-w-2xl text-base text-[#23262B]/70">
        비슷한 일정과 스타일의 여행자를 찾아 함께 떠나보세요. 모집글은 누구나
        열람할 수 있고, 참가 요청은 로그인 후 보낼 수 있습니다.
      </p>
      <Link
        href="/travel-tools?tab=mate"
        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
      >
        동행 모집글 작성하기
      </Link>
    </section>
  );
}
