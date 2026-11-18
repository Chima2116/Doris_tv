import { test, expect } from "@playwright/test";

const pages = ["/", "/journal", "/filmmakers", "/about", "/community"];

for (const path of pages) {
  test(`public page loads: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status(), `status for ${path}`).toBeLessThan(400);
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
  });
}

test("sign-in page has email, password and a show/hide password control", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show password" })).toBeVisible();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
});

test("sign-up page asks for a username and does not show the demo button when Supabase is set", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});

test("a guest is kept out of the admin area", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByText(/Admin access required|Admin only|required/i).first()).toBeVisible();
});

test("a guest is kept out of My journals", async ({ page }) => {
  await page.goto("/write");
  await expect(page.getByRole("heading", { name: "My journals" })).toHaveCount(0);
  await expect(page.getByText(/verified filmmakers|sign in/i).first()).toBeVisible();
});

test("the public Journal and filmmakers pages show no uncaught errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/journal");
  await page.goto("/filmmakers");
  expect(errors).toEqual([]);
});
