import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`EmptyState default colors and border ${theme}`, {
    tag: ["@component:empty-state", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-emptystate--empty-library&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-empty-state");
    await expect(component).toBeVisible();
    const result = await component.evaluate((element) => {
      const actual = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-text)";
      probe.style.backgroundColor = "var(--bd-surface-subtle)";
      probe.style.border = "var(--bd-hair) dashed var(--bd-border)";
      element.append(probe);
      const expected = getComputedStyle(probe);
      const result = {
        color: actual.color,
        expectedColor: expected.color,
        background: actual.backgroundColor,
        expectedBackground: expected.backgroundColor,
        border: actual.borderTopStyle,
        borderColor: actual.borderTopColor,
        expectedBorderColor: expected.borderTopColor,
        width: actual.borderTopWidth,
        expectedWidth: expected.borderTopWidth,
      };
      probe.remove();
      return result;
    });
    expect(result.color).toBe(result.expectedColor);
    expect(result.background).toBe(result.expectedBackground);
    expect(result.border).toBe("dashed");
    expect(result.borderColor).toBe(result.expectedBorderColor);
    expect(result.width).toBe(result.expectedWidth);
  });
}
test("EmptyState geometry uses spacing and typography tokens", {
  tag: ["@component:empty-state", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=surfaces-emptystate--empty-library&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const component = page.locator(".bd-empty-state");
  await expect(component).toBeVisible();
  const values = await component.evaluate(
    (element, declarations) => {
      const probe = document.createElement("span");
      Object.assign(probe.style, declarations);
      element.append(probe);
      const actual = getComputedStyle(element);
      const expected = getComputedStyle(probe);
      const values = Object.keys(declarations).map((key) => [
        actual[key as keyof CSSStyleDeclaration],
        expected[key as keyof CSSStyleDeclaration],
      ]);
      probe.remove();
      return values;
    },
    { paddingTop: "var(--bd-space-24)", paddingLeft: "var(--bd-space-16)" },
  );
  for (const [actual, expected] of values) expect(actual).toBe(expected);
});
