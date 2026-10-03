import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const [story, size] of [
    ["article", "display"],
    ["section", "heading"],
    ["subsection", "lead"],
    ["detail", "ui"],
  ] as const) {
    test(`Heading ${size} typography in ${theme}`, {
      tag: `@theme:${theme}`,
    }, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=typography-heading--${story}&viewMode=story&globals=theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const heading = page.getByRole("heading", { name: "A new perspective" });
      await expect(heading).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const values = await heading.evaluate((element, size) => {
        const ui = size === "ui";
        const probe = document.createElement("span");
        probe.style.fontFamily = `var(--bd-font-${ui ? "ui" : "editorial"})`;
        probe.style.fontSize = `var(--bd-size-${size})`;
        probe.style.fontWeight = `var(--bd-weight-${ui ? "semibold" : "editorial"})`;
        probe.style.lineHeight = `var(--bd-line-${ui ? "normal" : "tight"})`;
        probe.style.fontVariationSettings = ui
          ? "normal"
          : '"SOFT" var(--bd-editorial-soft), "WONK" var(--bd-editorial-wonk), "opsz" var(--bd-editorial-opsz)';
        element.append(probe);
        const actual = getComputedStyle(element);
        const expected = getComputedStyle(probe);
        const properties = [
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
          "fontVariationSettings",
        ] as const;
        const result = {
          actual: properties.map((property) => actual[property]),
          expected: properties.map((property) => expected[property]),
        };
        probe.remove();
        return result;
      }, size);
      expect(values.actual[0]).toContain(
        size === "ui" ? "Bench Manrope" : "Bench Fraunces",
      );
      expect(values.actual[2]).toBe(size === "ui" ? "600" : "500");
      expect(values.actual).toEqual(values.expected);
    });
  }

  for (const level of [1, 2, 3, 4, 5, 6]) {
    test(`Heading level ${level} uses its native tag in ${theme}`, {
      tag: `@theme:${theme}`,
    }, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=typography-heading--article&viewMode=story&globals=theme:${theme}&args=level:${level}`,
      );
      const heading = page.getByRole("heading", {
        level,
        name: "A new perspective",
      });
      await expect(heading).toBeVisible();
      expect(await heading.evaluate((element) => element.tagName)).toBe(
        `H${level}`,
      );
    });
  }
}
