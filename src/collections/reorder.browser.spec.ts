import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const component of ["grid-list", "table", "tree"]) {
  const story = component === "grid-list" ? "gridlist" : component;
  const selector =
    component === "grid-list"
      ? ".bd-grid-list-item"
      : component === "table"
        ? ".bd-table-row"
        : ".bd-tree-item";
  for (const theme of ["light", "dark"]) {
    test(`${component} reorder keyboard, indicator, cancel and axe ${theme}`, {
      tag: [`@component:${component}`, `@theme:${theme}`],
    }, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=collections-${story}--reorderable-resources&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const handle = page.getByRole("button", {
        name: /Field notes/,
      });
      await expect(handle).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press("Tab");
      await handle.focus();
      await page.keyboard.press("Enter");
      const indicator = page.locator(".bd-reorder-indicator[data-drop-target]");
      await expect(indicator).toHaveCount(1);
      const source = page.locator(`${selector}[data-dragging]`);
      await expect(source).toHaveCSS("opacity", "0.45");
      const tokenGeometry = await indicator.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.outline = "var(--bd-stroke) solid var(--bd-focus)";
        element.append(probe);
        const actual = getComputedStyle(element),
          expected = getComputedStyle(probe);
        const result = [
          actual.outlineWidth,
          actual.outlineColor,
          expected.outlineWidth,
          expected.outlineColor,
        ];
        probe.remove();
        return result;
      });
      expect(tokenGeometry.slice(0, 2)).toEqual(tokenGeometry.slice(2));
      await expect(page.locator("[data-live-announcer]")).toContainText(
        "Started dragging",
      );
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Escape");
      await expect(page.locator(`${selector}[data-dragging]`)).toHaveCount(0);
      await expect(page.locator(selector).first()).toContainText("Field notes");
      // Cancelling returns focus to the item (Table focuses its row or cell).
      await expect(
        page.locator(`${selector}:focus, ${selector}:has(:focus)`),
      ).toHaveCount(1);
      await handle.focus();
      await page.keyboard.press("Enter");
      await expect(indicator).toHaveCount(1);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.locator(selector).nth(0)).toContainText(
        "Reference images",
      );
      await expect(page.locator(selector).nth(1)).toContainText("Field notes");
      await expect(page.locator(selector).nth(2)).toContainText("Reading list");
      await expect(page.locator("[data-live-announcer]")).toContainText(
        "Drop complete",
      );
    });
  }
  // Pointer dragging is React Aria's native drag and drop; synthetic drags in
  // automated browsers are unreliable, and the keyboard path above exercises
  // the same onReorder, indicator and announcements.
}
