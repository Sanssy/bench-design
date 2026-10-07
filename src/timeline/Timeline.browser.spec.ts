import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`Timeline wraps long content and preserves focus in ${theme}`, {
    tag: ["@component:timeline", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(
      `/iframe.html?id=data-timeline--publication-history&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const list = page.getByRole("list", { name: "Publication history" });
    await expect(list).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(list.getByRole("listitem")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const style = await list
      .locator("li")
      .first()
      .evaluate((item) => {
        const marker = getComputedStyle(
          item.querySelector(".bd-timeline-marker") as Element,
        );
        const rail = getComputedStyle(item);
        const square = getComputedStyle(item, "::before");
        const probe = document.createElement("span");
        probe.style.font =
          "var(--bd-size-meta) / var(--bd-line-reading) var(--bd-font-mono)";
        probe.style.color = "var(--bd-border)";
        item.append(probe);
        const expected = getComputedStyle(probe);
        const result = {
          font: [marker.fontFamily, marker.fontSize],
          expectedFont: [expected.fontFamily, expected.fontSize],
          border: rail.borderInlineStartColor,
          expectedBorder: expected.color,
          square: [square.width, square.height, square.content],
        };
        probe.remove();
        return result;
      });
    expect(style.font).toEqual(style.expectedFont);
    expect(style.border).toBe(style.expectedBorder);
    expect(style.square).toEqual(["8px", "8px", '""']);
    await page.keyboard.press("Tab");
    await expect(list.getByRole("link")).toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-timeline")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`Timeline columns reflow and navigation in ${theme}`, {
    tag: ["@component:timeline", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=data-timeline--event-columns&viewMode=story&globals=theme:${theme}`,
    );
    const list = page.getByRole("list", { name: "Event history" });
    await expect(list).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 639, 640, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      const row = list.getByRole("listitem").first();
      const marker = await row.locator(".bd-timeline-marker").boundingBox();
      const title = await row.locator(".bd-timeline-title").boundingBox();
      expect(marker).not.toBeNull();
      expect(title).not.toBeNull();
      if (width >= 640) {
        expect(Math.abs((marker?.y ?? 0) - (title?.y ?? 0))).toBeLessThan(8);
        expect(title?.x).toBeGreaterThan(
          (marker?.x ?? 0) + (marker?.width ?? 0),
        );
      } else {
        expect(title?.y).toBeGreaterThanOrEqual(
          (marker?.y ?? 0) + (marker?.height ?? 0),
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await row.evaluate((el) => getComputedStyle(el).borderBottomStyle),
      ).toBe("solid");
    }
    await page.keyboard.press("Tab");
    const link = list.getByRole("link", { name: "Draft prepared" });
    await expect(link).toBeFocused();
    expect(
      await link.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#draft$/);
    expect(
      (
        await new AxeBuilder({ page })
          .include(".bd-timeline")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("Timeline action titles align their arrow at the row end", {
  tag: ["@component:timeline", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=data-timeline--action-columns&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  const item = page.locator(".bd-timeline-item").first();
  const arrow = item.locator(".bd-link-icon-trailing");
  await expect(arrow).toBeVisible();
  const [row, icon] = await Promise.all([
    item.boundingBox(),
    arrow.boundingBox(),
  ]);
  if (!row || !icon) throw new Error("Timeline geometry unavailable");
  expect(row.x + row.width - (icon.x + icon.width)).toBeLessThan(2);
});
