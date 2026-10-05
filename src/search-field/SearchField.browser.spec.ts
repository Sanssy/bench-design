import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`SearchField selection and keyboard focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:search-field"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-searchfield--default&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const control = page.locator(".bd-field-control").first();
    await expect(control).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "background:var(--bd-surface-raised);height:var(--bd-space-48);width:calc(var(--bd-space-16) + var(--bd-space-4));color:var(--bd-accent);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
      document.body.append(probe);
      const css = getComputedStyle(probe);
      const result = {
        surface: css.backgroundColor,
        accent: css.color,
        height: css.height,
        choiceSize: css.width,
        focus: css.outlineColor,
        strong: css.outlineWidth,
        offset: css.outlineOffset,
      };
      probe.remove();
      return result;
    });

    await expect(control).toHaveCSS("background-color", tokens.surface);
    await page.keyboard.press("Tab");
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveCSS("outline-color", tokens.focus);
    await expect(control).toHaveCSS("outline-width", tokens.strong);
    await expect(control).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`SearchField error and disabled tokens in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:search-field"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-searchfield--review&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const control = page.locator(".bd-field-control").first();
    await expect(control).toBeVisible();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "border:var(--bd-stroke) solid var(--bd-danger);background:var(--bd-surface-subtle);color:var(--bd-text-muted)";
      document.body.append(probe);
      const css = getComputedStyle(probe);
      const result = {
        danger: css.borderColor,
        stroke: css.borderWidth,
        disabled: css.backgroundColor,
        muted: css.color,
      };
      probe.remove();
      return result;
    });
    await expect(control).toHaveCSS("border-color", tokens.danger);
    await expect(control).toHaveCSS("border-width", tokens.stroke);
    await expect(page.getByText("Review this value")).toBeVisible();
    const disabled = page.locator("[data-disabled] .bd-field-control").first();
    await expect(disabled).toHaveCSS("background-color", tokens.disabled);
  });
}

test("SearchField uses token geometry independently of theme", {
  tag: ["@component:search-field"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-searchfield--default&viewMode=story");
  const control = page.locator(".bd-field-control").first();
  await expect(control).toBeVisible();
  const expected = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.height = "var(--bd-space-48)";
    document.body.append(probe);
    const height = getComputedStyle(probe).height;
    probe.remove();
    return height;
  });
  await expect(control).toHaveCSS("height", expected);
  // Only the SearchField clear button shows: forcing the engine's own button
  // off must not change the focused, filled field.
  const input = page.locator(".bd-search-input");
  await input.fill("Notes");
  await page.addStyleTag({
    content: ".bd-search-input { caret-color: transparent; }",
  });
  const shown = await control.screenshot();
  await page.addStyleTag({
    content:
      ".bd-search-input::-webkit-search-cancel-button { display: none !important; }",
  });
  expect(await control.screenshot()).toEqual(shown);
});

for (const theme of ["light", "dark"]) {
  test(`SearchField underlined accessibility in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:search-field"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-searchfield--underlined&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const input = page.getByRole("searchbox", { name: "Search documents" });
    const control = page.locator(".bd-search-control");
    await expect(input).toHaveAttribute("autocomplete", "off");
    await expect(control).toHaveCSS("border-top-width", "0px");
    await expect(control).toHaveCSS("border-left-width", "0px");
    await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    await expect(control).toHaveCSS("outline-style", "solid");
    const clear = page.getByRole("button", { name: "Clear search" });
    const bounds = await clear.boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
  });
}
