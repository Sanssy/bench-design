import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const variant of ["primary", "secondary"] as const) {
    for (const state of [
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
    ] as const) {
      test(
        `${variant} ${state} visual in ${theme}`,
        {
          tag: [`@theme:${theme}`, "@viewport:desktop"],
        },
        async ({ page }, testInfo) => {
          // Disable story play so the test owns the same real interactions.
          await page.goto(
            `/iframe.html?id=components-button--${variant}-${state}&viewMode=story&globals=theme:${theme}&embed=true`,
          );
          const button = page.getByRole("button", {
            name: "Enregistrer",
            exact: true,
          });
          await expect(button).toBeVisible();
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          await page.evaluate(() => document.fonts.ready);
          await page.mouse.move(390, 150);
          if (state === "hover") {
            await button.hover();
            await expect(button).toHaveAttribute("data-hovered", "true");
          }
          if (state === "focus" || state === "pressed") {
            await page.keyboard.press("Tab");
            await expect(button).toBeFocused();
            await expect(button).toHaveAttribute("data-focus-visible", "true");
          }
          if (state === "pressed") {
            await page.keyboard.down("Space");
            await expect(button).toHaveAttribute("data-pressed", "true");
          }
          if (state === "disabled") await expect(button).toBeDisabled();
          const name = `${variant}-${state}-${theme}.png`;
          // Keep a candidate even when no expected image exists with update=none.
          const candidate = testInfo.outputPath(`candidate-${name}`);
          await page.screenshot({
            path: candidate,
            animations: "disabled",
            caret: "hide",
          });
          await testInfo.attach(`candidate-${name}`, {
            path: candidate,
            contentType: "image/png",
          });
          await expect(page).toHaveScreenshot(name);
        },
      );
    }
  }
}
