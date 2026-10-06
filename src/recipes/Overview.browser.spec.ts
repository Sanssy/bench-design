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
      `/iframe.html?id=recipes-overview--personal-records&globals=a11y.manual:!true;theme:${theme}`,
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
    await tabTo(
      page,
      page.getByRole("tab", { name: "Housing — Home and cover" }),
    );
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("link", { name: "City bicycle" }),
    ).toBeVisible();
    await tabTo(page, page.getByRole("link", { name: "City bicycle" }));
    await tabTo(page, page.getByRole("link", { name: /Purchase receipt/ }));
    await tabTo(page, page.getByRole("link", { name: /Service record/ }));
    await tabTo(
      page,
      page.getByRole("link", { name: "Understand the change" }),
    );
    await expect(
      page.getByRole("link", { name: "Understand the change" }),
    ).toBeFocused();
    await tabTo(page, page.getByRole("link", { name: "Bicycle purchased" }));
    await page.getByRole("tab", { name: "Housing — Home and cover" }).click();
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
    await page
      .getByRole("tab", { name: "Vehicle — Purchase and service" })
      .focus();
    await page.keyboard.press("ArrowDown");
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

for (const width of [390, 1280]) {
  test(`Overview amount typography and identity at ${width}px`, {
    tag: ["@component:overview"],
  }, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/iframe.html?id=recipes-overview--personal-records&globals=a11y.manual:!true;theme:light",
    );
    await page.evaluate(() => document.fonts.ready);
    const amount = page.getByRole("img", { name: "840 EUR / month" });
    for (const part of [".bd-value__number", ".bd-value__unit"]) {
      const style = await amount.locator(part).evaluate((el) => ({
        font: getComputedStyle(el).fontFamily,
        weight: getComputedStyle(el).fontWeight,
      }));
      expect(style.font).toContain("Fraunces");
      expect(Number(style.weight)).toBeGreaterThanOrEqual(700);
    }
    const identity = page.getByText("Alex Morgan", { exact: true });
    const avatar = page.locator("main .bd-avatar");
    const a = await avatar.boundingBox();
    const n = await identity.boundingBox();
    expect(a).not.toBeNull();
    expect(n).not.toBeNull();
    if (!a || !n) throw new Error("Identity geometry unavailable");
    expect(n.x).toBeGreaterThan(a.x + a.width);
    expect(Math.abs(n.y - a.y)).toBeLessThan(a.height);
    if (width === 390) {
      const badge = await page
        .getByText("Monthly", { exact: true })
        .boundingBox();
      const source = await page
        .locator('a[href="#agreement"]')
        .filter({ hasText: "1 source record" })
        .last()
        .boundingBox();
      expect(badge).not.toBeNull();
      expect(source).not.toBeNull();
      if (!badge || !source) throw new Error("Expense geometry unavailable");
      expect(Math.abs(badge.y - source.y)).toBeLessThan(12);
    }
  });
}
