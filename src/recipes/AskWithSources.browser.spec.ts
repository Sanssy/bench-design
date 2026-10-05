import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Ask with sources keyboard, axe and reflow ${theme}`, {
    tag: ["@component:ask-with-sources-recipe", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(
      `/iframe.html?id=recipes-ask-with-sources--ask-and-read&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".bd-action-card")).toHaveCount(3);
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(page.locator(".bd-action-card")).toHaveCount(0);
    await expect(
      page.getByRole("list", { name: "Suggested questions" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "What should I prepare?" }).click();
    const input = page.getByRole("textbox", { name: "Your question" });
    await input.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Sending…");
    await expect(
      page.getByRole("heading", { name: "Sample answer" }),
    ).toBeVisible();
    const citation = page.getByRole("link", { name: "Preparation checklist" });
    // Start at the field; backwards Tab reaches the final citation.
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(citation).toBeFocused();
    const sourceBox = await citation.boundingBox();
    const composerBox = await page.locator(".bd-composer").boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(composerBox).not.toBeNull();
    expect((sourceBox?.y ?? 0) + (sourceBox?.height ?? 0)).toBeLessThanOrEqual(
      composerBox?.y ?? 0,
    );
    await page.keyboard.press("Enter");
    await expect(page.locator("#sample-excerpt")).toBeFocused();
    await page.evaluate(() => document.fonts.ready);
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
