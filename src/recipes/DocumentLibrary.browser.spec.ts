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
    for (const [width, columns] of [
      [1280, 4],
      [390, 2],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => document.fonts.ready);
      const grid = page.getByRole("grid", { name: "Documents" });
      await expect
        .poll(() =>
          grid.evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
          ),
        )
        .toBe(columns);
      const geometry = await grid.getByRole("row").evaluateAll((rows) =>
        rows.map((row) => ({
          top: row.getBoundingClientRect().top,
          height: row.getBoundingClientRect().height,
          preview: row
            .querySelector(".bd-grid-list-preview")
            ?.getBoundingClientRect().height,
          footer: row
            .querySelector(".bd-grid-list-footer")
            ?.getBoundingClientRect().bottom,
          bottom: row.getBoundingClientRect().bottom,
        })),
      );
      for (const item of geometry) {
        expect(item.preview).toBe(192);
        // Sub-pixel layout in Firefox: allow up to 1.5 px.
        expect(Math.abs((item.footer ?? 0) - item.bottom)).toBeLessThanOrEqual(
          1.5,
        );
        for (const peer of geometry.filter(
          (other) => Math.abs(other.top - item.top) < 1,
        )) {
          expect(Math.abs(peer.height - item.height)).toBeLessThanOrEqual(1);
        }
      }
      for (const label of await page
        .locator('.bd-page-footer .bd-text[data-variant="mono"]')
        .all()) {
        await expect(label).toHaveCSS("overflow-wrap", "normal");
        await expect(label).toHaveCSS("word-break", "normal");
      }
      await check();
      await page.screenshot({
        path: `../fid-after/library-3-${width}-${theme}.png`,
        fullPage: true,
      });
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await check();
    await expect(page.getByRole("contentinfo")).toContainText("Document space");
    await expect(page.locator(".bd-collection-view-toolbar")).toHaveCSS(
      "position",
      "static",
    );
    await expect(page.locator(".bd-app-shell")).toHaveCount(0);
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
    const all = page.getByRole("radio", { name: "All, 10" });
    for (
      let step = 0;
      step < 5 && !(await all.evaluate((el) => el === document.activeElement));
      step++
    )
      await page.keyboard.press("Tab");
    await expect(all).toBeFocused();
    // SegmentedControl: arrows move focus, Space selects.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("radio", { name: "Invoices, 2" }),
    ).toBeChecked();
    await expect(page.getByText("2 of 10 documents shown")).toBeVisible();
    await page.keyboard.press("Tab");
    const gridView = page.getByRole("radio", { name: "Grid view" });
    await expect(gridView).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(page.getByRole("radio", { name: "List view" })).toBeChecked();
    await expect(page.getByRole("grid", { name: "Documents" })).toHaveAttribute(
      "data-layout",
      "stack",
    );
    await check();
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

for (const theme of ["light", "dark"]) {
  test(`Document imports, reduced motion and dialog axe ${theme}`, {
    tag: ["@component:document-library", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(
      `/iframe.html?id=recipes-document-library--browse-documents&globals=a11y.manual:!true;theme:${theme}`,
    );
    await page.getByRole("button", { name: "Add documents" }).click();
    const dialog = page.getByRole("dialog", { name: "Add your documents" });
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "water.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("sample"),
    });
    await expect(dialog.getByText("Bill recognised · Housing")).toBeVisible();
    await dialog
      .getByRole("button", { name: "Try with a sample water bill" })
      .click();
    await expect(
      dialog.getByRole("button", { name: "View document" }),
    ).toHaveCount(2);
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: Buffer.from("sample"),
    });
    await expect(
      dialog.getByText("Some files could not be added"),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await dialog.getByRole("button", { name: "View document" }).first().click();
    await expect(page.getByRole("dialog", { name: "water.pdf" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("row", { name: "water.pdf" })).toBeVisible();
    await expect(page.getByText("12 documents", { exact: true })).toBeVisible();
  });
}
