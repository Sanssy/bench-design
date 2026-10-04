import { expect, test } from "@playwright/test";

// Expected sizes come from the tokens (plain inherits the surrounding text),
// so engines that round font sizes differently compare like with like.
for (const [mode, size, weight, family] of [
  ["hero", "var(--bd-size-hero)", "600", "Bench Manrope"],
  ["indexed", "var(--bd-size-heading)", "400", "Bench Plex"],
  ["dense", "var(--bd-size-heading)", "700", "Bench Manrope"],
  ["plain", "inherit", "400", "Bench Manrope"],
] as const) {
  test(`Value ${mode} typography`, {
    tag: ["@component:value", "@theme:light"],
  }, async ({ page }) => {
    const story = mode === "plain" ? "inline-stats" : "score";
    await page.goto(
      `/iframe.html?id=data-value--${story}&args=mode:${mode}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const value = page.locator(".bd-value");
    await expect(value).toBeVisible();
    const styles = await value
      .locator(".bd-value__number")
      .evaluate((element, size) => {
        const style = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.fontSize = size;
        element.parentElement?.parentElement?.append(probe);
        const expected = getComputedStyle(probe).fontSize;
        probe.remove();
        return {
          size: style.fontSize,
          expected,
          weight: style.fontWeight,
          family: style.fontFamily,
          numeric: style.fontVariantNumeric,
        };
      }, size);
    expect(styles.size).toBe(styles.expected);
    expect(styles.weight).toBe(weight);
    expect(styles.family).toContain(family);
    expect(styles.numeric).toBe("tabular-nums");
    if (mode === "plain" || mode === "dense") {
      expect(
        await value.evaluate(
          (element) => getComputedStyle(element).borderBottomWidth,
        ),
      ).toBe("0px");
    }
    if (mode === "dense") {
      const total = await value
        .locator(".bd-value__total")
        .evaluate((element) => {
          const probe = document.createElement("span");
          probe.style.fontSize = "var(--bd-size-meta)";
          element.append(probe);
          const result = [
            getComputedStyle(element).fontSize,
            getComputedStyle(probe).fontSize,
          ];
          probe.remove();
          return result;
        });
      expect(total[0]).toBe(total[1]);
      expect(
        await value.evaluate((element) => getComputedStyle(element).columnGap),
      ).toBe("4px");
    }
  });
}
for (const theme of ["light", "dark"] as const) {
  test(`Value hero rule ${theme}`, {
    tag: ["@component:value", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-value--score&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const value = page.locator(".bd-value");
    await expect(value).toBeVisible();
    const rule = await value.evaluate((element) => {
      const style = getComputedStyle(element);
      const probe = document.createElement("span");
      probe.style.color = "var(--bd-border-strong)";
      element.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return {
        width: style.borderBottomWidth,
        style: style.borderBottomStyle,
        color: style.borderBottomColor,
        token: color,
      };
    });
    expect(rule.width).toBe("2px");
    expect(rule.style).toBe("solid");
    expect(rule.color).toBe(rule.token);
    expect(rule.color).toBe(
      theme === "light" ? "rgb(24, 32, 28)" : "rgb(134, 150, 138)",
    );
  });
}
