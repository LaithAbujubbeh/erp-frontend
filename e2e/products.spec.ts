import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can open products page", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/products");

  await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /add product/i }),
  ).toBeVisible();
});
