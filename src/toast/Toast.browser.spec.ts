import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Toast examples and axe ${theme}`, {
    tag: ["@component:toast", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.clock.install();
    for (const story of ["save-document", "recover-document"]) {
      await page.goto(
        `/iframe.html?id=feedback-toast--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await page
        .getByRole("button", {
          name: story === "save-document" ? "Save document" : "Remove document",
        })
        .click();
      if (story === "save-document")
        await page.getByRole("button", { name: "Copy link" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-toast").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("toast pauses on hover and focus with a virtual clock", {
  tag: ["@component:toast", "@theme:light"],
}, async ({ page }) => {
  await page.clock.install();
  await page.goto(
    "/iframe.html?id=feedback-toast--save-document&globals=a11y.manual:!true;theme:light",
  );
  await page.getByRole("button", { name: "Save document" }).click();
  const toast = page.getByRole("status");
  await page.clock.runFor(2000);
  await toast.hover();
  await page.clock.runFor(10000);
  await expect(toast).toBeVisible();
  await page.mouse.move(0, 0);
  await page.getByRole("button", { name: "Close" }).focus();
  await page.clock.runFor(10000);
  await expect(toast).toBeVisible();
  await page.getByRole("button", { name: "Save document" }).focus();
  await page.clock.runFor(3000);
  await expect(toast).toHaveCount(0);
});
test("action toast remains and keyboard can close it", {
  tag: ["@component:toast", "@theme:light"],
}, async ({ page }) => {
  await page.clock.install();
  await page.goto(
    "/iframe.html?id=feedback-toast--recover-document&globals=a11y.manual:!true;theme:light",
  );
  await page.getByRole("button", { name: "Remove document" }).click();
  await page.clock.runFor(60000);
  await expect(page.getByRole("status")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveCount(0);
});
test("toast geometry reuses Popover tokens on mobile", {
  tag: ["@component:toast", "@theme:light"],
}, async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/iframe.html?id=feedback-toast--save-document&globals=a11y.manual:!true;theme:light",
  );
  await page.getByRole("button", { name: "Save document" }).click();
  const values = await page.locator(".bd-toast").evaluate((element) => {
    const probe = document.createElement("span");
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
      [actual.boxShadow, expected.boxShadow],
    ];
    probe.remove();
    return pairs;
  });
  for (const [actual, expected] of values) expect(actual).toBe(expected);
  const widths = await page.locator(".bd-toast-region").evaluate((element) => {
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      display: "block",
      width: "calc(100vw - var(--bd-space-32))",
    });
    element.append(probe);
    const expected = getComputedStyle(probe).width,
      actual = getComputedStyle(element).width;
    probe.remove();
    return [actual, expected];
  });
  expect(widths[0]).toBe(widths[1]);
});
