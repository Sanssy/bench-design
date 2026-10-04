import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Status semantic colors ${theme}`, {
    tag: ["@component:status", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const tone of ["success", "warning", "danger"] as const) {
      await page.goto(
        `/iframe.html?id=feedback-status--upload-complete&args=tone:${tone}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const root = page.locator(".bd-status");
      await expect(root).toHaveAttribute("data-tone", tone);
      const result = await root.evaluate((element, tone) => {
        const actual = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.color = "var(--bd-text)";
        probe.style.backgroundColor = `var(--bd-${tone}-subtle)`;
        probe.style.borderLeft = `var(--bd-strong) solid var(--bd-${tone})`;
        element.append(probe);
        const expected = getComputedStyle(probe);
        const result = {
          text: actual.color,
          expectedText: expected.color,
          icon: getComputedStyle(element.querySelector("svg") ?? element).color,
          expectedTone: expected.borderLeftColor,
          background: actual.backgroundColor,
          expectedBackground: expected.backgroundColor,
          border: actual.borderLeftColor,
          width: actual.borderLeftWidth,
          expectedWidth: expected.borderLeftWidth,
        };
        probe.remove();
        return result;
      }, tone);
      expect(result.text).toBe(result.expectedText);
      expect(result.icon).toBe(result.expectedTone);
    }
  });
}
test("Status geometry follows tokens", {
  tag: ["@component:status", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=feedback-status--upload-complete&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const root = page.locator(".bd-status");
  await expect(root).toBeVisible();
  const values = await root.evaluate((element) => {
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      gap: "var(--bd-space-8)",
      fontSize: "var(--bd-size-ui)",
    });
    element.append(probe);
    const actual = getComputedStyle(element);
    const expected = getComputedStyle(probe);
    const values = [
      [actual.gap, expected.gap],
      [actual.fontSize, expected.fontSize],
    ];
    probe.remove();
    return values;
  });
  for (const [actual, expected] of values) expect(actual).toBe(expected);
  const icon = root.locator("svg");
  await expect(icon).toHaveAttribute("width", "20");
  await expect(icon).toHaveAttribute("aria-hidden", "true");
});
