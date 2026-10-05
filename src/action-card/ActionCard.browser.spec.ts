import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`ActionCard focus and hover ${theme}`, {
    tag: ["@component:action-card", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=surfaces-actioncard--archive&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    const card = page.getByRole("link", { name: "Field notes" });
    await expect(card).toBeVisible();
    const bounds = await card.boundingBox();
    await page.keyboard.press("Tab");
    await expect(card).toBeFocused();
    await expect(card).toHaveAttribute("data-focus-visible");
    await expect(card).toHaveCSS("outline-style", "solid");
    await expect(card).not.toHaveCSS("box-shadow", "none");
    await expect(card).toHaveCSS("transform", "none");
    await card.evaluate((element) => element.blur());
    await card.hover();
    await expect(card).toHaveAttribute("data-hovered");
    await expect(card).not.toHaveCSS("box-shadow", "none");
    expect(await card.boundingBox()).toEqual(bounds);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
    ).toEqual([]);
  });
}
test("ActionCard activates at narrow touch viewport", {
  tag: ["@component:action-card", "@theme:light"],
}, async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(
    "http://127.0.0.1:6007/iframe.html?id=surfaces-actioncard--create-note&viewMode=story&globals=a11y.manual:!true;theme:light",
  );
  await page.getByRole("button", { name: "Create a note" }).tap();
  await expect(page.getByRole("status")).toHaveText("New note ready.");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
