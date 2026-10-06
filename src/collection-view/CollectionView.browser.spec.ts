import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`CollectionView examples and sticky tools ${theme}`, {
    tag: ["@component:collection-view", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resource-library", "empty-library", "title-search"]) {
      await page.goto(
        `/iframe.html?id=collections-collectionview--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(
        page.getByRole("region", { name: /Resource library [03]/ }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".bd-collection-view-footer")).toHaveCSS(
        "font-family",

        // The mono token, whatever face it names.
        await page.evaluate(() => {
          const probe = document.createElement("span");
          probe.style.fontFamily = "var(--bd-font-mono)";
          document.body.append(probe);
          const family = getComputedStyle(probe).fontFamily;
          probe.remove();
          return family;
        }),
      );
      await page.setViewportSize({ width: 320, height: 700 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (story === "empty-library") {
        await expect(
          page.getByRole("heading", { name: "Resource library 0", level: 2 }),
        ).toBeVisible();
        await expect(page.locator(".bd-collection-view-count")).toHaveCSS(
          "border-top-style",
          "solid",
        );
      }
      if (story === "resource-library") {
        await expect(page.locator(".bd-collection-view-toolbar")).toHaveCSS(
          "position",
          "sticky",
        );
      }
      if (story === "title-search") {
        await expect(page.locator(".bd-collection-view-toolbar")).toHaveCSS(
          "position",
          "static",
        );
        const search = page.getByRole("searchbox", {
          name: "Search resources",
        });
        await expect(
          page.locator(".bd-collection-view-header").getByRole("searchbox"),
        ).toBeVisible();
        await search.fill("unknown");
        await expect(
          page.getByRole("heading", { name: "No matching resources" }),
        ).toBeVisible();
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
test("consumer search, view and sorting operate through the composition", {
  tag: ["@component:collection-view", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-collectionview--resource-library&globals=a11y.manual:!true;theme:light",
  );
  const search = page.getByRole("searchbox", { name: "Search resources" });
  await expect(search).toBeVisible();
  await search.fill("unknown");
  await expect(
    page.getByRole("heading", { name: "No matching resources" }),
  ).toBeVisible();
  await expect(page.getByRole("grid", { name: "Resources" })).toHaveCount(0);
  await expect(page.getByText("0 of 3 shown")).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.getByText("3 of 3 shown")).toBeVisible();
  // SegmentedControl segments are radios (single choice).
  await page.getByRole("radio", { name: "List", exact: true }).click();
  await expect(page.locator(".bd-grid-list")).toHaveAttribute(
    "data-layout",
    "stack",
  );
  await page.getByRole("button", { name: "Reverse order" }).click();
  await expect(page.locator(".bd-grid-list-item").first()).toContainText(
    "Reading list",
  );
});
