"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabaseAuth";

/**
 * 공통 Header(5개 Screen 전체 재사용, design-reference/D-001/DESIGN.md §9).
 * 로그인 세션 상태는 읽기만 하며 로그인/로그아웃 등 쓰기 작업은 수행하지 않는다.
 */

type AccountState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; nickname: string; isAdmin: boolean };

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/about", label: "대표 소개" },
  { href: "/travel-tools", label: "여행 준비" },
  { href: "/mates", label: "동행 찾기" },
] as const;

function isActiveNav(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountState>({ status: "loading" });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, role")
        .eq("id", userId)
        .single();

      if (!active) {
        return;
      }

      if (data) {
        setAccount({
          status: "authenticated",
          nickname: String(data.nickname ?? ""),
          isAdmin: data.role === "ADMIN",
        });
      } else {
        setAccount({ status: "guest" });
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      if (data.session?.user) {
        void loadProfile(data.session.user.id);
      } else {
        setAccount({ status: "guest" });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          void loadProfile(session.user.id);
        } else {
          setAccount({ status: "guest" });
        }
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const nicknameInitial =
    account.status === "authenticated" && account.nickname.length > 0
      ? account.nickname[0]!.toUpperCase()
      : "";

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#F1F1F3] bg-white md:h-[72px]">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-[#23262B]">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF6B4A]"
          />
          <span className="hidden text-base font-semibold md:inline">
            Free Traveler
          </span>
          <span className="text-base font-semibold md:hidden">FT</span>
        </Link>

        <nav aria-label="주요 내비게이션" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = isActiveNav(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-block border-b-2 py-2 ${
                      active
                        ? "border-[#FF6B4A] text-[#23262B]"
                        : "border-transparent text-[#23262B]/70 hover:text-[#23262B]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="hidden items-center gap-2 text-sm font-medium text-[#23262B] md:inline-flex"
          >
            {account.status === "authenticated" ? (
              <>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE4DA] text-sm font-semibold text-[#E14E2E]">
                  {nicknameInitial}
                </span>
                {account.isAdmin && (
                  <span className="rounded-full bg-[#23262B] px-2 py-0.5 text-xs font-semibold text-white">
                    관리자
                  </span>
                )}
              </>
            ) : (
              "로그인"
            )}
          </Link>

          <Link
            href="/account"
            aria-label="계정"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#23262B] md:hidden"
          >
            {account.status === "authenticated" ? (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE4DA] text-sm font-semibold text-[#E14E2E]">
                {nicknameInitial}
              </span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "내비게이션 닫기" : "내비게이션 열기"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center text-[#23262B] md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-6 w-6"
            >
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="모바일 내비게이션"
          className="border-t border-[#F1F1F3] bg-white md:hidden"
        >
          <ul>
            {NAV_ITEMS.map((item) => {
              const active = isActiveNav(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center px-5 text-base font-medium ${
                      active ? "text-[#FF6B4A]" : "text-[#23262B]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
