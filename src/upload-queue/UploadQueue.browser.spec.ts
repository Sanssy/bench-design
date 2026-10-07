import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const story of ["uploading", "complete", "failed", "mixed"]) {
    test(`UploadQueue ${story} ${theme}`, {
      tag: ["@component:upload-queue", `@theme:${theme}`],
    }, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(
        `/iframe.html?id=feedback-uploadqueue--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("list", { name: "Uploads" })).toBeVisible();
      await expect(page.getByRole("status")).toHaveCount(1);
      if (story === "uploading") {
        await expect(
          page.getByRole("progressbar", { name: "Progress of Report.pdf" }),
        ).toHaveAttribute("aria-valuenow", "35");
        await expect(
          page.getByRole("progressbar", { name: "Progress of Notes.txt" }),
        ).not.toHaveAttribute("aria-valuenow");
      }
      if (story === "complete" || story === "mixed") {
        await page.keyboard.press("Tab");
        await expect(
          page.getByRole("link", { name: "View details" }),
        ).toBeFocused();
      }
      if (story === "failed")
        await expect(
          page.getByRole("img", { name: "Upload failed" }),
        ).toBeVisible();
      expect(
        await page
          .locator(".bd-upload-queue")
          .evaluate((e) => e.scrollWidth <= e.clientWidth),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include(".bd-upload-queue")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }
}
