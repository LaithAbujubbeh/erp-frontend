import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("shows not found page for invalid route", async ({ page }) => {
  await loginAsAdmin(page);

  await page.goto("/this-page-does-not-exist");

  await expect(page.getByText(/page not found/i)).toBeVisible();
  await expect(page.getByText("404")).toBeVisible();
});
