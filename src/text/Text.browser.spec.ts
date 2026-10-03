import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  for (const [story, size, variant, tone, tag] of [
    ["paragraph", "ui", "default", "default", "P"],
    ["metadata", "meta", "default", "default", "P"],
    ["body", "body", "default", "default", "P"],
    ["lead", "lead", "default", "default", "P"],
    ["label", "meta", "label", "default", "P"],
    ["mono", "meta", "mono", "default", "SPAN"],
    ["muted", "ui", "default", "muted", "P"],
  ] as const) {
    test(`Text ${story} typography in ${theme}`, {
      tag: [`@theme:${theme}`, "@component:text"],
    }, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=typography-text--${story}&viewMode=story&globals=theme:${theme}`,
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
          probe.style.textTransform =
            variant === "label" ? "uppercase" : "none";
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
            tag: element.tagName,
            actual: properties.map((property) => actual[property]),
            expected: properties.map((property) => expected[property]),
          };
          probe.remove();
          return result;
        },
        { size, variant, tone },
      );
      expect(values.tag).toBe(tag);
      expect(values.actual[0]).toContain(
        variant === "default" ? "Bench Manrope" : "Bench Plex",
      );
      expect(values.actual[2]).toBe("400");
      expect(values.actual).toEqual(values.expected);
    });
  }
}
