import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";
import { selectOptionContaining, selectFirstRealOption } from "./helpers/erp";
test.setTimeout(60_000);

async function createCustomer({
  page,
  customerName,
  customerEmail,
}: {
  page: Page;
  customerName: string;
  customerEmail: string;
}) {
  await page.goto("/customers");

  await expect(page.getByRole("heading", { name: /customers/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add customer|create customer|new customer/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create customer|add customer/i }),
  ).toBeVisible();

  await page.getByLabel(/^customer name$/i).fill(customerName);
  await page.getByLabel(/^email$/i).fill(customerEmail);
  await page.getByLabel(/^phone$/i).fill("0791234567");
  await page.getByLabel(/^address$/i).fill("Amman, Jordan");

  const statusSelect = page.getByLabel(/^status$/i);

  if ((await statusSelect.count()) > 0) {
    await statusSelect.selectOption("ACTIVE");
  }

  const createCustomerResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/customers") &&
      response.request().method() === "POST",
  );

  await page
    .getByRole("button", {
      name: /^create customer$/i,
    })
    .last()
    .click();

  const response = await createCustomerResponse;

  expect(response.ok()).toBeTruthy();

  await expect(page.getByText(customerName)).toBeVisible();
}

test("admin can create an order", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const customerName = `Order Customer ${timestamp}`;
  const customerEmail = `order-customer-${timestamp}@example.com`;

  await createCustomer({
    page,
    customerName,
    customerEmail,
  });

  await page.goto("/orders");

  await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add order|create order|new order/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create order|add order/i }),
  ).toBeVisible();

  const customerSelect = page.getByLabel(/^customer$/i);

  await selectOptionContaining(
    customerSelect,
    customerName,
    "Expected created customer to appear in customer dropdown",
  );

  const productSelect = page.getByLabel(/^product$/i).first();

  await selectFirstRealOption(
    productSelect,
    "Expected at least one active product to appear in order product dropdown",
  );

  await page
    .getByLabel(/^quantity$/i)
    .first()
    .fill("1");
  await page
    .getByLabel(/^unit price$/i)
    .first()
    .fill("10");

  const createOrderResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/orders") &&
      response.request().method() === "POST",
  );

  await page
    .getByRole("button", { name: /^create order$/i })
    .last()
    .click();

  const response = await createOrderResponse;

  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /create order|add order/i }),
  ).not.toBeVisible();

  await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
});
