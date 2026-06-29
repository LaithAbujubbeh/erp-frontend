import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin stays logged in after refresh", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/products");
  await page.reload();

  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();
});
