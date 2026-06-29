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

test("admin can create a category", async ({ page }) => {
  await loginAsAdmin(page);

  const categoryName = `Playwright Category ${Date.now()}`;

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
});
