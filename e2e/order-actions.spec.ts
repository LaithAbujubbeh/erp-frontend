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
    .getByRole("button", { name: /^create customer$/i })
    .last()
    .click();

  const response = await createCustomerResponse;

  expect(response.ok()).toBeTruthy();

  await expect(page.getByText(customerName)).toBeVisible();
}

async function createOrder({
  page,
  customerName,
}: {
  page: Page;
  customerName: string;
}) {
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

  await selectOptionContaining(
    page.getByLabel(/^customer$/i),
    customerName,
    "Expected created customer to appear in customer dropdown",
  );

  await selectFirstRealOption(
    page.getByLabel(/^product$/i).first(),
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
}

async function createOrderWithCustomer(page: Page, prefix: string) {
  const timestamp = Date.now();

  const customerName = `${prefix} Customer ${timestamp}`;
  const customerEmail = `${prefix.toLowerCase()}-${timestamp}@example.com`;

  await createCustomer({
    page,
    customerName,
    customerEmail,
  });

  await createOrder({
    page,
    customerName,
  });

  return customerName;
}

test("admin can pay an order", async ({ page }) => {
  await loginAsAdmin(page);

  const customerName = await createOrderWithCustomer(page, "Pay");

  await page.goto("/orders");

  const orderRow = page
    .getByRole("row")
    .filter({ hasText: customerName })
    .first();

  await expect(orderRow).toBeVisible();

  await orderRow.getByRole("button", { name: /^pay$/i }).click();

  const payOrderResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/orders") &&
      ["PATCH", "PUT", "POST"].includes(response.request().method()) &&
      response.status() >= 200 &&
      response.status() < 300,
  );

  await page
    .getByRole("button", {
      name: /^pay$|^confirm$|pay order|confirm payment|mark as paid/i,
    })
    .last()
    .click();

  const response = await payOrderResponse;

  expect(response.ok()).toBeTruthy();

  await expect(
    orderRow.getByRole("button", { name: /^pay$/i }),
  ).not.toBeVisible();
});

test("admin can cancel an order", async ({ page }) => {
  await loginAsAdmin(page);

  const customerName = await createOrderWithCustomer(page, "Cancel");

  await page.goto("/orders");

  const orderRow = page
    .getByRole("row")
    .filter({ hasText: customerName })
    .first();

  await expect(orderRow).toBeVisible();

  await orderRow.getByRole("button", { name: /^cancel$/i }).click();

  await expect(
    page.getByRole("heading", { name: /^cancel order$/i }),
  ).toBeVisible();

  const confirmCancelButton = page.getByRole("button", {
    name: /^cancel order$/i,
  });

  await expect(confirmCancelButton).toBeVisible();

  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/orders") &&
        ["PATCH", "PUT", "POST", "DELETE"].includes(
          response.request().method(),
        ),
    ),
    confirmCancelButton.click(),
  ]);

  expect(response.ok()).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: /^cancel order$/i }),
  ).not.toBeVisible();

  await expect(
    orderRow.getByRole("button", { name: /^cancel$/i }),
  ).not.toBeVisible();
});
