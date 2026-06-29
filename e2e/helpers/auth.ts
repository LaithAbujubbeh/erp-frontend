import { expect, type Page } from "@playwright/test";

type TestRole = "admin" | "manager" | "cashier" | "inventory";

const TEST_USERS = {
  admin: {
    email: "laith@laith.com",
    password: "laith123",
  },
  manager: {
    email: "manager@test.com",
    password: "123456",
  },
  cashier: {
    email: "cashier@test.com",
    password: "123456",
  },
  inventory: {
    email: "moe@moe.com",
    password: "123456",
  },
};

async function fillEmail(page: Page, value: string) {
  const byLabel = page.getByLabel(/email/i);

  if ((await byLabel.count()) > 0) {
    await byLabel.first().fill(value);
    return;
  }

  await page.getByPlaceholder(/email/i).fill(value);
}

async function fillPassword(page: Page, value: string) {
  const byLabel = page.getByLabel(/password/i);

  if ((await byLabel.count()) > 0) {
    await byLabel.first().fill(value);
    return;
  }

  await page.getByPlaceholder(/password/i).fill(value);
}

async function expectAuthCookie(page: Page) {
  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies();
        return cookies.some((cookie) => cookie.name === "token");
      },
      {
        message: "Expected auth cookie named token to be stored after login",
        timeout: 5000,
      },
    )
    .toBe(true);
}

export async function loginAs(page: Page, role: TestRole) {
  const user = TEST_USERS[role];

  await page.goto("/login");

  await fillEmail(page, user.email);
  await fillPassword(page, user.password);

  await page.getByRole("button", { name: /login|sign in/i }).click();

  await page.waitForLoadState("networkidle");

  await expectAuthCookie(page);

  await expect(page).not.toHaveURL(/\/login/);
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, "admin");
}

export async function loginAsManager(page: Page) {
  await loginAs(page, "manager");
}

export async function loginAsCashier(page: Page) {
  await loginAs(page, "cashier");
}

export async function loginAsInventory(page: Page) {
  await loginAs(page, "inventory");
}
