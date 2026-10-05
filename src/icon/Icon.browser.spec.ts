import { expect, test } from "@playwright/test";

test("Icon inherits parent color in both themes", {
  tag: ["@theme:light", "@theme:dark", "@component:icon"],
}, async ({ page }) => {
  const colors: string[] = [];
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=media-icon--gallery&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const icons = page.locator("#storybook-root svg");
    await expect(icons).toHaveCount(17);
    for (const icon of await icons.all()) {
      const actual = await icon.evaluate((element) => ({
        parent: getComputedStyle(element.parentElement as Element).color,
        stroke: getComputedStyle(element).stroke,
        child: getComputedStyle(element.firstElementChild as Element).stroke,
      }));
      expect(actual.stroke).toBe(actual.parent);
      expect(actual.child).toBe(actual.parent);
      colors.push(actual.stroke);
    }
  }
  // First light icon against first dark icon.
  expect(colors[0]).not.toBe(colors[colors.length / 2]);
});
