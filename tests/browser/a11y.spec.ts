import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

type Story = { id: string; type: string };
const index = JSON.parse(
  readFileSync("storybook-static/index.json", "utf8"),
) as { entries: Record<string, Story> };

for (const { id, type } of Object.values(index.entries)) {
  // Generated autodocs are excluded; hand-authored Docs/Foundations are stories.
  if (type !== "story") continue;
  test(`WCAG 2 A/AA: ${id} in both themes`, {
    tag: [
      "@theme:light",
      "@theme:dark",
      `@component:${id.split("--")[0]?.split("-").at(-1)}`,
    ],
  }, async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({
        colorScheme: theme === "light" ? "dark" : "light",
      });
      await page.goto(
        `/iframe.html?id=${id}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("#storybook-root")).not.toBeEmpty();
      await expect(page.locator("#storybook-root")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  });
}
