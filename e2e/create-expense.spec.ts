import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

async function createExpense(page: Page) {
  const timestamp = Date.now();

  const expenseTitle = `Cancel Expense ${timestamp}`;
  const expenseCategory = `Testing ${timestamp}`;
  const expenseAmount = "25.50";
  const expenseDate = "2026-06-30";
  const expenseDescription = "Created for cancel expense E2E test";

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

  await expect(expenseRow).toBeVisible({ timeout: 10_000 });

  return expenseTitle;
}

test("admin can cancel an expense", async ({ page }) => {
  await loginAsAdmin(page);

  const expenseTitle = await createExpense(page);

  const expenseRow = page
    .getByRole("row")
    .filter({ hasText: expenseTitle })
    .first();

  await expect(expenseRow).toBeVisible({ timeout: 10_000 });

  await expenseRow.getByRole("button", { name: /^cancel$/i }).click();

  await expect(
    page.getByRole("heading", { name: /^cancel expense$/i }),
  ).toBeVisible();

  const confirmCancelButton = page.getByRole("button", {
    name: /^cancel expense$/i,
  });

  await expect(confirmCancelButton).toBeVisible();

  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/expenses") &&
        ["PATCH", "PUT", "POST", "DELETE"].includes(
          response.request().method(),
        ),
    ),
    confirmCancelButton.click(),
  ]);

  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /^cancel expense$/i }),
  ).not.toBeVisible();

  await expect(expenseRow).not.toBeVisible({ timeout: 10_000 });
});
