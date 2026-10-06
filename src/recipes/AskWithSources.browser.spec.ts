import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`Ask with sources keyboard, axe and reflow ${theme}`, {
    tag: ["@component:ask-with-sources-recipe", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(
      `/iframe.html?id=recipes-ask-with-sources--ask-and-read&globals=a11y.manual:!true;theme:${theme}`,
    );
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".bd-action-card")).toHaveCount(3);
    const arrow = page.locator(".bd-action-card__trailing").first();
    const title = page.locator(".bd-action-card__title").first();
    const arrowBox = await arrow.boundingBox();
    const titleBox = await title.boundingBox();
    expect((arrowBox?.y ?? 0) + (arrowBox?.height ?? 0)).toBeGreaterThanOrEqual(
      (titleBox?.y ?? 0) + (titleBox?.height ?? 0) - 4,
    );
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const last = page.getByRole("button", {
        name: "What happens after the workshop?",
      });
      const composer = page.locator(".bd-composer");
      await expect(last).toBeVisible();
      const lastBox = await last.boundingBox();
      const cardBox = await composer.boundingBox();
      expect(cardBox?.y).toBeGreaterThanOrEqual(
        (lastBox?.y ?? 0) + (lastBox?.height ?? 0),
      );
      await expect(last).toHaveCSS("border-top-style", "solid");
      await expect(last.locator("svg")).toHaveCount(1);
      const context = await page.getByText("03 / Ask a question").boundingBox();
      const badge = await page.getByText("2 documents ready").boundingBox();
      expect(badge?.y).toBeGreaterThanOrEqual(
        (context?.y ?? 0) + (context?.height ?? 0),
      );
      const footer = page.getByRole("contentinfo");
      const splitWords = await footer.evaluate((element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const broken: string[] = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const lines = new Set(
              Array.from(range.getClientRects(), (rect) => Math.round(rect.y)),
            );
            if (lines.size > 1) broken.push(match[0]);
          }
        }
        return broken;
      });
      expect(splitWords).toEqual([]);
      const brand = await footer.getByRole("heading").boundingBox();
      const note = await footer.getByText("Local demonstration").boundingBox();
      expect(Math.max(brand?.y ?? 0, note?.y ?? 0)).toBeLessThan(
        Math.min(
          (brand?.y ?? 0) + (brand?.height ?? 0),
          (note?.y ?? 0) + (note?.height ?? 0),
        ),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(page.locator(".bd-action-card")).toHaveCount(0);
    await expect(
      page.getByRole("list", { name: "Suggested questions" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "What should I prepare?" }).focus();
    await page.keyboard.press("Enter");
    const input = page.getByRole("textbox", { name: "Your question" });
    await expect(input).toHaveValue("");
    await expect(page.getByRole("status")).toContainText("Sending…");
    await expect(
      page.getByRole("heading", { name: "Sample answer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Suggested questions" }),
    ).toBeVisible();
    await expect(page.locator(".bd-reference-list")).toHaveAttribute(
      "data-marker",
      "accent",
    );
    await expect(page.locator(".bd-reference-meta")).toHaveText([
      "p. 1",
      "p. 2",
    ]);
    const citation = page.getByRole("link", { name: "Preparation checklist" });
    // Start at the field; backwards Tab reaches the final citation.
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(citation).toBeFocused();
    const sourceBox = await citation.boundingBox();
    const composerBox = await page.locator(".bd-composer").boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(composerBox).not.toBeNull();
    expect((sourceBox?.y ?? 0) + (sourceBox?.height ?? 0)).toBeLessThanOrEqual(
      composerBox?.y ?? 0,
    );
    await page.keyboard.press("Enter");
    await expect(page.locator("#sample-excerpt")).toBeFocused();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
