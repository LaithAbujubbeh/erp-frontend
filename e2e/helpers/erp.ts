import { expect, type Locator } from "@playwright/test";

export async function selectOptionContaining(
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

export async function selectFirstRealOption(select: Locator, message: string) {
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
