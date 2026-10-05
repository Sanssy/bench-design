import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

type Story = { id: string; type: string; importPath: string };
const index = JSON.parse(
  readFileSync("storybook-static/index.json", "utf8"),
) as { entries: Record<string, Story> };

// WCAG 1.4.10 Reflow: content fits 320 CSS px (a 1280 px screen at 400 %)
// without scrolling in two dimensions. Layout is engine-independent enough to
// check once, in Chromium.
for (const { id, type, importPath } of Object.values(index.entries)) {
  if (type !== "story") continue;
  test(`Reflow at 320 px: ${id}`, {
    tag: [
      "@theme:light",
      `@component:${/^\.\/src\/([^/]+)\//.exec(importPath)?.[1] ?? "shared"}`,
    ],
  }, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Layout check runs once.");
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(
      `/iframe.html?id=${id}&viewMode=story&globals=a11y.manual:!true;theme:light`,
    );
    // React Aria collections add a hidden builder node: wait until a child has
    // a rendered box (a filtered locator missed rendered stories on loaded CI).
    await page.waitForFunction(() =>
      [...document.querySelectorAll("#storybook-root > *")].some((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      }),
    );
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      return [...document.querySelectorAll("#storybook-root *")]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          // Scroll containers (tables, code, tab lists) may hold wider content.
          const scroller = element.closest(
            '[role="region"][tabindex], .bd-table-frame, pre, [role="tablist"]',
          );
          return box.width > 0 && box.right > width + 1 && !scroller;
        })
        .slice(0, 3)
        .map((element) => element.className || element.tagName);
    });
    expect(overflow).toEqual([]);
  });
}
