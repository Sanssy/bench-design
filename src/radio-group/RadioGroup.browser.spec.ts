import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`RadioGroup selection and keyboard focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:radio-group"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-radiogroup--default&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const control = page.locator(".bd-choice-box").first();
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
    const selected = page.locator("[data-selected] > .bd-choice-box").first();
    await expect(selected).toHaveCSS("background-color", tokens.accent);
    await expect(selected.locator("svg, .bd-radio-dot")).toHaveCSS(
      "visibility",
      "visible",
    );

    await page.keyboard.press("Tab");
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveCSS("outline-color", tokens.focus);
    await expect(control).toHaveCSS("outline-width", tokens.strong);
    await expect(control).toHaveCSS("outline-offset", tokens.offset);
  });
  test(`RadioGroup error and disabled tokens in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:radio-group"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-radiogroup--review&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const control = page.locator(".bd-choice-box").first();
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
    const disabled = page.locator("[data-disabled] .bd-choice-box").first();
    await expect(disabled).toHaveCSS("background-color", tokens.disabled);
  });
}

test("RadioGroup uses token geometry independently of theme", {
  tag: ["@component:radio-group"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-radiogroup--default&viewMode=story");
  const control = page.locator(".bd-choice-box").first();
  await expect(control).toBeVisible();
  const expected = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.height = "calc(var(--bd-space-16) + var(--bd-space-4))";
    document.body.append(probe);
    const height = getComputedStyle(probe).height;
    probe.remove();
    return height;
  });
  await expect(control).toHaveCSS("height", expected);
  await expect(control).toHaveCSS("width", expected);
});

for (const theme of ["light", "dark"]) {
  test(`Radio cards selection, focus and responsive geometry in ${theme}`, {
    tag: ["@component:radio-group", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(
      `/iframe.html?id=form-radiogroup--cards&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const yes = page.getByRole("radio", { name: "Yes 42 %" });
    const no = page.getByRole("radio", { name: "No 58 %" });
    await expect(yes).toBeChecked();
    const tile = page.locator(".bd-radio").first();
    await expect(tile).toHaveCSS("min-height", "72px");
    await expect(tile.locator(".bd-radio-label")).toHaveCSS(
      "font-size",
      "18px",
    );
    await expect(tile).toHaveCSS("border-top-width", "2px");
    const expected = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "background:var(--bd-accent);color:var(--bd-on-accent);outline:var(--bd-strong) solid var(--bd-focus);box-shadow:var(--bd-stroke) var(--bd-stroke) 0 var(--bd-shadow)";
      document.body.append(probe);
      const css = getComputedStyle(probe);
      const result = {
        background: css.backgroundColor,
        text: css.color,
        focus: css.outlineColor,
        shadow: css.boxShadow,
      };
      probe.remove();
      return result;
    });
    await expect(tile).toHaveCSS("background-color", expected.background);
    await expect(tile).toHaveCSS("color", expected.text);
    await expect(tile).toHaveCSS("box-shadow", expected.shadow);
    await page.keyboard.press("Tab");
    await expect(yes).toBeFocused();
    await expect(tile).toHaveCSS("outline-width", "4px");
    await expect(tile).toHaveCSS("outline-color", expected.focus);
    await page.keyboard.press("ArrowDown");
    await expect(no).toBeChecked();
    await expect(yes).not.toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(yes).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Later Unavailable" }),
    ).toBeDisabled();
    await page.setViewportSize({ width: 390, height: 800 });
    const boxes = await page.locator(".bd-radio").evaluateAll((elements) =>
      elements.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width };
      }),
    );
    expect(boxes[1]?.x).toBe(boxes[0]?.x);
    expect(boxes[1]?.width).toBe(boxes[0]?.width);
    expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  });
}
