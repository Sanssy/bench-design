import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`GridList examples, selection geometry and axe ${theme}`, {
    tag: ["@component:grid-list", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resource-cards", "resource-list"]) {
      await page.goto(
        `/iframe.html?id=collections-gridlist--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const collection = page.getByRole("grid", {
        name: "Resources",
        exact: true,
      });
      await expect(collection).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (story === "resource-cards") {
        // Users press the visible box; the native input sits underneath it.
        await page
          .getByRole("row", { name: "Field notes" })
          .locator(".bd-choice-box")
          .click();
        await expect(page.getByText("1 selected")).toBeVisible();
        const sizes = await page
          .locator(".bd-grid-list-item[data-selected]")
          .evaluate((element) => {
            const style = getComputedStyle(element);
            const probe = document.createElement("span");
            probe.style.outline = "var(--bd-stroke) solid var(--bd-text)";
            probe.style.padding = "var(--bd-space-16)";
            element.append(probe);
            const expected = getComputedStyle(probe);
            const result = [
              style.outlineWidth,
              expected.outlineWidth,
              style.paddingTop,
              expected.paddingTop,
            ];
            probe.remove();
            return result;
          });
        expect(sizes[0]).toBe(sizes[1]);
        expect(sizes[2]).toBe(sizes[3]);
      }
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
test("grid arrows navigate in two dimensions and Enter activates", {
  tag: ["@component:grid-list", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-gridlist--resource-cards&globals=a11y.manual:!true;theme:light",
  );
  const first = page.getByRole("row", { name: /Field notes/ });
  await expect(first).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Opened Field notes")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("row", { name: /Reference images/ }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("row", { name: /Draft outlines/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("row", { name: /Reading list/ })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("row", { name: /Reading list/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.locator(".bd-grid-list-item[data-focus-visible]"),
  ).toHaveCSS("outline-style", "solid");
});
test("list arrows stay vertical", {
  tag: ["@component:grid-list", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-gridlist--resource-list&globals=a11y.manual:!true;theme:light",
  );
  await expect(page.getByRole("row", { name: "Field notes" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("row", { name: "Reference images" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("row", { name: "Reading list" })).toBeFocused();
});
