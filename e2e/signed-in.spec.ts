import { test, expect } from "@playwright/test";

const member = { email: process.env.TEST_MEMBER_EMAIL, password: process.env.TEST_MEMBER_PASSWORD };
const filmmaker = { email: process.env.TEST_FILMMAKER_EMAIL, password: process.env.TEST_FILMMAKER_PASSWORD };
const admin = { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD };

async function signIn(page: import("@playwright/test").Page, who: { email?: string; password?: string }) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(who.email!);
  await page.getByLabel("Password").fill(who.password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/sign-in"), { timeout: 15_000 });
}

const haveMember = Boolean(member.email && member.password);
const haveFilmmaker = Boolean(filmmaker.email && filmmaker.password);
const haveAdmin = Boolean(admin.email && admin.password);

test.describe("member", () => {
  test.skip(!haveMember, "Set TEST_MEMBER_EMAIL and TEST_MEMBER_PASSWORD to run");

  test("signs in and sees the profile tabs", async ({ page }) => {
    await signIn(page, member);
    await page.goto("/profile/test_member");
    await expect(page.getByRole("link", { name: "Edit profile" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("member cannot reach the admin area", async ({ page }) => {
    await signIn(page, member);
    await page.goto("/admin");
    await expect(page.getByText(/Admin access required|Admin only/i).first()).toBeVisible();
  });
});

test.describe("filmmaker", () => {
  test.skip(!haveFilmmaker, "Set TEST_FILMMAKER_EMAIL and TEST_FILMMAKER_PASSWORD to run");

  test("can open My journals and start a new story", async ({ page }) => {
    await signIn(page, filmmaker);
    await page.goto("/write");
    await expect(page.getByRole("heading", { name: "My journals" })).toBeVisible();
    await page.getByRole("link", { name: "Write a new journal" }).click();
    await expect(page.getByLabel("Title")).toBeVisible();
    await expect(page.getByRole("toolbar", { name: "Story formatting" })).toBeVisible();
  });
});

test.describe("admin", () => {
  test.skip(!haveAdmin, "Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD to run");

  test("admin sees the Journal review page and the Members page", async ({ page }) => {
    await signIn(page, admin);
    await page.goto("/admin/journal");
    await expect(page.getByRole("heading", { name: "Journal" })).toBeVisible();
    await page.goto("/admin/members");
    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  });
});
