import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Timeline wraps long content and preserves focus in ${theme}`, {
    tag: ["@component:timeline", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=data-timeline--publication-history&viewMode=story&globals=theme:${theme}`,
    );
    const list = page.getByRole("list", { name: "Publication history" });
    await expect(list).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(list.getByRole("listitem")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const style = await list
      .locator("li")
      .first()
      .evaluate((item) => {
        const marker = getComputedStyle(
          item.querySelector(".bd-timeline-marker") as Element,
        );
        const rail = getComputedStyle(item);
        const square = getComputedStyle(item, "::before");
        const probe = document.createElement("span");
        probe.style.font =
          "var(--bd-size-meta) / var(--bd-line-reading) var(--bd-font-mono)";
        probe.style.color = "var(--bd-border)";
        item.append(probe);
        const expected = getComputedStyle(probe);
        const result = {
          font: [marker.fontFamily, marker.fontSize],
          expectedFont: [expected.fontFamily, expected.fontSize],
          border: rail.borderInlineStartColor,
          expectedBorder: expected.color,
          square: [square.width, square.height, square.content],
        };
        probe.remove();
        return result;
      });
    expect(style.font).toEqual(style.expectedFont);
    expect(style.border).toBe(style.expectedBorder);
    expect(style.square).toEqual(["8px", "8px", '""']);
    await page.keyboard.press("Tab");
    await expect(list.getByRole("link")).toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-timeline")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
