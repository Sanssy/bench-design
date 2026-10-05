import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`CategoryLabel palette and geometry in ${theme}`, {
    tag: ["@component:category-label", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-categorylabel--categories&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".bd-category-label")).toHaveCount(6);
    for (const category of [
      "teal",
      "magenta",
      "orange",
      "violet",
      "green",
      "blue",
    ]) {
      const label = page.locator(`[data-category="${category}"]`);
      await expect(label).toBeVisible();
      const expected = await label.evaluate((element, category) => {
        const probe = document.createElement("span");
        probe.style.cssText = `color:var(--bd-text);background:var(--bd-category-${category});border:var(--bd-hair) solid var(--bd-border-strong)`;
        element.append(probe);
        const css = getComputedStyle(probe);
        const result = {
          text: css.color,
          marker: css.backgroundColor,
          border: css.borderColor,
        };
        probe.remove();
        return result;
      }, category);
      await expect(label).toHaveCSS("color", expected.text);
      await expect(label).toHaveCSS("border-color", expected.border);
      await expect(label).toHaveCSS("text-transform", "uppercase");
      const marker = label.locator(".bd-category-label__marker");
      await expect(marker).toHaveAttribute("aria-hidden", "true");
      await expect(marker).toHaveCSS("width", "10px");
      await expect(marker).toHaveCSS("height", "10px");
      await expect(marker).toHaveCSS("background-color", expected.marker);
    }
  });
}
test("CategoryLabel keeps its width in a stretching stack", {
  tag: ["@component:category-label", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=recipes-choice--confirm-selection&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const label = page.locator(".bd-category-label").first();
  await expect(label).toBeVisible();
  const widths = await label.evaluate((element) => [
    element.getBoundingClientRect().width,
    (element.parentElement as HTMLElement).getBoundingClientRect().width,
  ]);
  expect(widths[0]).toBeLessThan((widths[1] ?? 0) / 2);
});
