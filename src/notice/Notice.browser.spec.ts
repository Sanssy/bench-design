import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Notice semantic colors ${theme}`, {
    tag: ["@component:notice", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const tone of ["neutral", "success", "warning", "danger"] as const) {
      await page.goto(
        `/iframe.html?id=feedback-notice--upload-complete&args=tone:${tone}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const root = page.locator(".bd-notice");
      await expect(root).toHaveAttribute("data-tone", tone);
      const result = await root.evaluate((element, tone) => {
        const actual = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.color = "var(--bd-text)";
        probe.style.backgroundColor =
          tone === "neutral"
            ? "var(--bd-surface-subtle)"
            : `var(--bd-${tone}-subtle)`;
        probe.style.borderLeft = `var(--bd-strong) solid var(--bd-${tone === "neutral" ? "border" : tone})`;
        element.append(probe);
        const expected = getComputedStyle(probe);

        const luminance = (color: string) =>
          (
            color
              .match(/[\d.]+/g)
              ?.slice(0, 3)
              .map(Number) ?? []
          ).reduce((sum, channel, i) => {
            const c = channel / 255;
            return (
              sum +
              ([0.2126, 0.7152, 0.0722][i] ?? 0) *
                (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
            );
          }, 0);
        const a = luminance(actual.color),
          b = luminance(actual.backgroundColor);
        const result = {
          contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
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
      expect(result.contrast).toBeGreaterThanOrEqual(4.5);
      expect(result.text).toBe(result.expectedText);
      expect(result.icon).toBe(result.expectedTone);
      expect(result.background).toBe(result.expectedBackground);
      expect(result.border).toBe(result.expectedTone);
      expect(result.width).toBe(result.expectedWidth);
    }
  });
}
test("Notice geometry follows tokens", {
  tag: ["@component:notice", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=feedback-notice--upload-complete&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const root = page.locator(".bd-notice");
  await expect(root).toBeVisible();
  const values = await root.evaluate((element) => {
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      gap: "var(--bd-space-8)",
      fontSize: "var(--bd-size-ui)",
      padding: "var(--bd-space-16)",
    });
    element.append(probe);
    const actual = getComputedStyle(element);
    const expected = getComputedStyle(probe);
    const values = [
      [actual.gap, expected.gap],
      [actual.fontSize, expected.fontSize],
      [actual.padding, expected.padding],
    ];
    probe.remove();
    return values;
  });
  for (const [actual, expected] of values) expect(actual).toBe(expected);
  const icon = root.locator("svg");
  await expect(icon).toHaveAttribute("width", "20");
  await expect(icon).toHaveAttribute("aria-hidden", "true");
});
