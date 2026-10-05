import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Tree examples, token geometry and axe ${theme}`, {
    tag: ["@component:tree", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["resource-folders", "expanded-folders"]) {
      await page.goto(
        `/iframe.html?id=collections-tree--${story}&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-tree").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const sizes = await page
        .locator(".bd-tree-content")
        .first()
        .evaluate((element) => {
          const actual = getComputedStyle(element);
          const probe = document.createElement("span");
          probe.style.minHeight =
            "calc(var(--bd-space-32) + var(--bd-space-4))";
          element.append(probe);
          const result = [actual.minHeight, getComputedStyle(probe).minHeight];
          probe.remove();
          return result;
        });
      expect(sizes[0]).toBe(sizes[1]);
      if (story === "expanded-folders") {
        const indent = await page
          .getByRole("row", { name: /Field notes/ })
          .locator(".bd-tree-content")
          .evaluate((element) => {
            const actual = getComputedStyle(element);
            const probe = document.createElement("span");
            probe.style.paddingLeft = "var(--bd-space-24)";
            element.append(probe);
            const result = [
              actual.paddingLeft,
              getComputedStyle(probe).paddingLeft,
            ];
            probe.remove();
            return result;
          });
        expect(indent[0]).toBe(indent[1]);
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
test("tree keyboard expands, navigates and selects", {
  tag: ["@component:tree", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=collections-tree--resource-folders&globals=a11y.manual:!true;theme:light",
  );
  const root = page.getByRole("row", { name: /Resources/ });
  await expect(root).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(root).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(root).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  const child = page.getByRole("row", { name: /Field notes/ });
  await expect(child).toBeFocused();
  await page.keyboard.press("Space");
  await expect(child).toHaveAttribute("aria-selected", "true");
  await expect(child).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowLeft");
  await expect(root).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(root).toHaveAttribute("aria-expanded", "false");
});
