import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

async function fillField(page: Page, label: RegExp, value: string) {
  const byLabel = page.getByLabel(label);

  if ((await byLabel.count()) > 0) {
    await byLabel.first().fill(value);
    return;
  }

  const byPlaceholder = page.getByPlaceholder(label);

  if ((await byPlaceholder.count()) > 0) {
    await byPlaceholder.first().fill(value);
    return;
  }

  throw new Error(`Could not find field: ${label}`);
}

test("admin can create a customer", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const customerName = `Playwright Customer ${timestamp}`;
  const customerEmail = `customer-${timestamp}@example.com`;
  const customerPhone = "0791234567";
  const customerAddress = "Amman, Jordan";

  await page.goto("/customers");

  await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible();

  await page
    .getByRole("button", { name: /add customer|create customer|new customer/i })
    .click();

  await expect(
    page.getByRole("heading", { name: /create customer|add customer/i }),
  ).toBeVisible();

  await fillField(page, /^customer name$|^name$/i, customerName);
  await fillField(page, /^email$/i, customerEmail);
  await fillField(page, /^phone$/i, customerPhone);
  await fillField(page, /^address$/i, customerAddress);

  await page
    .getByRole("button", { name: /^create customer$|^add customer$|^save$/i })
    .last()
    .click();

  await expect(page.getByText(customerName)).toBeVisible();
  await expect(page.getByText(customerEmail)).toBeVisible();
});
