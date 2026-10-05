import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 640]) {
    test(`ConnectedList keeps order and reflows at ${width}px in ${theme}`, {
      tag: ["@component:connected-list", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        `/iframe.html?id=data-connectedlist--related-resources&viewMode=story&globals=theme:${theme}`,
      );
      const list = page.getByRole("list", { name: "Related resources" });
      await expect(list).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const items = list.getByRole("listitem");
      await expect(items).toHaveCount(3);
      await expect(items.nth(0)).toContainText("Overview");
      await expect(items.nth(1)).toContainText("Read the supporting source");
      await expect(items.nth(2)).toContainText(
        "AppendixWithAnUnbrokenIdentifier",
      );
      const first = await items.nth(0).boundingBox();
      const second = await items.nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (first && second) {
        if (width < 640) expect(second.y).toBeGreaterThan(first.y);
        else {
          expect(second.x).toBeGreaterThan(first.x);
          expect(second.y).toBe(first.y);
        }
      }
      const rail = await items.first().evaluate((item) => {
        const style = getComputedStyle(item);
        return {
          horizontal: style.borderBlockStartWidth,
          vertical: style.borderInlineStartWidth,
          marker: getComputedStyle(item, "::before").content,
        };
      });
      expect(rail).toEqual({
        horizontal: width < 640 ? "0px" : "1px",
        vertical: width < 640 ? "1px" : "0px",
        marker: '""',
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Tab");
      await expect(list.getByRole("link").first()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(list.getByRole("link").nth(1)).toBeFocused();
      expect(
        (
          await new AxeBuilder({ page })
            .include(".bd-connected-list")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }
}
