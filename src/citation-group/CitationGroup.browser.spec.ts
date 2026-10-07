import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`CitationGroup passages, keyboard and mobile ${theme}`, {
    tag: ["@component:citation-group", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-citationgroup--source-passages&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const group = page.getByRole("region", { name: "Annual report" });
    await expect(group.locator("blockquote")).toHaveCount(2);
    await page.keyboard.press("Tab");
    const link = group.getByRole("link", { name: "Read this passage" });
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute("data-focus-visible", "true");
    await page.setViewportSize({ width: 375, height: 800 });
    expect(await group.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    expect(
      await group
        .locator("blockquote")
        .first()
        .evaluate((el) => getComputedStyle(el).borderInlineStartWidth),
    ).toBe("3px");
    expect(
      (await new AxeBuilder({ page }).include(".bd-citation-group").analyze())
        .violations,
    ).toEqual([]);
    await page.goto(
      `/iframe.html?id=data-citationgroup--preview-action&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const button = page.getByRole("button", { name: "Preview passage" });
    await expect(button).toBeVisible();
    await page.evaluate(() => {
      const w = window as Window & { previews?: number };
      w.previews = 0;
      window.addEventListener("preview-passage", () => {
        w.previews = (w.previews ?? 0) + 1;
      });
    });
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    expect(
      await page.evaluate(
        () => (window as Window & { previews?: number }).previews,
      ),
    ).toBe(2);
  });
}
