import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can open stock movements page", async ({ page }) => {
  await loginAsAdmin(page);

  const failedResponses: string[] = [];

  page.on("response", (response) => {
    const url = response.url();

    if (url.includes("/stock-movements") && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${url}`);
    }
  });

  await page.goto("/stock-movements");

  await expect(
    page.getByRole("heading", { name: /stock movements/i }),
  ).toBeVisible();

  await page.waitForLoadState("networkidle");

  expect(failedResponses).toEqual([]);
});
