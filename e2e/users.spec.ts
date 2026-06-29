import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can open users page and see create button", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/users");

  await expect(page.getByRole("heading", { name: /users/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /create user/i }),
  ).toBeVisible();
});
