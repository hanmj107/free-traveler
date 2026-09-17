import { test, expect, type Page } from "@playwright/test";

/**
 * E2E-MATE-AUTH(일부) — 로그인이 필요한 동행 흐름 Smoke의 골격(E2E-006~007).
 *
 * PAGE-SCR003(동행 작성)·PAGE-SCR004(목록·상세·신청)·PAGE-SCR005(계정·내 활동)가 아직
 * 구현되지 않았고, 실제 로그인 가능한 테스트 계정도 없는 단계이므로 지금은 골격만
 * 작성한다. 각 TODO는 해당 Component/API Task가 구현된 뒤 실제 role/label로 채운다.
 *
 * 인증 환경변수(E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD)가 없으면 이 파일의 모든
 * 테스트를 명시적으로 skip한다 — 자격 증명 없이 로그인을 시도하다 실패하는 것과
 * "테스트가 없어서 통과한 것"을 구분하기 위함이다(scripts/run_release_e2e.mjs가 Supabase
 * Secret 자체의 유무로 test:e2e/test:e2e:public을 고르는 것과는 별개의, 더 안쪽 단계의
 * 안전장치다).
 *
 * Selector 우선순위: role/accessible name > label > test id. 외부 사이트 내용 검사·이미지
 * 응답 상태 검사는 하지 않는다.
 */

const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD;
const hasAuthCredentials = Boolean(TEST_USER_EMAIL && TEST_USER_PASSWORD);

async function login(page: Page): Promise<void> {
  await page.goto("/account");
  await page.getByLabel(/이메일/i).fill(TEST_USER_EMAIL as string);
  await page.getByLabel(/비밀번호/i).fill(TEST_USER_PASSWORD as string);
  await page.getByRole("button", { name: /로그인/ }).click();
}

test.describe("동행·인증 Smoke (E2E-006~007)", () => {
  test.skip(
    !hasAuthCredentials,
    "E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD 환경변수가 없어 인증이 필요한 Smoke를 건너뜁니다.",
  );

  test("E2E-006 로그인 사용자의 동행글 작성과 목록·상세 확인", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/travel-tools");
    const mateTab = page
      .getByRole("tab", { name: /동행/ })
      .or(page.getByRole("button", { name: /동행/ }));
    if ((await mateTab.count()) > 0) {
      await mateTab.first().click();
    }

    // TODO(COMP-SCR003-MATE-COMPOSE 구현 후): 실제 필드 role/label(제목·국가·지역·기간·
    // 여행 스타일·소개글·안전수칙 동의)로 교체해 작성 폼을 채우고 제출한다.
    // 제출 후 REQ-FUNC-MATE-003에 따라 연락처 미공개·모집중 상태로 게시되는지 확인한다.

    await page.goto("/mates");
    // TODO(PAGE-SCR004 구현 후): 방금 작성한 글이 목록에 닉네임만 표시된 채 나타나는지,
    // 상세 패널(Desktop)/Drawer(Mobile)에서 전체 내용이 보이는지 확인한다.
  });

  test("E2E-007 동행글 신청과 계정 화면의 내 활동 확인", async ({ page }) => {
    await login(page);

    await page.goto("/mates");
    // TODO(COMP-SCR004-JOIN-REQUEST 구현 후): "참가 요청 보내기" 버튼 클릭 후 확인 Dialog
    // 또는 안내 문구(예: "참가 요청을 보냈습니다.")만 검사한다. 중복 요청 시 안내 문구
    // (예: "이미 참가 요청을 보낸 모집글입니다.")도 함께 확인한다(REQ-FUNC-MATE-004).

    await page.goto("/account");
    // TODO(COMP-SCR005-MY-ACTIVITY 구현 후): "내 활동" 탭에서 방금 보낸 참가 요청이
    // 상태와 함께 목록에 반영됐는지 확인한다.
    await expect(page).toHaveURL(/\/account/);
  });
});
