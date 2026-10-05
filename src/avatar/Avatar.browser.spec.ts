import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Avatar examples and axe ${theme}`, {
    tag: ["@component:avatar", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["person", "sizes", "identity"]) {
      await page.goto(
        `/iframe.html?id=data-avatar--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-avatar").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("avatar sizes resolve from spacing tokens", {
  tag: ["@component:avatar", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=data-avatar--sizes&globals=a11y.manual:!true;theme:light",
  );
  for (const [size, token] of [
    [24, "var(--bd-space-24)"],
    [32, "var(--bd-space-32)"],
    [40, "calc(var(--bd-space-32) + var(--bd-space-8))"],
  ] as const) {
    const values = await page
      .locator(`.bd-avatar[data-size="${size}"]`)
      .evaluate((element, token) => {
        const probe = document.createElement("span");
        probe.style.width = token;
        probe.style.display = "block";
        // Keep the token probe out of the avatar flex sizing algorithm.
        probe.style.position = "absolute";
        element.append(probe);
        const expected = getComputedStyle(probe).width,
          actual = getComputedStyle(element);
        probe.remove();
        return [actual.width, actual.height, expected];
      }, token);
    expect(values[0]).toBe(values[2]);
    expect(values[1]).toBe(values[2]);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`Avatar tones and named identity action ${theme}`, {
    tag: ["@component:avatar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-avatar--identity&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const action = page.getByRole("button", {
      name: "Open Ada Lovelace profile",
    });
    await page.keyboard.press("Tab");
    await expect(action).toBeFocused();
    for (const tone of ["neutral", "accent"] as const) {
      const result = await page
        .locator(`.bd-avatar[data-tone="${tone}"]`)
        .first()
        .evaluate((element, tone) => {
          const actual = getComputedStyle(element);
          const probe = document.createElement("span");
          probe.style.color = `var(--bd-${tone === "accent" ? "on-accent" : "text"})`;
          probe.style.backgroundColor = `var(--bd-${tone === "accent" ? "accent" : "surface-subtle"})`;
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
            color: actual.color,
            background: actual.backgroundColor,
            expectedColor: expected.color,
            expectedBackground: expected.backgroundColor,
            contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          };
          probe.remove();
          return result;
        }, tone);
      expect(result.color).toBe(result.expectedColor);
      expect(result.background).toBe(result.expectedBackground);
      expect(result.contrast).toBeGreaterThanOrEqual(4.5);
    }
  });
}
