import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test("admin can access main ERP pages", async ({ page }) => {
  await loginAsAdmin(page);

  const pages = [
    { url: "/dashboard", heading: /dashboard/i },
    { url: "/products", heading: /products/i },
    { url: "/categories", heading: /categories/i },
    { url: "/customers", heading: /customers/i },
    { url: "/suppliers", heading: /suppliers/i },
    { url: "/purchases", heading: /purchases/i },
    { url: "/orders", heading: /orders/i },
    { url: "/expenses", heading: /expenses/i },
    { url: "/stock-movements", heading: /stock movements/i },
    { url: "/reports", heading: /reports/i },
    { url: "/users", heading: /users/i },
  ];

  for (const appPage of pages) {
    await page.goto(appPage.url);

    await expect(
      page.getByRole("heading", { name: appPage.heading }),
    ).toBeVisible();
  }
});
