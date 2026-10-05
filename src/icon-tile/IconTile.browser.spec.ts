import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`IconTile token geometry and contrast ${theme}`, {
    tag: ["@component:icon-tile", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=media-icontile--category-markers&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const tiles = page.locator(".bd-icon-tile");
    await expect(tiles).toHaveCount(16);
    for (const tile of await tiles.all()) {
      const values = await tile.evaluate((element) => {
        const tone = element.getAttribute("data-tone");
        const size = element.getAttribute("data-size");
        const probe = document.createElement("span");
        probe.style.color = `var(--bd-${tone === "accent" ? "on-accent" : "text"})`;
        probe.style.backgroundColor = `var(--bd-${tone === "neutral" ? "surface-subtle" : tone === "accent" ? "accent" : `category-${tone}-subtle`})`;
        probe.style.width = `var(--bd-space-${size === "sm" ? "48" : "64"})`;
        // Measured beside the tile, so it neither resizes nor squeezes it.
        probe.style.flex = "none";
        element.after(probe);
        const actual = getComputedStyle(element);
        const expected = getComputedStyle(probe);
        const svg = element.querySelector("svg") as SVGElement;
        const result = {
          color: getComputedStyle(svg).stroke,
          expectedColor: expected.color,
          background: actual.backgroundColor,
          expectedBackground: expected.backgroundColor,
          width: actual.width,
          height: actual.height,
          expectedSize: expected.width,
          display: actual.display,
          align: actual.alignItems,
          justify: actual.justifyContent,
          iconWidth: svg.getBoundingClientRect().width,
        };
        probe.remove();
        return result;
      });
      expect(values.color).toBe(values.expectedColor);
      expect(values.background).toBe(values.expectedBackground);
      expect(values.width).toBe(values.expectedSize);
      expect(values.height).toBe(values.expectedSize);
      expect(values.display).toBe("inline-flex");
      expect(values.align).toBe("center");
      expect(values.justify).toBe("center");
      expect(values.iconWidth).toBe(24);
      const luminance = (color: string) => {
        const channels = (color.match(/[\d.]+/g) ?? [])
          .slice(0, 3)
          .map(Number)
          .map((value) => {
            const c = value / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
        return (
          (channels[0] ?? 0) * 0.2126 +
          (channels[1] ?? 0) * 0.7152 +
          (channels[2] ?? 0) * 0.0722
        );
      };
      const a = luminance(values.color),
        b = luminance(values.background);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      ).toBeGreaterThanOrEqual(3);
    }
  });
}
