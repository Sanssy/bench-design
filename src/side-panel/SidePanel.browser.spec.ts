import { expect, test } from "@playwright/test";

test("SidePanel uses panel width, minimum width and padding tokens", {
  tag: ["@component:side-panel", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=layout-sidepanel--library&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const panel = page.locator(".bd-side-panel");
  await expect(panel).toBeVisible();
  const values = await panel.evaluate((element) => {
    const probe = document.createElement("div");
    probe.style.width = "var(--bd-panel-width)";
    probe.style.padding = "var(--bd-space-24)";
    element.append(probe);
    const actual = getComputedStyle(element);
    const expected = getComputedStyle(probe);
    const result = {
      width: actual.width,
      expectedWidth: expected.width,
      padding: actual.padding,
      expectedPadding: expected.padding,
      minimum: actual.minInlineSize,
    };
    probe.remove();
    return result;
  });
  expect(values.width).toBe(values.expectedWidth);
  expect(values.padding).toBe(values.expectedPadding);
  expect(values.minimum).toBe("240px");
});
for (const theme of ["light", "dark"] as const) {
  test(`SidePanel surface ${theme}`, {
    tag: ["@component:side-panel", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=layout-sidepanel--library&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const panel = page.locator(".bd-side-panel");
    await expect(panel).toBeVisible();
    expect(
      await panel.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.color = "var(--bd-text)";
        probe.style.background = "var(--bd-surface)";
        element.append(probe);
        const actual = getComputedStyle(element);
        const expected = getComputedStyle(probe);
        const matches =
          actual.color === expected.color &&
          actual.backgroundColor === expected.backgroundColor;
        probe.remove();
        return matches;
      }),
    ).toBe(true);
  });
}
