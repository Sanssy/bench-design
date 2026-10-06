import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Surface raised colors and border ${theme}`, {
    tag: ["@component:surface", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-surface--workspace&args=tone:raised&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-surface");
    await expect(component).toBeVisible();
    await expect(component).toHaveCSS(
      "box-shadow",
      theme === "light" ? "rgba(24, 32, 28, 0.086) 2px 2px 9px 0px" : "none",
    );
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
    expect(result.border).toBe("none");
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.goto(
      `/iframe.html?id=surfaces-surface--category-preview&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const categorySurface = page.locator(".bd-surface");
    await expect(categorySurface).toHaveCSS("box-shadow", "none");
    const colors = await categorySurface.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--bd-category-green-subtle)";
      element.append(probe);
      const result = [
        getComputedStyle(element).backgroundColor,
        getComputedStyle(probe).backgroundColor,
      ];
      probe.remove();
      return result;
    });
    expect(colors[0]).toBe(colors[1]);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}
for (const theme of ["light", "dark"] as const) {
  test(`Surface subtle colors and border ${theme}`, {
    tag: ["@component:surface", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-surface--notice&args=tone:subtle&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-surface");
    await expect(component).toBeVisible();
    await expect(component).toHaveCSS("box-shadow", "none");
    const result = await component.evaluate((element) => {
      const actual = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-text)";
      probe.style.backgroundColor = "var(--bd-surface-subtle)";
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
    expect(result.border).toBe("none");
  });
}
test("Surface geometry uses spacing and typography tokens", {
  tag: ["@component:surface", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=surfaces-surface--workspace&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const component = page.locator(".bd-surface");
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
    { paddingTop: "var(--bd-space-16)" },
  );
  for (const [actual, expected] of values) expect(actual).toBe(expected);
});

for (const theme of ["light", "dark"] as const) {
  test(`Surface inverse descendants, focus and nesting ${theme}`, {
    tag: ["@component:surface", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.emulateMedia({
      colorScheme: theme === "light" ? "dark" : "light",
    });
    await page.goto(
      `/iframe.html?id=surfaces-surface--inverse&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const surface = page.locator('.bd-surface[data-tone="inverse"]').first();
    await expect(surface).toBeVisible();
    await expect(surface).toHaveCSS("box-shadow", "none");
    await expect(surface.locator('.bd-surface[data-tone="raised"]')).toHaveCSS(
      "box-shadow",
      theme === "dark" ? "rgba(24, 32, 28, 0.086) 2px 2px 9px 0px" : "none",
    );
    const result = await surface.evaluate(
      (element, localTheme) => {
        const read = (el: Element) => {
          const s = getComputedStyle(el);
          return {
            color: s.color,
            background: s.backgroundColor,
            scheme: s.colorScheme,
          };
        };
        const probe = document.createElement("span");
        probe.style.cssText = `color:var(--bd-color-${localTheme}-text);background:var(--bd-color-${localTheme}-surface)`;
        element.append(probe);
        const expected = read(probe);
        for (const tone of ["raised", "subtle"]) {
          probe.style.backgroundColor = `var(--bd-color-${localTheme}-surface-${tone})`;
          const nested = element.querySelector(
            `.bd-surface[data-tone="${tone}"]`,
          );
          if (!nested || read(nested).background !== read(probe).background) {
            throw new Error(`Nested ${tone} must inherit the inverse palette`);
          }
        }
        probe.remove();
        const pairs = Array.from(
          element.querySelectorAll(".bd-text, .bd-link, .bd-button"),
        ).map((el) => {
          let background = getComputedStyle(el).backgroundColor;
          let parent = el.parentElement;
          while (background === "rgba(0, 0, 0, 0)" && parent) {
            background = getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
          }
          return [getComputedStyle(el).color, background] as const;
        });
        return {
          actual: read(element),
          expected,
          pairs,
          nested: Array.from(
            element.querySelectorAll('.bd-surface[data-tone="inverse"]'),
          ).map(read),
        };
      },
      theme === "light" ? "dark" : "light",
    );
    expect(result.actual.color).toBe(result.expected.color);
    expect(result.actual.background).toBe(result.expected.background);
    expect(result.actual.scheme).toBe(theme === "light" ? "dark" : "light");
    for (const nested of result.nested) expect(nested).toEqual(result.actual);
    const luminance = (color: string) => {
      const channels = color
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number);
      if (channels?.length !== 3) throw new Error(`Unsupported color ${color}`);
      return channels.reduce((sum, c, i) => {
        const v = c / 255;
        return (
          sum +
          ([0.2126, 0.7152, 0.0722][i] ?? 0) *
            (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        );
      }, 0);
    };
    const contrast = (a: string, b: string) => {
      const x = luminance(a),
        y = luminance(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    for (const [color, background] of result.pairs)
      expect(contrast(color, background)).toBeGreaterThanOrEqual(4.5);
    for (const control of await surface.locator("a, button").all()) {
      // Tab through the actual story instead of setting the focus-visible state.
      await page.keyboard.press("Tab");
      await expect(control).toBeFocused();
      await expect(control).toHaveAttribute("data-focus-visible", "true");
      await expect(control).toHaveCSS("outline-style", "solid");
      const focus = await control.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          color: s.outlineColor,
          width: Number.parseFloat(s.outlineWidth),
          offset: Number.parseFloat(s.outlineOffset),
        };
      });
      expect(focus.width).toBeGreaterThan(0);
      expect(focus.offset).toBeGreaterThan(0);
      expect(
        contrast(focus.color, result.actual.background),
      ).toBeGreaterThanOrEqual(3);
      await control.hover();
      const hover = await control.evaluate((el) => {
        const s = getComputedStyle(el);
        return [s.color, s.backgroundColor] as const;
      });
      expect(contrast(hover[0], hover[1])).toBeGreaterThanOrEqual(4.5);
      await page.mouse.move(0, 0);
    }
    await page.setViewportSize({ width: 320, height: 800 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(
      `/iframe.html?id=surfaces-surface--inverse&viewMode=story&globals=a11y.manual:!true;theme:system`,
    );
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await expect(
      page.locator('.bd-surface[data-tone="inverse"]').first(),
    ).toHaveCSS("color-scheme", theme === "dark" ? "light" : "dark");
  });
}
