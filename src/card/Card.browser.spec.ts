import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Card default colors and border ${theme}`, {
    tag: ["@component:card", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-card--saved-collection&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const component = page.locator(".bd-card");
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
    expect(result.border).toBe("solid");
    expect(result.borderColor).toBe(result.expectedBorderColor);
    expect(result.width).toBe(result.expectedWidth);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}
test("Card geometry uses spacing and typography tokens", {
  tag: ["@component:card", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=surfaces-card--saved-collection&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const component = page.locator(".bd-card");
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
    { paddingTop: "var(--bd-space-12)" },
  );
  for (const [actual, expected] of values) expect(actual).toBe(expected);
});

for (const theme of ["light", "dark"] as const) {
  test(`Card outlined media geometry and accessibility ${theme}`, {
    tag: ["@component:card", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-card--outlined-media&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const card = page.locator(".bd-card");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(card).toHaveCSS("box-shadow", "none");
    await expect(card).toHaveCSS("padding-top", "0px");
    const geometry = await card.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.border = "var(--bd-hair) solid var(--bd-border)";
      probe.style.padding = "var(--bd-space-24)";
      element.append(probe);
      const expected = getComputedStyle(probe);
      const content = element.querySelector(".bd-card-content") as HTMLElement;
      const media = element.querySelector(".bd-card-media") as HTMLElement;
      const image = media.querySelector("img") as HTMLElement;
      const result = {
        border: getComputedStyle(element).borderTopColor,
        expectedBorder: expected.borderTopColor,
        padding: getComputedStyle(content).paddingTop,
        expectedPadding: expected.paddingTop,
        mediaWidth: media.getBoundingClientRect().width,
        imageWidth: image.getBoundingClientRect().width,
      };
      probe.remove();
      return result;
    });
    expect(geometry.border).toBe(geometry.expectedBorder);
    expect(geometry.padding).toBe(geometry.expectedPadding);
    expect(geometry.imageWidth).toBe(geometry.mediaWidth);
    await page
      .getByRole("button", { name: "Open collection", exact: true })
      .click();
    await expect(page.getByRole("status")).toHaveText(
      "Collection opened: Field notes",
    );
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}
