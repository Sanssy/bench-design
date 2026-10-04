import { expect, test } from "@playwright/test";

// Spacing does not depend on the theme: check it once.
{
  const theme = "light";
  test("Inline token gaps", {
    tag: ["@component:inline", "@theme:light"],
  }, async ({ page }) => {
    for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96]) {
      await page.goto(
        `/iframe.html?id=layout-inline--actions&args=gap:${gap}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const layout = page.locator(".bd-inline");
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
test("Inline alignment and flow", {
  tag: ["@component:inline", "@theme:light"],
}, async ({ page }) => {
  for (const align of ["start", "center", "end", "stretch"]) {
    await page.goto(
      `/iframe.html?id=layout-inline--actions&args=align:${align}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    await expect(page.locator(".bd-inline")).toHaveCSS("align-items", align);
  }
  await expect(page.locator(".bd-inline")).toHaveCSS("flex-wrap", "wrap");
  for (const justify of [
    "start",
    "center",
    "end",
    "space-between",
    "space-around",
    "space-evenly",
  ]) {
    await page.goto(
      `/iframe.html?id=layout-inline--actions&args=justify:${justify}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    await expect(page.locator(".bd-inline")).toHaveCSS(
      "justify-content",
      justify,
    );
  }
  await page.goto(
    "/iframe.html?id=layout-inline--labels&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  await page.setViewportSize({ width: 200, height: 800 });
  await expect(page.locator(".bd-inline")).toBeVisible();
  const positions = await page
    .locator(".bd-inline")
    .evaluate((element) =>
      [...element.children].map((child) => child.getBoundingClientRect().top),
    );
  expect(new Set(positions).size).toBeGreaterThan(1);
});
test("nested Inline does not inherit its parent's gap, alignment or justification", {
  tag: ["@component:inline", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=layout-inline--actions&args=gap:24;align:center;justify:space-between&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const inner = await page
    .locator(".bd-inline")
    .first()
    .evaluate((outer) => {
      const nested = document.createElement("div");
      nested.className = "bd-inline";
      outer.append(nested);
      const style = getComputedStyle(nested);
      const result = [style.columnGap, style.alignItems, style.justifyContent];
      nested.remove();
      return result;
    });
  expect(inner).toEqual(["normal", "normal", "normal"]);
});
