import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`ToggleButton keyboard, selection tokens, axe and 320px ${theme}`, {
    tag: ["@component:toggle-button", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=actions-togglebutton--controlled-guides&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const button = page.getByRole("button", { name: "Show guides" });
    await expect(button).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const colors = await button.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "background:var(--bd-accent);color:var(--bd-on-accent)";
      element.append(probe);
      const css = getComputedStyle(probe);
      const colors = { background: css.backgroundColor, color: css.color };
      probe.remove();
      return colors;
    });
    await expect(button).toHaveCSS("background-color", colors.background);
    await expect(button).toHaveCSS("color", colors.color);
    await expect(button).toHaveCSS("outline-style", "solid");
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
