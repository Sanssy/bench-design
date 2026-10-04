import { expect, test } from "@playwright/test";

test("Toolbar moves between IconButton and Button with arrows", {
  tag: ["@component:toolbar", "@theme:light"],
}, async ({ page }) => {
  await page.goto(
    "/iframe.html?id=navigation-toolbar--canvas-tools&viewMode=story&globals=theme:light",
  );
  const zoom = page.getByRole("button", { name: "Zoom in" });
  const inspect = page.getByRole("button", { name: "Inspect canvas" });
  const fit = page.getByRole("button", { name: "Fit canvas" });
  await expect(zoom).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(zoom).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(inspect).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(fit).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(inspect).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(zoom).toBeFocused();
});

for (const theme of ["light", "dark"]) {
  test(`Toolbar spacing and visible focus in ${theme}`, {
    tag: ["@component:toolbar", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=navigation-toolbar--canvas-tools&viewMode=story&globals=theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const toolbar = page.getByRole("toolbar", { name: "Canvas tools" });
    await expect(toolbar).toBeVisible();
    const tokens = await toolbar.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "gap:var(--bd-space-8);outline:var(--bd-strong) solid var(--bd-focus);outline-offset:var(--bd-space-4)";
      element.append(probe);
      const style = getComputedStyle(probe);
      const result = {
        gap: style.gap,
        outline: style.outlineColor,
        width: style.outlineWidth,
        offset: style.outlineOffset,
      };
      probe.remove();
      return result;
    });
    await expect(toolbar).toHaveCSS("display", "flex");
    await expect(toolbar).toHaveCSS("align-items", "center");
    await expect(toolbar).toHaveCSS("gap", tokens.gap);
    await page.keyboard.press("Tab");
    const button = page.getByRole("button", { name: "Zoom in" });
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-color", tokens.outline);
    await expect(button).toHaveCSS("outline-width", tokens.width);
    await expect(button).toHaveCSS("outline-offset", tokens.offset);
  });
}
