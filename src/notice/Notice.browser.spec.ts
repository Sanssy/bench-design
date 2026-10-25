import AxeBuilder from "@axe-core/playwright";
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

  for (const theme of ["light", "dark"] as const) {
    for (const tone of ["neutral", "success", "warning", "danger"] as const) {
      await page.goto(
        `/iframe.html?id=feedback-notice--quiet-note&args=tone:${tone}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(root).toHaveAttribute("data-tone", tone);
      await expect(root.locator("svg")).toHaveCount(0);
      await expect(root).toHaveAttribute(
        "role",
        tone === "danger" ? "alert" : "status",
      );
      for (const width of [320, 1024]) {
        await page.setViewportSize({ width, height: 768 });
        const contentBounds = await root.locator("> div").boundingBox();
        const rootBounds = await root.boundingBox();
        const inset = await root.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            leftBorder: Number.parseFloat(style.borderLeftWidth),
            leftPadding: Number.parseFloat(style.paddingLeft),
            rightBorder: Number.parseFloat(style.borderRightWidth),
            rightPadding: Number.parseFloat(style.paddingRight),
          };
        });
        if (!contentBounds || !rootBounds) {
          throw new Error("Notice content and root need measurable bounds");
        }
        expect(contentBounds.x).toBeCloseTo(
          rootBounds.x + inset.leftBorder + inset.leftPadding,
          1,
        );
        expect(contentBounds.x + contentBounds.width).toBeCloseTo(
          rootBounds.x +
            rootBounds.width -
            inset.rightBorder -
            inset.rightPadding,
          1,
        );
      }
    }
  }
});

test("Notice block and inline padding roles fall back independently", {
  tag: ["@component:notice", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=feedback-notice--upload-complete&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const root = page.locator(".bd-notice");
  const padding = () =>
    root.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.paddingBlockStart, style.paddingInlineStart];
    });

  await root.evaluate((element) =>
    element.style.setProperty("--bd-space-16", "18px"),
  );
  expect(await padding()).toEqual(["18px", "18px"]);
  await root.evaluate((element) =>
    element.style.setProperty("--bd-notice-padding-block", "12px"),
  );
  expect(await padding()).toEqual(["12px", "18px"]);
  await root.evaluate((element) => {
    element.style.removeProperty("--bd-notice-padding-block");
    element.style.setProperty("--bd-notice-padding-inline", "14px");
  });
  expect(await padding()).toEqual(["18px", "14px"]);
  await root.evaluate((element) =>
    element.style.setProperty("--bd-notice-padding-block", "12px"),
  );
  expect(await padding()).toEqual(["12px", "14px"]);
});

test("Notice consumer spacing stays readable on narrow and RTL layouts", {
  tag: ["@component:notice", "@theme:light"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.goto(
      `/iframe.html?id=feedback-notice--compact-feedback&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const root = page.locator(".bd-notice");
    await expect(root).toBeVisible();
    const padding = await root.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.paddingBlockStart, style.paddingInlineStart];
    });
    expect(padding).toEqual(["12px", "14px"]);

    for (const width of [320, 1024]) {
      await page.setViewportSize({ width, height: 768 });
      const fits = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      );
      expect(fits).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 768 });
    await page.locator("html").evaluate((element) => {
      element.setAttribute("dir", "rtl");
    });
    await expect(root).toHaveCSS("direction", "rtl");
    const rtlPadding = await root.evaluate((element) => {
      const style = getComputedStyle(element);
      return [
        style.paddingBlockStart,
        style.paddingInlineStart,
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
      ];
    });
    expect(rtlPadding).toEqual([
      "12px",
      "14px",
      "12px",
      "14px",
      "12px",
      "14px",
    ]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await root.evaluate((element) => {
      element.style.writingMode = "vertical-rl";
    });
    const verticalPadding = await root.evaluate((element) => {
      const style = getComputedStyle(element);
      return [
        style.paddingBlockStart,
        style.paddingInlineStart,
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
      ];
    });
    expect(verticalPadding).toEqual([
      "12px",
      "14px",
      "14px",
      "12px",
      "14px",
      "12px",
    ]);
    await root.evaluate((element) => {
      element.style.removeProperty("writing-mode");
    });
    const accessibility = await new AxeBuilder({ page })
      .include(".bd-notice")
      .analyze();
    expect(accessibility.violations).toEqual([]);
  }
});
