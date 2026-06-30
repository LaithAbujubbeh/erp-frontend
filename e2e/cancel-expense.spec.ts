import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

async function createExpense(page: import("@playwright/test").Page) {
  const timestamp = Date.now();

  const expenseTitle = `Cancel Expense ${timestamp}`;
  const expenseCategory = "Testing";
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

  await expect(page.getByText(expenseTitle)).toBeVisible();

  return expenseTitle;
}

test("admin can cancel an expense", async ({ page }) => {
  await loginAsAdmin(page);

  const expenseTitle = await createExpense(page);

  await page.goto("/expenses");

  const expenseRow = page
    .getByRole("row")
    .filter({ hasText: expenseTitle })
    .first();

  await expect(expenseRow).toBeVisible();

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

  await expect(
    expenseRow.getByRole("button", { name: /^cancel$/i }),
  ).not.toBeVisible();
});
