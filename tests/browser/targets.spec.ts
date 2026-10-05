import { expect, type Locator, type Page, test } from "@playwright/test";

async function openStory(page: Page, story: string, theme: string) {
  await page.goto(
    `/iframe.html?id=${story}&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page.evaluate(() => document.fonts.ready);
}

// Measure the actual hit area, including a dense action's transparent extension.
async function targets(actions: Locator, width: number, height: number) {
  await expect(actions.first()).toBeVisible();
  const rectangles = [];
  for (const action of await actions.all()) {
    const rectangle = await action.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const pseudo = getComputedStyle(element, "::after");
      const extended = pseudo.content !== "none" && pseudo.content !== "normal";
      const width = extended ? Number.parseFloat(pseudo.width) : box.width;
      const height = extended ? Number.parseFloat(pseudo.height) : box.height;
      const x = box.x + (box.width - width) / 2;
      const y = box.y + (box.height - height) / 2;
      const hit = (px: number, py: number) => {
        const found = document.elementFromPoint(px, py);
        return found === element || (found !== null && element.contains(found));
      };
      return {
        x,
        y,
        width,
        height,
        corners: [
          hit(x + 1, y + 1),
          hit(x + width - 1, y + 1),
          hit(x + 1, y + height - 1),
          hit(x + width - 1, y + height - 1),
        ],
      };
    });
    expect(rectangle.width).toBeGreaterThanOrEqual(width);
    expect(rectangle.height).toBeGreaterThanOrEqual(height);
    expect(rectangle.corners).toEqual([true, true, true, true]);
    rectangles.push(rectangle);
  }
  for (let i = 0; i < rectangles.length; i += 1) {
    for (const other of rectangles.slice(i + 1)) {
      const current = rectangles[i];
      if (!current) throw new Error("Missing measured target");
      const overlapX =
        Math.min(current.x + current.width, other.x + other.width) -
        Math.max(current.x, other.x);
      const overlapY =
        Math.min(current.y + current.height, other.y + other.height) -
        Math.max(current.y, other.y);
      expect(overlapX > 0 && overlapY > 0).toBe(false);
    }
  }
}

for (const theme of ["light", "dark"]) {
  for (const component of [
    "search-field",
    "combo-box",
    "multi-combo-box",
    "number-field",
  ]) {
    test(`${component} isolated targets and keyboard ${theme}`, {
      tag: [`@component:${component}`, `@theme:${theme}`],
    }, async ({ page }) => {
      await openStory(
        page,
        `form-${component.replaceAll("-", "")}--default`,
        theme,
      );
      const input = page.locator(".bd-search-input");
      if (component === "search-field") await input.fill("Notes");
      const actions = page.locator(".bd-search-clear, .bd-number-step");
      await targets(actions, 44, 44);
      if (component === "number-field") {
        await expect(actions.first()).toHaveText("−");
        await expect(actions.nth(1)).toHaveText("+");
      } else {
        await expect(actions.first().locator("svg")).toHaveAttribute(
          "width",
          "20",
        );
      }
      if (component === "search-field") {
        // The clear button is pointer-only; Escape clears from the keyboard.
        await actions.first().click({ position: { x: 2, y: 2 } });
        await expect(input).toHaveValue("");
        await input.fill("Notes");
        await page.keyboard.press("Escape");
        await expect(input).toHaveValue("");
        return;
      }
      await actions.first().focus();
      await expect(actions.first()).toBeFocused();
      await page.keyboard.press("Enter");
      if (component === "number-field") await expect(input).toHaveValue("1");
      else {
        await expect(page.getByRole("listbox")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).toHaveCount(0);
      }
    });
  }
  test(`dense tags retain geometry and remove by keyboard ${theme}`, {
    tag: ["@component:multi-combo-box", `@theme:${theme}`],
  }, async ({ page }) => {
    await openStory(page, "form-multicombobox--default", theme);
    const tags = page.locator(".bd-tag-display .bd-selected-tag");
    await expect(tags.first()).toBeVisible();
    await expect(tags.first()).toHaveCSS("height", "28px");
    const remove = page.locator(".bd-tag-display .bd-tag-remove");
    await targets(remove, 24, 28);
    await expect(remove.first().locator("svg")).toHaveAttribute("width", "16");
    const count = await tags.count();
    await remove.first().focus();
    await page.keyboard.press("Enter");
    await expect(tags).toHaveCount(count - 1);
  });
  test(`dense tree chevrons ${theme}`, {
    tag: ["@component:tree", `@theme:${theme}`],
  }, async ({ page }) => {
    await openStory(page, "collections-tree--resource-folders", theme);
    await targets(page.locator(".bd-tree-chevron"), 24, 36);
    await expect(page.locator(".bd-tree-content").first()).toHaveCSS(
      "height",
      "36px",
    );
    await expect(page.locator(".bd-tree-chevron svg").first()).toHaveAttribute(
      "width",
      "16",
    );
    await page.locator(".bd-tree-chevron").first().focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Field notes", { exact: true })).toBeVisible();
  });
  for (const [component, row, height] of [
    ["grid-list", ".bd-grid-list-item", 44],
    ["table", ".bd-table-row", 44],
    ["tree", ".bd-tree-content", 36],
  ] as const) {
    test(`${component} reorder rows are the pointer targets ${theme}`, {
      tag: [`@component:${component}`, `@theme:${theme}`],
    }, async ({ page }) => {
      await openStory(
        page,
        `collections-${component.replaceAll("-", "")}--reorderable-resources`,
        theme,
      );
      // React Aria drags the whole row by pointer; the handle serves the keyboard.
      const handles = page.locator(".bd-reorder-handle");
      await expect(handles.first()).toHaveCSS("pointer-events", "none");
      await targets(page.locator(`${row}:has(.bd-reorder-handle)`), 44, height);
      // Keyboard reordering stays covered by src/collections/reorder.browser.spec.ts.
    });
  }
  for (const [component, story, selector] of [
    ["select", "form-select--default", ".bd-select-trigger"],
    [
      "disclosure",
      "structure-disclosure--document-details",
      ".bd-disclosure__trigger",
    ],
    ["icon-button", "form-iconbutton--secondary", ".bd-icon-button"],
  ]) {
    test(`${component} existing full target ${theme}`, {
      tag: [`@component:${component}`, `@theme:${theme}`],
    }, async ({ page }) => {
      await openStory(page, story ?? "", theme);
      await targets(page.locator(selector ?? ""), 44, 44);
    });
  }
  test(`slider target and keyboard ${theme}`, {
    tag: ["@component:slider", `@theme:${theme}`],
  }, async ({ page }) => {
    await openStory(page, "form-slider--default", theme);
    const thumb = page.locator(".bd-slider-thumb");
    await targets(thumb, 44, 44);
    await expect(thumb).toHaveCSS("width", "20px");
    const input = page.getByRole("slider");
    await input.focus();
    const before = Number(await input.inputValue());
    await page.keyboard.press("ArrowRight");
    await expect(input).toHaveValue(String(before + 1));
  });
  test(`toast close target and keyboard ${theme}`, {
    tag: ["@component:toast", `@theme:${theme}`],
  }, async ({ page }) => {
    await openStory(page, "feedback-toast--recover-document", theme);
    await page.getByRole("button", { name: "Remove document" }).click();
    const close = page.getByRole("button", { name: "Close", exact: true });
    await targets(close, 44, 44);
    await close.focus();
    await page.keyboard.press("Enter");
    await expect(close).toHaveCount(0);
  });
}
