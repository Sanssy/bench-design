import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Avatar examples and axe ${theme}`, {
    tag: ["@component:avatar", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["person", "sizes"]) {
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
