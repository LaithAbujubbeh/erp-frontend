import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can create an expense", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const expenseTitle = `Playwright Expense ${timestamp}`;
  const expenseCategory = `Testing ${timestamp}`;
  const expenseAmount = "25.50";
  const expenseDate = "2026-06-30";
  const expenseDescription = "Created by Playwright E2E test";

  await page.goto("/expenses");

  await expect(page.getByRole("heading", { name: /expenses/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add expense|create expense|new expense/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create expense|add expense/i }),
  ).toBeVisible();

  await page.getByLabel(/^title$/i).fill(expenseTitle);
  await page.getByLabel(/^category$/i).fill(expenseCategory);
  await page.getByLabel(/^amount$/i).fill(expenseAmount);
  await page.getByLabel(/^expense date$/i).fill(expenseDate);
  await page.getByLabel(/^description$/i).fill(expenseDescription);

  const createExpenseResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/expenses") &&
      response.request().method() === "POST",
  );

  await page
    .getByRole("button", { name: /^create expense$/i })
    .last()
    .click();

  const response = await createExpenseResponse;

  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /create expense|add expense/i }),
  ).not.toBeVisible();

  const expenseRow = page
    .getByRole("row")
    .filter({ hasText: expenseTitle })
    .first();

  await expect(expenseRow).toBeVisible();
  await expect(expenseRow).toContainText(expenseCategory);
});
