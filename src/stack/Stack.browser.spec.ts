import { expect, test } from "@playwright/test";

// Spacing does not depend on the theme: check it once.
{
  const theme = "light";
  test("Stack token gaps", {
    tag: ["@component:stack", "@theme:light"],
  }, async ({ page }) => {
    for (const gap of [4, 8, 12, 16, 24, 32, 48, 64, 96]) {
      await page.goto(
        `/iframe.html?id=layout-stack--card&args=gap:${gap}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const layout = page.locator(".bd-stack");
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
test("Stack alignment and flow", {
  tag: ["@component:stack", "@theme:light"],
}, async ({ page }) => {
  for (const align of ["start", "center", "end", "stretch"]) {
    await page.goto(
      `/iframe.html?id=layout-stack--card&args=align:${align}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    await expect(page.locator(".bd-stack")).toHaveCSS("align-items", align);
  }
  await expect(page.locator(".bd-stack")).toHaveCSS("flex-direction", "column");
});
test("nested Stack does not inherit its parent's gap or alignment", {
  tag: ["@component:stack", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=layout-stack--card&args=gap:24;align:center&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const inner = await page
    .locator(".bd-stack")
    .first()
    .evaluate((outer) => {
      const nested = document.createElement("div");
      nested.className = "bd-stack";
      outer.append(nested);
      const style = getComputedStyle(nested);
      const result = [style.rowGap, style.alignItems];
      nested.remove();
      return result;
    });
  expect(inner).toEqual(["normal", "stretch"]);
});
