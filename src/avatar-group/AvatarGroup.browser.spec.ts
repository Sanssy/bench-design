import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`AvatarGroup examples and axe ${theme}`, {
    tag: ["@component:avatar-group", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["collaborators", "limited-collaborators"]) {
      await page.goto(
        `/iframe.html?id=data-avatargroup--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-avatar-group").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("overflow names and group spacing", {
  tag: ["@component:avatar-group", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=data-avatargroup--limited-collaborators&globals=a11y.manual:!true;theme:light",
  );
  await expect(
    page.getByRole("img", { name: "Alan Turing, Katherine Johnson" }),
  ).toHaveText("+2");
  const values = await page.locator(".bd-avatar-group").evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.gap = "var(--bd-space-4)";
    element.append(probe);
    const expected = getComputedStyle(probe).gap,
      actual = getComputedStyle(element).gap;
    probe.remove();
    return [actual, expected];
  });
  expect(values[0]).toBe(values[1]);
});

for (const [story, size] of [
  ["compact-collaborators", 24],
  ["large-collaborators", 40],
] as const) {
  test(`AvatarGroup overflow follows ${size}px avatars`, {
    tag: ["@component:avatar-group"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-avatargroup--${story}&viewMode=story&globals=a11y.manual:!true`,
    );
    const overflow = page.getByRole("img", { name: "Grace Hopper" });
    await expect(overflow).toBeVisible();
    await expect(overflow).toHaveText("+1");
    await expect(overflow).toHaveCSS("width", `${size}px`);
    await expect(overflow).toHaveCSS("height", `${size}px`);
  });
}
