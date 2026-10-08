import { expect, test } from "@playwright/test";

test("Heading typography and theme colors", {
  tag: ["@theme:light", "@theme:dark", "@component:heading"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const theme = "light";
  for (const [story, size] of [
    ["article", "display"],
    ["section", "heading"],
    ["subsection", "lead"],
    ["detail", "ui"],
  ] as const) {
    await page.goto(
      `/iframe.html?id=typography-heading--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
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
    for (const colorTheme of ["light", "dark"]) {
      await page.goto(
        `/iframe.html?id=typography-heading--${story}&viewMode=story&globals=a11y.manual:!true;theme:${colorTheme}`,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        colorTheme,
      );
      await expect(heading).toHaveCSS("margin-block-start", "0px");
      await expect(heading).toHaveCSS("margin-block-end", "0px");
      const colors = await heading.evaluate((element, muted) => {
        const probe = document.createElement("span");
        probe.style.color = `var(--bd-text${muted ? "-muted" : ""})`;
        element.append(probe);
        const result = [
          getComputedStyle(element).color,
          getComputedStyle(probe).color,
        ];
        probe.remove();
        return result;
      }, false);
      expect(colors[0]).toBe(colors[1]);
    }
  }
});

test("Heading logical and centered alignment", {
  tag: ["@component:heading", "@theme:light"],
}, async ({ page }) => {
  for (const [story, expected] of [
    ["start", "start"],
    ["centered", "center"],
    ["article", "end"],
  ] as const) {
    await page.goto(
      `/iframe.html?id=typography-heading--${story}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    const element = page.locator(".bd-heading");
    await expect(element).toBeVisible();
    await element.evaluate((node) => {
      const parent = node.parentElement;
      if (!parent) throw new Error("Missing story container");
      parent.style.textAlign = "end";
      parent.dir = "rtl";
    });
    await expect(element).toHaveCSS("text-align", expected);
  }
});
