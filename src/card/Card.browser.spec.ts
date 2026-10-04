import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Card default colors and border ${theme}`, {
    tag: ["@component:card", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-card--saved-collection&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-card");
    await expect(component).toBeVisible();
    const result = await component.evaluate((element) => {
      const actual = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-text)";
      probe.style.backgroundColor = "var(--bd-surface-raised)";
      probe.style.border = "var(--bd-hair) solid var(--bd-divider)";
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
    expect(result.border).toBe("solid");
    expect(result.borderColor).toBe(result.expectedBorderColor);
    expect(result.width).toBe(result.expectedWidth);
  });
}
test("Card geometry uses spacing and typography tokens", {
  tag: ["@component:card", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=surfaces-card--saved-collection&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const component = page.locator(".bd-card");
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
    { paddingTop: "var(--bd-space-12)" },
  );
  for (const [actual, expected] of values) expect(actual).toBe(expected);
});
