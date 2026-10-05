import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Link styles and keyboard focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:link"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=typography-link--paragraph&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const link = page.getByRole("link", {
      name: "Read the next chapter",
      exact: true,
    });
    await expect(link).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const tokens = await link.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "color:var(--bd-on-accent);background:var(--bd-accent);text-decoration-thickness:var(--bd-hair);text-underline-offset:0.2em;outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4);border-top:var(--bd-stroke) solid";
      element.append(probe);
      const style = getComputedStyle(probe);
      const result = {
        color: style.color,
        background: style.backgroundColor,
        hair: style.textDecorationThickness,
        stroke: style.borderTopWidth,
        offset: style.textUnderlineOffset,
        outline: style.outlineColor,
        width: style.outlineWidth,
        focusOffset: style.outlineOffset,
        inherited: getComputedStyle(element.parentElement as Element).color,
      };
      probe.remove();
      return result;
    });
    await expect(link).toHaveCSS("color", tokens.inherited);
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    await expect(link).toHaveCSS("text-decoration-thickness", tokens.hair);
    await expect(link).toHaveCSS("text-underline-offset", tokens.offset);
    await link.hover();
    await expect(link).toHaveCSS("background-color", tokens.background);
    await expect(link).toHaveCSS("color", tokens.color);
    await expect(link).toHaveCSS("text-decoration-thickness", tokens.stroke);
    await page.mouse.move(0, 0);
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute("data-focus-visible", "true");
    await expect(link).toHaveCSS("outline-style", "solid");
    await expect(link).toHaveCSS("outline-width", tokens.width);
    await expect(link).toHaveCSS("outline-color", tokens.outline);
    await expect(link).toHaveCSS("outline-offset", tokens.focusOffset);
  });
  test(`Link external announcement is visually hidden in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:link"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=typography-link--external&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const link = page.getByRole("link", {
      name: "Visit Example (opens in a new tab)",
      exact: true,
    });
    await expect(link).toBeVisible();
    const announcement = link.getByText("(opens in a new tab)");
    await expect(announcement).toHaveCSS("position", "absolute");
    await expect(announcement).toHaveCSS("clip-path", "inset(50%)");
    await expect(announcement).toHaveCSS("width", "1px");
    await expect(announcement).toHaveCSS("height", "1px");
  });
  test(`Link metadata icons and focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:link"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=typography-link--metadata&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const link = page.getByRole("link", {
      name: "Read source details",
      exact: true,
    });
    await expect(link.locator("svg[aria-hidden=true]")).toHaveCount(2);
    const tokens = await link.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "font-family:var(--bd-font-mono);font-size:var(--bd-size-meta);margin-inline-start:var(--bd-space-8)";
      element.append(probe);
      const style = getComputedStyle(probe);
      const result = {
        font: style.fontFamily,
        size: style.fontSize,
        gap: style.marginInlineStart,
      };
      probe.remove();
      return result;
    });
    await expect(link).toHaveCSS("font-family", tokens.font);
    await expect(link).toHaveCSS("font-size", tokens.size);
    await expect(link.locator(".bd-link-icon-leading")).toHaveCSS(
      "margin-inline-end",
      tokens.gap,
    );
    await expect(link.locator(".bd-link-icon-trailing")).toHaveCSS(
      "margin-inline-start",
      tokens.gap,
    );
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute("data-focus-visible", "true");
    await expect(link).toHaveCSS("outline-style", "solid");
  });
  test(`Link long labels wrap in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:link"],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 240, height: 400 });
    await page.goto(
      `/iframe.html?id=typography-link--long-label&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    const link = page.getByRole("link");
    await expect(link).toBeVisible();
    const geometry = await link.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const rects = Array.from(range.getClientRects());
      return {
        lines: new Set(rects.map((rect) => Math.round(rect.top))).size,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    expect(geometry.lines).toBeGreaterThan(1);
    expect(geometry.overflow).toBe(false);
  });
}
