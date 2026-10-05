import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`SegmentedControl token geometry and keyboard focus in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-segmentedcontrol--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const geometry = page.locator(".bd-segment").first();
    await expect(geometry).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "height:calc(var(--bd-space-32) + var(--bd-space-4));outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
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
    const focused = page.locator(".bd-segment").first();
    await expect(focused).toHaveCSS("outline-style", "solid");
    await expect(focused).toHaveCSS("outline-color", tokens.focus);
    await expect(focused).toHaveCSS("outline-width", tokens.width);
    await expect(focused).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`SegmentedControl external error and disabled state in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-segmentedcontrol--review&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByText("Review this value")).toBeVisible();
    const disabled = page.locator(".bd-field[data-disabled]").first();
    await expect(disabled).toBeVisible();
    const controls = disabled.getByRole("radio");
    await expect(controls.first()).toBeVisible();
    await expect(controls.first()).toBeDisabled();
    // Counts last: pointer clicks change React Aria's interaction modality.
    for (const story of ["facets-with-counts", "wrapped"]) {
      await page.goto(
        `/iframe.html?id=form-segmentedcontrol--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      if (story === "wrapped") {
        const group = page.locator(".bd-segmented");
        await expect(group).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(group).toHaveCSS("border-top-width", "0px");
        for (const segment of await page.locator(".bd-segment").all()) {
          await expect(segment).toHaveCSS("border-top-style", "solid");
          await expect(segment).toHaveCSS("border-inline-end-style", "solid");
        }
      }
      const housing = page.getByRole("radio", { name: "Housing, 5" });
      const count = housing.locator(".bd-segment-count");
      await expect(count).toHaveText("5");
      const roles = await page.evaluate(() => {
        const probe = document.createElement("span");
        document.body.append(probe);
        probe.style.color = "var(--bd-text-muted)";
        probe.style.fontFamily = "var(--bd-font-mono)";
        probe.style.fontSize = "var(--bd-size-meta)";
        const css = getComputedStyle(probe);
        const result = {
          muted: css.color,
          font: css.fontFamily,
          size: css.fontSize,
          selected: "",
        };
        probe.style.color = "var(--bd-on-accent)";
        result.selected = getComputedStyle(probe).color;
        probe.remove();
        return result;
      });
      await expect(count).toHaveCSS("color", roles.muted);
      await expect(count).toHaveCSS("font-family", roles.font);
      await expect(count).toHaveCSS("font-size", roles.size);
      await housing.click();
      await expect(count).toHaveCSS("color", roles.selected);
      await page.getByRole("radio", { name: /^All,/ }).click();
      await expect(count).toHaveCSS("color", roles.muted);
    }
  });
  test(`SegmentedControl axe A and AA in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of [
      "default",
      "review",
      "wrapped",
      "facets-with-counts",
    ]) {
      await page.goto(
        `/iframe.html?id=form-segmentedcontrol--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
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
test("SegmentedControl keyboard editing", {
  tag: ["@component:segmented-control"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-segmentedcontrol--default&viewMode=story&globals=a11y.manual:!true",
  );
  await expect(page.locator(".bd-field").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  const recent = page.getByRole("radio", { name: "Recent, 8" });
  await expect(recent).toBeFocused();
  await page.keyboard.press("Space");
  await expect(recent).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Space");
  await expect(recent).toHaveAttribute("aria-checked", "true");
});

test("wrapped facets fit 320 px and traverse successive rows", {
  tag: ["@component:segmented-control"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(
    "/iframe.html?id=form-segmentedcontrol--wrapped&viewMode=story&globals=a11y.manual:!true",
  );
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);
  const boxes = await radios.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        right: box.right,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }),
  );
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(320);
  }
  expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await expect(radios.nth(5)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(radios.nth(3)).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
