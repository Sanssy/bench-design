import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Table examples, token geometry and axe ${theme}`, {
    tag: ["@component:table", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resource-inventory", "compact-inventory"]) {
      await page.goto(
        `/iframe.html?id=collections-table--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-table").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const sizes = await page
        .locator(".bd-table-cell")
        .first()
        .evaluate((element) => {
          const actual = getComputedStyle(element);
          const probe = document.createElement("span");
          probe.style.height = "var(--bd-space-48)";
          element.append(probe);
          const result = [actual.height, getComputedStyle(probe).height];
          probe.remove();
          return result;
        });
      expect(sizes[0]).toBe(sizes[1]);
      await expect(
        page.locator('.bd-table-cell[data-align="end"]').first(),
      ).toHaveCSS("font-variant-numeric", "tabular-nums");
      const sticky = page.locator(".bd-table-heading").first();
      await expect(sticky).toHaveCSS(
        "position",
        story === "resource-inventory" ? "sticky" : "static",
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
test("table keyboard moves across cells and sorts", {
  tag: ["@component:table", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-table--resource-inventory&globals=a11y.manual:!true;theme:light",
  );
  const table = page.getByRole("grid", { name: "Resource inventory" });
  await expect(table).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("gridcell", { name: "12", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("gridcell", { name: "24", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".bd-table-cell[data-focus-visible]")).toHaveCSS(
    "outline-style",
    "solid",
  );
  await page.getByRole("columnheader", { name: /Name/ }).click();
  await expect(
    page.getByRole("columnheader", { name: /Name/ }),
  ).toHaveAttribute("aria-sort", "descending");
  // Users press the visible box; the native input sits underneath it.
  await page.locator("thead .bd-choice-box").click();
  await expect(page.locator(".bd-table-row[data-selected]")).toHaveCount(3);
});
test("wide table scrolls inside its frame", {
  tag: ["@component:table", "@theme:light"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto(
    "/iframe.html?id=collections-table--compact-inventory&globals=a11y.manual:!true;theme:light",
  );
  const frame = page.locator(".bd-table-frame").first();
  await expect(frame).toBeVisible();
  const overflow = await frame.evaluate((element) => ({
    width: element.clientWidth,
    content: element.scrollWidth,
    body: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(overflow.content).toBeGreaterThan(overflow.width);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport);
  await frame.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  expect(await frame.evaluate((element) => element.scrollLeft)).toBeGreaterThan(
    0,
  );
});
