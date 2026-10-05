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
      await expect(handle).toBeFocused();
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
  test(`${component} pointer reorders consumer data`, {
    tag: [`@component:${component}`, "@theme:light"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=collections-${story}--reorderable-resources&globals=a11y.manual:!true;theme:light`,
    );
    const rows = page.locator(selector);
    await expect(rows).toHaveCount(3);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.addEventListener(
        "dragstart",
        () =>
          queueMicrotask(() => {
            const preview = document.querySelector(".bd-reorder-preview");
            if (!preview) return;
            const probe = document.createElement("span");
            probe.style.boxShadow = "var(--bd-elevation-dialog)";
            preview.append(probe);
            document.documentElement.dataset.previewShadowMatches = String(
              getComputedStyle(preview).boxShadow ===
                getComputedStyle(probe).boxShadow,
            );
            document.documentElement.dataset.previewLabel =
              preview.textContent ?? "";
            probe.remove();
          }),
        { once: true },
      );
    });
    const target = await rows.last().boundingBox();
    if (!target) throw new Error("Drop target is not rendered");
    await rows.first().dragTo(rows.last(), {
      targetPosition: { x: target.width / 2, y: target.height - 1 },
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-preview-shadow-matches",
      "true",
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-preview-label",
      /Field notes/,
    );
    await expect(rows.last()).toContainText("Field notes");
    await expect(rows.first()).toContainText("Reference images");
  });
}
