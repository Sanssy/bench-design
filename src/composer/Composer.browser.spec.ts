import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Composer mobile focus and accessibility in ${theme}`, {
    tag: ["@component:composer", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const story of ["default", "pending", "disabled", "invalid"]) {
      await page.goto(
        `/iframe.html?id=form-composer--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator(".bd-composer")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox")).toBeFocused();
    await expect(page.getByRole("textbox")).toHaveCSS("outline-style", "solid");
  });
}
