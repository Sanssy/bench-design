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
      const defaults = await label.evaluate((element) => {
        const css = getComputedStyle(element);
        const marker = element.querySelector(
          ".bd-category-label__marker",
        ) as HTMLElement;
        const markerCss = getComputedStyle(marker);
        element.style.writingMode = "vertical-rl";
        const vertical = getComputedStyle(element);
        const verticalWriting = [
          vertical.paddingTop,
          vertical.paddingRight,
          vertical.minBlockSize,
        ];
        element.style.removeProperty("writing-mode");
        return {
          radius: css.borderTopLeftRadius,
          paddingTop: css.paddingTop,
          paddingRight: css.paddingRight,
          gap: css.columnGap,
          minBlockSize: css.minBlockSize,
          markerSize: [markerCss.width, markerCss.height],
          markerRadius: markerCss.borderTopLeftRadius,
          verticalWriting,
        };
      });
      expect(defaults).toEqual({
        radius: "0px",
        paddingTop: "3px",
        paddingRight: "8px",
        gap: "7px",
        minBlockSize: "24px",
        markerSize: ["10px", "10px"],
        markerRadius: "0px",
        verticalWriting: ["3px", "8px", "24px"],
      });
      const marker = label.locator(".bd-category-label__marker");
      await expect(marker).toHaveAttribute("aria-hidden", "true");
      await expect(marker).toHaveCSS("width", "10px");
      await expect(marker).toHaveCSS("height", "10px");
      await expect(marker).toHaveCSS("background-color", expected.marker);
    }

    const label = page.locator(".bd-category-label").first();
    const inherited = await label.evaluate((element) => {
      const parent = element.parentElement as HTMLElement;
      parent.style.setProperty("--bd-metadata-radius", "999px");
      const radius = getComputedStyle(element).borderTopLeftRadius;
      parent.style.setProperty("--bd-metadata-padding-vertical", "2px");
      const vertical = getComputedStyle(element);
      const verticalValue = [vertical.paddingTop, vertical.paddingRight];
      parent.style.setProperty("--bd-metadata-padding-vertical", "3px");
      const verticalRemap = getComputedStyle(element).paddingTop;
      parent.style.setProperty("--bd-metadata-padding-horizontal", "10px");
      const horizontal = getComputedStyle(element);
      const horizontalValue = [horizontal.paddingTop, horizontal.paddingRight];
      parent.style.setProperty("--bd-metadata-gap", "6px");
      const gap = getComputedStyle(element).columnGap;
      parent.style.setProperty("--bd-category-label-min-block-size", "0px");
      const minBlockSize = getComputedStyle(element).minBlockSize;
      parent.style.setProperty("--bd-hair", "3px");
      parent.style.setProperty("--bd-stroke", "5px");
      parent.style.setProperty("--bd-category-label-marker-size", "8px");
      const marker = element.querySelector(
        ".bd-category-label__marker",
      ) as HTMLElement;
      const sizeOnly = getComputedStyle(marker);
      const markerSizeOnly = [
        sizeOnly.width,
        sizeOnly.height,
        sizeOnly.borderTopLeftRadius,
      ];
      parent.style.setProperty("--bd-category-label-marker-radius", "50%");
      const markerCss = getComputedStyle(marker);
      const markerGeometry = [
        markerCss.width,
        markerCss.height,
        markerCss.borderTopLeftRadius,
      ];
      const nested = document.createElement("div");
      parent.insertBefore(nested, element);
      nested.append(element);
      nested.style.setProperty("--bd-metadata-radius", "12px");
      const nestedCss = getComputedStyle(element);
      const nestedGeometry = [
        nestedCss.borderTopLeftRadius,
        nestedCss.paddingTop,
        nestedCss.paddingRight,
        nestedCss.columnGap,
        nestedCss.minBlockSize,
        getComputedStyle(marker).width,
      ];
      parent.insertBefore(element, nested);
      nested.remove();
      for (const name of [
        "--bd-metadata-radius",
        "--bd-metadata-padding-vertical",
        "--bd-metadata-padding-horizontal",
        "--bd-metadata-gap",
        "--bd-category-label-min-block-size",
        "--bd-category-label-marker-size",
        "--bd-category-label-marker-radius",
        "--bd-hair",
        "--bd-stroke",
      ]) {
        parent.style.removeProperty(name);
      }
      return {
        radius,
        verticalValue,
        verticalRemap,
        horizontalValue,
        gap,
        minBlockSize,
        markerSizeOnly,
        markerGeometry,
        nestedGeometry,
      };
    });
    expect(inherited).toEqual({
      radius: "999px",
      verticalValue: ["2px", "8px"],
      verticalRemap: "3px",
      horizontalValue: ["3px", "10px"],
      gap: "6px",
      minBlockSize: "0px",
      markerSizeOnly: ["8px", "8px", "0px"],
      markerGeometry: ["8px", "8px", "50%"],
      nestedGeometry: ["12px", "3px", "10px", "6px", "0px", "8px"],
    });
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

for (const theme of ["light", "dark"]) {
  test(`CategoryLabel icon and plain labels wrap in ${theme}`, {
    tag: ["@component:category-label", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const width of [170, 320, 390, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        `/iframe.html?id=data-categorylabel--topic-labels&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
      );
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const labels = page.locator(".bd-category-label");
      await expect(labels).toHaveCount(3);
      for (const direction of ["ltr", "rtl"] as const) {
        await page.locator("html").evaluate((element, dir) => {
          (element as HTMLElement).dir = dir;
        }, direction);
        for (const label of await labels.all()) {
          await expect(label).toBeVisible();
          expect(
            await label.evaluate((e) => e.scrollWidth <= e.clientWidth),
          ).toBe(true);
        }
      }
      await expect(labels.first().locator("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      await expect(
        labels.first().locator(".bd-category-label__marker"),
      ).toHaveCount(0);
      await expect(labels.nth(1)).toHaveCSS("border-top-style", "none");
      await expect(labels.nth(1)).toHaveCSS(
        "background-color",
        "rgba(0, 0, 0, 0)",
      );
      await expect(labels.first().locator("svg")).toHaveCSS("width", "16px");
      await expect(labels.first().locator("svg")).toHaveCSS("height", "16px");
      const plainPadding = await labels.nth(1).evaluate((element) => {
        const parent = element.parentElement?.parentElement as HTMLElement;
        const originalVertical = parent.style.getPropertyValue(
          "--bd-metadata-padding-vertical",
        );
        const originalHorizontal = parent.style.getPropertyValue(
          "--bd-metadata-padding-horizontal",
        );
        parent.style.removeProperty("--bd-metadata-padding-vertical");
        parent.style.removeProperty("--bd-metadata-padding-horizontal");
        const plain = getComputedStyle(element);
        const defaults = [plain.paddingTop, plain.paddingRight];
        parent.style.setProperty("--bd-metadata-padding-vertical", "2px");
        parent.style.setProperty("--bd-metadata-padding-horizontal", "10px");
        const overridden = getComputedStyle(element);
        const values = [overridden.paddingTop, overridden.paddingRight];
        parent.style.setProperty(
          "--bd-metadata-padding-vertical",
          originalVertical,
        );
        parent.style.setProperty(
          "--bd-metadata-padding-horizontal",
          originalHorizontal,
        );
        return { defaults, values };
      });
      expect(plainPadding).toEqual({
        defaults: ["0px", "0px"],
        values: ["2px", "10px"],
      });
    }
  });
}
