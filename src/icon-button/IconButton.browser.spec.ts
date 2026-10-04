import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`IconButton square and keyboard focus in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:icon-button"],
  }, async ({ page }) => {
    for (const variant of ["primary", "secondary"]) {
      await page.goto(
        `/iframe.html?id=form-iconbutton--${variant}&viewMode=story&globals=theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const button = page.getByRole("button", { name: "Search documents" });
      await expect(button).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const box = await button.boundingBox();
      expect(box?.width).toBe(48);
      expect(box?.height).toBe(48);
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      await expect(button).toHaveAttribute("data-focus-visible", "true");
      await expect(button).toHaveCSS("outline-style", "solid");
      const focus = await button.evaluate((element) => {
        const probe = document.createElement("span");
        probe.style.cssText =
          "outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
        element.append(probe);
        const style = getComputedStyle(probe);
        const result = {
          color: style.outlineColor,
          width: style.outlineWidth,
          offset: style.outlineOffset,
        };
        probe.remove();
        return result;
      });
      await expect(button).toHaveCSS("outline-color", focus.color);
      await expect(button).toHaveCSS("outline-width", focus.width);
      await expect(button).toHaveCSS("outline-offset", focus.offset);
    }
  });
  test(`Button icon spacing in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:button"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-button--with-icon&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const button = page.getByRole("button", { name: "Add item" });
    await expect(button).toHaveCSS("column-gap", "8px");
    await expect(button.locator("svg")).toHaveCSS("width", "20px");
  });
}
