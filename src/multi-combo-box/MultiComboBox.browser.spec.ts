import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`MultiComboBox shared list geometry in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:multi-combo-box"],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto(
      `/iframe.html?id=form-multicombobox--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const input = page.getByRole("combobox");
    await input.focus();
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "height:calc(var(--bd-space-48) - var(--bd-space-4));width:var(--bd-space-48);background:var(--bd-surface-raised);outline:var(--bd-strong) solid var(--bd-focus)";
      document.body.append(probe);
      const css = getComputedStyle(probe);
      const values = {
        row: css.height,
        field: css.width,
        surface: css.backgroundColor,
        focus: css.outlineColor,
      };
      probe.remove();
      return values;
    });
    await expect(page.locator(".bd-field-control")).toHaveCSS(
      "min-height",
      tokens.field,
    );
    await expect(page.locator(".bd-field-control")).toHaveCSS(
      "background-color",
      tokens.surface,
    );
    await expect(page.locator(".bd-field-control")).toHaveCSS(
      "outline-color",
      tokens.focus,
    );
    await input.press("ArrowDown");
    await expect(page.getByRole("option").first()).toHaveCSS(
      "height",
      tokens.row,
    );
    await expect(page.getByRole("listbox")).toHaveCSS(
      "height",
      `${7 * Number.parseFloat(tokens.row)}px`,
    );
    await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
  });
  test(`MultiComboBox accessibility with tags and open list in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:multi-combo-box"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-multicombobox--default&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.getByRole("row").first()).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.getByRole("combobox").fill("Document 000");
    await expect(page.getByRole("listbox")).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}

test("MultiComboBox keyboard selection and tag removal", {
  tag: ["@component:multi-combo-box"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-multicombobox--default&viewMode=story");
  const input = page.getByRole("combobox");
  await input.fill("Document 09999");
  await expect(page.getByRole("option").locator("u")).toHaveText(
    "Document 09999",
  );
  await input.press("ArrowDown");
  await input.press("Enter");
  await input.press("Escape");
  const tag = page.getByRole("row", { name: "Document 00000" });
  await tag.focus();
  await page.keyboard.press("Delete");
  await expect(tag).toHaveCount(0);
  await page.getByRole("row", { name: "Document 00001" }).focus();
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("row", { name: "Document 00001" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("row", { name: "Document 09999" })).toBeVisible();
});

test("MultiComboBox limits tags to two lines and counts additional choices", {
  tag: ["@component:multi-combo-box"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await page.goto("/iframe.html?id=form-multicombobox--default&viewMode=story");
  await page.getByRole("combobox").fill("Document 000");
  for (const label of [
    "Document 00002",
    "Document 00003",
    "Document 00004",
    "Document 00005",
  ]) {
    await page.getByRole("option", { name: new RegExp(label) }).click();
  }
  await expect(page.locator(".bd-tag-display .bd-tag-summary")).toBeVisible();
  const geometry = await page.locator(".bd-tag-display").evaluate((element) => {
    const tags = [...element.querySelectorAll('[role="row"]')];
    return {
      rows: new Set(
        tags.map((tag) => Math.round(tag.getBoundingClientRect().top)),
      ).size,
      visible: tags.length,
      summary: element.querySelector(".bd-tag-summary")?.textContent,
    };
  });
  expect(geometry.rows).toBe(2);
  expect(geometry.summary).toBe(`+${6 - geometry.visible}`);
  await page.getByRole("button", { name: "Clear all" }).click();
  await page.getByRole("combobox").press("Escape");
  await expect(page.getByRole("row")).toHaveCount(0);
});

test("MultiComboBox loads server pages while retaining selected tags", {
  tag: ["@component:multi-combo-box"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-multicombobox--server-search&viewMode=story",
  );
  const input = page.getByRole("combobox", { name: "Remote documents" });
  await input.fill("Document");
  await expect(page.locator(".bd-loading-indicator")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("option", { name: /Document 00000/ }).click();
  await page.getByRole("listbox").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("status")).toHaveText(/(?:100|150) loaded/);
  await input.fill("Document 09999");
  await expect(page.getByRole("option")).toHaveCount(1);
  await input.press("Escape");
  await expect(
    page.getByRole("row", { name: "Document 00000" }).first(),
  ).toBeVisible();
});

test("MultiComboBox disabled, invalid and optional usage", {
  tag: ["@component:multi-combo-box"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-multicombobox--server-search&viewMode=story",
  );
  await expect(
    page.getByRole("combobox", { name: /Archived documents/ }),
  ).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: /Documents to review/ }),
  ).toHaveAccessibleDescription(
    "Search the document library Choose an available document",
  );
  await expect(
    page.getByRole("combobox", { name: /Additional documents/ }),
  ).not.toHaveAttribute("aria-required", "true");
});
