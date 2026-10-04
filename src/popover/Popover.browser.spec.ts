import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Popover surface and elevation ${theme}`, {
    tag: ["@component:popover", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=overlays-popover--export-help&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Export help" }).click();
    await expect(
      page.getByRole("dialog", { name: "Export formats" }),
    ).toBeVisible();
    await expect(page.locator(".bd-modal-overlay")).toHaveCount(0);
    const pairs = await page.locator(".bd-popover").evaluate((element) => {
      const probe = document.createElement("div");
      Object.assign(probe.style, {
        background: "var(--bd-surface-raised)",
        border: "var(--bd-hair) solid var(--bd-border-strong)",
        boxShadow: "var(--bd-offset) var(--bd-offset) 0 var(--bd-shadow)",
      });
      element.append(probe);
      const actual = getComputedStyle(element),
        expected = getComputedStyle(probe);
      const pairs = [
        [actual.backgroundColor, expected.backgroundColor],
        [actual.borderColor, expected.borderColor],
        [actual.borderWidth, expected.borderWidth],
        [actual.boxShadow, expected.boxShadow],
      ];
      probe.remove();
      return pairs;
    });
    for (const [actual, expected] of pairs) expect(actual).toBe(expected);
  });
}

test("Popover anchors, repositions and restores focus on Escape or outside click", {
  tag: ["@component:popover", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=overlays-popover--sharing-help&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  // Keep a DOM locator for geometry while React Aria hides the background.
  const trigger = page.locator("#storybook-root .bd-button");
  await expect(trigger).toHaveAccessibleName("Sharing help");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Sharing options" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  const popover = page.locator(".bd-popover");
  const anchor = await trigger.boundingBox(),
    box = await popover.boundingBox();
  expect(anchor).not.toBeNull();
  expect(box).not.toBeNull();
  expect(
    Math.abs(
      (box?.x ?? 0) +
        (box?.width ?? 0) -
        (anchor?.x ?? 0) -
        (anchor?.width ?? 0),
    ),
  ).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 360, height: 480 });
  await expect(async () => {
    const box = await popover.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(480);
  }).toPass();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(350, 470);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("Open Popover passes automated axe in both themes", {
  tag: ["@component:popover", "@theme:light", "@theme:dark"],
}, async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(
      `/iframe.html?id=overlays-popover--export-help&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await page.getByRole("button", { name: "Export help" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
});
