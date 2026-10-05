import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`FilterBar wide row and token spacing ${theme}`, {
    tag: ["@component:filter-bar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(
      `/iframe.html?id=form-filterbar--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("42 results");
    const gap = await page
      .locator(".bd-filter-bar")
      .evaluate((element) => [
        getComputedStyle(element).gap,
        getComputedStyle(element).getPropertyValue("--bd-space-16").trim(),
      ]);
    expect(gap[0]).toBe(gap[1]);
    await page.getByRole("button", { name: "Available" }).click();
    await expect(page.getByRole("status")).toHaveText("12 results");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByRole("status")).toHaveText("42 results");
  });
  test(`FilterBar mobile sheet keyboard, geometry and axe ${theme}`, {
    tag: ["@component:filter-bar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      `/iframe.html?id=form-filterbar--mobile&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const trigger = page.getByRole("button", { name: "Filters 0" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Filters", exact: true });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Available" })).toHaveCount(
      1,
    );
    const box = await page.locator(".bd-modal").boundingBox();
    expect(box?.width).toBe(390);
    expect(box?.height).toBe(844);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole("button", { name: "Available" }).focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Show 12 results" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Filters 1" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Available" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Filters 1" })).toBeFocused();
    await page.setViewportSize({ width: 640, height: 844 });
    await expect(page.getByRole("button", { name: "Available" })).toHaveCount(
      1,
    );
    await expect(
      page.getByRole("button", { name: "Available" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Filters 1" })).toHaveCount(
      0,
    );
  });
  test(`FilterBar wide axe ${theme}`, {
    tag: ["@component:filter-bar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(
      `/iframe.html?id=form-filterbar--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByRole("status")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("FilterBar chips and summary align with the search control", {
  tag: ["@component:filter-bar"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(
    "/iframe.html?id=form-filterbar--default&viewMode=story&globals=a11y.manual:!true",
  );
  await expect(page.getByRole("searchbox")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const centres = await page
    .locator(".bd-search-control, .bd-filter-bar-chips, .bd-filter-bar-summary")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return box.top + box.height / 2;
      }),
    );
  expect(centres).toHaveLength(3);
  expect(Math.max(...centres) - Math.min(...centres)).toBeLessThanOrEqual(1);
});
