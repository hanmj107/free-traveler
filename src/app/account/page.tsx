"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AuthForms from "@/components/scr005/AuthForms";
import ProfileEdit from "@/components/scr005/ProfileEdit";
import MyActivity from "@/components/scr005/MyActivity";
import AdminPanel, { isAdminRole } from "@/components/scr005/AdminPanel";

/**
 * SCR-005 `/account` — Header → Intro(축소 Hero) → 역할별 Section → Footer 순서로
 * 조립한다. Guest: 계정 인증 폼. Member: 프로필/내 활동 탭. Admin: Member 탭 +
 * 관리자 탭. 역할은 `profiles.role`을 세션 사용자 본인 행에서만 읽어 판단하고
 * (RLS `profiles_select_own`), 관리자가 아니면 관리자 탭 자체를 렌더링하지 않는다
 * (비관리자 접근 시 UI 미노출 + `reports`/`app_settings` RLS가 데이터 접근도 차단).
 */

type AccountState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "member"; userId: string; isAdmin: boolean };

type MemberTab = "profile" | "activity" | "admin";

export default function AccountPage() {
  const [account, setAccount] = useState<AccountState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<MemberTab>("profile");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadRole(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!active) {
        return;
      }
      setAccount({
        status: "member",
        userId,
        isAdmin: isAdminRole(data?.role),
      });
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      if (data.session?.user) {
        void loadRole(data.session.user.id);
      } else {
        setAccount({ status: "guest" });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          void loadRole(session.user.id);
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

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="border-b border-[#F1F1F3] bg-[#F7F7F9]">
          <div className="mx-auto max-w-[1280px] px-5 py-10">
            <h1 className="text-2xl font-bold text-[#23262B]">계정</h1>
            <p className="mt-2 text-sm text-[#23262B]/70">
              로그인, 프로필, 내가 남긴 활동을 이곳에서 관리합니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-8">
          {account.status === "loading" && (
            <p className="text-sm text-[#23262B]/60">
              계정 정보를 불러오는 중입니다...
            </p>
          )}

          {account.status === "guest" && <AuthForms isAuthenticated={false} />}

          {account.status === "member" && (
            <div className="space-y-8">
              <AuthForms isAuthenticated />

              <div>
                <nav
                  aria-label="계정 탭"
                  className="flex gap-2 border-b border-[#F1F1F3]"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    aria-current={activeTab === "profile" ? "page" : undefined}
                    className={`min-h-11 border-b-2 px-4 text-sm font-medium ${
                      activeTab === "profile"
                        ? "border-[#FF6B4A] text-[#23262B]"
                        : "border-transparent text-[#23262B]/60"
                    }`}
                  >
                    프로필
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    aria-current={activeTab === "activity" ? "page" : undefined}
                    className={`min-h-11 border-b-2 px-4 text-sm font-medium ${
                      activeTab === "activity"
                        ? "border-[#FF6B4A] text-[#23262B]"
                        : "border-transparent text-[#23262B]/60"
                    }`}
                  >
                    내 활동
                  </button>
                  {account.isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("admin")}
                      aria-current={activeTab === "admin" ? "page" : undefined}
                      className={`min-h-11 border-b-2 px-4 text-sm font-medium ${
                        activeTab === "admin"
                          ? "border-[#FF6B4A] text-[#23262B]"
                          : "border-transparent text-[#23262B]/60"
                      }`}
                    >
                      관리자
                    </button>
                  )}
                </nav>

                <div className="py-6">
                  {activeTab === "profile" && (
                    <ProfileEdit userId={account.userId} />
                  )}
                  {activeTab === "activity" && (
                    <MyActivity userId={account.userId} />
                  )}
                  {activeTab === "admin" && account.isAdmin && <AdminPanel />}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
