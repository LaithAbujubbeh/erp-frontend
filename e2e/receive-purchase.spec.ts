import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { selectOptionContaining, selectFirstRealOption } from "./helpers/erp";

test.setTimeout(60_000);

async function createSupplier({
  page,
  supplierName,
  supplierEmail,
}: {
  page: Page;
  supplierName: string;
  supplierEmail: string;
}) {
  await page.goto("/suppliers");

  await expect(page.getByRole("heading", { name: /suppliers/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add supplier|create supplier|new supplier/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create supplier|add supplier/i }),
  ).toBeVisible();

  await page.getByLabel(/^supplier name$/i).fill(supplierName);
  await page.getByLabel(/^email$/i).fill(supplierEmail);
  await page.getByLabel(/^phone$/i).fill("0791234567");
  await page.getByLabel(/^address$/i).fill("Amman, Jordan");

  const createSupplierResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/suppliers") &&
      response.request().method() === "POST",
  );

  await page
    .getByRole("button", { name: /^create supplier$/i })
    .last()
    .click();

  const response = await createSupplierResponse;

  expect(response.ok()).toBeTruthy();

  await expect(page.getByText(supplierName)).toBeVisible();
}

async function createPurchase({
  page,
  supplierName,
}: {
  page: Page;
  supplierName: string;
}) {
  await page.goto("/purchases");

  await expect(page.getByRole("heading", { name: /purchases/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add purchase|create purchase|new purchase/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create purchase|add purchase/i }),
  ).toBeVisible();

  const supplierSelect = page.getByLabel(/^supplier$/i);

  await selectOptionContaining(
    supplierSelect,
    supplierName,
    "Expected created supplier to appear in supplier dropdown",
  );

  const productSelect = page.getByLabel(/^product$/i).first();

  await selectFirstRealOption(
    productSelect,
    "Expected at least one active product to appear in product dropdown",
  );

  await page
    .getByLabel(/^quantity$/i)
    .first()
    .fill("5");
  await page
    .getByLabel(/^unit cost$/i)
    .first()
    .fill("4");

  const createPurchaseResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/purchases") &&
      response.request().method() === "POST",
  );

  await page
    .getByRole("button", { name: /^create purchase$/i })
    .last()
    .click();

  const response = await createPurchaseResponse;

  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /create purchase|add purchase/i }),
  ).not.toBeVisible();

  await expect(page.getByRole("heading", { name: /purchases/i })).toBeVisible();
}

test("admin can receive a purchase", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const supplierName = `Receive Supplier ${timestamp}`;
  const supplierEmail = `receive-supplier-${timestamp}@example.com`;

  await createSupplier({
    page,
    supplierName,
    supplierEmail,
  });

  await createPurchase({
    page,
    supplierName,
  });

  await page.goto("/purchases");

  await expect(page.getByRole("heading", { name: /purchases/i })).toBeVisible();

  const purchaseRow = page
    .getByRole("row")
    .filter({ hasText: supplierName })
    .first();

  await expect(purchaseRow).toBeVisible();

  await purchaseRow.getByRole("button", { name: /^receive$/i }).click();

  const receivePurchaseResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/purchases") &&
      ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
      response.status() >= 200 &&
      response.status() < 300,
  );

  await page
    .getByRole("button", {
      name: /^receive$|^confirm$|receive purchase|confirm receive/i,
    })
    .last()
    .click();

  const response = await receivePurchaseResponse;

  expect(response.ok()).toBeTruthy();

  await expect(
    purchaseRow.getByRole("button", { name: /^receive$/i }),
  ).not.toBeVisible();
});
