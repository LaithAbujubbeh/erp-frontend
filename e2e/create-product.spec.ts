import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

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

async function createCategory(page: Page, categoryName: string) {
  await page.goto("/categories");

  await expect(
    page.getByRole("heading", { name: /categories/i }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: /add category|create category|new category/i })
    .click();

  await fillCategoryName(page, categoryName);

  await page
    .getByRole("button", { name: /create|add|save/i })
    .last()
    .click();

  await expect(page.getByText(categoryName)).toBeVisible();
}

test("admin can create a product", async ({ page }) => {
  await loginAsAdmin(page);

  const timestamp = Date.now();

  const categoryName = `Playwright Product Category ${timestamp}`;
  const productName = `Playwright Product ${timestamp}`;
  const sku = `PW-${timestamp}`;

  await createCategory(page, categoryName);

  await page.goto("/products");

  await expect(page.getByRole("heading", { name: /products/i })).toBeVisible();

  await page
    .getByRole("button", { name: /add product|create product|new product/i })
    .click();

  await expect(
    page.getByRole("heading", { name: /create product|add product/i }),
  ).toBeVisible();

  await page.getByLabel(/^product name$/i).fill(productName);
  await page.getByLabel(/^sku$/i).fill(sku);
  await page
    .getByLabel(/^description$/i)
    .fill("Created by Playwright E2E test");

  await page.getByLabel(/^buying price$/i).fill("5");
  await page.getByLabel(/^selling price$/i).fill("10");
  await page.getByLabel(/^quantity$/i).fill("20");
  await page.getByLabel(/^low stock threshold$/i).fill("5");

  await expect(page.getByLabel(/^category$/i)).toBeEnabled();
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
  await expect(page.getByText(sku)).toBeVisible();
});
