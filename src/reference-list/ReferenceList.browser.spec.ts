import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`ReferenceList tokens, reflow and accessibility in ${theme}`, {
    tag: ["@component:reference-list", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=data-referencelist--references&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const root = page.locator(".bd-reference-list");
    await expect(root).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await root.evaluate((el) => getComputedStyle(el).listStyleType),
    ).toBe("decimal");
    await expect(root.getByRole("listitem")).toHaveCount(2);
    await page.keyboard.press("Tab");
    const link = root.getByRole("link", { name: "Publication guide" });
    await expect(link).toBeFocused();
    expect(
      await link.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#guide$/);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-reference-list")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`ReferenceList accent metadata and navigation in ${theme}`, {
    tag: ["@component:reference-list", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=data-referencelist--accent-references&viewMode=story&globals=theme:${theme}`,
    );
    const list = page.getByRole("list", { name: "Supporting references" });
    await expect(list).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(list.getByText("p. 3", { exact: true })).toBeVisible();
    expect(
      await list
        .locator(".bd-reference-marker")
        .first()
        .evaluate((el) => {
          const probe = document.createElement("span");
          probe.style.background = "var(--bd-accent)";
          probe.style.color = "var(--bd-on-accent)";
          el.append(probe);
          const actual = getComputedStyle(el);
          const expected = getComputedStyle(probe);
          const matches =
            actual.color === expected.color &&
            actual.backgroundColor === expected.backgroundColor;
          probe.remove();
          return matches;
        }),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(
      list.getByRole("link", { name: "Publication guide" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#guide$/);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-reference-list")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
