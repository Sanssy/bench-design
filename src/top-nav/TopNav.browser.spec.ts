import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`TopNav wraps complete labels and preserves native focus in ${theme}`, {
    tag: ["@component:top-nav", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=navigation-topnav--long-labels&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const nav = page.getByRole("navigation", { name: "Main pages" });
    await expect(nav).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const links = nav.getByRole("link");
    await expect(links).toHaveCount(3);
    for (const link of await links.all()) {
      const bounds = await link.boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
      expect(bounds?.x).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320);
      await expect(link).toHaveCSS("text-overflow", "clip");
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS("outline-style", "solid");
    }
    const first = links.first();
    await expect(first).toHaveAttribute("aria-current", "page");
    const styles = await first.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "border-bottom:var(--bd-stroke) solid var(--bd-border-strong);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
      element.append(probe);
      const actual = getComputedStyle(element),
        expected = getComputedStyle(probe);
      const pairs = [
        [actual.borderBottomWidth, expected.borderBottomWidth],
        [actual.borderBottomColor, expected.borderBottomColor],
      ];
      probe.remove();
      return pairs;
    });
    for (const [actual, expected] of styles) expect(actual).toBe(expected);
    await expect(links.last()).toHaveText("Ask");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#ask$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}
