import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can create a supplier", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const supplierName = `Playwright Supplier ${timestamp}`;
  const supplierEmail = `supplier-${timestamp}@example.com`;
  const supplierPhone = "0791234567";
  const supplierAddress = "Amman, Jordan";

  await page.goto("/suppliers");

  await expect(page.getByRole("heading", { name: /suppliers/i })).toBeVisible();

  await page
    .getByRole("button", { name: /add supplier|create supplier|new supplier/i })
    .click();

  await expect(
    page.getByRole("heading", { name: /create supplier|add supplier/i }),
  ).toBeVisible();

  await page.getByLabel(/^supplier name$/i).fill(supplierName);
  await page.getByLabel(/^email$/i).fill(supplierEmail);
  await page.getByLabel(/^phone$/i).fill(supplierPhone);
  await page.getByLabel(/^address$/i).fill(supplierAddress);

  const statusSelect = page.getByLabel(/^status$/i);

  if ((await statusSelect.count()) > 0) {
    await statusSelect.selectOption("ACTIVE");
  }

  await page
    .getByRole("button", { name: /^create supplier$/i })
    .last()
    .click();

  await expect(page.getByText(supplierName)).toBeVisible();
  await expect(page.getByText(supplierEmail)).toBeVisible();
});
