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
      page.getByRole("radiogroup", { includeHidden: true }),
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
    const tabs = page.getByRole("radiogroup");
    await expect(tabs).toBeVisible();
    const main = page.getByRole("main");
    expect((await main.boundingBox())?.y).toBeLessThan(
      (await tabs.boundingBox())?.y ?? 0,
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

test("AppShell mobile selector supports pointer and keyboard", {
  tag: ["@component:app-shell", "@theme:light"],
}, async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(workspace);
  const library = page.getByRole("radio", { name: "Library" });
  const details = page.getByRole("radio", { name: "Details" });
  await expect(library).toHaveAttribute("aria-checked", "true");
  await details.click();
  await expect(
    page.getByRole("complementary", { name: "Details" }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Library" }),
  ).toBeHidden();
  // React Aria ToggleButtonGroup: arrows move focus, Space selects.
  await details.press("ArrowLeft");
  await expect(library).toBeFocused();
  await library.press("Space");
  await expect(library).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByRole("complementary", { name: "Library" }),
  ).toBeVisible();
});

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
