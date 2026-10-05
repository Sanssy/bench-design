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
  test(`${component} mouse drag reorders consumer data`, {
    tag: [`@component:${component}`, "@theme:light"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=collections-${story}--reorderable-resources&globals=a11y.manual:!true;theme:light`,
    );
    const rows = page.locator(selector);
    await expect(rows).toHaveCount(3);
    const from = await rows.nth(0).boundingBox();
    const to = await rows.nth(2).boundingBox();
    if (!from || !to) throw new Error("Rows are not rendered");
    // Real mouse steps: one-shot synthetic drags are unreliable across engines.
    const x = from.x + from.width / 2;
    const startY = from.y + from.height / 2;
    const endY = to.y + to.height - 4;
    await page.mouse.move(x, startY);
    await page.mouse.down();
    for (let step = 1; step <= 12; step += 1)
      await page.mouse.move(x, startY + ((endY - startY) * step) / 12);
    await page.mouse.up();
    await expect(rows.nth(0)).not.toContainText("Field notes");
  });
}
