import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const storyUrl = (story: string, theme?: string) =>
  `/iframe.html?id=form-segmentedcontrol--${story}&viewMode=story&globals=a11y.manual:!true${theme ? `;theme:${theme}` : ""}`;

async function checkDefaultPresentation(page: Page, theme: string) {
  await page.goto(storyUrl("default", theme));
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page.evaluate(() => document.fonts.ready);
  const geometry = page.locator(".bd-segment").first();
  await expect(geometry).toBeVisible();
  const tokens = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "height:calc(var(--bd-space-32) + var(--bd-space-4));outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
    document.body.append(probe);
    const css = getComputedStyle(probe);
    const result = {
      height: css.height,
      focus: css.outlineColor,
      width: css.outlineWidth,
      offset: css.outlineOffset,
    };
    probe.remove();
    return result;
  });
  await expect(geometry).toHaveCSS("height", tokens.height);
  await page.keyboard.press("Tab");
  const focused = page.locator(".bd-segment").first();
  await expect(focused).toHaveCSS("outline-style", "solid");
  await expect(focused).toHaveCSS("outline-color", tokens.focus);
  await expect(focused).toHaveCSS("outline-width", tokens.width);
  await expect(focused).toHaveCSS("outline-offset", tokens.offset);

  await page.goto(storyUrl("review", theme));
  await expect(page.getByText("Review this value")).toBeVisible();
  const disabled = page.locator(".bd-field[data-disabled]").first();
  await expect(disabled).toBeVisible();
  const controls = disabled.getByRole("radio");
  await expect(controls.first()).toBeVisible();
  await expect(controls.first()).toBeDisabled();

  // Counts last: pointer clicks change React Aria's interaction modality.
  for (const story of ["facets-with-counts", "wrapped"]) {
    await page.goto(storyUrl(story, theme));
    if (story === "wrapped") {
      const group = page.locator(".bd-segmented");
      await expect(group).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(group).toHaveCSS("border-top-width", "0px");
      for (const segment of await page.locator(".bd-segment").all()) {
        await expect(segment).toHaveCSS("border-top-style", "solid");
        await expect(segment).toHaveCSS("border-inline-end-style", "solid");
      }
    }
    const housing = page.getByRole("radio", { name: "Housing, 5" });
    const count = housing.locator(".bd-segment-count");
    await expect(count).toHaveText("5");
    const roles = await page.evaluate(() => {
      const probe = document.createElement("span");
      document.body.append(probe);
      probe.style.color = "var(--bd-text-muted)";
      probe.style.fontFamily = "var(--bd-font-mono)";
      probe.style.fontSize = "var(--bd-size-meta)";
      const css = getComputedStyle(probe);
      const result = {
        muted: css.color,
        font: css.fontFamily,
        size: css.fontSize,
        selected: "",
      };
      probe.style.color = "var(--bd-on-accent)";
      result.selected = getComputedStyle(probe).color;
      probe.remove();
      return result;
    });
    await expect(count).toHaveCSS("color", roles.muted);
    await expect(count).toHaveCSS("font-family", roles.font);
    await expect(count).toHaveCSS("font-size", roles.size);
    await housing.click();
    await expect(count).toHaveCSS("color", roles.selected);
    await page.getByRole("radio", { name: /^All,/ }).click();
    await expect(count).toHaveCSS("color", roles.muted);
  }
}

async function checkTrackPresentation(page: Page, theme: string) {
  await page.goto(storyUrl("track", theme));
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page.evaluate(() => document.fonts.ready);
  const group = page.getByRole("radiogroup", { name: "Category" });
  const field = page.locator(".bd-field").first();
  const groupStyle = await group.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "background:var(--bd-surface-subtle);padding:var(--bd-space-4);gap:var(--bd-space-4)";
    document.body.append(probe);
    const expected = getComputedStyle(probe);
    const result = {
      surface: expected.backgroundColor,
      space: expected.paddingTop,
      background: getComputedStyle(element).backgroundColor,
      padding: getComputedStyle(element).paddingTop,
      gap: getComputedStyle(element).columnGap,
      border: getComputedStyle(element).borderTopWidth,
    };
    probe.remove();
    return result;
  });
  expect(groupStyle.background).toBe(groupStyle.surface);
  expect(groupStyle.padding).toBe(groupStyle.space);
  expect(groupStyle.gap).toBe(groupStyle.space);
  expect(groupStyle.border).toBe("0px");
  await expect(group).toHaveAttribute("data-variant", "track");
  const fieldBox = await field.boundingBox();
  const groupBox = await group.boundingBox();
  expect(fieldBox).not.toBeNull();
  expect(groupBox?.width).toBeCloseTo(fieldBox?.width ?? 0, 0);
  const boxes = await page.locator(".bd-segment").evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        border: style.borderTopWidth,
        background: style.backgroundColor,
      };
    }),
  );
  expect(boxes).toHaveLength(4);
  expect(
    Math.max(...boxes.map((box) => box.width)) -
      Math.min(...boxes.map((box) => box.width)),
  ).toBeLessThanOrEqual(1);
  expect(boxes.every((box) => box.height >= 44 && box.border === "0px")).toBe(
    true,
  );
  expect(boxes[1]?.background).toBe("rgba(0, 0, 0, 0)");

  const segment = page.locator(".bd-segment").first();
  await expect(group).toHaveCSS("border-radius", "0px");
  await expect(segment).toHaveCSS("border-radius", "0px");
  await page.locator(".bd-field").evaluate((element) => {
    element.style.setProperty("--bd-radius", "12px");
  });
  await expect(group).toHaveCSS("border-radius", "12px");
  await expect(segment).toHaveCSS("border-radius", "12px");
  await page.locator(".bd-field").evaluate((element) => {
    element.style.setProperty("--bd-radius-surface", "14px");
    element.style.setProperty("--bd-radius-control", "10px");
  });
  await expect(group).toHaveCSS("border-radius", "14px");
  await expect(segment).toHaveCSS("border-radius", "10px");

  await page.setViewportSize({ width: 320, height: 800 });
  for (const story of ["track", "track-wrapped"]) {
    await page.goto(storyUrl(story, theme));
    await page.evaluate(() => document.fonts.ready);
    const track = page.locator(".bd-segmented");
    const trackBox = await track.boundingBox();
    const narrowBoxes = await page
      .locator(".bd-segment")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          return {
            x: box.x,
            right: box.right,
            width: box.width,
            height: box.height,
            lineCount: range.getClientRects().length,
          };
        }),
      );
    expect(trackBox).not.toBeNull();
    expect(
      narrowBoxes.every((box) => box.width >= 44 && box.height >= 44),
    ).toBe(true);
    const trackRight = (trackBox?.x ?? 0) + (trackBox?.width ?? 320);
    expect(
      narrowBoxes.every(
        (box) => box.x >= (trackBox?.x ?? 0) && box.right <= trackRight,
      ),
    ).toBe(true);
    expect(narrowBoxes.some((box) => box.lineCount > 1)).toBe(
      story === "track-wrapped",
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
  }

  await page.goto(storyUrl("track", theme));
  const trackGroup = page.getByRole("radiogroup", { name: "Category" });
  const all = page.getByRole("radio", { name: "All" });
  const housing = page.getByRole("radio", { name: "Housing" });
  const travel = page.getByRole("radio", { name: "Travel" });
  const archived = page.getByRole("radio", { name: "Archived" });
  await expect(trackGroup).toBeVisible();
  await expect(all).toHaveAttribute("aria-checked", "true");
  await expect(archived).toBeDisabled();
  await page.keyboard.press("Tab");
  await expect(all).toBeFocused();
  await expect(all).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowRight");
  await expect(housing).toBeFocused();
  await page.keyboard.press("Space");
  await expect(housing).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowRight");
  await expect(travel).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(travel).toBeFocused();
  await expect(archived).not.toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(housing).toBeFocused();
}

for (const theme of ["light", "dark"]) {
  test(`SegmentedControl default, disabled, error and count presentation in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    await checkDefaultPresentation(page, theme);
  });

  test(`SegmentedControl track appearance, responsive geometry and interaction in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    await checkTrackPresentation(page, theme);
  });

  test(`SegmentedControl axe A and AA in ${theme}`, {
    tag: ["@component:segmented-control", `@theme:${theme}`],
  }, async ({ page }) => {
    for (const story of [
      "default",
      "review",
      "wrapped",
      "facets-with-counts",
    ]) {
      await page.goto(storyUrl(story, theme));
      await expect(page.locator(".bd-field").first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}

test("SegmentedControl keyboard editing", {
  tag: ["@component:segmented-control"],
}, async ({ page }) => {
  await page.goto(storyUrl("default"));
  await expect(page.locator(".bd-field").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  const recent = page.getByRole("radio", { name: "Recent, 8" });
  await expect(recent).toBeFocused();
  await page.keyboard.press("Space");
  await expect(recent).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Space");
  await expect(recent).toHaveAttribute("aria-checked", "true");
});

test("wrapped facets fit 320 px and traverse successive rows", {
  tag: ["@component:segmented-control"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(storyUrl("wrapped"));
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);
  const boxes = await radios.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        right: box.right,
        y: box.y,
        width: box.width,
        height: box.height,
      };
    }),
  );
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(320);
  }
  expect(boxes[1]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await expect(radios.nth(1)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await expect(radios.nth(5)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(radios.nth(3)).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
