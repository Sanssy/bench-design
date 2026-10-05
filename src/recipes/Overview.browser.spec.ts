import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 20; step++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement))
      return;
  }
  await expect(target).toBeFocused();
}
for (const theme of ["light", "dark"]) {
  test(`Overview keyboard, axe and reflow ${theme}`, {
    tag: ["@component:overview", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(
      `/iframe.html?id=recipes-overview--personal-records&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: "Overview", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await tabTo(page, page.getByRole("link", { name: "Skip to main content" }));
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await tabTo(page, page.getByRole("radio", { name: "Housing, 4" }));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("link", { name: "City bicycle" }),
    ).toBeVisible();
    await tabTo(page, page.getByRole("link", { name: "City bicycle" }));
    await tabTo(page, page.getByRole("link", { name: "Purchase receipt" }));
    await tabTo(page, page.getByRole("link", { name: "Service record" }));
    await tabTo(
      page,
      page.getByRole("link", { name: "Understand the change" }),
    );
    await expect(
      page.getByRole("link", { name: "Understand the change" }),
    ).toBeFocused();
    await tabTo(
      page,
      page.getByRole("link", { name: "Read the first record" }),
    );
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.getByRole("radio", { name: "Vehicle, 2" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("heading", { name: "No records yet" }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
