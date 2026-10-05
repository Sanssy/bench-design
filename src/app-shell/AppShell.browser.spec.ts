import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const workspace =
  "/iframe.html?id=layout-appshell--workspace&viewMode=story&globals=a11y.manual:!true;theme:light";

test("AppShell scrolls each wide workspace zone independently", {
  tag: ["@component:app-shell", "@theme:light"],
}, async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 960, height: 560 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(workspace);
    const main = page.getByRole("main");
    // The zones carry the panel width (scrollbar included on platforms with
    // classic scrollbars); SidePanel fills them.
    const start = page.getByRole("complementary", { name: "Library" });
    const end = page.getByRole("complementary", { name: "Details" });
    await expect(end).toBeVisible();
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveCSS("clip-path", "inset(50%)");
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS("clip-path", "none");
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(main).toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.evaluate(() => document.fonts.ready);
    for (const panel of [start, end]) {
      expect(
        await panel.evaluate((element) => {
          // Border-box width, scrollbar gutter included, against the token
          // resolved outside the scroll container.
          const probe = document.createElement("div");
          probe.style.width = "var(--bd-panel-width)";
          document.body.append(probe);
          const matches =
            element.getBoundingClientRect().width ===
            probe.getBoundingClientRect().width;
          probe.remove();
          return matches;
        }),
      ).toBe(true);
    }

    expect(
      await page
        .locator(".bd-app-shell")
        .evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(viewport.height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight,
      ),
    ).toBe(true);
    // The zones themselves scroll; SidePanel never does.
    const zones = [main, start, end];
    for (const zone of zones) {
      expect(
        await zone.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      ).toBe(true);
      await zone.evaluate((element) => {
        element.scrollTop = 100;
      });
      expect(
        await zone.evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      for (const other of zones.filter((item) => item !== zone)) {
        expect(await other.evaluate((element) => element.scrollTop)).toBe(0);
      }
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await zone.evaluate((element) => {
        element.scrollTop = 0;
      });
    }
    await expect(
      page.getByRole("tablist", { includeHidden: true }),
    ).toBeHidden();
  }
});

test("AppShell uses natural page scrolling in short wide windows", {
  tag: ["@component:app-shell", "@theme:light"],
}, async ({ page }) => {
  for (const height of [500, 559]) {
    await page.setViewportSize({ width: 1280, height });
    await page.goto(workspace);
    await expect(
      page.getByRole("complementary", { name: "Details" }),
    ).toBeVisible();
    const main = page.getByRole("main");
    expect(
      await main.evaluate((element) => getComputedStyle(element).overflowY),
    ).toBe("visible");
    await page.evaluate(() => window.scrollTo(0, 200));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(await main.evaluate((element) => element.scrollTop)).toBe(0);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByRole("contentinfo")).toBeInViewport();
  }
});

test("AppShell keeps mobile document order, natural scrolling and sticky selector", {
  tag: ["@component:app-shell", "@theme:light"],
}, async ({ page }) => {
  for (const width of [375, 959]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(workspace);
    const tabs = page.getByRole("tablist");
    await expect(tabs).toBeVisible();
    const main = page.getByRole("main");
    await expect(tabs).toBeInViewport();
    expect((await tabs.boundingBox())?.y).toBeLessThan(
      (await main.boundingBox())?.y ?? 0,
    );
    await page.evaluate(() => window.scrollTo(0, 200));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect(
      await main.evaluate((element) => getComputedStyle(element).overflowY),
    ).toBe("visible");
    await tabs.evaluate((element) =>
      window.scrollTo(
        0,
        element.getBoundingClientRect().top + window.scrollY + 100,
      ),
    );
    expect((await tabs.boundingBox())?.y).toBeCloseTo(0, 0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`AppShell mobile Tabs keyboard, linked panels and axe ${theme}`, {
    tag: ["@component:app-shell", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(workspace.replace("theme:light", `theme:${theme}`));
    const library = page.getByRole("tab", { name: "Library" });
    const details = page.getByRole("tab", { name: "Details" });
    await expect(library).toBeVisible();
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveCSS("clip-path", "inset(50%)");
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS("clip-path", "none");
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await page.evaluate(() => document.fonts.ready);
    await expect(library).toHaveAttribute("aria-selected", "true");
    const start = page.locator(".bd-app-shell-start");
    const end = page.locator(".bd-app-shell-end");
    for (const [tab, panel] of [
      [library, start],
      [details, end],
    ] as const) {
      await expect(tab).toHaveAttribute(
        "aria-controls",
        (await panel.getAttribute("id")) ?? "",
      );
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        (await tab.getAttribute("id")) ?? "",
      );
    }
    await details.click();
    await expect(page.getByRole("tabpanel", { name: "Details" })).toBeVisible();
    await expect(start).toBeHidden();
    await details.press("ArrowLeft");
    await expect(library).toBeFocused();
    await expect(library).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "Library" })).toBeVisible();
    await expect(library).toHaveCSS("outline-style", "solid");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    // Resizing must preserve both actual content nodes, and restore interactive desktop regions.
    await start.evaluate((element) => {
      element.dataset.mountProbe = "retained";
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.getByRole("complementary", { name: "Details" }),
    ).toBeVisible();
    await expect(end).not.toHaveAttribute("inert");
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(start).toHaveAttribute("data-mount-probe", "retained");
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`AppShell surfaces and separators ${theme}`, {
    tag: ["@component:app-shell", `@theme:${theme}`],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(
      `/iframe.html?id=layout-appshell--workspace&viewMode=story&globals=a11y.manual:!true;theme:${theme}`,
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(
      page.getByRole("complementary", { name: "Details" }),
    ).toBeVisible();
    const values = await page.locator(".bd-app-shell").evaluate((shell) => {
      const probe = document.createElement("div");
      probe.style.background = "var(--bd-surface-subtle)";
      probe.style.border = "var(--bd-hair) solid var(--bd-border-strong)";
      shell.append(probe);
      const expected = getComputedStyle(probe);
      const main = getComputedStyle(shell.querySelector("main") as Element);
      const results = [main.backgroundColor === expected.backgroundColor];
      for (const [selector, edge] of [
        [".bd-app-shell-header", "Bottom"],
        [".bd-app-shell-footer", "Top"],
        [".bd-app-shell-start", "Right"],
        [".bd-app-shell-end", "Left"],
      ] as const) {
        const actual = getComputedStyle(
          shell.querySelector(selector) as Element,
        );
        results.push(
          actual.getPropertyValue(`border-${edge.toLowerCase()}-color`) ===
            expected.borderTopColor,
          actual.getPropertyValue(`border-${edge.toLowerCase()}-width`) ===
            expected.borderTopWidth,
        );
      }
      probe.remove();
      return results;
    });
    expect(values.every(Boolean)).toBe(true);
  });
}
