import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Link styles and keyboard focus in ${theme}`, {
    tag: `@theme:${theme}`,
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
    tag: `@theme:${theme}`,
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
}
