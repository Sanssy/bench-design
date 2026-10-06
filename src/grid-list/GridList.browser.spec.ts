import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`GridList examples, selection geometry and axe ${theme}`, {
    tag: ["@component:grid-list", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of [
      "resource-cards",
      "resource-list",
      "wide-resource-cards",
    ]) {
      await page.goto(
        `/iframe.html?id=collections-gridlist--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const collection = page.getByRole("grid", {
        name: "Resources",
        exact: true,
      });
      await expect(collection).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (story === "resource-cards") {
        // Users press the visible box; the native input sits underneath it.
        await page
          .getByRole("row", { name: "Field notes" })
          .locator(".bd-choice-box")
          .click();
        await expect(page.getByText("1 selected")).toBeVisible();
        const sizes = await page
          .locator(".bd-grid-list-item[data-selected]")
          .evaluate((element) => {
            const style = getComputedStyle(element);
            const probe = document.createElement("span");
            probe.style.outline = "var(--bd-stroke) solid var(--bd-text)";
            probe.style.padding = "var(--bd-space-16)";
            element.append(probe);
            const expected = getComputedStyle(probe);
            const result = [
              style.outlineWidth,
              expected.outlineWidth,
              style.paddingTop,
              expected.paddingTop,
            ];
            probe.remove();
            return result;
          });
        expect(sizes[0]).toBe(sizes[1]);
        expect(sizes[2]).toBe(sizes[3]);
      }
      if (story === "wide-resource-cards") {
        const colors = await page
          .getByRole("row", { name: "Field notes" })
          .evaluate((element) => {
            const style = getComputedStyle(element);
            const probe = document.createElement("span");
            probe.style.background = "var(--bd-selection-strong)";
            probe.style.color = "var(--bd-on-selection-strong)";
            element.append(probe);
            const expected = getComputedStyle(probe);
            const result = [
              style.backgroundColor,
              expected.backgroundColor,
              style.color,
              expected.color,
            ];
            probe.remove();
            return result;
          });
        expect(colors[0]).toBe(colors[1]);
        expect(colors[2]).toBe(colors[3]);
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
test("grid arrows navigate in two dimensions and Enter activates", {
  tag: ["@component:grid-list", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-gridlist--resource-cards&globals=a11y.manual:!true;theme:light",
  );
  const first = page.getByRole("row", { name: /Field notes/ });
  await expect(first).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Opened Field notes")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("row", { name: /Reference images/ }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("row", { name: /Draft outlines/ })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("row", { name: /Reading list/ })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("row", { name: /Reading list/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.locator(".bd-grid-list-item[data-focus-visible]"),
  ).toHaveCSS("outline-style", "solid");
});
test("list arrows stay vertical", {
  tag: ["@component:grid-list", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-gridlist--resource-list&globals=a11y.manual:!true;theme:light",
  );
  await expect(page.getByRole("row", { name: "Field notes" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("row", { name: "Reference images" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("row", { name: "Reading list" })).toBeFocused();
});

// Geometry is theme-independent; both themes are covered by the examples test.
const theme = "light";
test(`wide cards collapse and strong selection stays visible ${theme}`, {
  tag: ["@component:grid-list", `@theme:${theme}`],
}, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    `/iframe.html?id=collections-gridlist--wide-resource-cards&globals=a11y.manual:!true;theme:${theme}`,
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  const grid = page.getByRole("grid", { name: "Resources", exact: true });
  await expect(grid).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const columnCount = () =>
    grid.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
  expect(await columnCount()).toBe(4);
  const first = page.getByRole("row", { name: "Field notes" });
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS("outline-offset", "4px");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("row", { name: "Reference images" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("row", { name: "Source index" })).toBeFocused();
  for (const [width, count] of [
    [1280, 4],
    [800, 4],
    [390, 2],
    [320, 1],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(columnCount).toBe(count);
    const fits = await grid.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    );
    expect(fits).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(
    `/iframe.html?id=collections-gridlist--media-cards&globals=a11y.manual:!true;theme:${theme}`,
  );
  const mediaGrid = page.getByRole("grid", { name: "Resource previews" });
  await expect(mediaGrid).toBeVisible();
  const firstMedia = mediaGrid.getByRole("row").first();
  await expect(firstMedia).toHaveCSS("padding", "0px");
  const sizes = await firstMedia.evaluate((element) => {
    const content = element.querySelector(".bd-grid-list-content");
    return [
      element.clientWidth,
      content?.getBoundingClientRect().width,
    ] as const;
  });
  expect(Math.abs(sizes[0] - (sizes[1] ?? 0))).toBeLessThanOrEqual(1);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
