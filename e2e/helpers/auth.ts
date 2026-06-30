import { expect, type Page } from "@playwright/test";

type TestRole = "admin" | "manager" | "cashier" | "inventory";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const TEST_USERS = {
  admin: {
    email: getEnv("E2E_ADMIN_EMAIL"),
    password: getEnv("E2E_ADMIN_PASSWORD"),
  },
  manager: {
    email: getEnv("E2E_MANAGER_EMAIL"),
    password: getEnv("E2E_MANAGER_PASSWORD"),
  },
  cashier: {
    email: getEnv("E2E_CASHIER_EMAIL"),
    password: getEnv("E2E_CASHIER_PASSWORD"),
  },
  inventory: {
    email: getEnv("E2E_INVENTORY_EMAIL"),
    password: getEnv("E2E_INVENTORY_PASSWORD"),
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
