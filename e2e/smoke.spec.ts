import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can login", async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
});
