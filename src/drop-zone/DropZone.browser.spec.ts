import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`DropZone examples and axe ${theme}`, {
    tag: ["@component:drop-zone", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of [
      "upload-documents",
      "unavailable",
      "editorial",
      "editorial-unavailable",
    ]) {
      await page.goto(
        `/iframe.html?id=import-dropzone--${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".bd-drop-zone").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
test("picker refusal is visible and keyboard reachable", {
  tag: ["@component:drop-zone", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=import-dropzone--upload-documents&globals=a11y.manual:!true;theme:light",
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("image"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "photo.png: this format is not accepted",
  );
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Drop documents here", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Add files" })).toBeFocused();
});
test("drag target indicates and rejects invalid files", {
  tag: ["@component:drop-zone", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=import-dropzone--upload-documents&globals=a11y.manual:!true;theme:light",
  );
  const data = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    const item = transfer.items.add(
      new File(["bad"], "image.png", { type: "image/png" }),
    );
    // Synthetic files have no filesystem entry. Use the native File fallback
    // rather than the directory-entry path, which ignores null entries.
    if (!item) throw new Error("Missing drag item");
    // Chromium returns a fresh item wrapper on each access, so the fallback is
    // set on the prototype of this test page rather than on one wrapper.
    Object.defineProperty(DataTransferItem.prototype, "webkitGetAsEntry", {
      value: undefined,
      configurable: true,
    });
    return transfer;
  });
  const zone = page.locator(".bd-drop-zone");
  await zone.dispatchEvent("dragenter", { dataTransfer: data });
  await zone.dispatchEvent("dragover", { dataTransfer: data });
  await expect(zone).toHaveAttribute("data-drop-target", "true");
  await zone.dispatchEvent("drop", { dataTransfer: data });
  await expect(page.getByRole("alert")).toContainText("image.png");
  const colors = await zone.evaluate((element) => {
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      border: "var(--bd-stroke) solid var(--bd-danger)",
      background: "var(--bd-danger-subtle)",
    });
    element.append(probe);
    const actual = getComputedStyle(element),
      expected = getComputedStyle(probe);
    const values = [
      [actual.borderColor, expected.borderColor],
      [actual.backgroundColor, expected.backgroundColor],
    ];
    probe.remove();
    return values;
  });
  for (const [actual, expected] of colors) expect(actual).toBe(expected);
  await data.dispose();
});
test("drop zone geometry follows tokens", {
  tag: ["@component:drop-zone", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=import-dropzone--upload-documents&globals=a11y.manual:!true;theme:light",
  );
  const values = await page.locator(".bd-drop-zone").evaluate((element) => {
    const probe = document.createElement("span");
    Object.assign(probe.style, {
      padding: "var(--bd-space-24)",
      border: "var(--bd-stroke) dashed var(--bd-border-strong)",
      background: "var(--bd-surface-subtle)",
    });
    element.append(probe);
    const actual = getComputedStyle(element),
      expected = getComputedStyle(probe);
    const pairs = [
      [actual.padding, expected.padding],
      [actual.borderWidth, expected.borderWidth],
      [actual.backgroundColor, expected.backgroundColor],
    ];
    probe.remove();
    return pairs;
  });
  for (const [actual, expected] of values) expect(actual).toBe(expected);
});

for (const theme of ["light", "dark"]) {
  test(`editorial compact layout and keyboard picker ${theme}`, {
    tag: ["@component:drop-zone", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=import-dropzone--editorial&globals=a11y.manual:!true;theme:${theme}`,
    );
    const zone = page.getByRole("button", {
      name: "Bring your documents into focus",
      exact: true,
    });
    const picker = page.getByRole("button", { name: "Add files" });
    for (const width of [640, 639, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(zone).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: "Bring your documents into focus",
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Drop local documents here or choose files to get started.",
        ),
      ).toBeVisible();
      await expect(page.getByText("TXT, PDF · 10 MB max.")).toBeVisible();
      await expect(picker).toBeVisible();
      if (width < 640) {
        await expect(page.locator(".bd-icon-tile")).toBeHidden();
        await expect(page.getByText("01 / IMPORT")).toBeHidden();
      } else {
        await expect(page.locator(".bd-icon-tile")).toBeVisible();
        await expect(page.getByText("01 / IMPORT")).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
    await page.keyboard.press("Tab");
    await expect(zone).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(picker).toBeFocused();
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Enter");
    await (await chooser).setFiles({
      name: "note.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("ok"),
    });
    await expect(page.getByRole("status")).toHaveText("note.txt");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
