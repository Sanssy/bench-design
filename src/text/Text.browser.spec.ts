import { expect, test } from "@playwright/test";

test("Text typography and theme colors", {
  tag: ["@theme:light", "@theme:dark", "@component:text"],
}, async ({ page }) => {
  const theme = "light";
  for (const [story, size, variant, tone] of [
    ["paragraph", "ui", "default", "default"],
    ["metadata", "meta", "default", "default"],
    ["body", "body", "default", "default"],
    ["lead", "lead", "default", "default"],
    ["label", "meta", "label", "default"],
    ["mono", "meta", "mono", "default"],
    ["muted", "ui", "default", "muted"],
  ] as const) {
    await page.goto(
      `/iframe.html?id=typography-text--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const text = page.getByText("Read the next chapter.", { exact: true });
    await expect(text).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const values = await text.evaluate(
      (element, { size, variant, tone }) => {
        const probe = document.createElement("span");
        probe.style.fontFamily = `var(--bd-font-${variant === "label" ? "metadata" : variant === "mono" ? "mono" : "ui"})`;
        probe.style.fontSize = `var(--bd-size-${size})`;
        probe.style.fontWeight = "var(--bd-weight-regular)";
        probe.style.lineHeight = `var(--bd-line-${size === "meta" && variant === "default" ? "normal" : "reading"})`;
        probe.style.color = `var(--bd-text${tone === "muted" ? "-muted" : ""})`;
        probe.style.textTransform = variant === "label" ? "uppercase" : "none";
        probe.style.letterSpacing =
          variant === "label" ? "var(--bd-tracking-label)" : "normal";
        element.append(probe);
        const actual = getComputedStyle(element);
        const expected = getComputedStyle(probe);
        const properties = [
          "fontFamily",
          "fontSize",
          "fontWeight",
          "lineHeight",
          "color",
          "textTransform",
          "letterSpacing",
        ] as const;
        const result = {
          actual: properties.map((property) => actual[property]),
          expected: properties.map((property) => expected[property]),
        };
        probe.remove();
        return result;
      },
      { size, variant, tone },
    );
    expect(values.actual[0]).toContain(
      variant === "default" ? "Bench Manrope" : "Bench Plex",
    );
    expect(values.actual[2]).toBe("400");
    expect(values.actual).toEqual(values.expected);
    for (const colorTheme of ["light", "dark"]) {
      await page.goto(
        `/iframe.html?id=typography-text--${story}&viewMode=story&globals=a11y.manual:!true;theme:${colorTheme}`,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        colorTheme,
      );
      const colors = await text.evaluate((element, muted) => {
        const probe = document.createElement("span");
        probe.style.color = `var(--bd-text${muted ? "-muted" : ""})`;
        element.append(probe);
        const result = [
          getComputedStyle(element).color,
          getComputedStyle(probe).color,
        ];
        probe.remove();
        return result;
      }, tone === "muted");
      expect(colors[0]).toBe(colors[1]);
    }
  }
});
