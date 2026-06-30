import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can open reports page", async ({ page }) => {
  await loginAsAdmin(page);

  const failedResponses: string[] = [];

  page.on("response", (response) => {
    const url = response.url();

    if (url.includes("/reports") && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${url}`);
    }
  });

  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();

  await page.waitForLoadState("networkidle");

  expect(failedResponses).toEqual([]);
});
