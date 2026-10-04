import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`TextArea token geometry and keyboard focus in ${theme}`, {
    tag: ["@component:text-area", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-textarea--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const geometry = page.locator(".bd-textarea").first();
    await expect(geometry).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "height:var(--bd-space-48);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
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
    const initial = await geometry.evaluate((element) => {
      const css = getComputedStyle(element);
      return (
        3 * Number.parseFloat(css.lineHeight) +
        Number.parseFloat(css.paddingTop) +
        Number.parseFloat(css.paddingBottom) +
        Number.parseFloat(css.borderTopWidth) +
        Number.parseFloat(css.borderBottomWidth)
      );
    });
    expect((await geometry.boundingBox())?.height).toBeCloseTo(initial, 0);
    await page.keyboard.press("Tab");
    const focused = page.locator(".bd-textarea").first();
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-color", tokens.focus);
    await expect(focused).toHaveCSS("outline-width", tokens.width);
    await expect(focused).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`TextArea external error and disabled state in ${theme}`, {
    tag: ["@component:text-area", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-textarea--review&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByText("Review this value")).toBeVisible();
    const disabled = page.locator(".bd-field[data-disabled]").first();
    await expect(disabled).toBeVisible();
    const controls = disabled.getByRole("textbox");
    await expect(controls.first()).toBeVisible();
    await expect(controls.first()).toBeDisabled();
  });
  test(`TextArea axe A and AA in ${theme}`, {
    tag: ["@component:text-area", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["default", "review"]) {
      await page.goto(
        `/iframe.html?id=form-textarea--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
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
test("TextArea keyboard editing", { tag: ["@component:text-area"] }, async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=form-textarea--default&viewMode=story&globals=a11y.manual:!true",
  );
  await expect(page.locator(".bd-field").first()).toBeVisible();
  const input = page.getByRole("textbox");
  await input.fill("One\nTwo");
  await expect(input).toHaveValue("One\nTwo");
  await expect(page.getByText("7 / 500")).toBeVisible();
});
test("TextArea grows to eight lines, scrolls and shrinks", {
  tag: ["@component:text-area"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-textarea--default&viewMode=story&globals=a11y.manual:!true",
  );
  const input = page.getByRole("textbox");
  await expect(input).toBeVisible();
  const heights = await input.evaluate((element) => {
    const css = getComputedStyle(element);
    const extra =
      Number.parseFloat(css.paddingTop) +
      Number.parseFloat(css.paddingBottom) +
      Number.parseFloat(css.borderTopWidth) +
      Number.parseFloat(css.borderBottomWidth);
    const line = Number.parseFloat(css.lineHeight);
    return { min: 3 * line + extra, max: 8 * line + extra };
  });
  await input.fill(Array.from({ length: 12 }, () => "A line").join("\n"));
  await expect
    .poll(async () => (await input.boundingBox())?.height)
    .toBeCloseTo(heights.max, 0);
  expect(
    await input.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await input.fill("Short");
  await expect
    .poll(async () => (await input.boundingBox())?.height)
    .toBeCloseTo(heights.min, 0);
});
