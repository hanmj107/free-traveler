import { describe, expect, it } from "vitest";
import { validateAuthForm } from "@/components/scr005/AuthForms";
import { isAdminRole, isValidHttpUrl } from "@/components/scr005/AdminPanel";

/**
 * SCR-005 `/account` 완료 검사 — Auth 상태 Component Test / 관리자 Guard Test /
 * URL Validation Test(사용자 요청 "완료 검사" 항목). 이 화면은 아직 전용
 * UNIT_TEST Task가 없어(SCR-003/004의 UNIT-TRAVEL-DATES/UNIT-CONTACT-DETECTION/
 * UNIT-MATE-STATE와 달리) 각 Component가 노출하는 순수 함수를 대상으로 검증한다.
 */

describe("validateAuthForm — 로그인/회원가입/재설정 진입 조건(Auth 상태 전이)", () => {
  it("로그인은 이메일+비밀번호가 없으면 오류를 반환한다", () => {
    expect(
      validateAuthForm("login", { email: "", password: "", nickname: "" }),
    ).not.toBeNull();
    expect(
      validateAuthForm("login", {
        email: "a@example.com",
        password: "",
        nickname: "",
      }),
    ).not.toBeNull();
  });

  it("로그인은 이메일+비밀번호가 있으면 통과한다", () => {
    expect(
      validateAuthForm("login", {
        email: "a@example.com",
        password: "password123",
        nickname: "",
      }),
    ).toBeNull();
  });

  it("회원가입은 닉네임이 없으면 오류를 반환한다", () => {
    expect(
      validateAuthForm("signup", {
        email: "a@example.com",
        password: "password123",
        nickname: "",
      }),
    ).not.toBeNull();
  });

  it("회원가입은 이메일+비밀번호+닉네임이 있으면 통과한다", () => {
    expect(
      validateAuthForm("signup", {
        email: "a@example.com",
        password: "password123",
        nickname: "여행자",
      }),
    ).toBeNull();
  });

  it("재설정은 비밀번호 없이 이메일만 있으면 통과한다", () => {
    expect(
      validateAuthForm("reset", {
        email: "a@example.com",
        password: "",
        nickname: "",
      }),
    ).toBeNull();
  });

  it("재설정은 이메일이 없으면 오류를 반환한다", () => {
    expect(
      validateAuthForm("reset", { email: "", password: "", nickname: "" }),
    ).not.toBeNull();
  });
});

describe("isAdminRole — 관리자 UI 접근 Guard(PRIV-003)", () => {
  it("role이 ADMIN이면 true를 반환한다", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
  });

  it("role이 MEMBER이면 false를 반환한다", () => {
    expect(isAdminRole("MEMBER")).toBe(false);
  });

  it("role이 없거나(null/undefined) 알 수 없는 값이면 false를 반환한다(기본값은 항상 차단)", () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });
});

describe("isValidHttpUrl — 외부 URL(app_settings) 형식 검증(SEC-004)", () => {
  it("http(s) 절대 URL은 유효하다", () => {
    expect(isValidHttpUrl("https://www.booking.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com/path?query=1")).toBe(true);
  });

  it("스킴이 없거나 http/https가 아니면 무효하다", () => {
    expect(isValidHttpUrl("www.booking.com")).toBe(false);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
  });

  it("빈 문자열이나 형식이 깨진 값은 무효하다", () => {
    expect(isValidHttpUrl("")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
  });
});
