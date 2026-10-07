import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`ProgressBar track, fill and accessibility ${theme}`, {
    tag: ["@component:progress-bar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=feedback-progressbar--processing&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(
      page.getByRole("progressbar", { name: "Processing documents" }),
    ).toBeVisible();
    const values = await page
      .locator(".bd-progress-track")
      .evaluate((track) => {
        const fill = track.firstElementChild as HTMLElement;
        const probe = document.createElement("span");
        probe.style.background = "var(--bd-divider)";
        probe.style.color = "var(--bd-text)";
        track.append(probe);
        const expected = getComputedStyle(probe);
        const result = {
          height: getComputedStyle(track).height,
          background: getComputedStyle(track).backgroundColor,
          expectedBackground: expected.backgroundColor,
          fill: getComputedStyle(fill).backgroundColor,
          expectedFill: expected.color,
          fraction:
            fill.getBoundingClientRect().width /
            track.getBoundingClientRect().width,
        };
        probe.remove();
        return result;
      });
    expect(values.height).toBe("4px");
    expect(values.background).toBe(values.expectedBackground);
    expect(values.fill).toBe(values.expectedFill);
    expect(values.fraction).toBeCloseTo(0.4, 2);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-progress-bar")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
  test(`ProgressBar indeterminate reduced motion ${theme}`, {
    tag: ["@component:progress-bar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(
      `/iframe.html?id=feedback-progressbar--waiting&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const fill = page.locator(".bd-progress-fill");
    await expect(fill).toBeVisible();
    expect(await fill.evaluate((e) => getComputedStyle(e).animationName)).toBe(
      "bd-progress-travel",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await fill.evaluate((e) => getComputedStyle(e).animationName)).toBe(
      "none",
    );
    await expect(page.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-progress-bar")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
