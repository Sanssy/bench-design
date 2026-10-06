import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Composer mobile focus and accessibility in ${theme}`, {
    tag: ["@component:composer", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const story of ["default", "pending", "disabled", "invalid"]) {
      await page.goto(
        `/iframe.html?id=form-composer--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator(".bd-composer")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox")).toBeFocused();
    await expect(page.getByRole("textbox")).toHaveCSS("outline-style", "solid");
  });
}

for (const theme of ["light", "dark"]) {
  test(`Composer card geometry, send and focus in ${theme}`, {
    tag: ["@component:composer", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=form-composer--card&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const card = page.locator(".bd-composer");
    const input = page.getByRole("textbox", { name: "Message" });
    const send = page.getByRole("button", { name: "Send" });
    await expect(card).toHaveCSS("position", "static");
    const style = await card.evaluate((element) => {
      const css = getComputedStyle(element);
      return {
        background: css.backgroundColor,
        shadow: css.boxShadow,
        border: css.borderTopStyle,
      };
    });
    expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.shadow).not.toBe("none");
    expect(style.border).toBe("solid");
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS("outline-style", "solid");
    await input.fill("Review these notes");
    const fieldBox = await input.boundingBox();
    const buttonBox = await send.boundingBox();
    expect(buttonBox?.width).toBe(48);
    expect(buttonBox?.height).toBe(48);
    expect(
      fieldBox && buttonBox && fieldBox.x + fieldBox.width <= buttonBox.x,
    ).toBe(true);
    await page.keyboard.press("Tab");
    await expect(send).toBeFocused();
    await expect(send).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Review these notes");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
