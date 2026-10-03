import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(
    "/iframe.html?id=technical-bootstrap-harness--native-control&viewMode=story",
  );
  await expect(page.getByRole("main")).toBeVisible();
});
test("renders the named native harness control", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Exercise harness", exact: true }),
  ).toBeVisible();
});
test("click updates native harness state", async ({ page }) => {
  await page
    .getByRole("button", { name: "Exercise harness", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Interactions: 1");
});
test("executes axe on the technical harness", async ({ page }) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
