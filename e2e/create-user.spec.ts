import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can create a new user", async ({ page }) => {
  await loginAsAdmin(page);

  const uniqueEmail = `test-user-${Date.now()}@example.com`;

  await page.goto("/users");

  await page.getByRole("button", { name: /create user/i }).click();

  await expect(
    page.getByRole("heading", { name: /create user/i }),
  ).toBeVisible();

  await page.getByLabel(/^name$/i).fill("Playwright Test User");
  await page.getByLabel(/^email$/i).fill(uniqueEmail);
  await page.getByLabel(/^password$/i).fill("password123");
  await page.getByLabel(/^role$/i).selectOption("CASHIER");

  await page
    .getByRole("button", { name: /^create user$/i })
    .last()
    .click();

  await expect(page.getByText(uniqueEmail)).toBeVisible();
});
