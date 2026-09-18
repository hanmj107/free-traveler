import Link from "next/link";

/**
 * 동행 구하기 탭 — 로그인 유도 카드 + 안전 안내 사이드 패널(REQ-FUNC-MATE-001).
 * 비로그인/성인 미확인 사용자에게는 작성 폼 대신 이 Component만 표시한다.
 */
export default function LoginPromptCard() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex-1 rounded-2xl bg-[#F7F7F8] p-6">
        <h3 className="text-lg font-semibold text-[#23262B]">
          로그인이 필요합니다
        </h3>
        <p className="mt-2 text-sm text-[#23262B]/70">
          동행 모집글을 작성하려면 로그인과 성인(만 19세 이상) 확인이
          필요합니다.
        </p>
        <Link
          href="/account"
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FF6B4A] px-5 text-sm font-semibold text-white"
        >
          로그인 / 회원가입
        </Link>
      </div>

      <div className="flex-1 rounded-2xl border border-[#F1F1F3] p-6">
        <h3 className="text-lg font-semibold text-[#23262B]">동행 안전 안내</h3>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-[#23262B]/70">
          <li>Free Traveler는 동행자의 신원이나 안전을 보증하지 않습니다.</li>
          <li>
            전화번호·메신저 ID 등 연락처는 모집글 본문에 포함할 수 없습니다.
          </li>
          <li>부적절한 모집글이나 사용자는 신고·차단할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
