import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`DisclosureGroup examples and axe ${theme}`, {
    tag: ["@component:disclosure-group", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["document-sections", "compare-sections"]) {
      await page.goto(
        `/iframe.html?id=structure-disclosuregroup--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-disclosure-group").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("exclusive and multiple keyboard expansion", {
  tag: ["@component:disclosure-group", "@theme:light"],
}, async ({ page }) => {
  for (const [story, multiple] of [
    ["document-sections", false],
    ["compare-sections", true],
  ] as const) {
    await page.goto(
      `/iframe.html?id=structure-disclosuregroup--${story}&globals=a11y.manual:!true;theme:light`,
    );
    const buttons = page.getByRole("button");
    await expect(buttons.nth(0)).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(buttons.nth(0)).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(buttons.nth(1)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(buttons.nth(0)).toHaveAttribute(
      "aria-expanded",
      String(multiple),
    );
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "true");
  }
});
