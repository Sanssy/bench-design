import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Tabs selects panels with arrows and Home/End", {
  tag: ["@component:tabs", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=navigation-tabs--library-sections&viewMode=story&globals=theme:light",
  );
  const assets = page.getByRole("tab", { name: "Assets", exact: true });
  await expect(assets).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(assets).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const collections = page.getByRole("tab", {
    name: "Collections",
    exact: true,
  });
  await expect(collections).toBeFocused();
  await expect(collections).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Collections" })).toHaveText(
    "Organize assets into collections.",
  );
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Saved", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(collections).toBeFocused();
  await page.keyboard.press("Home");
  await expect(assets).toBeFocused();
  await expect(assets).toHaveAttribute("aria-selected", "true");
});

for (const theme of ["light", "dark"]) {
  test(`Tabs selected border, hover and focus in ${theme}`, {
    tag: ["@component:tabs", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=navigation-tabs--library-sections&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const tab = page.getByRole("tab", { name: "Assets", exact: true });
    await expect(tab).toBeVisible();
    const tokens = await tab.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "border-bottom:var(--bd-stroke) solid var(--bd-border-strong);background:var(--bd-surface-subtle);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4);font-weight:var(--bd-weight-bold)";
      element.append(probe);
      const style = getComputedStyle(probe);
      const result = {
        border: style.borderBottomColor,
        width: style.borderBottomWidth,
        weight: style.fontWeight,
        background: style.backgroundColor,
        outline: style.outlineColor,
        focusWidth: style.outlineWidth,
        offset: style.outlineOffset,
      };
      probe.remove();
      return result;
    });
    await expect(tab).toHaveCSS("border-bottom-color", tokens.border);
    await expect(tab).toHaveCSS("border-bottom-width", tokens.width);
    await expect(tab).toHaveCSS("font-weight", tokens.weight);
    await expect(
      page.getByRole("tab", { name: "Saved", exact: true }),
    ).toHaveCSS("border-bottom-color", "rgba(0, 0, 0, 0)");
    await tab.hover();
    await expect(tab).toHaveCSS("background-color", tokens.background);
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await expect(tab).toBeFocused();
    await expect(tab).toHaveCSS("outline-style", "solid");
    await expect(tab).toHaveCSS("outline-color", tokens.outline);
    await expect(tab).toHaveCSS("outline-width", tokens.focusWidth);
    await expect(tab).toHaveCSS("outline-offset", tokens.offset);
  });
}

test("Tabs geometry uses the ratified tokens", {
  tag: ["@component:tabs", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=navigation-tabs--library-sections&viewMode=story&globals=theme:light",
  );
  const tab = page.getByRole("tab", { name: "Assets", exact: true });
  await expect(tab).toBeVisible();
  const result = await tab.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "min-height:var(--bd-space-48);padding:var(--bd-space-8);font-size:var(--bd-size-meta);margin-top:var(--bd-space-16);border-bottom:var(--bd-hair) solid var(--bd-divider)";
    element.append(probe);
    const expected = getComputedStyle(probe);
    const actual = getComputedStyle(element);
    const list = getComputedStyle(element.parentElement as Element);
    const panel = getComputedStyle(
      document.querySelector('[role="tabpanel"]') as Element,
    );
    const values = [
      [actual.minHeight, expected.minHeight],
      [actual.paddingTop, expected.paddingTop],
      [actual.fontSize, expected.fontSize],
      [list.borderBottomWidth, expected.borderBottomWidth],
      [list.borderBottomColor, expected.borderBottomColor],
      [panel.marginTop, expected.marginTop],
    ];
    probe.remove();
    return values;
  });
  for (const [actual, expected] of result) expect(actual).toBe(expected);
});

for (const theme of ["light", "dark"] as const) {
  test(`Vertical Tabs axis, indicator and reflow ${theme}`, {
    tag: ["@component:tabs", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=navigation-tabs--vertical-sections&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const first = page.getByRole("tab", { name: "Assets", exact: true });
    await expect(first).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("tablist")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("tab", { name: "Collections", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowUp");
    await expect(first).toBeFocused();
    const pairs = await first.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.borderInlineStart =
        "var(--bd-stroke) solid var(--bd-border-strong)";
      element.append(probe);
      const expected = getComputedStyle(probe),
        actual = getComputedStyle(element);
      const pairs = [
        [actual.borderInlineStartColor, expected.borderInlineStartColor],
        [actual.borderInlineStartWidth, expected.borderInlineStartWidth],
      ];
      probe.remove();
      return pairs;
    });
    for (const [actual, expected] of pairs) expect(actual).toBe(expected);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
test("Controlled Tabs changes the selected panel from keyboard", {
  tag: ["@component:tabs", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=navigation-tabs--controlled-sections&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const collections = page.getByRole("tab", {
    name: "Collections",
    exact: true,
  });
  await expect(collections).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  await expect(collections).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel", { name: "Saved" })).toBeVisible();
});
