import { expect, test, type Page } from "@playwright/test";
import {
  loginAsCashier,
  loginAsInventory,
  loginAsManager,
} from "./helpers/auth";

async function expectPageBlocked(
  page: Page,
  url: string,
  blockedHeading: RegExp,
) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", { name: blockedHeading }),
  ).not.toBeVisible();

  const bodyText = await page.locator("body").innerText();

  expect(bodyText.toLowerCase()).toMatch(
    /you do not have permission|unauthorized|not authorized|access denied|forbidden|dashboard|404|page not found|sign in/,
  );
}

test("manager can access reports but cannot access users page", async ({
  page,
}) => {
  await loginAsManager(page);

  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();

  await expectPageBlocked(page, "/users", /users/i);
});

test("cashier cannot access users, reports, or expenses pages", async ({
  page,
}) => {
  await loginAsCashier(page);

  await expectPageBlocked(page, "/users", /users/i);
  await expectPageBlocked(page, "/reports", /reports/i);
  await expectPageBlocked(page, "/expenses", /expenses/i);
});

test("inventory staff can access stock movements but cannot access users or reports", async ({
  page,
}) => {
  await loginAsInventory(page);

  await page.goto("/stock-movements");
  await expect(
    page.getByRole("heading", { name: /stock movements/i }),
  ).toBeVisible();

  await expectPageBlocked(page, "/users", /users/i);
  await expectPageBlocked(page, "/reports", /reports/i);
});
