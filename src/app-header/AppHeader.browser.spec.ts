import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const width of [320, 1280]) {
    test(`AppHeader keeps all slots visible at ${width} in ${theme}`, {
      tag: ["@component:app-header", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(
        `/iframe.html?id=layout-appheader--workspace&viewMode=story&globals=theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const banner = page.getByRole("banner");
      await expect(banner).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(banner).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const brand = banner.getByRole("link", { name: "Research workspace" });
      const nav = banner.getByRole("navigation", { name: "Main pages" });
      const action = banner.getByRole("button", { name: "Account" });
      const brandBox = await brand.boundingBox();
      const navBox = await nav.boundingBox();
      const actionBox = await action.boundingBox();
      expect(brandBox).not.toBeNull();
      expect(navBox).not.toBeNull();
      expect(actionBox).not.toBeNull();
      if (!brandBox || !navBox || !actionBox)
        throw new Error("Missing header bounds");
      if (width === 320) {
        expect(navBox.y).toBeGreaterThanOrEqual(
          Math.max(
            brandBox.y + brandBox.height,
            actionBox.y + actionBox.height,
          ),
        );
      } else {
        expect(navBox.x).toBeGreaterThan(brandBox.x);
        expect(actionBox.x).toBeGreaterThan(navBox.x);
        expect(Math.max(brandBox.y, navBox.y, actionBox.y)).toBeLessThan(
          Math.min(
            brandBox.y + brandBox.height,
            navBox.y + navBox.height,
            actionBox.y + actionBox.height,
          ),
        );
      }
      for (const control of [
        brand,
        ...(await nav.getByRole("link").all()),
        action,
      ]) {
        await expect(control).toBeVisible();
        const box = await control.boundingBox();
        if (!box) throw new Error("Missing control bounds");
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(
          await control.evaluate(
            // Inline links report clientWidth 0 in Firefox: compare with the
            // rendered width, allowing 1 px of rounding.
            (element) =>
              element.scrollWidth <=
              Math.ceil(element.getBoundingClientRect().width) + 1,
          ),
        ).toBe(true);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to main content" }),
      ).toBeFocused();
      for (const control of [
        brand,
        ...(await nav.getByRole("link").all()),
        action,
      ]) {
        await page.keyboard.press("Tab");
        await expect(control).toBeFocused();
        await expect(control).toHaveCSS("outline-style", "solid");
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }
}
