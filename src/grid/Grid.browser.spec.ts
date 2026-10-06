import { expect, test } from "@playwright/test";

// Layout does not depend on the theme: check it once.
const theme = "light";
{
  test("Grid token gaps", {
    tag: ["@component:grid", "@theme:light"],
  }, async ({ page }) => {
    for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96]) {
      await page.goto(
        `/iframe.html?id=layout-grid--collection&args=gap:${gap}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const layout = page.locator(".bd-grid");
      await expect(layout).toBeVisible();
      const values = await layout.evaluate((element, gap) => {
        const probe = document.createElement("div");
        probe.style.gap = `var(--bd-space-${gap})`;
        element.append(probe);
        const result = [
          getComputedStyle(element).gap,
          getComputedStyle(probe).gap,
        ];
        probe.remove();
        return result;
      }, gap);
      expect(values[0]).toBe(values[1]);
      expect(values[0]).toBe(`${gap}px`);
    }
  });
}
{
  for (const columns of [2, 3, 4]) {
    test(`Grid ${columns} columns responsive`, {
      tag: ["@component:grid", "@theme:light"],
    }, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=layout-grid--collection&args=columns:${columns}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const grid = page.locator(".bd-grid");
      await expect(grid).toBeVisible();
      for (const [width, count] of [
        [639, 1],
        [640, columns],
        [641, columns],
      ] as const) {
        await page.setViewportSize({ width, height: 800 });
        const tracks = await grid.evaluate(
          (element) =>
            getComputedStyle(element).gridTemplateColumns.split(" ").length,
        );
        expect(tracks).toBe(count);
      }
    });
  }
}

for (const template of ["hero", "sidebar", "marker"] as const) {
  test(`Grid ${template} proportions and mobile fallback`, {
    tag: ["@component:grid", "@theme:light"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=layout-grid--${template}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    const grid = page.locator(".bd-grid");
    await expect(grid).toBeVisible();
    for (const width of [639, 640, 1200]) {
      await page.setViewportSize({ width, height: 800 });
      const tracks = await grid.evaluate((element) =>
        getComputedStyle(element)
          .gridTemplateColumns.split(" ")
          .map(Number.parseFloat),
      );
      if (width < 640) {
        expect(tracks).toHaveLength(1);
      } else {
        expect(tracks).toHaveLength(template === "marker" ? 3 : 2);
        if (template === "hero")
          expect(
            Math.abs((tracks[0] ?? 0) / (tracks[1] ?? 1) - 7 / 5),
          ).toBeLessThan(0.01);
        else expect(tracks[0]).toBe(template === "sidebar" ? 232 : 136);
        if (template === "marker") {
          const action = await page
            .getByRole("button", { name: "Open chapter" })
            .boundingBox();
          expect(
            Math.abs((tracks[2] ?? 0) - (action?.width ?? 0)),
          ).toBeLessThan(1);
        }
      }
    }
  });
}
