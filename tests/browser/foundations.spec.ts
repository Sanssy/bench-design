import { expect, test } from "@playwright/test";
import tokens from "../../src/tokens.json" with { type: "json" };

for (const theme of ["light", "dark"] as const) {
  test(`foundations render in explicit ${theme}`, {
    tag: `@theme:${theme}`,
  }, async ({ page }) => {
    await page.emulateMedia({
      colorScheme: theme === "light" ? "dark" : "light",
    });
    await page.goto(
      `/iframe.html?id=foundations-colors--palette&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("heading", { name: "Colors" })).toBeVisible();
    await expect(page.locator("[data-role]")).toHaveCount(
      new Set([...Object.keys(tokens.light), ...Object.keys(tokens.dark)]).size,
    );
    const text = page.locator('[data-role="text"]');
    await expect(text).toContainText(theme === "light" ? "#18201c" : "#e9e8e0");
    await expect(text.locator("[data-contrast]")).toContainText(
      theme === "light" ? "15.11" : "14.07",
    );
    await expect(page.locator('[data-role="divider"]')).toContainText(
      theme === "light" ? "#d6d8ce" : "#303b33",
    );
    await page.goto(
      `/iframe.html?id=foundations-typography--scale&globals=theme:${theme}`,
    );
    await expect(page.locator("[data-family]")).toHaveCount(3);
    await page.evaluate(() => document.fonts.ready);
    const families = await page
      .locator("[data-family]")
      .evaluateAll((samples) =>
        samples.map((sample) =>
          getComputedStyle(sample)
            .fontFamily.split(",")[0]
            ?.replaceAll('"', ""),
        ),
      );
    expect(families).toEqual(["Bench Fraunces", "Bench Manrope", "Bench Plex"]);
    const sizes = await page
      .locator("[data-size]")
      .evaluateAll((samples) =>
        samples.map((sample) =>
          Number.parseFloat(getComputedStyle(sample).fontSize),
        ),
      );
    const rems = [0.8, 1, 1.25, 1.5625, 1.953125, 3.0517578125, 5.9604644775];
    expect(sizes).toHaveLength(rems.length);
    for (const [index, rem] of rems.entries()) {
      expect(sizes[index]).toBeCloseTo(rem * 16, 1);
    }
    await expect(page.locator('[data-family="editorial"]')).toHaveCSS(
      "font-weight",
      "500",
    );
    await page.goto(
      `/iframe.html?id=foundations-spacing-geometry--scale&globals=theme:${theme}`,
    );
    for (const space of [4, 8, 12, 16, 24, 32, 48, 64, 96]) {
      await expect(page.locator(`[data-space="${space}"]`)).toHaveCSS(
        "width",
        `${space}px`,
      );
    }
    const geometry = await page
      .locator("[data-geometry]")
      .evaluate((sample) => {
        const css = getComputedStyle(sample);
        return [css.borderTopWidth, css.borderRadius, css.boxShadow];
      });
    const shadow = theme === "light" ? "rgb(24, 32, 28)" : "rgb(8, 13, 10)";
    expect(geometry).toEqual(["1px", "0px", `${shadow} 3px 3px 0px 0px`]);
  });
}

test("system theme follows OS live in the iframe", {
  tag: "@theme:system",
}, async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(
    "/iframe.html?id=foundations-colors--palette&globals=theme:system",
  );
  await expect(page.getByRole("heading", { name: "Colors" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 244, 239)",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(22, 28, 25)",
  );
  await expect(
    page.locator('[data-role="text"] [data-contrast]'),
  ).toContainText("14.07");
});
