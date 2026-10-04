import { expect, test } from "@playwright/test";

test("MetaList at most three columns become term/detail rows below 640px", {
  tag: ["@component:meta-list", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=data-metalist--source-details&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const list = page.locator(".bd-meta-list");
  await expect(list).toBeVisible();
  await expect(list.locator(":scope > div")).toHaveCount(4);
  for (const width of [640, 639]) {
    await page.setViewportSize({ width, height: 800 });
    const styles = await list.evaluate((element) => {
      const style = getComputedStyle(element);
      const row = getComputedStyle(element.children[0] as Element);
      const detail = getComputedStyle(element.querySelector("dd") as Element);
      const probe = document.createElement("span");
      probe.style.fontSize = "var(--bd-size-meta)";
      probe.style.lineHeight = "var(--bd-line-reading)";
      element.append(probe);
      const expected = getComputedStyle(probe);
      const detailStyles = {
        actual: [detail.fontSize, detail.lineHeight],
        expected: [expected.fontSize, expected.lineHeight],
      };
      probe.remove();
      return {
        detailStyles,
        columns: style.gridTemplateColumns.split(" ").map(Number.parseFloat),
        gap: style.gap,
        rowDisplay: row.display,
        rowColumns: row.gridTemplateColumns.split(" ").map(Number.parseFloat),
        rowGap: row.gap,
      };
    });
    expect(styles.columns).toHaveLength(width === 640 ? 3 : 1);
    expect(styles.gap).toBe(width === 640 ? "32px" : "8px");
    if (width === 640)
      expect(styles.columns[0] ?? 0).toBeCloseTo(styles.columns[2] ?? 0, 1);
    else {
      expect(styles.detailStyles.actual).toEqual(styles.detailStyles.expected);
      expect(styles.rowDisplay).toBe("grid");
      expect(styles.rowGap).toBe("8px");
      expect(
        (styles.rowColumns[1] ?? 0) / (styles.rowColumns[0] ?? 1),
      ).toBeCloseTo(2, 1);
    }
  }
});
