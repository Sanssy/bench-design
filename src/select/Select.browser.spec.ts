import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Select selection and keyboard focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:select"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-select--default&viewMode=story&globals=theme:${theme}`,
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
  test(`Select error and disabled tokens in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:select"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-select--review&viewMode=story&globals=theme:${theme}`,
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
test("Select keyboard choice, selected marker and dismissal", {
  tag: ["@component:select"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-select--default&viewMode=story");
  const trigger = page.getByRole("button", { name: /Collection/ });
  // Wait for the story to render before using the keyboard.
  await expect(trigger).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(page.getByRole("option", { name: "Reading" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("option", { name: "Reading" }).locator("svg"),
  ).toHaveCSS("visibility", "visible");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("Research");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await page.keyboard.press("Escape");
  await expect(list).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("Select uses token geometry independently of theme", {
  tag: ["@component:select"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-select--default&viewMode=story");
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
});
