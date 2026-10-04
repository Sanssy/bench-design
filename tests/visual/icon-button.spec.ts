import { expect, test } from "@playwright/test";

// Button with icon (rest) and IconButton (rest, focus), both variants.
const cases = [
  ...(["primary", "secondary"] as const).map((variant) => ({
    name: `button-icon-${variant}-rest`,
    story: `form-button--with-icon&args=variant:${variant}`,
    role: "Add item",
    focus: false,
  })),
  ...(["primary", "secondary"] as const).flatMap((variant) =>
    [false, true].map((focus) => ({
      name: `icon-button-${variant}-${focus ? "focus" : "rest"}`,
      story: `form-iconbutton--${variant}`,
      role: "Search documents",
      focus,
    })),
  ),
];

for (const theme of ["light", "dark"] as const) {
  for (const { name, story, role, focus } of cases) {
    test(
      `${name} visual in ${theme}`,
      {
        tag: [`@theme:${theme}`, "@viewport:desktop"],
      },
      async ({ page }, testInfo) => {
        await page.goto(
          `/iframe.html?id=${story}&viewMode=story&globals=theme:${theme}&embed=true`,
        );
        const button = page.getByRole("button", { name: role, exact: true });
        await expect(button).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(0, 0);
        if (focus) {
          await page.keyboard.press("Tab");
          await expect(button).toHaveAttribute("data-focus-visible", "true");
        }
        const file = `${name}-${theme}.png`;
        // Keep a candidate even when no expected image exists with update=none.
        const candidate = testInfo.outputPath(`candidate-${file}`);
        await page.screenshot({
          path: candidate,
          animations: "disabled",
          caret: "hide",
        });
        await testInfo.attach(`candidate-${file}`, {
          path: candidate,
          contentType: "image/png",
        });
        await expect(page).toHaveScreenshot(file);
      },
    );
  }
}
