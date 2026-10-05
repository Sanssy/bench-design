import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Document library keyboard, axe and 320px reflow ${theme}`, {
    tag: ["@component:document-library", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(
      `/iframe.html?id=recipes-document-library--browse-documents&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    async function check() {
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
    }
    await check();
    await expect(page.getByRole("row").locator(".bd-card")).toHaveCount(0);
    const search = page.getByRole("searchbox", { name: /Search documents/ });
    await search.focus();
    await page.keyboard.type("unknown");
    await expect(
      page.getByRole("heading", { name: "No matching documents" }),
    ).toBeVisible();
    await check();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.press("Backspace");
    const all = page.getByRole("radio", { name: "All, 4" });
    for (
      let step = 0;
      step < 5 && !(await all.evaluate((el) => el === document.activeElement));
      step++
    )
      await page.keyboard.press("Tab");
    await expect(all).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("radio", { name: "Invoices, 2" }),
    ).toBeChecked();
    await expect(page.getByText("2 of 4 documents shown")).toBeVisible();
    await page.keyboard.press("Tab");
    const row = page.getByRole("row", { name: "Energy invoice" });
    await expect(row).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Energy invoice" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("mark")).toHaveText(
      "Total payable: 64.80 EUR.",
    );
    expect(
      await dialog
        .locator("mark")
        .evaluate((el) => el.parentElement?.textContent),
    ).not.toBe("Total payable: 64.80 EUR.");
    await check();
    await page.keyboard.press("Escape");
    if (await dialog.isVisible()) await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(row).toBeFocused();
  });
}
