import {
  test,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

/**
 * E2E-MATE-AUTH — 동행·인증·관리자 Smoke(E2E-006~010 흐름). Chromium만 사용한다
 * (docs/PROJECT_SCOPE.md §7). Functional AC의 5개 흐름을 순서대로 검증한다:
 *   (6) 로그인→성인확인된 계정→동행글 작성(연락처 차단 포함)
 *   (7) 비회원 목록·상세 열람(연락처 비노출)
 *   (8) 참가요청→중복차단→승인/거절
 *   (9) 신고(접수번호)·차단(상호비노출)
 *   (10) 관리자 신고 상태변경·외부URL설정
 *
 * 알려진 제한사항(둘 다 이 프로젝트 Supabase Auth 설정에서 비롯된 것이며 이
 * 파일이 우회하지 않는다):
 *   - "회원가입" 자체는 이 프로젝트가 이메일 형식을 엄격히 검증해(존재하지 않는
 *     도메인 거부) `example.com`/`.invalid` 같은 테스트용 주소로 자동화할 수
 *     없고, 이메일 확인(mailer_autoconfirm=false)도 켜져 있어 확인 없이 즉시
 *     로그인되지도 않는다. 따라서 이 파일은 이미 가입·확인된 시드 계정
 *     (supabase/seed.sql: seed_admin/seed_member_a/seed_member_b, 전부
 *     adult_verified=true)으로 "로그인" 단계부터 검증한다 — 회원가입 Form 자체의
 *     클라이언트 동작은 tests/unit/accountGuards.spec.ts(validateAuthForm)가
 *     이미 다룬다.
 *   - 이 파일은 Mock이 아니라 실제 Supabase 프로젝트에 실제 행(모집글·참가요청·
 *     신고)을 남긴다(고유 타임스탬프 제목으로 식별 가능). 차단만 테스트가 끝나며
 *     스스로 해제해 반복 실행 가능하게 한다.
 */

const SEED_ADMIN = {
  email: "seed.admin@example.invalid",
  password: "seed-not-a-real-password-1",
};
const SEED_MEMBER_A = {
  email: "seed.member-a@example.invalid",
  password: "seed-not-a-real-password-2",
};
const SEED_MEMBER_B = {
  email: "seed.member-b@example.invalid",
  password: "seed-not-a-real-password-3",
};
const SEED_MEMBER_A_ID = "22222222-2222-2222-2222-222222222222";

const RUN_ID = Date.now();
const POST_TITLE = `E2E 동행 테스트 ${RUN_ID}`;

async function loginAs(
  page: Page,
  credentials: { email: string; password: string },
) {
  await page.goto("/account");
  await page.getByLabel("이메일").fill(credentials.email);
  await page.getByLabel("비밀번호").fill(credentials.password);
  await page
    .locator("form")
    .getByRole("button", { name: "로그인", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "내 활동" })).toBeVisible({
    timeout: 10000,
  });
}

async function newPage(browser: Browser): Promise<{
  context: BrowserContext;
  page: Page;
}> {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

test.describe.serial("E2E-MATE-AUTH — 동행·인증·관리자 흐름", () => {
  let memberACtx: BrowserContext;
  let memberBCtx: BrowserContext;
  let adminCtx: BrowserContext;
  let memberAPage: Page;
  let memberBPage: Page;
  let adminPage: Page;
  let receiptNumber = "";

  test.beforeAll(async ({ browser }) => {
    ({ context: memberACtx, page: memberAPage } = await newPage(browser));
    ({ context: memberBCtx, page: memberBPage } = await newPage(browser));
    ({ context: adminCtx, page: adminPage } = await newPage(browser));
  });

  test.afterAll(async () => {
    await memberACtx.close();
    await memberBCtx.close();
    await adminCtx.close();
  });

  test("(6) 로그인한 성인확인 계정이 연락처 포함 글은 막히고, 정상 글은 등록된다", async () => {
    await loginAs(memberAPage, SEED_MEMBER_A);

    // seed_member_a는 이미 seed.sql이 만든 동행글 8건의 작성자라 "내가 쓴 동행글"이
    // 비어 있지 않다(Empty State CTA가 뜨지 않는다) — /travel-tools로 직접 이동한다.
    await memberAPage.goto("/travel-tools");

    const mateTab = memberAPage
      .getByRole("tab", { name: /동행/ })
      .or(memberAPage.getByRole("button", { name: /동행/ }));
    if ((await mateTab.count()) > 0) {
      await mateTab.first().click();
    }

    await memberAPage.getByLabel("제목").fill(POST_TITLE);
    await memberAPage.getByLabel("국가").fill("일본");
    await memberAPage.getByLabel("지역").fill("오사카");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await memberAPage
      .getByLabel("여행 시작일")
      .fill(tomorrow.toISOString().slice(0, 10));
    await memberAPage
      .getByLabel("여행 종료일")
      .fill(nextWeek.toISOString().slice(0, 10));
    await memberAPage.getByRole("button", { name: "도시 탐방" }).click();

    // 연락처가 포함된 본문은 제출이 막힌다(MATE-009, SEC-008).
    await memberAPage
      .getByLabel("상세 소개")
      .fill("같이 가실 분 카톡 아이디로 연락주세요 010-1234-5678");
    await memberAPage.getByLabel(/동행 모집글에 연락처/).check();
    const submitButton = memberAPage.getByRole("button", {
      name: /동행 모집글 등록하기/,
    });
    // 연락처가 포함된 상태에서는 애초에 제출 버튼이 비활성 상태라 클릭 자체가 막힌다.
    await expect(submitButton).toBeDisabled();

    // 연락처를 지우고 정상 본문으로 제출한다.
    await memberAPage
      .getByLabel("상세 소개")
      .fill("오사카에서 3박 4일 동안 함께 다닐 동행을 구합니다.");
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(
      memberAPage.getByText("동행 모집글이 등록되었습니다."),
    ).toBeVisible({ timeout: 10000 });

    // 방금 만든 글의 postId를 "내 활동"에서 확인해 이후 단계에서 재사용한다.
    await memberAPage.goto("/account");
    await memberAPage.getByRole("button", { name: "내 활동" }).click();
    await expect(memberAPage.getByText(POST_TITLE)).toBeVisible();
  });

  test("(7) 비회원이 목록/상세를 열람해도 연락처가 전혀 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/mates");

    const card = page.getByText(POST_TITLE).first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();

    const detailHeading = page.getByRole("heading", { name: POST_TITLE });
    await expect(detailHeading).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/010-1234-5678/);
    expect(bodyText).not.toMatch(SEED_MEMBER_A.email);

    // 비회원은 참가 요청/신고/차단 대신 로그인 유도 링크를 본다.
    await expect(
      page.getByRole("link", { name: /로그인 후 참가 요청 보내기/ }),
    ).toBeVisible();
  });

  test("(8) 참가 요청 → 중복 차단(409) → 작성자 승인", async () => {
    await loginAs(memberBPage, SEED_MEMBER_B);

    // supabase/seed.sql은 seed_member_b가 seed_member_a를 이미 차단한 상태로
    // 고정 fixture를 만든다(RLS 상호비노출 검증용, rls_basic.sql/rls.spec.ts가
    // 이 상태에 의존한다). seed_member_a가 이 프로젝트의 모든 기존 글을 쓴
    // 작성자라 이 차단이 걸려 있으면 member_b가 아무 글도 볼 수 없어 참가 요청
    // 흐름 자체를 진행할 수 없다 — 여기서 잠시 해제하고, (9)가 끝나면 원래
    // fixture 상태로 되돌린다.
    await memberBPage.request
      .delete(
        `/api/blocks?blockedUserId=${encodeURIComponent(SEED_MEMBER_A_ID)}`,
      )
      .catch(() => {});

    await memberBPage.goto("/mates");

    const card = memberBPage.getByText(POST_TITLE).first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();

    await memberBPage
      .getByLabel("간단 메시지")
      .fill("함께 여행하고 싶습니다. 잘 부탁드려요!");
    await memberBPage.getByRole("button", { name: "참가 요청 보내기" }).click();
    await expect(
      memberBPage.getByText(
        "참가 요청을 보냈습니다. 작성자의 승인을 기다려 주세요.",
      ),
    ).toBeVisible({ timeout: 10000 });

    // 같은 글에 다시 요청하면 중복(409)으로 막힌다.
    await memberBPage.reload();
    const cardAgain = memberBPage.getByText(POST_TITLE).first();
    await cardAgain.click();
    await memberBPage.getByLabel("간단 메시지").fill("혹시 다시 한번요!");
    await memberBPage.getByRole("button", { name: "참가 요청 보내기" }).click();
    await expect(
      memberBPage.getByText("이미 참가 요청을 보낸 모집글입니다."),
    ).toBeVisible({ timeout: 10000 });

    // 작성자(member_a)가 "내 활동 > 받은 요청"에서 승인한다.
    await memberAPage.goto("/account");
    await memberAPage.getByRole("button", { name: "내 활동" }).click();
    const receivedItem = memberAPage
      .locator("li", { hasText: "함께 여행하고 싶습니다" })
      .first();
    await expect(receivedItem).toBeVisible({ timeout: 10000 });
    await receivedItem.getByRole("button", { name: "승인" }).click();
    await expect(receivedItem.getByText("승인됨")).toBeVisible({
      timeout: 10000,
    });
  });

  test("(9) 신고(접수번호) · 차단(상호 비노출) — 차단은 테스트 종료 시 해제한다", async () => {
    await memberBPage.goto("/mates");
    const card = memberBPage.getByText(POST_TITLE).first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();

    await memberBPage.getByRole("button", { name: "신고하기" }).click();
    await memberBPage
      .getByLabel("간단 설명(선택)")
      .fill(`E2E 테스트 신고 ${RUN_ID}`);
    await memberBPage.getByRole("button", { name: "신고 제출" }).click();
    const receiptText = memberBPage.getByText(/접수번호: RPT-/);
    await expect(receiptText).toBeVisible({ timeout: 10000 });
    receiptNumber = (await receiptText.innerText()).replace("접수번호: ", "");
    expect(receiptNumber).toMatch(/^RPT-\d{8}-[A-Z0-9]{6}$/);
    await memberBPage.getByRole("button", { name: "닫기" }).click();

    // 상호 비노출은 이미 supabase/tests/rls_basic.sql·tests/integration/rls.spec.ts가
    // DB 레벨로 검증했다 — 여기서는 admin 계정으로 실제 차단 버튼 UI 왕복만 확인하고
    // (기존 seed 차단 쌍과 겹치지 않도록), 끝나면 즉시 해제해 반복 실행 가능하게 한다.
    // (admin 로그인은 (10)에서도 재사용하므로 여기서 먼저 해 둔다.)
    await loginAs(adminPage, SEED_ADMIN);
    await adminPage.goto("/mates");
    const adminCard = adminPage.getByText(POST_TITLE).first();
    await expect(adminCard).toBeVisible({ timeout: 10000 });
    await adminCard.click();
    await adminPage.getByRole("button", { name: "작성자 차단하기" }).click();
    await expect(
      adminPage.getByText(
        "이 작성자를 차단했습니다. 이후 목록·상세에 표시되지 않습니다.",
      ),
    ).toBeVisible({ timeout: 10000 });

    // 차단한 admin에게는 이제 이 글이 보이지 않아야 한다(목록에서 사라짐).
    await adminPage.reload();
    await expect(adminPage.getByText(POST_TITLE)).toHaveCount(0);

    // 정리: 방금 만든(admin이 member_a를 차단한) 관계를 해제해 이 Smoke를
    // 반복 실행할 수 있게 한다.
    await adminPage.request.delete(
      `/api/blocks?blockedUserId=${encodeURIComponent(SEED_MEMBER_A_ID)}`,
    );

    // 정리: (8)에서 잠시 해제했던 seed 고정 fixture(member_b가 member_a를 차단)를
    // 원상복구한다 — rls_basic.sql/rls.spec.ts가 이 상태에 의존하기 때문이다.
    await memberBPage.request.post("/api/blocks", {
      data: { blockedUserId: SEED_MEMBER_A_ID },
    });
  });

  test("(10) 관리자 — 신고 상태 변경 및 외부 URL 설정", async () => {
    // admin은 (9)에서 이미 로그인했다(같은 adminPage를 재사용).
    await adminPage.goto("/account");
    await adminPage.getByRole("button", { name: "관리자" }).click();

    const reportItem = adminPage
      .locator("li", { hasText: `E2E 테스트 신고 ${RUN_ID}` })
      .first();
    await expect(reportItem).toBeVisible({ timeout: 10000 });
    await reportItem.getByRole("combobox").selectOption("IN_REVIEW");
    await expect(reportItem.getByText("상태가 변경되었습니다.")).toBeVisible({
      timeout: 10000,
    });

    const flightUrlInput = adminPage.getByLabel("항공 검색 URL");
    const currentFlightUrl = await flightUrlInput.inputValue();
    await flightUrlInput.fill(
      currentFlightUrl || "https://www.google.com/travel/flights",
    );
    await adminPage.getByRole("button", { name: "저장" }).click();
    await expect(adminPage.getByText("저장되었습니다.")).toBeVisible({
      timeout: 10000,
    });
  });
});
