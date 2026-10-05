import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Badge outline colors and border ${theme}`, {
    tag: ["@component:badge", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=feedback-badge--document-count&args=variant:outline&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-badge");
    await expect(component).toBeVisible();
    const result = await component.evaluate((element) => {
      const actual = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-text)";
      probe.style.backgroundColor = "transparent";
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
    expect(result.border).toBe("solid");
    expect(result.borderColor).toBe(result.expectedBorderColor);
    expect(result.width).toBe(result.expectedWidth);
  });
}
for (const theme of ["light", "dark"] as const) {
  test(`Badge solid colors and border ${theme}`, {
    tag: ["@component:badge", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=feedback-badge--document-count&args=variant:solid&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-badge");
    await expect(component).toBeVisible();
    const result = await component.evaluate((element) => {
      const actual = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-surface)";
      probe.style.backgroundColor = "var(--bd-text)";
      probe.style.border = "var(--bd-hair) solid var(--bd-text)";
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
    expect(result.border).toBe("solid");
    expect(result.borderColor).toBe(result.expectedBorderColor);
    expect(result.width).toBe(result.expectedWidth);
  });
}
test("Badge geometry uses spacing and typography tokens", {
  tag: ["@component:badge", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=feedback-badge--document-count&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const component = page.locator(".bd-badge");
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
    {
      fontSize: "var(--bd-size-meta)",
      minWidth: "var(--bd-space-24)",
      minHeight: "var(--bd-space-24)",
    },
  );
  for (const [actual, expected] of values) expect(actual).toBe(expected);
  expect(
    await component.evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain("Bench Plex");
});

for (const theme of ["light", "dark"] as const) {
  test(`Badge semantic colors ${theme}`, {
    tag: ["@component:badge", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const tone of ["success", "warning", "danger"] as const) {
      for (const variant of ["outline", "solid"] as const) {
        await page.goto(
          `/iframe.html?id=feedback-badge--document-count&args=tone:${tone};variant:${variant}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
        );
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const root = page.locator(".bd-badge");
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
            icon: getComputedStyle(element.querySelector("svg") ?? element)
              .color,
            expectedTone: expected.borderLeftColor,
            background: actual.backgroundColor,
            expectedBackground: expected.backgroundColor,
            border: actual.borderTopColor,
            width: actual.borderLeftWidth,
            expectedWidth: expected.borderLeftWidth,
          };
          probe.remove();
          return result;
        }, tone);
        expect(result.text).toBe(result.expectedText);
        expect(result.border).toBe(result.expectedTone);
        expect(result.background).toBe(
          variant === "solid" ? result.expectedBackground : "rgba(0, 0, 0, 0)",
        );
      }
    }
  });
}

test("Badge tags keep readable wrapping text in both themes", {
  tag: ["@component:badge", "@theme:light", "@theme:dark"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 170, height: 800 });
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=feedback-badge--related-topics&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    for (const tag of await page
      .locator('.bd-badge[data-variant="tag"]')
      .all()) {
      await expect(tag.locator("svg")).toHaveAttribute("aria-hidden", "true");
      const result = await tag.evaluate((element) => {
        const css = getComputedStyle(element);
        const tone = element.getAttribute("data-tone");
        const probe = document.createElement("span");
        probe.style.backgroundColor =
          tone === "neutral"
            ? "var(--bd-surface-subtle)"
            : `var(--bd-category-${tone}-subtle)`;
        element.append(probe);
        const background = getComputedStyle(probe).backgroundColor;
        probe.remove();
        const luminance = (color: string) => {
          const channels =
            color
              .match(/[\d.]+/g)
              ?.slice(0, 3)
              .map(Number) ?? [];
          return channels.reduce((sum, channel, i) => {
            const c = channel / 255;
            return (
              sum +
              ([0.2126, 0.7152, 0.0722][i] ?? 0) *
                (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
            );
          }, 0);
        };
        const a = luminance(css.color),
          b = luminance(css.backgroundColor);
        return {
          background: css.backgroundColor,
          expected: background,
          font: css.fontFamily,
          contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
          fits: element.scrollWidth <= element.clientWidth,
          wraps:
            (element.querySelector("span")?.getBoundingClientRect().height ??
              0) > parseFloat(css.lineHeight),
        };
      });
      expect(result.background).toBe(result.expected);
      expect(result.font).toContain("Bench Manrope");
      expect(result.contrast).toBeGreaterThanOrEqual(4.5);
      expect(result.fits).toBe(true);
      expect(result.wraps).toBe(true);
    }
  }
});
