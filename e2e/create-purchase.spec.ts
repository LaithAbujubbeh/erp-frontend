import { expect, test, type Locator, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.setTimeout(60_000);

async function selectFirstRealOption(select: Locator, message: string) {
  await expect(select).toBeVisible();
  await expect(select).toBeEnabled();

  await expect
    .poll(
      async () => {
        const values = await select
          .locator("option")
          .evaluateAll((options) =>
            options.map((option) => (option as HTMLOptionElement).value),
          );

        return values.some((value) => value !== "");
      },
      {
        message,
        timeout: 10_000,
      },
    )
    .toBe(true);

  const firstValue = await select.locator("option").evaluateAll((options) => {
    const realOption = options.find(
      (option) => (option as HTMLOptionElement).value !== "",
    );

    return realOption ? (realOption as HTMLOptionElement).value : null;
  });

  expect(firstValue).toBeTruthy();

  await select.selectOption(firstValue!);
}

async function fillCategoryName(page: Page, value: string) {
  const byLabel = page.getByLabel(/category|name/i);

  if ((await byLabel.count()) > 0) {
    await byLabel.first().fill(value);
    return;
  }

  const byPlaceholder = page.getByPlaceholder(/category|name/i);

  if ((await byPlaceholder.count()) > 0) {
    await byPlaceholder.first().fill(value);
    return;
  }

  await page.locator("input").last().fill(value);
}

async function selectOptionContaining(
  select: Locator,
  text: string,
  message: string,
) {
  await expect(select).toBeVisible();
  await expect(select).toBeEnabled();

  await expect
    .poll(
      async () => {
        const options = await select.locator("option").allTextContents();
        return options.some((option) => option.includes(text));
      },
      {
        message,
        timeout: 10_000,
      },
    )
    .toBe(true);

  const optionValue = await select
    .locator("option")
    .filter({ hasText: text })
    .first()
    .getAttribute("value");

  expect(optionValue).toBeTruthy();

  await select.selectOption(optionValue!);
}

async function createCategory(page: Page, categoryName: string) {
  await page.goto("/categories");

  await expect(
    page.getByRole("heading", { name: /categories/i }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: /add category|create category|new category/i,
    })
    .click();

  await fillCategoryName(page, categoryName);

  await page
    .getByRole("button", { name: /create|add|save/i })
    .last()
    .click();

  await expect(page.getByText(categoryName)).toBeVisible();
}

async function createProduct({
  page,
  categoryName,
  productName,
  sku,
}: {
  page: Page;
  categoryName: string;
  productName: string;
  sku: string;
}) {
  await page.goto("/products");

  await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();

  await page
    .getByRole("button", {
      name: /add product|create product|new product/i,
    })
    .click();

  await expect(
    page.getByRole("heading", { name: /create product|add product/i }),
  ).toBeVisible();

  await page.getByLabel(/^product name$/i).fill(productName);
  await page.getByLabel(/^sku$/i).fill(sku);
  await page.getByLabel(/^description$/i).fill("Created for purchase test");

  await page.getByLabel(/^buying price$/i).fill("5");
  await page.getByLabel(/^selling price$/i).fill("10");
  await page.getByLabel(/^quantity$/i).fill("20");
  await page.getByLabel(/^low stock threshold$/i).fill("5");

  await page.getByLabel(/^category$/i).selectOption({
    label: categoryName,
  });

  const statusSelect = page.getByLabel(/^status$/i);

  if ((await statusSelect.count()) > 0) {
    await statusSelect.selectOption("ACTIVE");
  }

  await page
    .getByRole("button", { name: /^create product$/i })
    .last()
    .click();

  await expect(page.getByText(productName)).toBeVisible();
}

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

  await page
    .getByRole("button", { name: /^create supplier$/i })
    .last()
    .click();

  await expect(page.getByText(supplierName)).toBeVisible();
}

test("admin can create a purchase", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const categoryName = `Purchase Category ${timestamp}`;
  const productName = `Purchase Product ${timestamp}`;
  const sku = `PUR-${timestamp}`;
  const supplierName = `Purchase Supplier ${timestamp}`;
  const supplierEmail = `purchase-supplier-${timestamp}@example.com`;

  await createCategory(page, categoryName);

  await createProduct({
    page,
    categoryName,
    productName,
    sku,
  });

  await createSupplier({
    page,
    supplierName,
    supplierEmail,
  });

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
});
