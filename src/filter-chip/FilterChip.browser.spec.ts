import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`FilterChip active geometry and colors ${theme}`, {
    tag: ["@component:filter-chip", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-filterchip--active&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const chip = page.locator(".bd-filter-chip").first();
    await expect(chip).toHaveAttribute("data-selected", "true");
    const values = await chip.evaluate((element) => {
      const probe = document.createElement("span");
      Object.assign(probe.style, {
        minHeight: "calc(var(--bd-space-32) + var(--bd-space-4))",
        backgroundColor: "var(--bd-accent)",
        color: "var(--bd-on-accent)",
        border: "var(--bd-hair) solid var(--bd-border-strong)",
        boxShadow: "var(--bd-stroke) var(--bd-stroke) 0 var(--bd-shadow)",
        fontWeight: "var(--bd-weight-semibold)",
      });
      element.append(probe);
      const actual = getComputedStyle(element),
        expected = getComputedStyle(probe);
      const values = [
        "minHeight",
        "backgroundColor",
        "color",
        "borderTopColor",
        "borderTopWidth",
        "boxShadow",
        "fontWeight",
      ].map((key) => [
        actual[key as keyof CSSStyleDeclaration],
        expected[key as keyof CSSStyleDeclaration],
      ]);
      probe.remove();
      return values;
    });
    for (const [actual, expected] of values) expect(actual).toBe(expected);
    expect((await chip.boundingBox())?.height).toBe(36);
  });
}
test("FilterChip keyboard interaction and focus", {
  tag: ["@component:filter-chip", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-filterchip--default&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const chip = page.locator(".bd-filter-chip");
  await chip.focus();
  await page.keyboard.press("Space");
  await expect(chip).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Enter");
  await expect(chip).toHaveAttribute("aria-pressed", "false");
});
test("FilterChip usage stories pass axe in both themes", {
  tag: ["@component:filter-chip", "@theme:light", "@theme:dark"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"])
    for (const story of ["default", "active"]) {
      await page.goto(
        `/iframe.html?id=form-filterchip--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator(".bd-filter-chip").first()).toBeVisible();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
});
