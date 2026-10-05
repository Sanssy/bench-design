import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Inspector examples and eyebrow typography ${theme}`, {
    tag: ["@component:inspector", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resource-details", "no-selection"]) {
      await page.goto(
        `/iframe.html?id=collections-inspector--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-inspector")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (story === "resource-details") {
        await expect(page.locator(".bd-inspector-eyebrow")).toHaveCSS(
          "font-family",
          /IBM Plex Mono/,
        );
        await page.setViewportSize({ width: 360, height: 700 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
test("Inspector disclosure keyboard preserves consumer metadata and actions", {
  tag: ["@component:inspector", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-inspector--resource-details&globals=a11y.manual:!true;theme:light",
  );
  const trigger = page.getByRole("button", { name: /Details/ });
  await expect(trigger).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Space");
  await expect(page.getByText("Research archive")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit resource" }),
  ).toBeVisible();
});
