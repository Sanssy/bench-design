import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Slider token geometry and keyboard focus in ${theme}`, {
    tag: ["@component:slider", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-slider--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const geometry = page.locator(".bd-slider-thumb").first();
    await expect(geometry).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "height:calc(var(--bd-space-16) + var(--bd-space-4));outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
      document.body.append(probe);
      const css = getComputedStyle(probe);
      const result = {
        height: css.height,
        focus: css.outlineColor,
        width: css.outlineWidth,
        offset: css.outlineOffset,
      };
      probe.remove();
      return result;
    });
    await expect(geometry).toHaveCSS("height", tokens.height);
    await page.keyboard.press("Tab");
    const focused = page.locator(".bd-slider-thumb").first();
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-color", tokens.focus);
    await expect(focused).toHaveCSS("outline-width", tokens.width);
    await expect(focused).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`Slider external error and disabled state in ${theme}`, {
    tag: ["@component:slider", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-slider--review&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByText("Review this value")).toBeVisible();
    const disabled = page.locator(".bd-field[data-disabled]").first();
    await expect(disabled).toBeVisible();
    const controls = disabled.getByRole("slider");
    await expect(controls.first()).toBeVisible();
    await expect(controls.first()).toBeDisabled();
  });
  test(`Slider axe A and AA in ${theme}`, {
    tag: ["@component:slider", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["default", "review"]) {
      await page.goto(
        `/iframe.html?id=form-slider--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator(".bd-field").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
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
test("Slider keyboard editing", { tag: ["@component:slider"] }, async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=form-slider--default&viewMode=story&globals=a11y.manual:!true",
  );
  await expect(page.locator(".bd-field").first()).toBeVisible();
  const input = page.getByRole("slider");
  await input.focus();
  await page.keyboard.press("ArrowRight");
  await expect(input).toHaveValue("26");
  await page.keyboard.press("End");
  await expect(input).toHaveValue("100");
  await expect(page.locator("output")).toHaveText("100");
});
