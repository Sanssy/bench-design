import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`ActionList ${theme} wraps at 320px with full targets and visible keyboard focus`, {
    tag: ["@component:action-list", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=navigation-actionlist--resources&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const list = page.getByRole("list", { name: "Resources" });
    await expect(list).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const row of await list.getByRole("link").all()) {
      expect((await row.boundingBox())?.height).toBeGreaterThanOrEqual(48);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
    await page.keyboard.press("Tab");
    const first = list.getByRole("link").first();
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("data-focus-visible", "true");
    expect(
      await first.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe("solid");
    await page.keyboard.press("Tab");
    await expect(list.getByRole("link").last()).toBeFocused();
    const result = await new AxeBuilder({ page })
      .include(".bd-action-list")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

for (const theme of ["light", "dark"]) {
  test(`ActionList interface typography across examples ${theme}`, {
    tag: ["@component:action-list", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resources", "numbered-actions", "outlined-steps"]) {
      await page.goto(
        `/iframe.html?id=navigation-actionlist--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      const list = page.locator(".bd-action-list");
      await expect(list).toBeVisible();
      await list.evaluate((el) => {
        if (el.parentElement) el.parentElement.style.fontSize = "25px";
      });
      for (const title of await list.locator(".bd-action-list__title").all()) {
        await expect(title).toHaveCSS("font-size", "16px");
      }
    }
  });
}
