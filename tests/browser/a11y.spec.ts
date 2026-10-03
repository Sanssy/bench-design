import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  ["typography-link--paragraph", "link", "Read the next chapter"],
  ["typography-link--external", "link", "Visit Example (opens in a new tab)"],
  ["typography-heading--article", "heading", "A new perspective"],
  ["typography-heading--section", "heading", "A new perspective"],
  ["typography-heading--subsection", "heading", "A new perspective"],
  ["typography-heading--detail", "heading", "A new perspective"],
  ["typography-heading--display", "heading", "A new perspective"],
  ["typography-text--paragraph", "paragraph", "Read the next chapter."],
  ["typography-text--metadata", "paragraph", "Read the next chapter."],
  ["typography-text--body", "paragraph", "Read the next chapter."],
  ["typography-text--lead", "paragraph", "Read the next chapter."],
  ["typography-text--muted", "paragraph", "Read the next chapter."],
  ["typography-text--label", "paragraph", "Read the next chapter."],
  ["typography-text--mono", "paragraph", "Read the next chapter."],
  ["form-button--primary", "button", "Save"],
  ["form-button--secondary", "button", "Save"],
  ["form-button--disabled", "button", "Save"],
  ["form-button--variants", "button", "Save"],
  ["foundations-colors--palette", "heading", "Colors"],
  ["foundations-typography--scale", "heading", "Typography"],
  ["foundations-spacing-geometry--scale", "heading", "Spacing & geometry"],
  ["docs-getting-started--page", "heading", "Getting started"],
  ["docs-principles--page", "heading", "Principles"],
  ["docs-themes--page", "heading", "Themes"],
] as const;

for (const theme of ["light", "dark"] as const) {
  for (const [id, role, name] of pages) {
    test(`WCAG 2 A/AA: ${id} in ${theme}`, {
      tag: [
        `@theme:${theme}`,
        `@component:${id.split("--")[0]?.split("-").at(-1)}`,
      ],
    }, async ({ page }) => {
      await page.emulateMedia({
        colorScheme: theme === "light" ? "dark" : "light",
      });
      await page.goto(
        `/iframe.html?id=${id}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(
        id.startsWith("typography-text--")
          ? page.getByText(name, { exact: true })
          : page.getByRole(role, { name, exact: true }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }
}
