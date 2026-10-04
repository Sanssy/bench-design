import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`ComboBox field and seven-row geometry in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:combo-box"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-combobox--default&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const input = page.getByRole("combobox");
    await expect(input).toBeVisible();
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
    const control = page.locator(".bd-field-control");
    await expect(control).toHaveCSS("height", tokens.field);
    await expect(control).toHaveCSS("background-color", tokens.surface);
    await input.focus();
    await expect(control).toHaveCSS("outline-color", tokens.focus);
    await input.press("ArrowDown");
    await expect(page.getByRole("option").first()).toHaveCSS(
      "height",
      tokens.row,
    );
    await expect(page.getByRole("listbox")).toHaveCSS(
      "height",
      `${7 * Number.parseFloat(tokens.row)}px`,
    );
  });
  test(`ComboBox open list accessibility in ${theme}`, {
    tag: [`@theme:${theme}`, "@component:combo-box"],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=form-combobox--default&viewMode=story&globals=theme:${theme}`,
    );
    await page.getByRole("combobox").fill("Document 000");
    await expect(page.getByRole("listbox")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test("ComboBox keyboard selection, search highlight and dismissal", {
  tag: ["@component:combo-box"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-combobox--default&viewMode=story");
  const input = page.getByRole("combobox");
  await expect(input).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await input.fill("Document 09999");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option").locator("u")).toHaveText(
    "Document 09999",
  );
  await expect(page.getByRole("status")).toContainText("1 results");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toHaveValue("Document 09999");
  await expect(input).toBeFocused();
  await input.press("ArrowDown");
  await input.press("Escape");
  await expect(page.getByRole("listbox")).not.toBeVisible();
});
test("ComboBox scrolls a virtualized collection of 10 000 options", {
  tag: ["@component:combo-box"],
}, async ({ page }) => {
  await page.goto("/iframe.html?id=form-combobox--default&viewMode=story");
  await page.getByRole("combobox").press("ArrowDown");
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  expect(await page.getByRole("option").count()).toBeLessThan(100);
  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    page.getByRole("option", { name: /Document 09999/ }),
  ).toBeVisible();
  await page.getByRole("option", { name: /Document 09999/ }).click();
  await expect(page.getByRole("combobox")).toHaveValue("Document 09999");
});
test("ComboBox server pages load at the end with reduced motion", {
  tag: ["@component:combo-box"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-combobox--server-search&viewMode=story",
  );
  const input = page.getByRole("combobox", { name: "Remote document" });
  await input.fill("Document");
  await expect(page.locator(".bd-loading-indicator")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.getByRole("option").first()).toBeVisible();
  const list = page.getByRole("listbox");
  await list.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("status")).toHaveText(/(?:100|150) loaded/);
});
test("ComboBox invalid and disabled usage states", {
  tag: ["@component:combo-box"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=form-combobox--server-search&viewMode=story",
  );
  await expect(
    page.getByRole("combobox", { name: /Archived document/ }),
  ).toBeDisabled();
  await expect(
    page.getByRole("combobox", { name: /Document to review/ }),
  ).toHaveAccessibleDescription(
    "Search the document library Choose an available document",
  );
  await expect(
    page.getByRole("combobox", { name: /Additional document/ }),
  ).not.toHaveAttribute("aria-required", "true");
});
