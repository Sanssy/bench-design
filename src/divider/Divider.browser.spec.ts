import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Divider decorative color in ${theme}`, {
    tag: ["@component:divider", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=layout-divider--reading-sections&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const divider = page.locator("hr.bd-divider");
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("separator")).toHaveCount(0);
    const values = await divider.evaluate((element) => {
      const probe = document.createElement("div");
      probe.style.borderTop = "var(--bd-hair) solid var(--bd-divider)";
      element.after(probe);
      const actual = getComputedStyle(element),
        expected = getComputedStyle(probe);
      const result = {
        actual: [actual.borderTopColor, actual.borderTopWidth],
        expected: [expected.borderTopColor, expected.borderTopWidth],
      };
      probe.remove();
      return result;
    });
    expect(values.actual).toEqual(values.expected);
    expect(values.actual).toEqual([
      theme === "light" ? "rgb(214, 216, 206)" : "rgb(48, 59, 51)",
      "1px",
    ]);
  });
}
