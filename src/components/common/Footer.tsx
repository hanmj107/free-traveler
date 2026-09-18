import Link from "next/link";

/**
 * 공통 Footer(5개 Screen 전체 재사용, design-reference/D-001/DESIGN.md §9).
 * 정확히 3컬럼(소개/바로가기/이용 안내) + 하단 저작권 바로만 구성한다.
 */
export type FooterProps = {
  /** 로그인 상태에 따라 "바로가기" 컬럼의 계정 링크 라벨만 바꾼다(UI_CONTRACT.md §9). */
  isAuthenticated?: boolean;
};

export default function Footer({ isAuthenticated = false }: FooterProps) {
  const accountLabel = isAuthenticated ? "계정" : "로그인";

  return (
    <footer className="border-t border-[#F1F1F3] bg-white text-[#23262B]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <h2 className="text-base font-semibold">Free Traveler 소개</h2>
          <p className="mt-3 text-sm text-[#23262B]/80">
            50회 이상의 자유여행, 30개국 이상의 경험을 바탕으로 여행 준비를 돕는
            서비스입니다.
          </p>
          <Link
            href="/about"
            className="mt-3 inline-block py-2 text-sm font-medium text-[#FF6B4A] hover:text-[#E14E2E]"
          >
            대표 소개 보기
          </Link>
        </div>

        <nav aria-label="바로가기">
          <h2 className="text-base font-semibold">바로가기</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link href="/" className="block py-2">
                홈
              </Link>
            </li>
            <li>
              <Link href="/about" className="block py-2">
                대표 소개
              </Link>
            </li>
            <li>
              <Link href="/travel-tools" className="block py-2">
                여행 준비
              </Link>
            </li>
            <li>
              <Link href="/mates" className="block py-2">
                동행 찾기
              </Link>
            </li>
            <li>
              <Link href="/account" className="block py-2">
                {accountLabel}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-base font-semibold">이용 안내</h2>
          <p className="mt-3 text-sm text-[#23262B]/80">
            항공·숙소 링크는 외부 사이트로 연결되며 예약을 대행하지 않습니다.
          </p>
          <p className="mt-2 text-sm text-[#23262B]/80">
            국가별 안전정보는 외교부 해외안전여행 공식 자료를 기준으로 확인일을
            표기합니다.
          </p>
        </div>
      </div>

      <div className="border-t border-[#F1F1F3]">
        <p className="mx-auto max-w-[1280px] px-5 py-4 text-xs text-[#23262B]/60">
          © 2026 Free Traveler
        </p>
      </div>
    </footer>
  );
}
