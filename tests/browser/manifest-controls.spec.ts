import { expect, test } from "@playwright/test";

test("Storybook Controls exposes literal variant choices", {
  tag: ["@component:radio-group"],
}, async ({ page }) => {
  await page.goto(
    "/?path=/story/form-radiogroup--cards&globals=a11y.manual:!true",
  );
  await page.getByRole("tab", { name: /^Controls/ }).click();
  const row = page
    .getByRole("row")
    .filter({ has: page.getByText("variant", { exact: true }) });
  const select = row.getByRole("combobox");
  await expect(select).toBeVisible();
  await expect(select.getByRole("option")).toHaveText(["list", "cards"]);
  await select.selectOption("list");
  await expect(
    page.frameLocator("#storybook-preview-iframe").getByRole("radiogroup"),
  ).toHaveAttribute("data-variant", "list");
});
