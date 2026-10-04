import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Disclosure examples and axe ${theme}`, {
    tag: ["@component:disclosure", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["document-details", "expanded-details"]) {
      await page.goto(
        `/iframe.html?id=structure-disclosure--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-disclosure").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("disclosure keyboard and header geometry", {
  tag: ["@component:disclosure", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=structure-disclosure--document-details&globals=a11y.manual:!true;theme:light",
  );
  const trigger = page.getByRole("button", { name: "Document details PDF" });
  await expect(trigger).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const sizes = await trigger.evaluate((element) => {
    const actual = getComputedStyle(element);
    const probe = document.createElement("span");
    probe.style.minHeight = "var(--bd-space-48)";
    element.append(probe);
    const expected = getComputedStyle(probe).minHeight;
    probe.remove();
    return [actual.minHeight, expected];
  });
  expect(sizes[0]).toBe(sizes[1]);
});
