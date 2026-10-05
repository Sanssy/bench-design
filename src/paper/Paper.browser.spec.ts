import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Paper tokens, reflow and accessibility in ${theme}`, {
    tag: ["@component:paper", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=layout-paper--document&viewMode=story&globals=theme:${theme}`,
    );
    const root = page.locator(".bd-paper");
    await expect(root).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const styles = await root.evaluate((el) => {
      const s = getComputedStyle(el);
      const mark = getComputedStyle(el.querySelector("mark") as Element);
      const probe = document.createElement("span");
      probe.style.cssText =
        "background:var(--bd-surface-raised);color:var(--bd-border);max-width:var(--bd-measure);padding:var(--bd-space-24);box-shadow:var(--bd-offset) var(--bd-offset) 0 var(--bd-shadow)";
      el.append(probe);
      const expected = getComputedStyle(probe);
      const sheet = [
        s.backgroundColor,
        s.borderTopColor,
        s.maxInlineSize,
        s.paddingTop,
        s.boxShadow,
      ];
      const tokens = [
        expected.backgroundColor,
        expected.color,
        expected.maxWidth,
        expected.paddingTop,
        expected.boxShadow,
      ];
      probe.style.cssText =
        "background:var(--bd-accent);color:var(--bd-on-accent)";
      const result = {
        sheet,
        tokens,
        mark: [mark.backgroundColor, mark.color],
        highlight: [
          getComputedStyle(probe).backgroundColor,
          getComputedStyle(probe).color,
        ],
      };
      probe.remove();
      return result;
    });
    expect(styles.sheet).toEqual(styles.tokens);
    expect(styles.mark).toEqual(styles.highlight);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-paper")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
