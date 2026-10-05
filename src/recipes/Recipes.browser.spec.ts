import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 30; step++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement))
      return;
  }
  await expect(target).toBeFocused();
}
async function checkPage(page: Page) {
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
for (const theme of ["light", "dark"]) {
  for (const recipe of [
    "library--browse-and-inspect",
    "workspace--edit-in-panel",
    "choice--confirm-selection",
  ]) {
    test(`Recipe ${recipe} keyboard, axe and reflow ${theme}`, {
      tag: ["@component:recipes", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(
        `/iframe.html?id=recipes-${recipe}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await checkPage(page);
      if (recipe.startsWith("library")) {
        const search = page.getByRole("searchbox", {
          name: "Search resources",
        });
        // Start at the search field: Firefox's first Tab stops differ by
        // platform; the rest of the path is reached by Tab.
        await search.focus();
        await page.keyboard.type("unknown");
        await expect(
          page.getByRole("heading", { name: "No matching resources" }),
        ).toBeVisible();
        await page.keyboard.press("ControlOrMeta+A");
        await page.keyboard.press("Backspace");
        const filter = page.getByRole("button", { name: "Text only" });
        await tabTo(page, filter);
        await page.keyboard.press("Space");
        await expect(page.getByText("2 of 3 shown")).toBeVisible();
        const row = page.getByRole("row", { name: "Field notes" });
        await tabTo(page, row);
        await page.keyboard.press("Space");
        await expect(
          page.getByRole("heading", { name: "Field notes", exact: true }),
        ).toBeVisible();
        await expect(page.getByText("Sample archive")).toBeVisible();
        await checkPage(page);
        await search.focus();
        await page.keyboard.type("unknown");
        await expect(
          page.getByRole("heading", { name: "No resource selected" }),
        ).toBeVisible();
      } else if (recipe.startsWith("workspace")) {
        await tabTo(page, page.getByRole("button", { name: "Open editor" }));
        await page.keyboard.press("Enter");
        const name = page.getByRole("textbox", { name: "Board name" });
        await tabTo(page, name);
        await page.keyboard.press("ControlOrMeta+A");
        await page.keyboard.type("Updated board");
        await tabTo(page, page.getByRole("textbox", { name: "Copies" }));
        await page.keyboard.press("ArrowUp");
        await tabTo(page, page.getByRole("textbox", { name: "Marker color" }));
        await page.keyboard.press("ControlOrMeta+A");
        await page.keyboard.type("#18201c");
        await tabTo(page, page.getByRole("slider", { name: "Opacity" }));
        await page.keyboard.press("ArrowRight");
        await expect(
          page.getByRole("status", { name: "Board preview" }),
        ).toContainText("Updated board · 3 copies · #18201C · 51% opacity");
      } else {
        await tabTo(
          page,
          page.getByRole("radio", { name: "Compact", exact: false }),
        );
        await page.keyboard.press("ArrowRight");
        await expect(
          page.getByRole("radio", { name: "Extended", exact: false }),
        ).toBeChecked();
        await tabTo(page, page.getByRole("button", { name: "Confirm choice" }));
        await page.keyboard.press("Enter");
        await expect(page.getByRole("status")).toContainText(
          "Extended sample set is ready",
        );
        await checkPage(page);
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("ArrowLeft");
        await expect(page.getByRole("status")).toHaveCount(0);
      }
      await checkPage(page);
    });
  }
}

for (const theme of ["light", "dark"]) {
  for (const width of [1280, 375]) {
    test(`Recipe polish geometry ${width} ${theme}`, {
      tag: ["@component:recipes", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        `/iframe.html?id=recipes-library--browse-and-inspect&globals=a11y.manual:!true;theme:${theme}`,
      );
      await page.evaluate(() => document.fonts.ready);
      const search = await page.locator(".bd-search-control").boundingBox();
      const chip = await page
        .getByRole("button", { name: "Text only" })
        .boundingBox();
      expect(chip?.height).toBe(search?.height);
      if (width === 1280) {
        expect((chip?.y ?? 0) + (chip?.height ?? 0)).toBeCloseTo(
          (search?.y ?? 0) + (search?.height ?? 0),
          0,
        );
      }
      const inspector = await page.locator(".bd-inspector").boundingBox();
      const eyebrow = await page
        .getByText("Selection", { exact: true })
        .boundingBox();
      expect(eyebrow?.x).toBeGreaterThan(inspector?.x ?? 0);
      const row = page.getByRole("row", { name: "Field notes" });
      await row.click();
      await page.getByRole("searchbox").focus();
      await expect(row).toHaveAttribute("aria-selected", "true");
      const selectedBackground = await row.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      expect(selectedBackground).not.toBe(
        await page
          .getByRole("row", { name: "Reading list" })
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      await page.goto(
        `/iframe.html?id=recipes-workspace--edit-in-panel&globals=a11y.manual:!true;theme:${theme}`,
      );
      await page.evaluate(() => document.fonts.ready);
      const button = page.getByRole("button", { name: "Open editor" });
      expect((await button.boundingBox())?.width).toBeLessThan(
        (await page.getByRole("main").boundingBox())?.width ?? 0,
      );
      const preview = page.getByRole("status", { name: "Board preview" });
      await expect(preview.locator(".bd-color-preview")).toHaveCSS(
        "background-color",
        "rgb(216, 237, 105)",
      );
      await button.click();
      await page.getByRole("textbox", { name: "Marker color" }).fill("#18201c");
      await page.getByRole("textbox", { name: "Marker color" }).press("Tab");
      await expect(preview.locator(".bd-color-preview")).toHaveCSS(
        "background-color",
        "rgb(24, 32, 28)",
      );
    });
  }
}
