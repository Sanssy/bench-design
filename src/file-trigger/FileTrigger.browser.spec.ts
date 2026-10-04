import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`FileTrigger examples and axe ${theme}`, {
    tag: ["@component:file-trigger", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of ["select-document", "select-images"]) {
      await page.goto(
        `/iframe.html?id=import-filetrigger--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-button").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("native picker opens from keyboard", {
  tag: ["@component:file-trigger", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=import-filetrigger--select-document&globals=a11y.manual:!true;theme:light",
  );
  await expect(
    page.getByRole("button", { name: "Add document" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Add document" }),
  ).toBeFocused();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  const picker = await chooser;
  expect(picker.isMultiple()).toBe(false);
  await picker.setFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("notes"),
  });
});
test("file trigger geometry uses Button tokens", {
  tag: ["@component:file-trigger", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=import-filetrigger--select-document&globals=a11y.manual:!true;theme:light",
  );
  const button = page.getByRole("button", { name: "Add document" });
  const sizes = await button.evaluate((element) => {
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
