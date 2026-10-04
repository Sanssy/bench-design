import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`ColorSwatchPicker token geometry and keyboard focus in ${theme}`, {
    tag: ["@component:color-swatch-picker", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-colorswatchpicker--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const geometry = page.locator(".bd-swatch").first();
    await expect(geometry).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "height:var(--bd-space-32);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
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
    const focused = page.locator(".bd-swatch-option").first();
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-color", tokens.focus);
    await expect(focused).toHaveCSS("outline-width", tokens.width);
    await expect(focused).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`ColorSwatchPicker external error and disabled state in ${theme}`, {
    tag: ["@component:color-swatch-picker", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-colorswatchpicker--review&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByText("Review this value")).toBeVisible();
    const disabled = page.locator(".bd-field[data-disabled]").first();
    await expect(disabled).toBeVisible();
    const controls = disabled.getByRole("option");
    await expect(controls.first()).toBeVisible();
    await expect(controls.first()).toHaveAttribute("aria-disabled", "true");
  });
  test(`ColorSwatchPicker axe A and AA in ${theme}`, {
    tag: ["@component:color-swatch-picker", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["default", "review"]) {
      await page.goto(
        `/iframe.html?id=form-colorswatchpicker--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
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
test("ColorSwatchPicker keyboard editing", {
  tag: ["@component:color-swatch-picker"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-colorswatchpicker--default&viewMode=story&globals=a11y.manual:!true",
  );
  await expect(page.locator(".bd-field").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(page.getByRole("option", { name: "Ink" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
