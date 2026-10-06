import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`Page document flow at ${width} in ${theme}`, {
      tag: ["@component:page", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(
        `/iframe.html?id=layout-page--document&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await page.evaluate(() => document.fonts.ready);
      const main = page.getByRole("main");
      await expect(main).toBeVisible();
      const box = await main.boundingBox();
      const available = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      const expected = Math.min(1168, available - (width < 960 ? 48 : 128));
      expect(box?.width).toBe(expected);
      expect(box?.x).toBe((available - expected) / 2);
      const skip = page.getByRole("link", { name: "Skip to main content" });
      await page.keyboard.press("Tab");
      await expect(skip).toBeFocused();
      await expect(skip).toHaveCSS("clip-path", "none");
      await page.keyboard.press("Enter");
      await expect(main).toBeFocused();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await expect(page.locator(".bd-page-header")).toHaveCSS(
        "position",
        "static",
      );
      await expect(main).toHaveCSS("overflow-y", "visible");
      const top = await page.getByRole("banner").boundingBox();
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0);
      expect((await page.getByRole("banner").boundingBox())?.y).toBeLessThan(
        top?.y ?? 0,
      );
      await expect(page.getByRole("contentinfo")).toBeInViewport();
      expect(await main.evaluate((element) => element.scrollTop)).toBe(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });
  }
  test(`Page narrow measure in ${theme}`, {
    tag: ["@component:page", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(
      `/iframe.html?id=layout-page--narrow&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const main = page.getByRole("main");
    await expect(main).toHaveCSS("max-inline-size", "920px");
    const box = await main.boundingBox();
    expect(box?.width).toBe(920);
    const available = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(box?.x).toBe((available - 920) / 2);
    expect(
      await page.locator(".bd-page").evaluate((element) => {
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--bd-surface)";
        element.append(probe);
        const matches =
          getComputedStyle(element).backgroundColor ===
          getComputedStyle(probe).backgroundColor;
        probe.remove();
        return matches;
      }),
    ).toBe(true);
  });
}
